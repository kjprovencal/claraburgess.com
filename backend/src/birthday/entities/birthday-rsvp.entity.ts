import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BirthdayAttendance {
  YES = 'yes',
  NO = 'no',
}

@Entity('birthday_rsvp')
export class BirthdayRsvp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ type: 'varchar' })
  attending: BirthdayAttendance;

  @Column({ default: 1 })
  guestCount: number;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
