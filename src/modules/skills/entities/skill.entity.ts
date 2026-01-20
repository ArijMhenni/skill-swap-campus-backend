import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SkillCategory } from '../../../common/enums/skill-category.enum';
import { SkillType } from '../../../common/enums/skill-type.enum';
import { SkillStatus } from '../../../common/enums/skill-status.enum';
import { User } from '../../users/entities/user.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: SkillCategory,
  })
  category: SkillCategory;

  @Column({
    type: 'enum',
    enum: SkillType,
  })
  type: SkillType;

  @Column({ name: 'estimated_time', type: 'int' })
  estimatedTime: number;

  @Column({
    type: 'enum',
    enum: SkillStatus,
    default: SkillStatus.ACTIVE,
  })
  status: SkillStatus;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}