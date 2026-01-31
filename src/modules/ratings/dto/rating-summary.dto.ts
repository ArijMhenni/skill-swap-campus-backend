import { ApiProperty } from '@nestjs/swagger';

export class RatingSummaryDto {
  @ApiProperty({ description: 'Note moyenne' })
  averageRating: number;

  @ApiProperty({ description: 'Nombre total d\'évaluations' })
  totalRatings: number;
}