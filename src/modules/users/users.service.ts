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

    Object.assign(user, updateProfileDto);
    if ('avatar' in updateProfileDto) {
      user.avatar = updateProfileDto.avatar || null;
      console.log('🔄 Avatar update - Setting to:', user.avatar === null ? 'NULL' : 'BASE64 STRING');
    }

    const savedUser = await this.userRepository.save(user);
    console.log('✅ User saved - Avatar is:', savedUser.avatar === null ? 'NULL' : 'SET');
    
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find(); 
  }
}
