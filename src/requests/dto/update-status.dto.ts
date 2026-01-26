import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '../entities/request.entity';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'Nouveau statut de la demande',
    enum: RequestStatus,
    example: RequestStatus.ACCEPTED,
  })
  @IsNotEmpty({ message: 'Le statut est requis' })
  @IsEnum(RequestStatus, { message: 'Le statut doit être valide' })
  status: RequestStatus;
}