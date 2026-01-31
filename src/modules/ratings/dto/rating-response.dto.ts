import { ApiProperty } from '@nestjs/swagger';

export class RatingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  requestId: string;

  @ApiProperty()
  raterId: string;

  @ApiProperty()
  raterName: string;

  @ApiProperty()
  ratedUserId: string;

  @ApiProperty()
  stars: number;

  @ApiProperty({ required: false })
  comment?: string;

  @ApiProperty()
  createdAt: Date;
}