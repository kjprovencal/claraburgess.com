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
  price: number;

  @Column({ default: 1 })
  quantity: number;

  @Column()
  category: string;

  @Column('int', { default: 0 })
  order: number;

  @Column({ default: false })
  purchased: boolean;

  @Column({ nullable: true })
  url?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
