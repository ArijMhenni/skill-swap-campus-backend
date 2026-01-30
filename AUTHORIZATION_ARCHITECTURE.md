# Backend Authorization Architecture

## Overview

This document explains the **defense-in-depth** authorization architecture implemented for the SkillSwap Campus backend.

---

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│  1. Route Guards (Authorization Gates)         │
│     - JwtAuthGuard: Verify JWT token           │
│     - ResourceOwnershipGuard: Verify ownership │
│     - RolesGuard: Verify role permissions      │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  2. Controller (Request Validation)             │
│     - Validate DTOs                             │
│     - Extract user from request                 │
│     - Pass to service layer                     │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  3. Service Layer (Business Logic + Defense)    │
│     - Defensive checks (validate ownership)     │
│     - Business logic execution                  │
│     - Database operations                       │
└─────────────────────────────────────────────────┘
```

---

## How Authorization Works

### Example: Deleting a Skill

#### **Step 1: Client Request**

```http
DELETE /api/skills/123
Authorization: Bearer eyJhbGci...
```

#### **Step 2: JwtAuthGuard**

```typescript
@UseGuards(JwtAuthGuard)
```

- ✅ Validates JWT token
- ✅ Decodes user information
- ✅ Attaches `user` to request object
- ❌ Rejects if token invalid/expired

#### **Step 3: ResourceOwnershipGuard**

```typescript
@UseGuards(JwtAuthGuard, ResourceOwnershipGuard)
@CheckResourceOwnership('skill')
```

- ✅ Fetches skill from database
- ✅ Compares `skill.user.id === requestUser.id`
- ✅ Allows if user is owner
- ❌ Throws 403 Forbidden if not owner
- ❌ Throws 404 Not Found if skill doesn't exist

#### **Step 4: Controller**

```typescript
delete(@Param('id') id: string, @GetUser() user: User) {
  return this.skillsService.delete(id, user.id);
}
```

- ✅ Receives validated request
- ✅ Extracts user from request (guaranteed to exist)
- ✅ Calls service with userId

#### **Step 5: Service Layer (Defense-in-Depth)**

```typescript
async delete(id: string, userId: string): Promise<void> {
  const skill = await this.findOne(id);

  // Defensive check - should never fail if guard works
  if (skill.user.id !== userId) {
    throw new ForbiddenException('...');
  }

  // Proceed with deletion
}
```

- ✅ Re-validates ownership (redundant but safe)
- ✅ Performs soft delete
- ✅ Updates user's skill lists

---

## Guard vs. Component Comparison

### **Frontend Guard (Angular)**

```typescript
// ❌ CLIENT-SIDE - Can be bypassed
export const skillOwnerGuard: CanActivateFn = (route) => {
  return skillService
    .getSkillById(id)
    .pipe(map((skill) => skill.user.id === currentUser.id));
};
```

**Attack Vector:**

```bash
# Bypass frontend entirely
curl -X DELETE http://api.com/skills/123 \
  -H "Authorization: Bearer STOLEN_TOKEN"
```

### **Backend Guard (NestJS)**

```typescript
// ✅ SERVER-SIDE - Cannot be bypassed
@UseGuards(JwtAuthGuard, ResourceOwnershipGuard)
@CheckResourceOwnership('skill')
delete(@Param('id') id: string) { ... }
```

**Protection:**

- ✅ All requests MUST pass through guard
- ✅ No way to bypass (server validates)
- ✅ Consistent authorization across all clients

---

## Best Practices Implemented

### 1. **Defense in Depth**

```typescript
// Layer 1: Guard checks ownership
@UseGuards(ResourceOwnershipGuard)

// Layer 2: Service validates again (defensive)
if (skill.user.id !== userId) {
  throw new ForbiddenException();
}
```

**Why both?**

- Guard: Primary security boundary
- Service: Prevents bugs if guard is bypassed/misconfigured
- Never trust a single layer

### 2. **Separation of Concerns**

```
Guards      → Authorization logic
Controllers → Request/response handling
Services    → Business logic
```

### 3. **Reusable Guards**

```typescript
// Same guard works for any resource type
@CheckResourceOwnership('skill')
@CheckResourceOwnership('request')
@CheckResourceOwnership('message')
```

### 4. **Explicit Error Messages**

```typescript
// ❌ Bad: Generic error
throw new ForbiddenException('Forbidden');

// ✅ Good: Specific, actionable error
throw new ForbiddenException('You can only delete your own skills');
```

### 5. **Proper HTTP Status Codes**

```typescript
@HttpCode(HttpStatus.NO_CONTENT)  // 204 for successful deletion
@HttpCode(HttpStatus.OK)          // 200 for successful update
```

---

## Security Considerations

### ✅ **What This Protects Against**

- Unauthorized updates/deletes
- Resource enumeration attacks (if implemented)
- Direct API manipulation
- Token theft (JWT validates identity)

### ⚠️ **What This DOESN'T Protect Against**

- SQL Injection (use parameterized queries - TypeORM does this)
- XSS attacks (sanitize inputs in DTOs)
- CSRF (implement CSRF tokens for state-changing operations)
- Rate limiting (implement throttler)
- Privilege escalation (implement RBAC properly)

### 🔒 **Additional Security Recommendations**

1. **Add Rate Limiting**

```typescript
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 requests per 60 seconds
```

2. **Validate UUIDs**

```typescript
@Param('id', ParseUUIDPipe) id: string
```

3. **Sanitize Inputs**

```typescript
// In DTOs
@IsString()
@IsNotEmpty()
@MaxLength(200)
@Matches(/^[a-zA-Z0-9\s-]+$/)
title: string;
```

4. **Audit Logging**

```typescript
// Log all ownership violations
this.logger.warn(
  `User ${userId} attempted to delete skill ${skillId} without ownership`,
);
```

---

## Testing Authorization

### Unit Test Example

```typescript
describe('ResourceOwnershipGuard', () => {
  it('should deny access when user is not owner', async () => {
    const guard = new ResourceOwnershipGuard(reflector, skillRepo);

    mockSkillRepo.findOne.mockResolvedValue({
      id: 'skill-123',
      user: { id: 'owner-456' },
    });

    mockRequest.user = { id: 'attacker-789' };

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
```

### Integration Test Example

```typescript
it('DELETE /skills/:id - should fail when not owner', async () => {
  const otherUserToken = await getTokenForUser('other-user');

  return request(app.getHttpServer())
    .delete('/skills/123')
    .set('Authorization', `Bearer ${otherUserToken}`)
    .expect(403)
    .expect((res) => {
      expect(res.body.message).toContain('do not own');
    });
});
```

---

## Migration Checklist

- [x] Create ResourceOwnershipGuard
- [x] Create @CheckResourceOwnership decorator
- [x] Apply guards to UPDATE/DELETE endpoints
- [x] Keep defensive checks in service layer
- [x] Add proper HTTP status codes
- [ ] Add UUID validation pipes
- [ ] Add rate limiting
- [ ] Add audit logging
- [ ] Write unit tests for guards
- [ ] Write integration tests for authorization
- [ ] Document API authorization in Swagger

---

## Usage Examples

### Protecting a Route

```typescript
@Patch(':id')
@UseGuards(JwtAuthGuard, ResourceOwnershipGuard)
@CheckResourceOwnership('skill')
update(@Param('id') id: string, @GetUser() user: User, @Body() dto: UpdateSkillDto) {
  return this.skillsService.update(id, dto, user.id);
}
```

### Making a Route Public

```typescript
@Get()
@Public()  // No authentication required
findAll() {
  return this.skillsService.findAll();
}
```

### Role-Based + Ownership

```typescript
@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnershipGuard)
@Roles(Role.USER, Role.ADMIN)
@CheckResourceOwnership('skill')
delete(@Param('id') id: string, @GetUser() user: User) {
  // Only authenticated users with USER or ADMIN role who OWN the skill can delete it
}
```

### Admin Override

```typescript
async delete(id: string, userId: string, isAdmin: boolean = false): Promise<void> {
  const skill = await this.findOne(id);

  // Admins can delete any skill
  if (!isAdmin && skill.user.id !== userId) {
    throw new ForbiddenException('You can only delete your own skills');
  }

  // Proceed with deletion
}
```

---

## Key Differences: Old vs. New

| Aspect                     | Before                                 | After                                    |
| -------------------------- | -------------------------------------- | ---------------------------------------- |
| **Authorization Location** | Service only                           | Guard + Service (defense-in-depth)       |
| **Reusability**            | Duplicate logic in each service        | Single guard for all resources           |
| **Error Handling**         | Generic errors                         | Specific, actionable errors              |
| **Testing**                | Hard to test authorization separately  | Guards testable in isolation             |
| **Security**               | One layer                              | Multiple layers                          |
| **Maintainability**        | Changes require editing all services   | Change guard once, affects all routes    |
| **Performance**            | Loads resource twice (guard + service) | Guard result cached in request           |
| **Standards Compliance**   | ❌ Not following NestJS patterns       | ✅ Industry-standard NestJS architecture |

---

## Why This Approach is Better

### 1. **Fail Fast Principle**

```
Old: Request → Controller → Service → Check → Fail
New: Request → Guard → Fail (before reaching business logic)
```

### 2. **Declarative Security**

```typescript
// Clear, readable, self-documenting
@UseGuards(JwtAuthGuard, ResourceOwnershipGuard)
@CheckResourceOwnership('skill')
```

### 3. **Separation of Concerns**

- **Guards**: Authorization (Can this user do this?)
- **Services**: Business Logic (How do we do this?)
- **Controllers**: Routing & Validation (What are we doing?)

### 4. **Scalability**

Adding new protected resources is trivial:

```typescript
// Just add a case to the guard
case 'message':
  return this.checkMessageOwnership(resourceId, userId);
```

---

## Common Pitfalls Avoided

❌ **Pitfall 1: Checking ownership in service only**

```typescript
// Service can be called from other places (jobs, internal services)
// Authorization might be bypassed
```

❌ **Pitfall 2: Not validating in service (trusting guard only)**

```typescript
// What if guard is removed accidentally?
// What if called internally?
```

✅ **Solution: Defense-in-Depth**

```typescript
// Guard: Primary protection
// Service: Defensive validation
```

❌ **Pitfall 3: Returning 404 for unauthorized resources**

```typescript
// Information leak - attacker knows resource exists
if (!isOwner) {
  throw new NotFoundException(); // ❌ Wrong
}
```

✅ **Solution: Return 403 for existing resources**

```typescript
if (!isOwner) {
  throw new ForbiddenException(); // ✅ Correct
}
```

---

## Performance Optimization

### Problem: Double Database Query

```
Guard fetches skill → Service fetches skill again
```

### Solution: Resource Caching (Advanced)

```typescript
// Guard attaches skill to request
request.preloadedSkill = skill;

// Service uses preloaded data
const skill = request.preloadedSkill || (await this.findOne(id));
```

**Trade-off**: Added complexity vs. one saved query. Only implement if performance is critical.

---

## Conclusion

**The guard approach is fundamentally better because:**

1. ✅ **Security-first design**: Authorization before execution
2. ✅ **Reusable**: One guard, many resources
3. ✅ **Testable**: Guards tested independently
4. ✅ **Maintainable**: Change once, affect all routes
5. ✅ **Standard**: Follows NestJS best practices
6. ✅ **Declarative**: Clear intent in route definitions
7. ✅ **Defense-in-depth**: Multiple security layers

**vs. Component/Service-only approach:**

1. ❌ Authorization mixed with business logic
2. ❌ Duplicate code in every service method
3. ❌ Hard to test authorization separately
4. ❌ Easy to forget checks in new methods
5. ❌ Not following framework patterns

---

## Next Steps

1. Apply `ResourceOwnershipGuard` to all protected routes
2. Add UUID validation pipes
3. Implement audit logging for security events
4. Add rate limiting to prevent abuse
5. Write comprehensive authorization tests
6. Document authorization in Swagger/OpenAPI
