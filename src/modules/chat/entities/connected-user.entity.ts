import { User } from "src/modules/users/entities/user.entity";
import { Entity, PrimaryGeneratedColumn ,Column, OneToMany, OneToOne, JoinColumn, ManyToOne} from "typeorm";

@Entity()
export class ConnectedUser{

    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    socketId: string;

    @ManyToOne(()=>User,user=>user.connections)
    @JoinColumn()
    user:User;

}