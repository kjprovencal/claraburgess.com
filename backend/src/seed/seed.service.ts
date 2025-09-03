import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistryItem } from '../registry/entities/registry-item.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(RegistryItem)
    private registryItemsRepository: Repository<RegistryItem>,
  ) {}

  async onModuleInit() {
    await this.seedRegistryItems();
  }

  async seedRegistryItems() {
    const existingItems = await this.registryItemsRepository.count();
    if (existingItems > 0) {
      Logger.log('Registry items already exist, skipping seed');
      return;
    }

    const seedItems = [
      {
        name: 'Baby Monitor',
        price: 89.99,
        quantity: 1,
        category: 'Safety & Monitoring',
        order: 0,
        url: 'https://example.com/baby-monitor',
        imageUrl:
          'https://plus.unsplash.com/premium_photo-1748100465274-b40e53a343a1?w=400&h=400&fit=crop',
      },
      {
        name: 'Diaper Bag',
        price: 45.0,
        quantity: 1,
        category: 'Traveling',
        order: 1,
        url: 'https://example.com/diaper-bag',
        imageUrl:
          'https://images.unsplash.com/photo-1595174194121-4f2ea5615e91?w=400&h=400&fit=crop',
      },
      {
        name: 'Swaddle Blankets',
        price: 24.99,
        quantity: 2,
        category: 'Sleeping',
        order: 2,
        url: 'https://example.com/swaddle-blankets',
        imageUrl:
          'https://images.unsplash.com/photo-1663247131258-a0782cbb1fd9?w=400&h=400&fit=crop',
      },
      {
        name: 'Baby Bath Tub',
        price: 32.5,
        quantity: 1,
        category: 'Bathing',
        order: 3,
        url: 'https://example.com/baby-bath',
        imageUrl:
          'https://images.unsplash.com/photo-1617817740234-86b952cf9b04?w=400&h=400&fit=crop',
      },
      {
        name: 'Car Seat',
        price: 199.99,
        quantity: 1,
        category: 'Traveling',
        order: 4,
        url: 'https://example.com/car-seat',
      },
    ];

    for (const item of seedItems) {
      const registryItem = this.registryItemsRepository.create(item);
      await this.registryItemsRepository.save(registryItem);
    }

    Logger.log(`Seeded ${seedItems.length} registry items`);
  }
}
