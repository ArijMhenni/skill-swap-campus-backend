import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ReportTargetType } from '../../../common/enums/report-target-type.enum';

export class CreateReportDto {
  @IsEnum(ReportTargetType)
  targetType: ReportTargetType;

  @IsUUID()
  targetId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string;
}
