import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RaterDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  profilePicture?: string;
}

export class RatingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  requestId: string;

  @ApiProperty()
  raterId: string;

  @ApiProperty({ type: RaterDto })
  rater: RaterDto;

  @ApiProperty()
  ratedUserId: string;

  @ApiProperty({ type: RaterDto })
  ratedUser: RaterDto;

  @ApiProperty()
  skillTitle: string;

  @ApiProperty()
  stars: number;

  @ApiPropertyOptional()
  comment?: string;

  @ApiProperty()
  createdAt: Date;
}

export class RatingSummaryDto {
  @ApiProperty({ example: 4.5 })
  averageRating: number;

  @ApiProperty({ example: 12 })
  totalRatings: number;

  @ApiProperty({
    example: { '5': 8, '4': 3, '3': 1, '2': 0, '1': 0 },
  })
  ratingDistribution: { [key: number]: number };
}

export class PendingRatingDto {
  @ApiProperty()
  requestId: string;

  @ApiProperty()
  lessonCompletedId?: string;

  @ApiProperty({ type: RaterDto })
  user: RaterDto;

  @ApiProperty()
  skillTitle: string;

  @ApiProperty()
  completedAt: Date;
}