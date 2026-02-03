import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import {
  RatingResponseDto,
  RatingSummaryDto,
  PendingRatingDto,
} from './dto/rating-response.dto';

import { SkillRequest } from '../requests/entities/request-skill.entity';
import { RequestStatus } from '../../common/enums/request-status.enum';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,

    @InjectRepository(SkillRequest)
    private readonly requestRepository: Repository<SkillRequest>,
  ) {}

  // =========================
  // Creer une nouvelle evaluation
  // =========================
  async create(
    userId: string,
    createRatingDto: CreateRatingDto,
  ): Promise<RatingResponseDto> {
    const { requestId, stars, comment } = createRatingDto;

    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['skill', 'requester', 'provider'],
    });

    if (!request) {
      throw new NotFoundException('Request non trouvee');
    }

    if (request.status !== RequestStatus.COMPLETED) {
      throw new BadRequestException(
        'Vous ne pouvez evaluer que les echanges termines',
      );
    }

    const isRequester = request.requesterId === userId;
    const isProvider = request.providerId === userId;

    if (!isRequester && !isProvider) {
      throw new ForbiddenException(
        'Vous ne pouvez pas evaluer cet echange',
      );
    }

    const ratedUserId = isRequester
      ? request.providerId
      : request.requesterId;

    const existingRating = await this.ratingRepository.findOne({
      where: { requestId, raterId: userId },
    });

    if (existingRating) {
      throw new BadRequestException('Vous avez deja evalue cet echange');
    }

    const rating = this.ratingRepository.create({
      requestId,
      raterId: userId,
      ratedUserId,
      stars,
      comment,
    });

    const savedRating = await this.ratingRepository.save(rating);

    const fullRating = await this.ratingRepository.findOne({
      where: { id: savedRating.id },
      relations: ['rater', 'ratedUser', 'request', 'request.skill'],
    });

    if (!fullRating) {
      throw new NotFoundException('Rating introuvable apres creation');
    }

    return this.toResponseDto(fullRating);
  }

  // =========================
  // Evaluations recues
  // =========================
  async getReceivedRatings(userId: string): Promise<RatingResponseDto[]> {
    const ratings = await this.ratingRepository.find({
      where: { ratedUserId: userId },
      relations: ['rater', 'ratedUser', 'request', 'request.skill'],
      order: { createdAt: 'DESC' },
    });

    return ratings.map((r) => this.toResponseDto(r));
  }

  // =========================
  // Evaluations donnees
  // =========================
  async getGivenRatings(userId: string): Promise<RatingResponseDto[]> {
    const ratings = await this.ratingRepository.find({
      where: { raterId: userId },
      relations: ['rater', 'ratedUser', 'request', 'request.skill'],
      order: { createdAt: 'DESC' },
    });

    return ratings.map((r) => this.toResponseDto(r));
  }

  // =========================
  // Evaluations publiques d’un utilisateur
  // =========================
  async getUserRatings(userId: string): Promise<RatingResponseDto[]> {
    const ratings = await this.ratingRepository.find({
      where: { ratedUserId: userId },
      relations: ['rater', 'ratedUser', 'request', 'request.skill'],
      order: { createdAt: 'DESC' },
    });

    return ratings.map((r) => this.toResponseDto(r));
  }

  // =========================
  // Resume de reputation
  // =========================
  async getUserSummary(userId: string): Promise<RatingSummaryDto> {
    const ratings = await this.ratingRepository.find({
      where: { ratedUserId: userId },
    });

    if (ratings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const totalStars = ratings.reduce((sum, r) => sum + r.stars, 0);
    const averageRating =
      Math.round((totalStars / ratings.length) * 10) / 10;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((r) => {
      ratingDistribution[r.stars]++;
    });

    return {
      averageRating,
      totalRatings: ratings.length,
      ratingDistribution,
    };
  }

  // =========================
  // Evaluations en attente
  // =========================
  async getPendingRatings(userId: string): Promise<PendingRatingDto[]> {
    const completedRequests = await this.requestRepository.find({
      where: [
        { requesterId: userId, status: RequestStatus.COMPLETED },
        { providerId: userId, status: RequestStatus.COMPLETED },
      ],
      relations: ['skill', 'requester', 'provider'],
      order: { updatedAt: 'DESC' },
    });

    const pendingRatings: PendingRatingDto[] = [];

    for (const request of completedRequests) {
      const existingRating = await this.ratingRepository.findOne({
        where: { requestId: request.id, raterId: userId },
      });

      if (!existingRating) {
        const isRequester = request.requesterId === userId;
        const userToRate = isRequester
          ? request.provider
          : request.requester;

        pendingRatings.push({
          requestId: request.id,
          user: {
            id: userToRate.id,
            firstName: userToRate.firstName,
            lastName: userToRate.lastName,
            profilePicture: userToRate.avatar ?? undefined,
          },
          skillTitle: request.skill?.title || 'Competence supprimee',
          completedAt: request.updatedAt,
        });
      }
    }

    return pendingRatings;
  }

  // =========================
  // Verifier si un utilisateur peut evaluer
  // =========================
  async canUserRate(
    userId: string,
    requestId: string,
  ): Promise<{ allowed: boolean; reason?: string }> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      return { allowed: false, reason: 'Request non trouvee' };
    }

    if (request.status !== RequestStatus.COMPLETED) {
      return {
        allowed: false,
        reason: 'La request doit etre completee pour evaluer',
      };
    }

    const isParticipant =
      request.requesterId === userId ||
      request.providerId === userId;

    if (!isParticipant) {
      return {
        allowed: false,
        reason: 'Vous ne participez pas a cet echange',
      };
    }

    const existingRating = await this.ratingRepository.findOne({
      where: { requestId, raterId: userId },
    });

    if (existingRating) {
      return { allowed: false, reason: 'Vous avez deja evalue cet echange' };
    }

    return { allowed: true };
  }

  // =========================
  // Mapper vers DTO
  // =========================
  // =========================
// Mapper vers DTO
// =========================
private toResponseDto(rating: Rating): RatingResponseDto {
  return {
    id: rating.id,
    requestId: rating.requestId,

    raterId: rating.raterId,
    rater: {
      id: rating.rater.id,
      firstName: rating.rater.firstName,
      lastName: rating.rater.lastName,
      profilePicture: rating.rater.avatar ?? undefined,
    },

    ratedUserId: rating.ratedUserId,
    ratedUser: {
      id: rating.ratedUser.id,
      firstName: rating.ratedUser.firstName,
      lastName: rating.ratedUser.lastName,
      profilePicture: rating.ratedUser.avatar ?? undefined,
    },

    skillTitle: rating.request?.skill?.title ?? 'Compétence supprimée',
    stars: rating.stars,
    comment: rating.comment ?? undefined, 
    createdAt: rating.createdAt,
  };
}

}
