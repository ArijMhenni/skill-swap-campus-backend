import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ERROR_MESSAGES } from '../../../common/constants/error-messages.constant';

@Injectable()
export class BanCheckInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return next.handle();
    }

    if (user.isBanned) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.USER_BANNED);
    }

    return next.handle();
  }
}
