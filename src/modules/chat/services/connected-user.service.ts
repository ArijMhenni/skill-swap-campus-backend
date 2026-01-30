import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectedUser } from '../entities/connected-user.entity';
import { ConnectedUserI } from '../entities/connected-user.interface';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
@Injectable()
export class ConnectedUserService {

    constructor(
        @InjectRepository(ConnectedUser)
        private readonly connectedUserRepository: Repository<ConnectedUser>
    ){}

    async create(connectedUser: ConnectedUserI):Promise<ConnectedUser>{
        return this.connectedUserRepository.save(connectedUser);

    }

    async findByUser(user: User):Promise<ConnectedUserI[]>{
        return this.connectedUserRepository
  .createQueryBuilder('connectedUser')
  .leftJoinAndSelect('connectedUser.user', 'user')
  .where('user.id = :userId', { userId: user.id })
  .getMany();
    }


async deleteBySocketId(socketId:string){
    return this.connectedUserRepository.delete({ socketId });
}
  async deleteAll() {
    await this.connectedUserRepository
      .createQueryBuilder()
      .delete()
      .execute();
  }
} 
