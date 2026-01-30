import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, JoinTable } from 'typeorm';
import { Room } from './room.interface';
import { User } from '../../users/entities/user.entity';

export interface MessageI {
  id: string;
  room: Room;
  sender: User;
  content: string;
  createdAt: Date;
}