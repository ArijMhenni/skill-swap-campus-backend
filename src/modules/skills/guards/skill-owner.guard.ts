import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../entities/skill.entity';

@Injectable()
export class SkillOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const skillId = request.params.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
      relations: ['user'],
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${skillId} not found`);
    }

    if (skill.user.id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to modify this skill',
      );
    }

    return true;
  }
}
