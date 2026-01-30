import { Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, CreateDateColumn,UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JoinedRoom } from './joined-room.entity';
import { Message } from './message.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => User,user => user.rooms)
  @JoinTable()
  participants: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(()=>JoinedRoom,joinedUsers=>joinedUsers.room)
  joinedUsers:JoinedRoom[];

  @OneToMany(()=>Message,messages=>messages.room)
  messages:Message[];
}