import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { RatingsService } from '../ratings.service';

@Injectable()
export class RatingAccessGuard implements CanActivate {
  constructor(private ratingsService: RatingsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const requestId = request.body.requestId || request.params.requestId;

    const canRate = await this.ratingsService.canUserRate(userId, requestId);
    
    if (!canRate.allowed) {
      throw new ForbiddenException(canRate.reason);
    }

    return true;
  }
}