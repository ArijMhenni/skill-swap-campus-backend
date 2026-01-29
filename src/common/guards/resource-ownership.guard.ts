import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../../modules/skills/entities/skill.entity';
import { RESOURCE_OWNERSHIP_KEY } from '../decorators/resource-ownership.decorator';
import { 
  ResourceOwnershipException, 
  ResourceNotFoundException 
} from '../exceptions/resource-ownership.exception';

/**
 * Guard to verify that the authenticated user owns the requested resource.
 * 
 * This guard implements the "defense-in-depth" security principle by checking
 * resource ownership at the route level before business logic executes.
 * 
 * Requirements:
 * - Must be used AFTER JwtAuthGuard (requires authenticated user)
 * - Requires @CheckResourceOwnership decorator with resource type
 * - Resource ID must be in route params as 'id'
 * 
 * Security Features:
 * - Validates user authentication
 * - Verifies resource exists
 * - Confirms user ownership
 * - Logs authorization violations
 * - Provides specific error messages
 * 
 * @example
 * @UseGuards(JwtAuthGuard, ResourceOwnershipGuard)
 * @CheckResourceOwnership('skill')
 * update(@Param('id') id: string, @GetUser() user: User) { ... }
 */
@Injectable()
export class ResourceOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(ResourceOwnershipGuard.name);

  constructor(
    private reflector: Reflector,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    // Add other repositories as needed for different resource types
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get the resource type from metadata set by @CheckResourceOwnership decorator
    const resourceType = this.reflector.getAllAndOverride<string>(
      RESOURCE_OWNERSHIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no resource type specified, skip this guard
    if (!resourceType) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;

    // Validate user exists (should be ensured by JwtAuthGuard)
    if (!user || !user.id) {
      this.logger.warn('ResourceOwnershipGuard called without authenticated user');
      throw new ForbiddenException('User authentication required');
    }

    // Validate resource ID exists
    if (!resourceId) {
      throw new BadRequestException('Resource ID is required');
    }

    // Check ownership based on resource type
    try {
      const isOwner = await this.checkOwnership(
        resourceType,
        resourceId,
        user.id,
        request,
      );

      if (!isOwner) {
        // Log authorization violation for security monitoring
        this.logger.warn(
          `Authorization denied: User ${user.id} attempted to access ${resourceType} ${resourceId} without ownership`,
        );
        
        throw new ResourceOwnershipException(resourceType, resourceId, user.id);
      }

      return true;
    } catch (error) {
      // Re-throw known exceptions
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      
      // Log unexpected errors
      this.logger.error(
        `Unexpected error in ownership check: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to verify resource ownership');
    }
  }

  /**
   * Check if the user owns the specified resource
   * 
   * @param resourceType - Type of resource (e.g., 'skill', 'request')
   * @param resourceId - ID of the resource
   * @param userId - ID of the user making the request
   * @param request - Express request object (for caching loaded resource)
   * @returns true if user owns the resource
   * @throws NotFoundException if resource doesn't exist
   */
  private async checkOwnership(
    resourceType: string,
    resourceId: string,
    userId: string,
    request: any,
  ): Promise<boolean> {
    switch (resourceType.toLowerCase()) {
      case 'skill':
        return this.checkSkillOwnership(resourceId, userId, request);
      
      // Add more resource types here as needed
      // case 'request':
      //   return this.checkRequestOwnership(resourceId, userId, request);
      // case 'message':
      //   return this.checkMessageOwnership(resourceId, userId, request);
      
      default:
        this.logger.error(`Unknown resource type: ${resourceType}`);
        throw new BadRequestException(`Unknown resource type: ${resourceType}`);
    }
  }

  /**
   * Check if user owns a skill
   * 
   * Performance optimization: Caches the loaded skill in the request object
   * to prevent duplicate queries in the service layer.
   */
  private async checkSkillOwnership(
    skillId: string,
    userId: string,
    request: any,
  ): Promise<boolean> {
    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
      relations: ['user'],
    });

    if (!skill) {
      throw new ResourceNotFoundException('skill', skillId);
    }

    // Cache the skill in request for potential reuse in service layer
    // This prevents duplicate database queries
    request.preloadedSkill = skill;

    return skill.user?.id === userId;
  }
}
