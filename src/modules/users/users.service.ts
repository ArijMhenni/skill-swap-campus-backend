import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from '../../auth/dto/update-profile.dto';

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
    });
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
  
  // debugging avatar updates
  if ('avatar' in updateProfileDto) {
   // not updating avatar unless explicitly provided
    if (updateProfileDto.avatar === null || updateProfileDto.avatar === '') {
      user.avatar = null;
      console.log(' Avatar explicitly removed');
    } else if (updateProfileDto.avatar) {
      user.avatar = updateProfileDto.avatar;
      console.log(' Avatar updated with new image');
    }
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream

    const savedUser = await this.userRepository.save(user);
    console.log(' User saved - Avatar is:', savedUser.avatar === null ? 'NULL' : 'SET');
    
    return savedUser;
  }

  return this.userRepository.save(user);
}

async findAll() {
    return this.userRepository.find(); 
  }
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  }

  const savedUser = await this.userRepository.save(user);
  console.log('✅ User saved - Avatar is:', savedUser.avatar === null ? 'NULL' : 'SET');
  
  return savedUser;
}

async findAll() {
  return this.userRepository.find(); 
}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
}
