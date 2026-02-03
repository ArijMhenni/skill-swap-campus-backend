import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSkillDto } from './create-skill.dto';
import { SkillStatus } from '../../../common/enums/skill-status.enum';

export class UpdateSkillDto extends PartialType(CreateSkillDto) {
  @ApiPropertyOptional({
    description: 'Status of the skill',
    enum: SkillStatus,
    example: SkillStatus.ACTIVE,
  })
  @IsEnum(SkillStatus)
  @IsOptional()
  status?: SkillStatus;
}
