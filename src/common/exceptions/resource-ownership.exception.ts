import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom exception for resource ownership violations.
 * Provides more specific error messaging than generic ForbiddenException.
 * 
 * @example
 * throw new ResourceOwnershipException('skill', skillId, userId);
 */
export class ResourceOwnershipException extends HttpException {
  constructor(
    resourceType: string,
    resourceId: string,
    userId: string,
  ) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: `Access denied: You do not own this ${resourceType}`,
        error: 'Forbidden',
        details: {
          resourceType,
          resourceId,
          attemptedBy: userId,
          reason: 'ownership_required',
        },
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Exception for when a resource is not found.
 * Extends NotFoundException with additional context.
 */
export class ResourceNotFoundException extends HttpException {
  constructor(resourceType: string, resourceId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} not found`,
        error: 'Not Found',
        details: {
          resourceType,
          resourceId,
        },
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
