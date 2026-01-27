import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '../../common/enums/request-status.enum';

export class FilterRequestDto {
  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: RequestStatus,
    example: RequestStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(RequestStatus, { message: 'Le statut doit être valide' })
  status?: RequestStatus;

  @ApiPropertyOptional({
    description: 'Voir les demandes en tant que demandeur ou fournisseur',
    enum: ['asRequester', 'asProvider'],
    example: 'asRequester',
  })
  @IsOptional()
  @IsEnum(['asRequester', 'asProvider'], {
    message: 'Le rôle doit être asRequester ou asProvider',
  })
  role?: 'asRequester' | 'asProvider';
}