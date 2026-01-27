// src/modules/requests/requests.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillRequest } from './entities/request-skill.entity';  // 
import { RequestStatus } from '../../common/enums/request-status.enum';
import { CreateRequestDto } from './dto/create-request.dto';
import { FilterRequestDto } from './dto/filter-request.dto';
import { Skill } from '../skills/entities/skill.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(SkillRequest)  
    private readonly requestRepository: Repository<SkillRequest>,  // 
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async create(
    createRequestDto: CreateRequestDto,
    userId: string,
  ): Promise<SkillRequest> { 
    const { skillId, message } = createRequestDto;

    console.log('==========================================');
    console.log('📝 CREATE REQUEST');
    console.log('skillId:', skillId);
    console.log('userId (requester):', userId);

    // Vérifier que la skill existe
    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
      relations: ['user'],
    });

    console.log('Skill trouvée:', skill ? 'OUI' : 'NON');

    if (!skill) {
      console.error('❌ Skill non trouvée');
      throw new NotFoundException('Compétence non trouvée');
    }

    if (!skill.user) {
      console.error('❌ Skill sans propriétaire');
      throw new BadRequestException('Cette compétence n\'a pas de propriétaire');
    }

    console.log('Skill user id:', skill.user.id);

    // Vérifier qu'on ne demande pas sa propre skill
    if (skill.user.id === userId) {
      console.error('❌ Tentative de demander sa propre skill');
      throw new BadRequestException(
        'Vous ne pouvez pas demander votre propre compétence',
      );
    }

    // Vérifier qu'il n'existe pas déjà une demande en attente
    const existingRequest = await this.requestRepository.findOne({
      where: {
        skillId: skillId,
        requesterId: userId,
        status: RequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      console.error('❌ Demande en attente existe déjà');
      throw new BadRequestException(
        'Vous avez déjà une demande en attente pour cette compétence',
      );
    }

    // Créer la demande
    const request = this.requestRepository.create({
      skillId: skillId,
      requesterId: userId,
      providerId: skill.user.id,
      message: message,
      status: RequestStatus.PENDING,
    });

    console.log('Request créée:', {
      skillId: request.skillId,
      requesterId: request.requesterId,
      providerId: request.providerId,
    });

    const saved = await this.requestRepository.save(request);

    console.log('✅ Request sauvegardée:', saved.id);
    console.log('==========================================');

    return saved;
  }

  async findMyRequests(
    userId: string,
    filters: FilterRequestDto,
  ): Promise<SkillRequest[]> {   
    const { status, role } = filters;

    const queryBuilder = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.skill', 'skill')
      .leftJoinAndSelect('request.requester', 'requester')
      .leftJoinAndSelect('request.provider', 'provider')
      .orderBy('request.createdAt', 'DESC');

    // Filtrer par rôle
    if (role === 'asRequester') {
      queryBuilder.where('request.requester_id = :userId', { userId });
    } else if (role === 'asProvider') {
      queryBuilder.where('request.provider_id = :userId', { userId });
    } else {
      queryBuilder.where(
        '(request.requester_id = :userId OR request.provider_id = :userId)',
        { userId },
      );
    }

    // Filtrer par statut
    if (status) {
      queryBuilder.andWhere('request.status = :status', { status });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string, userId: string): Promise<SkillRequest> {   
    const request = await this.requestRepository.findOne({
      where: { id: id },
      relations: ['skill', 'requester', 'provider'],
    });

    if (!request) {
      throw new NotFoundException('Demande non trouvée');
    }

    if (request.requesterId !== userId && request.providerId !== userId) {
      throw new ForbiddenException('Vous n\'avez pas accès à cette demande');
    }

    return request;
  }

  async updateStatus(
    id: string,
    userId: string,
    newStatus: RequestStatus,
  ): Promise<SkillRequest> {  // 
    const request = await this.findOne(id, userId);

    this.validateStatusTransition(request, userId, newStatus);

    request.status = newStatus;
    return await this.requestRepository.save(request);
  }

  private validateStatusTransition(
    request: SkillRequest,  // 
    userId: string,
    newStatus: RequestStatus,
  ): void {
    const currentStatus = request.status;
    const isRequester = request.requesterId === userId;
    const isProvider = request.providerId === userId;

    if (
      currentStatus === RequestStatus.PENDING &&
      (newStatus === RequestStatus.ACCEPTED ||
        newStatus === RequestStatus.REJECTED)
    ) {
      if (!isProvider) {
        throw new ForbiddenException(
          'Seul le fournisseur peut accepter ou rejeter une demande',
        );
      }
      return;
    }

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