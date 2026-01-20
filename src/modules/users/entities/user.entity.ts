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

  @Column('simple-array', { name: 'offered_skills', default: '' })
  offeredSkills: string[];

  @Column('simple-array', { name: 'wanted_skills', default: '' })
  wantedSkills: string[];

  @Column({ type: 'text', nullable: true })
  availability: string;

  @Column({ name: 'is_banned', default: false })
  isBanned: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  // @OneToMany(() => Skill, (skill) => skill.user)
  // skills: Skill[];
}