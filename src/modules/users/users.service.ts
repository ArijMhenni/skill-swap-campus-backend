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

    Object.assign(user, updateProfileDto);
    if ('avatar' in updateProfileDto) {
        user.avatar = updateProfileDto.avatar || null;
        console.log('🔄 Avatar update - Setting to:', user.avatar === null ? 'NULL' : 'BASE64 STRING');
    }

<<<<<<< HEAD
    return this.userRepository.save(user);
  }

  async findAll() {
  return this.userRepository.find(); 
}
=======
    const savedUser = await this.userRepository.save(user);
    console.log('✅ User saved - Avatar is:', savedUser.avatar === null ? 'NULL' : 'SET');
    
    return savedUser;
    }
>>>>>>> ef0d4683c488dfaa7817f17302ca3bc630b5e0b9
}