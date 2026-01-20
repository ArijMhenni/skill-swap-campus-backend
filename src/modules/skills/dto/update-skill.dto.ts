import { IsString, IsOptional, IsEnum, IsInt, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SkillCategory } from '../../../common/enums/skill-category.enum';
import { SkillType } from '../../../common/enums/skill-type.enum';
import { SkillStatus } from '../../../common/enums/skill-status.enum';

export class UpdateSkillDto {
  @ApiPropertyOptional({
    description: 'Title of the skill',
    example: 'Advanced React Patterns',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the skill',
    example: 'Deep dive into advanced React patterns and hooks',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Category of the skill',
    enum: SkillCategory,
    example: SkillCategory.TECH,
  })
  @IsEnum(SkillCategory)
  @IsOptional()
  category?: SkillCategory;

  @ApiPropertyOptional({
    description: 'Type of the skill',
    enum: SkillType,
    example: SkillType.OFFER,
  })
  @IsEnum(SkillType)
  @IsOptional()
  type?: SkillType;

  @ApiPropertyOptional({
    description: 'Estimated time in hours',
    example: 15,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedTime?: number;

  @ApiPropertyOptional({
    description: 'Status of the skill',
    enum: SkillStatus,
    example: SkillStatus.ACTIVE,
  })
  @IsEnum(SkillStatus)
  @IsOptional()
  status?: SkillStatus;
}
