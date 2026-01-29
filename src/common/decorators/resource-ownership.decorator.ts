import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for resource ownership check
 */
export const RESOURCE_OWNERSHIP_KEY = 'resourceOwnership';

/**
 * Decorator to mark a route as requiring resource ownership verification.
 * 
 * Must be used in conjunction with:
 * 1. @UseGuards(JwtAuthGuard) - to authenticate the user
 * 2. @UseGuards(ResourceOwnershipGuard) - to verify ownership
 * 
 * @param resourceType - The type of resource to check (e.g., 'skill', 'request')
 * 
 * @example
 * @Patch(':id')
 * @UseGuards(JwtAuthGuard, ResourceOwnershipGuard)
 * @CheckResourceOwnership('skill')
 * update(@Param('id') id: string, @GetUser() user: User) {
 *   // Only the skill owner can reach this point
 * }
 */
export const CheckResourceOwnership = (resourceType: string) =>
  SetMetadata(RESOURCE_OWNERSHIP_KEY, resourceType);
