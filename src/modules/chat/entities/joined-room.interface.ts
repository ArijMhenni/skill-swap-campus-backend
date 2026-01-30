import { Room } from "./room.interface";
import { User } from "src/modules/users/entities/user.entity";
export interface joinedRoomI{

        id?:string;
        socketId:string;
        user:User;
        room:Room;
        
}