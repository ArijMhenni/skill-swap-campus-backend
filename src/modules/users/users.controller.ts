import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from '../../auth/dto/update-profile.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@GetUser() user: User) {
    // Recharger l'utilisateur depuis la base de données pour obtenir les données les plus récentes
    return this.usersService.findById(user.id);
  }

  @Get('findByFirstname')
  async findUserByFirstname(@Query('firstName') firstName:string){
    return this.usersService.findAllByFirstName(firstName);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
updateProfile(
  @GetUser() user: User,
  @Body() updateProfileDto: UpdateProfileDto,
) {
  console.log('🔍 RAW DTO KEYS:', Object.keys(updateProfileDto));
  console.log('🔍 RAW DTO VALUES:', updateProfileDto);
  console.log('🔍 "avatar" in DTO?', 'avatar' in updateProfileDto);
  console.log('🔍 avatar value:', updateProfileDto.avatar);
  console.log('🔍 avatar === undefined?', updateProfileDto.avatar === undefined);
  
  return this.usersService.updateProfile(user.id, updateProfileDto);
}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (public)' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get()
@ApiOperation({ summary: 'Get all users' })
@ApiResponse({ status: 200, description: 'Returns all users' })
async getAllUsers() {
  return this.usersService.findAll();
}
}