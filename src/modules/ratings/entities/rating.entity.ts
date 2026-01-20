import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Request } from '../../requests/entities/request.entity';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Request)
  @JoinColumn({ name: 'request_id' })
  request: Request;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'rater_id' })
  rater: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'rated_user_id' })
  ratedUser: User;

  @Column({ type: 'int' })
  stars: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}