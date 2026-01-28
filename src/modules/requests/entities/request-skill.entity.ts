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
export class SkillRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'skill_id' })
  skillId: string;

  @ManyToOne(() => Skill, { eager: true })
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;

  @Column('uuid', { name: 'requester_id' })
  requesterId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  @Column('uuid', { name: 'provider_id' })
  providerId: string;

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