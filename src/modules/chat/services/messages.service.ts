import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../entities/message.entity';
import { Repository } from 'typeorm';
import { MessageI } from '../entities/message.interface';
import { Room } from '../entities/room.interface';
import { IPaginationOptions,paginate,Pagination } from 'nestjs-typeorm-paginate';
@Injectable()
export class MessagesService {


    constructor(
        @InjectRepository(Message)
        private readonly messageRepository:Repository<Message>){}


    async create(message:MessageI):Promise<MessageI>{
        return this.messageRepository.save(this.messageRepository.create(message));
    }
    

    async findMessagesForRoom(room:Room,options :IPaginationOptions):Promise<Pagination<MessageI>>{
        const query=this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.room','room')
        .where('room.id=:roomId',{roomId:room.id})
        .leftJoinAndSelect('message.sender','user')
        .orderBy('message.createdAt','ASC');

        return paginate(query,options);
         
    }
}
