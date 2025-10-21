import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RegistryItem } from './registry-item.entity';

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  registryItemId: string;

  @ManyToOne(() => RegistryItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'registryItemId' })
  registryItem: RegistryItem;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  buyerName?: string;

  @Column({ nullable: true })
  purchaseLocation?: string;

  @Column({ nullable: true })
  orderNumber?: string;

  @Column({ nullable: true })
  thankYouAddress?: string;

  @Column({ nullable: true })
  similarItemDescription?: string;

  @Column({ default: 'purchased' })
  giftType: 'purchased' | 'similar' | 'none';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
