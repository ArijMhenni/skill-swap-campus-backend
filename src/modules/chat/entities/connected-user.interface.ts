import { User } from "src/modules/users/entities/user.entity";

export interface ConnectedUserI{
    id?:string;
    socketId: string;
    user:User;

}