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
import { SkillRequest } from '../../requests/entities/request-skill.entity';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => SkillRequest)
  @JoinColumn({ name: 'request_id' })
  request: SkillRequest;

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