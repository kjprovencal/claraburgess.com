import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('rate_limits')
@Index(['ipAddress', 'endpoint', 'timestamp'])
@Index(['ipAddress', 'isBlocked'])
export class RateLimit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ipAddress: string;

  @Column({ default: 'default' })
  endpoint: string;

  @Column()
  timestamp: Date;

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ nullable: true })
  blockedUntil?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
