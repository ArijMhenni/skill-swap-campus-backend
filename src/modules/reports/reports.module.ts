// reports.module.ts
import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { AdminService } from '../admin/admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { Report } from '../admin/entities/report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Skill, Report])],
  controllers: [ReportsController],
  providers: [AdminService],
})
export class ReportsModule {}
