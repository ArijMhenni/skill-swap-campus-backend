import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: 'Weekends, evenings' })
  @IsString()
  @IsOptional()
  availability?: string;

  @ApiPropertyOptional({ example: ['JavaScript', 'React'] })
  @IsArray()
  @IsOptional()
  offeredSkills?: string[];

  @ApiPropertyOptional({ example: ['Python', 'Machine Learning'] })
  @IsArray()
  @IsOptional()
  wantedSkills?: string[];
}