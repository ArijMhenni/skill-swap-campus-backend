import { User } from "src/modules/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "./room.entity";
@Entity()
export class JoinedRoom{


    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    socketId:string;

    @ManyToOne(()=>User,user=>user.joinedRooms)
    @JoinColumn()
    user:User;
    
    @ManyToOne(()=>Room,room=>room.joinedUsers)
    @JoinColumn()
    room:Room;
    

}