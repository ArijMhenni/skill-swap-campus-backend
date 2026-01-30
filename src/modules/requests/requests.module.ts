import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { SkillRequest } from './entities/request-skill.entity';
import { Notification } from './entities/notification.entity';
import { Skill } from '../skills/entities/skill.entity';
import { RequestAccessGuard } from './guards/request-access.guard';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SkillRequest, Skill]),
    NotificationsModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService, RequestAccessGuard],
  exports: [RequestsService],
})
export class RequestsModule {}