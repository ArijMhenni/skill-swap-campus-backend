import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReportTargetType } from '../../../common/enums/report-target-type.enum';
import { User } from '../../users/entities/user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({
    name: 'target_type',
    type: 'enum',
    enum: ReportTargetType,
  })
  targetType: ReportTargetType;

  @Column({ name: 'target_id' })
  targetId: string;

  @Column('text')
  reason: string;

  @Column({ default: 'PENDING' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}