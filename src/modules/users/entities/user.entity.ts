import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from '../../../common/enums/role.enum';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column('simple-array', { name: 'offered_skills', nullable: true })
  offeredSkills: string[];

  @Column('simple-array', { name: 'wanted_skills', nullable: true })
  wantedSkills: string[];


  @Column({ type: 'text', nullable: true })
  availability: string;

  @Column({ type: 'text', nullable: true })
  avatar: string | null ;

  @Column({ name: 'is_banned', default: false })
  isBanned: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires?: Date;

  // Relations
  // @OneToMany(() => Skill, (skill) => skill.user)
  // skills: Skill[];
}