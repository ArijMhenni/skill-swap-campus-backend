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
import { SkillType } from '../../common/enums/skill-type.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createSkillDto: CreateSkillDto, userId: string): Promise<Skill> {
    const skill = this.skillRepository.create({
      ...createSkillDto,
      user: { id: userId } as any,
    });

    const savedSkill = await this.skillRepository.save(skill);

    // Mettre à jour les offered_skills ou wanted_skills de l'utilisateur
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      if (createSkillDto.type === SkillType.OFFER) {
        const offeredSkills = user.offeredSkills || [];
        if (!offeredSkills.includes(savedSkill.title)) {
          user.offeredSkills = [...offeredSkills, savedSkill.title];
        }
      } else if (createSkillDto.type === SkillType.REQUEST) {
        const wantedSkills = user.wantedSkills || [];
        if (!wantedSkills.includes(savedSkill.title)) {
          user.wantedSkills = [...wantedSkills, savedSkill.title];
        }
      }
      await this.userRepository.save(user);
    }

    return savedSkill;
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

    // Defense-in-depth: Guard should prevent this, but validate anyway
    if (skill.user.id !== userId) {
      throw new ForbiddenException(
        'Authorization check failed: You can only update your own skills',
      );
    }

    const oldTitle = skill.title;
    const newTitle = updateSkillDto.title;

    // Mettre à jour la compétence
    Object.assign(skill, updateSkillDto);
    const updatedSkill = await this.skillRepository.save(skill);

    // Si le titre a changé, mettre à jour la liste de compétences de l'utilisateur
    if (newTitle && oldTitle !== newTitle) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        if (skill.type === SkillType.OFFER) {
          const offeredSkills = user.offeredSkills || [];
          const index = offeredSkills.indexOf(oldTitle);
          if (index !== -1) {
            offeredSkills[index] = newTitle;
            user.offeredSkills = offeredSkills;
          }
        } else if (skill.type === SkillType.REQUEST) {
          const wantedSkills = user.wantedSkills || [];
          const index = wantedSkills.indexOf(oldTitle);
          if (index !== -1) {
            wantedSkills[index] = newTitle;
            user.wantedSkills = wantedSkills;
          }
        }
        await this.userRepository.save(user);
      }
    }

    return updatedSkill;
  }

  async delete(id: string, userId: string): Promise<void> {
    const skill = await this.findOne(id);

    // Defense-in-depth: Guard should prevent this, but validate anyway
    if (skill.user.id !== userId) {
      throw new ForbiddenException(
        'Authorization check failed: You can only delete your own skills',
      );
    }

    // Soft delete : changer le status à DELETED
    skill.status = SkillStatus.DELETED;
    await this.skillRepository.save(skill);

    // Retirer la compétence des offered_skills ou wanted_skills de l'utilisateur
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      if (skill.type === SkillType.OFFER) {
        user.offeredSkills = (user.offeredSkills || []).filter(
          (s) => s !== skill.title,
        );
      } else if (skill.type === SkillType.REQUEST) {
        user.wantedSkills = (user.wantedSkills || []).filter(
          (s) => s !== skill.title,
        );
      }
      await this.userRepository.save(user);
    }
  }

  async findByUser(userId: string): Promise<Skill[]> {
    return await this.skillRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
