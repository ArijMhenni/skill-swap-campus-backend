import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RequestStatus } from '../../../common/enums/request-status.enum';
import { User } from '../../users/entities/user.entity';
import { Skill } from '../../skills/entities/skill.entity';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Skill, { eager: true })
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'provider_id' })
  provider: User;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column('text')
  message: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}