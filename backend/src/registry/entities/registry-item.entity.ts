import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('registry_items')
export class RegistryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price?: number;

  @Column({ default: 1 })
  quantity: number;

  @Column()
  category: string;

  @Column('int', { default: 0 })
  order: number;

  @Column({ default: false })
  purchased: boolean;

  @Column({ default: 0 })
  purchasedQuantity: number;

  @Column({ nullable: true })
  url?: string;

  // Cached link preview data
  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  siteName?: string;

  @Column({ nullable: true })
  availability?: string;

  @Column({ nullable: true })
  previewCacheExpiry?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
