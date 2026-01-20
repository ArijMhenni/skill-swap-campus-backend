import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SkillCategory } from '../../../common/enums/skill-category.enum';
import { SkillType } from '../../../common/enums/skill-type.enum';

export class FilterSkillDto {
  @ApiPropertyOptional({
    description: 'Filter by skill category',
    enum: SkillCategory,
    example: SkillCategory.TECH,
  })
  @IsEnum(SkillCategory)
  @IsOptional()
  category?: SkillCategory;

  @ApiPropertyOptional({
    description: 'Filter by skill type',
    enum: SkillType,
    example: SkillType.OFFER,
  })
  @IsEnum(SkillType)
  @IsOptional()
  type?: SkillType;

  @ApiPropertyOptional({
    description: 'Search in title and description',
    example: 'React',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
