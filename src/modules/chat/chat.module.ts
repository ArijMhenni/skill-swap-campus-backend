import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Room } from './entities/room.entity';
import { Message } from './entities/message.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from '../users/users.module';
import { RoomService } from './services/room.service';
import { ConnectedUserService } from './services/connected-user.service';
import { ConnectedUser } from './entities/connected-user.entity';
import { JoinedRoom } from './entities/joined-room.entity';
import { JoinedRoomService } from './services/joined-room.service';
import { MessagesService } from './services/messages.service';
@Module({
  imports: [TypeOrmModule.forFeature([Room, Message,ConnectedUser,JoinedRoom]),AuthModule, UsersModule],
  providers: [ChatService, ChatGateway, RoomService, ConnectedUserService,JoinedRoomService,MessagesService],
  controllers: [],
})
export class ChatModule {

}