import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../guards/public.guard';

/**
 * Decorator to mark a route as publicly accessible (no authentication required).
 * 
 * Use this when you have JwtAuthGuard applied globally but want specific routes
 * to be accessible without authentication.
 * 
 * @example
 * @Get()
 * @Public()
 * findAll() {
 *   return this.skillsService.findAll();
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
