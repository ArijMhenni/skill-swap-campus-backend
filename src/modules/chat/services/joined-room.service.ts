import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinedRoom } from '../entities/joined-room.entity';
import { Repository } from 'typeorm';
import { Room } from '../entities/room.interface';
import { joinedRoomI } from '../entities/joined-room.interface';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class JoinedRoomService {

    constructor(
        @InjectRepository(JoinedRoom)
        private readonly JoinedRoomepository: Repository<JoinedRoom>
    ){}

    async create(joinedroom: joinedRoomI):Promise<joinedRoomI>{
        return this.JoinedRoomepository.save(joinedroom)
    }

    async findByUser(user:User):Promise<joinedRoomI[]>{
   return this.JoinedRoomepository.find({
    where: { user },
  });
}


    async findByRoom(room: Room): Promise<JoinedRoom[]> {
    return this.JoinedRoomepository.find({
        where: {
        room: { id: room.id },
        },
    });
    }

    async deleteBySocketId(socketId: string){
        return this.JoinedRoomepository.delete({socketId});

    }

    async deleteAll(){
        await this.JoinedRoomepository
        .createQueryBuilder()
        .delete()
        .execute();
    }
}
