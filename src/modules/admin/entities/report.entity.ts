import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReportTargetType } from '../../../common/enums/report-target-type.enum';
import { User } from '../../users/entities/user.entity';
import { ReportStatus } from '../../../common/enums/report-status.enum';

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

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Column({ name: 'resolved_by', nullable: true })
  resolvedBy?: string;

  @Column({ type: 'text', nullable: true, name: 'admin_notes' })
  adminNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
