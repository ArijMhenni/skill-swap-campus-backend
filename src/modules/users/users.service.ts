import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,Like } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from '../../auth/dto/update-profile.dto';
import { first } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findAllByFirstName(firstName: string): Promise<User[]> {
    return this.userRepository.find({
      where: {
        firstName: Like(`%${firstName}%`)
      }
    })
  }

async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<User> {
  const user = await this.findById(id);

  // Only update fields that are explicitly provided (not undefined)
  if (updateProfileDto.firstName !== undefined) {
    user.firstName = updateProfileDto.firstName;
  }
  if (updateProfileDto.lastName !== undefined) {
    user.lastName = updateProfileDto.lastName;
  }
  if (updateProfileDto.availability !== undefined) {
    user.availability = updateProfileDto.availability;
  }
  if (updateProfileDto.offeredSkills !== undefined) {
    user.offeredSkills = updateProfileDto.offeredSkills;
  }
  if (updateProfileDto.wantedSkills !== undefined) {
    user.wantedSkills = updateProfileDto.wantedSkills;
  }
  
  // Special handling for avatar
  if ('avatar' in updateProfileDto) {
    // Only set avatar if it's a valid base64 string, otherwise set to null
    // Don't update if avatar is undefined
    if (updateProfileDto.avatar === null || updateProfileDto.avatar === '') {
      user.avatar = null;
      console.log('🔄 Avatar explicitly removed');
    } else if (updateProfileDto.avatar) {
      user.avatar = updateProfileDto.avatar;
      console.log('🔄 Avatar updated with new image');
    }
    // If undefined, don't touch it - but since we're checking 'in', this shouldn't happen
  }

  const savedUser = await this.userRepository.save(user);
  console.log('✅ User saved');
  
  return savedUser;
}

  async findAll() {
  return this.userRepository.find(); 
}
}