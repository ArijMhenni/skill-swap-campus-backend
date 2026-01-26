import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { RequestsService } from '../requests.service';

@Injectable()
export class RequestAccessGuard implements CanActivate {
  constructor(private readonly requestsService: RequestsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requestId = request.params.id;

    if (!user || !user.id) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    const hasAccess = await this.requestsService.canAccessRequest(
      requestId,
      user.id,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'Vous n\'avez pas accès à cette demande',
      );
    }

    return true;
  }
}