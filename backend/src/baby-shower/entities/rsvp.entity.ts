import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AttendanceStatus {
  YES = 'yes',
  NO = 'no',
}

@Entity('rsvp')
export class Rsvp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ type: 'varchar' })
  attending: AttendanceStatus;

  @Column({ default: 1 })
  guestCount: number;

  @Column({ nullable: true })
  dietaryRestrictions: string;

  @Column({ nullable: true })
  message: string;

  @Column({ default: false })
  emailSent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
