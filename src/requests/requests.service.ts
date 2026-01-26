import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, RequestStatus } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { FilterRequestDto } from './dto/filter-request.dto';
import { Skill } from '../modules/skills/entities/skill.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async create(
    createRequestDto: CreateRequestDto,
    userId: string,
  ): Promise<Request> {
    const { skillId, message } = createRequestDto;

    // Vérifier que la skill existe
    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
      relations: ['user'],
    });

    if (!skill) {
      throw new NotFoundException('Compétence non trouvée');
    }

    // Vérifier qu'on ne demande pas sa propre skill
    if (skill.id === userId) {
      throw new BadRequestException(
        'Vous ne pouvez pas demander votre propre compétence',
      );
    }

    // Vérifier qu'il n'existe pas déjà une demande en attente
    const existingRequest = await this.requestRepository.findOne({
      where: {
        skillId,
        requesterId: userId,
        status: RequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException(
        'Vous avez déjà une demande en attente pour cette compétence',
      );
    }

    // Créer la demande
    const request = this.requestRepository.create({
      skillId,
      requesterId: userId,
      providerId: skill.id,
      message,
      status: RequestStatus.PENDING,
    });

    return await this.requestRepository.save(request);
  }

  async findMyRequests(
    userId: string,
    filters: FilterRequestDto,
  ): Promise<Request[]> {
    const { status, role } = filters;

    const queryBuilder = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.skill', 'skill')
      .leftJoinAndSelect('request.requester', 'requester')
      .leftJoinAndSelect('request.provider', 'provider')
      .orderBy('request.createdAt', 'DESC');

    // Filtrer par rôle
    if (role === 'asRequester') {
      queryBuilder.where('request.requesterId = :userId', { userId });
    } else if (role === 'asProvider') {
      queryBuilder.where('request.providerId = :userId', { userId });
    } else {
      // Par défaut, afficher toutes les demandes de l'utilisateur
      queryBuilder.where(
        '(request.requesterId = :userId OR request.providerId = :userId)',
        { userId },
      );
    }

    // Filtrer par statut
    if (status) {
      queryBuilder.andWhere('request.status = :status', { status });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string, userId: string): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['skill', 'requester', 'provider'],
    });

    if (!request) {
      throw new NotFoundException('Demande non trouvée');
    }

    // Vérifier que l'utilisateur a accès à cette demande
    if (request.requesterId !== userId && request.providerId !== userId) {
      throw new ForbiddenException(
        'Vous n\'avez pas accès à cette demande',
      );
    }

    return request;
  }

  async updateStatus(
    id: string,
    userId: string,
    newStatus: RequestStatus,
  ): Promise<Request> {
    const request = await this.findOne(id, userId);

    // Validation des transitions de statut
    this.validateStatusTransition(request, userId, newStatus);

    request.status = newStatus;
    return await this.requestRepository.save(request);
  }

  private validateStatusTransition(
    request: Request,
    userId: string,
    newStatus: RequestStatus,
  ): void {
    const currentStatus = request.status;
    const isRequester = request.requesterId === userId;
    const isProvider = request.providerId === userId;

    // PENDING → ACCEPTED/REJECTED (par provider uniquement)
    if (
      currentStatus === RequestStatus.PENDING &&
      (newStatus === RequestStatus.ACCEPTED || newStatus === RequestStatus.REJECTED)
    ) {
      if (!isProvider) {
        throw new ForbiddenException(
          'Seul le fournisseur peut accepter ou rejeter une demande',
        );
      }
      return;
    }

    // PENDING → CANCELLED (par requester uniquement)
    if (
      currentStatus === RequestStatus.PENDING &&
      newStatus === RequestStatus.CANCELLED
    ) {
      if (!isRequester) {
        throw new ForbiddenException(
          'Seul le demandeur peut annuler une demande en attente',
        );
      }
      return;
    }

    // ACCEPTED → COMPLETED (par les deux)
    if (
      currentStatus === RequestStatus.ACCEPTED &&
      newStatus === RequestStatus.COMPLETED
    ) {
      if (!isRequester && !isProvider) {
        throw new ForbiddenException(
          'Seuls les participants peuvent marquer comme complété',
        );
      }
      return;
    }

    // Transition invalide
    throw new BadRequestException(
      `Transition de statut invalide : ${currentStatus} → ${newStatus}`,
    );
  }

  async canAccessRequest(requestId: string, userId: string): Promise<boolean> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      return false;
    }

    return request.requesterId === userId || request.providerId === userId;
  }
}