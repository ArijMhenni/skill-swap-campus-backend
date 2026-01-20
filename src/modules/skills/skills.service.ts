import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { FilterSkillDto } from './dto/filter-skill.dto';
import { SkillStatus } from '../../common/enums/skill-status.enum';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async create(createSkillDto: CreateSkillDto, userId: string): Promise<Skill> {
    const skill = this.skillRepository.create({
      ...createSkillDto,
      user: { id: userId },
    });

    return await this.skillRepository.save(skill);
  }

  async findAll(filterDto: FilterSkillDto) {
    const { category, type, search, page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.skillRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.user', 'user')
      .where('skill.status = :status', { status: SkillStatus.ACTIVE });

    if (category) {
      queryBuilder.andWhere('skill.category = :category', { category });
    }

    if (type) {
      queryBuilder.andWhere('skill.type = :type', { type });
    }

    if (search) {
      queryBuilder.andWhere(
        '(skill.title LIKE :search OR skill.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('skill.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }

    return skill;
  }

  async update(
    id: string,
    updateSkillDto: UpdateSkillDto,
    userId: string,
  ): Promise<Skill> {
    const skill = await this.findOne(id);

    // Vérifier que l'utilisateur est le propriétaire
    if (skill.user.id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to update this skill',
      );
    }

    Object.assign(skill, updateSkillDto);
    return await this.skillRepository.save(skill);
  }

  async delete(id: string, userId: string): Promise<void> {
    const skill = await this.findOne(id);

    // Vérifier que l'utilisateur est le propriétaire
    if (skill.user.id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this skill',
      );
    }

    // Soft delete : changer le status à DELETED
    skill.status = SkillStatus.DELETED;
    await this.skillRepository.save(skill);
  }

  async findByUser(userId: string): Promise<Skill[]> {
    return await this.skillRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
