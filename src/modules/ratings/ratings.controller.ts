import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingResponseDto } from './dto/rating-response.dto';
import { RatingSummaryDto } from './dto/rating-summary.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RATING_MESSAGES } from '../../common/constants/rating-messages.constant';

@ApiTags('Ratings')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une évaluation' })
  @ApiResponse({
    status: 201,
    description: RATING_MESSAGES.CREATED,
    type: RatingResponseDto,
  })
  async create(
    @Body() createRatingDto: CreateRatingDto,
    @GetUser('id') userId: string,
  ): Promise<RatingResponseDto> {
    return this.ratingsService.create(createRatingDto, userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtenir toutes les évaluations d\'un utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Liste des évaluations',
    type: [RatingResponseDto],
  })
  async findByUser(
    @Param('userId') userId: string,
  ): Promise<RatingResponseDto[]> {
    return this.ratingsService.findByUser(userId);
  }

  @Get('summary/:userId')
  @ApiOperation({ summary: 'Obtenir le résumé de réputation d\'un utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Résumé des évaluations',
    type: RatingSummaryDto,
  })
  async getSummary(
    @Param('userId') userId: string,
  ): Promise<RatingSummaryDto> {
    return this.ratingsService.getSummary(userId);
  }
}
