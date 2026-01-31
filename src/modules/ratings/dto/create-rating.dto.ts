import { IsUUID, IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({ description: 'ID de la requête complétée' })
  @IsUUID()
  requestId: string;

  @ApiProperty({ description: 'Note de 1 à 5 étoiles', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  stars: number;

  @ApiPropertyOptional({ description: 'Commentaire optionnel' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}