import {
  IsUUID,
  IsInt,
  Min,
  Max,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({
    description: 'ID de la request completee',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  requestId: string;

  @ApiProperty({
    description: 'Note de 1 a 5 etoiles',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  stars: number;

  @ApiPropertyOptional({
    description: 'Commentaire optionnel',
    maxLength: 500,
    example: 'Excellent echange, tres pedagogique!',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  comment?: string;
}