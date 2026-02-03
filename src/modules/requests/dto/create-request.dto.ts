import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({
    description: 'ID de la compétence demandée',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'L\'ID de la compétence est requis' })
  @IsUUID('4', { message: 'L\'ID de la compétence doit être un UUID valide' })
  skillId: string;

  @ApiProperty({
    description: 'Message de demande personnalisé',
    example: 'Bonjour, je suis très intéressé par votre compétence en React...',
    minLength: 10,
  })
  @IsNotEmpty({ message: 'Le message est requis' })
  @IsString({ message: 'Le message doit être une chaîne de caractères' })
  @MinLength(10, { message: 'Le message doit contenir au moins 10 caractères' })
  message: string;
}