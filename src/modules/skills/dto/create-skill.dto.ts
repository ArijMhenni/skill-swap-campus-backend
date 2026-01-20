import { IsString, IsNotEmpty, IsEnum, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SkillCategory } from '../../../common/enums/skill-category.enum';
import { SkillType } from '../../../common/enums/skill-type.enum';

export class CreateSkillDto {
  @ApiProperty({
    description: 'Title of the skill',
    example: 'Introduction to React',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Detailed description of the skill',
    example: 'Learn the basics of React, including components, state, and props',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Category of the skill',
    enum: SkillCategory,
    example: SkillCategory.TECH,
  })
  @IsEnum(SkillCategory)
  @IsNotEmpty()
  category: SkillCategory;

  @ApiProperty({
    description: 'Type of the skill (offered or wanted)',
    enum: SkillType,
    example: SkillType.OFFER,
  })
  @IsEnum(SkillType)
  @IsNotEmpty()
  type: SkillType;

  @ApiProperty({
    description: 'Estimated time in hours',
    example: 10,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  estimatedTime: number;
}
