import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SkillRequest } from '../../requests/entities/request-skill.entity';

@Entity('ratings')
@Unique(['requestId', 'raterId']) // Un seul rating par user par request
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'request_id' })
  requestId: string;

  // ✅ Use SkillRequest here, not Request
  @ManyToOne(() => SkillRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: SkillRequest;

  @Column({ name: 'rater_id' })
  raterId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'rater_id' })
  rater: User;

  @Column({ name: 'rated_user_id' })
  ratedUserId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'rated_user_id' })
  ratedUser: User;

  @Column({ type: 'int' })
  stars: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
