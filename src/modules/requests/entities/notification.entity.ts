import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ nullable: true })
  link: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}