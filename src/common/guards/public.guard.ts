import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Guard to allow public access to specific routes.
 * By default, if JwtAuthGuard is applied globally, all routes require authentication.
 * Use @Public() decorator to bypass authentication for specific routes.
 * 
 * This is a best practice for API security - secure by default, opt-in for public routes.
 */
@Injectable()
export class PublicGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    return isPublic ?? false;
  }
}
