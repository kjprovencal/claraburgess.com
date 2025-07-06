import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password?: string;

  @Column({ default: 'user' })
  role: string;

  @Column({
    type: 'varchar',
    default: UserStatus.PENDING,
    enum: UserStatus,
  })
  status: UserStatus;

  @Column({ nullable: true })
  approvedBy?: string;

  @ManyToOne(() => User, (user: User) => user.id, { nullable: true })
  @JoinColumn({ name: 'approvedBy' })
  approvedByUser?: User | null;

  @Column({ nullable: true })
  approvedAt?: Date;

  @Column({ nullable: true })
  rejectionReason?: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isPreApproved: boolean;

  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column({ nullable: true })
  passwordResetExpires?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
