import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from '../entities/room.entity';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
@Injectable()
export class RoomService {

    constructor(
        @InjectRepository(Room)
        private readonly roomRepository:Repository<Room>)
        {}

    async createRoom(room:Room,creator: User):Promise<Room>{
        const newRoom= await this.addCreatorToRoom(room,creator);
        return this.roomRepository.save(newRoom)
    }

    async getRoomsForUser(userId: string,options: IPaginationOptions):Promise<Pagination<Room>>{
        const query=this.roomRepository
        .createQueryBuilder('rooms')
        .innerJoin('rooms.participants','users')
        .where('users.id = :userId',{userId})
        .leftJoinAndSelect('rooms.participants','all_users')
        .orderBy('rooms.updatedAt','DESC');

        return paginate(query,options);
    }


    async addCreatorToRoom(room:Room,creator:User):Promise<Room>{
        room.participants ??= [];
        room.participants.push(creator);
        return room;
    }
    
async getRoom(roomId: string): Promise<Room | null> {
  return this.roomRepository.findOne({
    where: { id: roomId },
    relations: ['joinedUsers'],
  });
}
}
