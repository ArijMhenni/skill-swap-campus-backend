import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { Request } from './entities/request.entity';
import { Skill } from '../modules/skills/entities/skill.entity';
import { RequestAccessGuard } from './guards/request-access.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Request, Skill])],
  controllers: [RequestsController],
  providers: [RequestsService, RequestAccessGuard],
  exports: [RequestsService],
})
export class RequestsModule {}