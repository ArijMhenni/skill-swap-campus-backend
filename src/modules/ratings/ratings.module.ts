import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { Rating } from './entities/rating.entity';
import { SkillRequest } from '../requests/entities/request-skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, SkillRequest])],
  controllers: [RatingsController],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}