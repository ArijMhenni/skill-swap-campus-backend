import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  // Creer un avis
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createRatingDto: CreateRatingDto, @GetUser() user: User) {
    return this.ratingsService.create(user.id, createRatingDto);
  }

  // Mes avis recus
  @Get('received')
  @UseGuards(JwtAuthGuard)
  getReceivedRatings(@GetUser() user: User) {
    return this.ratingsService.getReceivedRatings(user.id);
  }

  // Mes avis donnes
  @Get('given')
  @UseGuards(JwtAuthGuard)
  getGivenRatings(@GetUser() user: User) {
    return this.ratingsService.getGivenRatings(user.id);
  }

  // Ma reputation
  @Get('my-reputation')
  @UseGuards(JwtAuthGuard)
  getMyReputation(@GetUser() user: User) {
    return this.ratingsService.getUserSummary(user.id);
  }

  // Avis en attente
  @Get('pending')
  @UseGuards(JwtAuthGuard)
  getPendingRatings(@GetUser() user: User) {
    return this.ratingsService.getPendingRatings(user.id);
  }

  // Avis d'un utilisateur (public)
  @Get('user/:userId')
  getUserRatings(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.ratingsService.getUserRatings(userId);
  }

  // Reputation d'un utilisateur (public)
  @Get('user/:userId/summary')
  getUserSummary(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.ratingsService.getUserSummary(userId);
  }
}