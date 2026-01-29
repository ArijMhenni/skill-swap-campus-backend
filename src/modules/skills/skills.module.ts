import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { Skill } from './entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { ResourceOwnershipGuard } from '../../common/guards/resource-ownership.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Skill, User])],
  controllers: [SkillsController],
  providers: [SkillsService, ResourceOwnershipGuard],
  exports: [SkillsService, TypeOrmModule],
})
export class SkillsModule {}
