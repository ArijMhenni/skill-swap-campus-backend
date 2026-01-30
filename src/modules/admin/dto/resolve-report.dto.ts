import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus } from '../../../common/enums/report-status.enum';

export class ResolveReportDto {
  @ApiProperty({
    description: 'New status for the report',
    enum: ReportStatus,
    example: ReportStatus.RESOLVED,
  })
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @ApiPropertyOptional({
    description: 'Admin notes about the resolution',
    example: 'User has been warned and content removed',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  adminNotes?: string;
}
