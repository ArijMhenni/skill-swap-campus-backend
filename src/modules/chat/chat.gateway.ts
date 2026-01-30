import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket ,Server} from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { RoomService } from './services/room.service';
import { Room } from './entities/room.entity';
import type { PageI } from './entities/page.interface';
import { ConnectedUserService } from './services/connected-user.service';
import { ConnectedUserI } from './entities/connected-user.interface';
import { JoinedRoomService } from './services/joined-room.service';
import { MessagesService } from './services/messages.service';
import type  { MessageI } from './entities/message.interface';
import { joinedRoomI } from './entities/joined-room.interface';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection,OnGatewayDisconnect,OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor( 
    private authservice:AuthService,
    private userService:UsersService,
    private roomService:RoomService,
    private connectedUserService:ConnectedUserService,
    private joinedRoomService:JoinedRoomService,
    private messageService:MessagesService){}

  async onModuleInit() {
      await this.connectedUserService.deleteAll();
      await this.joinedRoomService.deleteAll();
  }
  async handleConnection(socket:Socket){
    try{
      const token = socket.handshake.auth?.token;;
      console.log("the auth header is",token)
      console.log("the token is",socket.handshake.headers)
      const decodedToken=await this.authservice.verifyJwt(token);
      //console.log(socket.handshake.headers.authorization);
      const user:User=await this.userService.findById(decodedToken.sub);
      if (!user){
        return this.disconnect(socket); 
      }
      else {
        socket.data.user =user;
        const rooms=await this.roomService.getRoomsForUser(user.id,{page:1,limit:10});
        //bech twali compatible maa angular paginator
        rooms.meta.currentPage=rooms.meta.currentPage-1;

        // save socket to DB
        await this.connectedUserService.create({socketId: socket.id,user});
        //partager aux utilisateurs les rooms auxquels ils sont des participants 
        return this.server.to(socket.id).emit('rooms',rooms);

      }

    }
    catch(err){  console.error('Socket connection error:', err);
      return this.disconnect(socket);
      }}
    async handleDisconnect(socket: Socket){
      console.log('on disconnect');
      //remove the connection 
      await this.connectedUserService.deleteBySocketId(socket.id);
      socket.disconnect();
    }

    private disconnect(socket:Socket){
        socket.emit('Error',new UnauthorizedException());
        socket.disconnect();
    }
      @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, room: Room) {
    const createdRoom: Room = await this.roomService.createRoom(room, socket.data.user);

    for (const user of createdRoom.participants) {
      const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
      const rooms = await this.roomService.getRoomsForUser(user.id, { page: 1, limit: 10 });
      rooms.meta.currentPage = rooms.meta.currentPage - 1;
      for (const connection of connections) {
        await this.server.to(connection.socketId).emit('rooms', rooms);
      }
    }
  }


     @SubscribeMessage('paginateRoom')
    async onPaginateRoom(socket:Socket,page: PageI){
      page.limit=page.limit>100 ? 100:page.limit;
      page.page=page.page+1;
      const rooms = await this.roomService.getRoomsForUser(socket.data.user.id, this.handleIncomingPagerequest(page));
      return this.server.to(socket.id).emit('rooms',rooms);
    }


    @SubscribeMessage('joindRoom')
    async onJoindRoom(socket:Socket,room:Room){
      const messages=await this.messageService.findMessagesForRoom(room,{limit:10,page:1});
      messages.meta.currentPage=messages.meta.currentPage-1;
      //enregistrer la connection dans le room
      await this.joinedRoomService.create({socketId:socket.id,user:socket.data.user,room});
      //send last messages from the room to the front
      await this.server.to(socket.id).emit('messages',messages);
    
    }

    @SubscribeMessage('leaveRoom')
    async onLeaveRoom(socket:Socket){
      //remove the connection 
      console.log('LEAVE');
      await this.joinedRoomService.deleteBySocketId(socket.id);
    }

@SubscribeMessage('addMessage')
async onAddMessage(socket: Socket, message: MessageI) {
  const createdMessage: MessageI =
    await this.messageService.create({
      ...message,
      sender: socket.data.user,
    });

  if (!createdMessage.room?.id) {
    throw new Error('Room id missing in created message');
  }

  const room = await this.roomService.getRoom(createdMessage.room.id);
  if (!room) {
    throw new Error('Room not found');
  }

  const joinedUsers: joinedRoomI[] =
    await this.joinedRoomService.findByRoom(room);
  for (const user of joinedUsers){  
    await this.server.to(user.socketId).emit('messageAdded',createdMessage);
  }
}




    private handleIncomingPagerequest(page:PageI){
      page.limit=page.limit>100 ? 100:page.limit;
      page.page=page.page+1;
      return page;
    }
}
