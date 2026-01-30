import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Role } from '../../../common/enums/role.enum';
import { ERROR_MESSAGES } from '../../../common/constants/error-messages.constant';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.UNAUTHENTICATED);
    }

    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(ERROR_MESSAGES.ADMIN.FORBIDDEN);
    }

    return true;
  }
}
