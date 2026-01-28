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
import { CreateRequestDto } from './dto/create-request.dto';
import { FilterRequestDto } from './dto/filter-request.dto';
import { Skill } from '../skills/entities/skill.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(SkillRequest)
    private readonly requestRepository: Repository<SkillRequest>,

    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}


  async create(createRequestDto: CreateRequestDto, userId: string): Promise<SkillRequest> {
    const { skillId, message } = createRequestDto;

    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
      relations: ['user'],
    });

    if (!skill) {
      throw new NotFoundException('Compétence non trouvée');
    }

    if (!skill.user) {
      throw new BadRequestException("Cette compétence n'a pas de propriétaire");
    }

    if (skill.user.id === userId) {
      throw new BadRequestException('Vous ne pouvez pas demander votre propre compétence');
    }

    const existingRequest = await this.requestRepository.findOne({
      where: {
        skillId,
        requesterId: userId,
        status: RequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Vous avez déjà une demande en attente pour cette compétence');
    }

    const request = this.requestRepository.create({
      skillId,
      requesterId: userId,
      providerId: skill.user.id,
      message,
      status: RequestStatus.PENDING,
    });

    const saved = await this.requestRepository.save(request);

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

    if (!request) throw new NotFoundException('Demande non trouvée');
    if (request.requesterId !== userId && request.providerId !== userId)
      throw new ForbiddenException("Vous n'avez pas accès à cette demande");

    return request;
  }
  async updateStatus(id: string, userId: string, newStatus: RequestStatus): Promise<SkillRequest> {
    const request = await this.findOne(id, userId);
    this.validateStatusTransition(request, userId, newStatus);

    request.status = newStatus;
    return await this.requestRepository.save(request);
  }


  private validateStatusTransition(request: SkillRequest, userId: string, newStatus: RequestStatus): void {
    const isRequester = request.requesterId === userId;
    const isProvider = request.providerId === userId;

    if (request.status === RequestStatus.PENDING && [RequestStatus.ACCEPTED, RequestStatus.REJECTED].includes(newStatus)) {
      if (!isProvider) throw new ForbiddenException('Seul le fournisseur peut accepter ou rejeter');
      return;
    }

    if (request.status === RequestStatus.PENDING && newStatus === RequestStatus.CANCELLED) {
      if (!isRequester) throw new ForbiddenException('Seul le demandeur peut annuler');
      return;
    }

    if (request.status === RequestStatus.ACCEPTED && newStatus === RequestStatus.COMPLETED) {
      if (!isRequester && !isProvider) throw new ForbiddenException('Seuls les participants peuvent compléter');
      return;
    }

    throw new BadRequestException(`Transition invalide : ${request.status} → ${newStatus}`);
  }

  async canAccessRequest(requestId: string, userId: string): Promise<boolean> {
    const request = await this.requestRepository.findOne({ where: { id: requestId } });
    if (!request) return false;
    return request.requesterId === userId || request.providerId === userId;
  }
}