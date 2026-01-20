import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { FilterSkillDto } from './dto/filter-skill.dto';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  // @UseGuards(JwtAuthGuard) // À décommenter quand l'authentification sera implémentée
  create(@Body() createSkillDto: CreateSkillDto, @Request() req) {
    // Temporairement, on peut passer un userId fixe pour tester
    const userId = req.user?.id || 'temp-user-id';
    return this.skillsService.create(createSkillDto, userId);
  }

  @Get()
  findAll(@Query() filterDto: FilterSkillDto) {
    return this.skillsService.findAll(filterDto);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.skillsService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Patch(':id')
  // @UseGuards(JwtAuthGuard) // À décommenter quand l'authentification sera implémentée
  update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'temp-user-id';
    return this.skillsService.update(id, updateSkillDto, userId);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard) // À décommenter quand l'authentification sera implémentée
  delete(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id || 'temp-user-id';
    return this.skillsService.delete(id, userId);
  }
}
