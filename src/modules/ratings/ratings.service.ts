import  {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { SkillRequest } from '../requests/entities/request-skill.entity'; 
import { User } from '../users/entities/user.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingResponseDto } from './dto/rating-response.dto';
import { RatingSummaryDto } from './dto/rating-summary.dto';
import { RATING_MESSAGES } from '../../common/constants/rating-messages.constant';
import { RequestStatus } from '../../common/enums/request-status.enum';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    
    @InjectRepository(SkillRequest)  // ✅
    private readonly requestRepository: Repository<SkillRequest>,  // ✅
    
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createRatingDto: CreateRatingDto,
    userId: string,
  ): Promise<RatingResponseDto> {
    const { requestId, stars, comment } = createRatingDto;

    // Vérifier que la requête existe
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(RATING_MESSAGES.REQUEST_NOT_FOUND);
    }

    // Vérifier que la requête est complétée
    if (request.status !== RequestStatus.COMPLETED) {
      throw new BadRequestException(RATING_MESSAGES.REQUEST_NOT_COMPLETED);
    }

    // Vérifier que l'utilisateur est participant
    const isRequester = request.requester?.id === userId || request.requesterId === userId;
    const isProvider = request.provider?.id === userId || request.providerId === userId;

    if (!isRequester && !isProvider) {
      throw new ForbiddenException(RATING_MESSAGES.UNAUTHORIZED);
    }

    // Déterminer qui est noté
    const ratedUserId = isRequester 
      ? (request.provider?.id || request.providerId)
      : (request.requester?.id || request.requesterId);

    // Vérifier qu'on ne s'auto-évalue pas
    if (ratedUserId === userId) {
      throw new BadRequestException(RATING_MESSAGES.CANNOT_RATE_SELF);
    }

    // Vérifier qu'on n'a pas déjà noté
    const existingRating = await this.ratingRepository.findOne({
      where: {
        request: { id: requestId },
        rater: { id: userId },
      },
    });

    if (existingRating) {
      throw new BadRequestException(RATING_MESSAGES.ALREADY_RATED);
    }

    // Charger les entités User et Request
    const rater = await this.userRepository.findOne({ where: { id: userId } });
    const ratedUser = await this.userRepository.findOne({ where: { id: ratedUserId } });

    if (!rater || !ratedUser) {
      throw new NotFoundException('User not found');
    }

    // Créer la notation
    const rating = this.ratingRepository.create({
      request,
      rater,
      ratedUser,
      stars,
      comment,
    });

    const savedRating = await this.ratingRepository.save(rating);

    // Charger les relations pour la réponse
    const ratingWithRelations = await this.ratingRepository.findOne({
      where: { id: savedRating.id },
      relations: ['rater', 'ratedUser', 'request'],
    });

    if (!ratingWithRelations) {
      throw new NotFoundException('Rating not found after save');
    }

    return {
      id: ratingWithRelations.id,
      requestId: ratingWithRelations.request.id,
      raterId: ratingWithRelations.rater.id,
      raterName: `${ratingWithRelations.rater.firstName} ${ratingWithRelations.rater.lastName}`,
      ratedUserId: ratingWithRelations.ratedUser.id,
      stars: ratingWithRelations.stars,
      comment: ratingWithRelations.comment,
      createdAt: ratingWithRelations.createdAt,
    };
  }

  async findByUser(userId: string): Promise<RatingResponseDto[]> {
    const ratings = await this.ratingRepository.find({
      where: { ratedUser: { id: userId } },
      relations: ['rater', 'ratedUser', 'request'],
      order: { createdAt: 'DESC' },
    });

    return ratings.map((rating) => ({
      id: rating.id,
      requestId: rating.request.id,
      raterId: rating.rater.id,
      raterName: `${rating.rater.firstName} ${rating.rater.lastName}`,
      ratedUserId: rating.ratedUser.id,
      stars: rating.stars,
      comment: rating.comment,
      createdAt: rating.createdAt,
    }));
  }

  async getSummary(userId: string): Promise<RatingSummaryDto> {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .leftJoin('rating.ratedUser', 'ratedUser')
      .select('AVG(rating.stars)', 'average')
      .addSelect('COUNT(rating.id)', 'total')
      .where('ratedUser.id = :userId', { userId })
      .getRawOne();

    return {
      averageRating: parseFloat(result.average) || 0,
      totalRatings: parseInt(result.total) || 0,
    };
  }
}
