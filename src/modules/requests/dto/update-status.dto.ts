import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '../../common/enums/request-status.enum';

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