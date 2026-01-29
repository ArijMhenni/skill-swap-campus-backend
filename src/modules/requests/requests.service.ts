import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillRequest } from './entities/request-skill.entity';
import { RequestStatus } from '../../common/enums/request-status.enum';
import { SkillType } from '../../common/enums/skill-type.enum';
import { CreateRequestDto } from './dto/create-request.dto';
import { FilterRequestDto } from './dto/filter-request.dto';
import { Skill } from '../skills/entities/skill.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(SkillRequest)
    private readonly requestRepository: Repository<SkillRequest>,

    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,

    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createRequestDto: CreateRequestDto, userId: string): Promise<SkillRequest> {
    const { skillId, message } = createRequestDto;

    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
      relations: ['user'],
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    if (!skill.user) {
      throw new BadRequestException("This skill has no owner");
    }

    if (skill.user.id === userId) {
      throw new BadRequestException('You cannot request your own skill');
    }

    const existingRequest = await this.requestRepository.findOne({
      where: {
        skillId,
        requesterId: userId,
        status: RequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('You already have a pending request for this skill');
    }

    const request = this.requestRepository.create({
      skillId,
      requesterId: userId,
      providerId: skill.user.id,
      message,
      status: RequestStatus.PENDING,
    });

    const saved = await this.requestRepository.save(request);

    // Message différent selon le type de skill
    let notificationTitle: string;
    let notificationMessage: string;

    if (skill.type === SkillType.OFFER) {
      // Quelqu'un veut apprendre cette compétence
      notificationTitle = 'Nouvelle demande d\'apprentissage';
      notificationMessage = `Quelqu'un souhaite apprendre "${skill.title}" avec vous`;
    } else {
      // Quelqu'un propose son aide pour cette demande
      notificationTitle = 'Proposition d\'aide reçue';
      notificationMessage = `Quelqu'un propose de vous aider pour "${skill.title}"`;
    }

    try {
      await this.notificationsService.create(
        skill.user.id,
        notificationTitle,
        notificationMessage,
        saved.id,
      );
    } catch (error) {
      console.error('Error creating notification:', error);
      // Ne pas bloquer la création de la request si la notification échoue
    }

    return saved;
  }

  async findMyRequests(userId: string, filters: FilterRequestDto): Promise<SkillRequest[]> {
    const { role, status } = filters;

    const query = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.skill', 'skill')
      .leftJoinAndSelect('request.requester', 'requester')
      .leftJoinAndSelect('request.provider', 'provider')
      .orderBy('request.createdAt', 'DESC');

    if (role === 'asRequester') {
      query.where('request.requester_id = :userId', { userId });
    } else if (role === 'asProvider') {
      query.where('request.provider_id = :userId', { userId });
    } else {
      query.where('(request.requester_id = :userId OR request.provider_id = :userId)', { userId });
    }

    if (status) {
      query.andWhere('request.status = :status', { status });
    }

    const result = await query.getMany();
    return result;
  }

  async findOne(id: string, userId: string): Promise<SkillRequest> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['skill', 'requester', 'provider'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.requesterId !== userId && request.providerId !== userId) {
      throw new ForbiddenException("You do not have access to this request");
    }

    return request;
  }

  async updateStatus(id: string, userId: string, newStatus: RequestStatus): Promise<SkillRequest> {
    const request = await this.findOne(id, userId);
    this.validateStatusTransition(request, userId, newStatus);

    const oldStatus = request.status;
    request.status = newStatus;
    const updatedRequest = await this.requestRepository.save(request);

    try {
      await this.createStatusChangeNotification(request, userId, newStatus);
    } catch (error) {
      console.error('Error creating notification:', error);
      // Ne pas bloquer la mise à jour si la notification échoue
    }

    return updatedRequest;
  }
  private validateStatusTransition(request: SkillRequest, userId: string, newStatus: RequestStatus): void {
    const isRequester = request.requesterId === userId;
    const isProvider = request.providerId === userId;

    if (request.status === RequestStatus.PENDING && [RequestStatus.ACCEPTED, RequestStatus.REJECTED].includes(newStatus)) {
      if (!isProvider) {
        throw new ForbiddenException('Only the provider can accept or reject');
      }
      return;
    }

    if (request.status === RequestStatus.PENDING && newStatus === RequestStatus.CANCELLED) {
      if (!isRequester) {
        throw new ForbiddenException('Only the requester can cancel');
      }
      return;
    }

    if (request.status === RequestStatus.ACCEPTED && newStatus === RequestStatus.COMPLETED) {
      if (!isRequester && !isProvider) {
        throw new ForbiddenException('Only participants can complete');
      }
      return;
    }

    throw new BadRequestException(`Invalid transition: ${request.status} → ${newStatus}`);
  }

  async canAccessRequest(requestId: string, userId: string): Promise<boolean> {
    const request = await this.requestRepository.findOne({ 
      where: { id: requestId } 
    });

    if (!request) {
      return false;
    }

    return request.requesterId === userId || request.providerId === userId;
  }

  private async createStatusChangeNotification(
    request: SkillRequest,
    userId: string,
    newStatus: RequestStatus,
  ): Promise<void> {
    
    const otherUserId = request.requesterId === userId ? request.providerId : request.requesterId;

    let title: string;
    let message: string;

    
    switch (newStatus) {
      case RequestStatus.ACCEPTED:
        title = 'Request Accepted!';
        message = `Your request for "${request.skill?.title}" has been accepted just now`;
        break;

      case RequestStatus.REJECTED:
        title = 'Request Rejected';
        message = `Your request for "${request.skill?.title}" has been rejected`;
        break;

      case RequestStatus.COMPLETED:
        title = 'Exchange Completed';
        message = `The exchange "${request.skill?.title}" has been marked as completed`;
        break;

      case RequestStatus.CANCELLED:
        title = 'Request Cancelled';
        message = `A request for "${request.skill?.title}" has been cancelled`;
        break;

      default:
        return; // Pas de notification pour les autres statuts
    }

    await this.notificationsService.create(
      otherUserId,
      title,
      message,
      request.id,
    );
  }
}