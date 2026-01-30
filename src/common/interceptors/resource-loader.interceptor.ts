import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../../modules/skills/entities/skill.entity';

export const PRELOAD_RESOURCE_KEY = 'preloadResource';

/**
 * Interceptor to preload resources before handler execution.
 * This prevents duplicate database queries and attaches the resource to the request.
 * 
 * Usage:
 * @UseInterceptors(ResourceLoaderInterceptor)
 * @PreloadResource('skill')
 * update(@Param('id') id: string, @Req() request) {
 *   const skill = request.skill; // Already loaded
 * }
 */
@Injectable()
export class ResourceLoaderInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const resourceType = this.reflector.getAllAndOverride<string>(
      PRELOAD_RESOURCE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!resourceType) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const resourceId = request.params.id;

    if (resourceId) {
      const resource = await this.loadResource(resourceType, resourceId);
      // Attach resource to request object for use in guards/controllers
      request[resourceType] = resource;
    }

    return next.handle();
  }

  private async loadResource(resourceType: string, resourceId: string): Promise<any> {
    switch (resourceType.toLowerCase()) {
      case 'skill':
        const skill = await this.skillRepository.findOne({
          where: { id: resourceId },
          relations: ['user'],
        });
        if (!skill) {
          throw new NotFoundException(`Skill with ID ${resourceId} not found`);
        }
        return skill;
      
      default:
        return null;
    }
  }
}

/**
 * Decorator to mark that a resource should be preloaded
 */
export const PreloadResource = (resourceType: string) =>
  Reflect.metadata(PRELOAD_RESOURCE_KEY, resourceType);
