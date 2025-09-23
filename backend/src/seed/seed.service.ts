import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RegistryItem } from '../registry/entities/registry-item.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(RegistryItem)
    private registryItemsRepository: Repository<RegistryItem>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Only seed in development or if explicitly enabled
    const shouldSeed =
      this.configService.get<string>('NODE_ENV') === 'development' ||
      this.configService.get<string>('ENABLE_SEEDING') === 'true';

    if (shouldSeed) {
      await this.seedRegistryItems();
    } else {
      Logger.log(
        'Seeding disabled in production. Set ENABLE_SEEDING=true to enable.',
      );
    }
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
        quantity: 1,
        category: 'Safety & Monitoring',
        order: 0,
        url: 'https://example.com/baby-monitor',
      },
      {
        name: 'Diaper Bag',
        quantity: 1,
        category: 'Traveling',
        order: 1,
        url: 'https://example.com/diaper-bag',
      },
      {
        name: 'Swaddle Blankets',
        quantity: 3,
        category: 'Sleeping',
        order: 2,
        url: 'https://example.com/swaddle-blankets',
      },
      {
        name: 'Baby Bath Tub',
        quantity: 1,
        category: 'Bathing',
        order: 3,
        url: 'https://example.com/baby-bath',
      },
      {
        name: 'Car Seat',
        quantity: 1,
        category: 'Traveling',
        order: 4,
        url: 'https://example.com/car-seat',
      },
      {
        name: 'Baby Bottles',
        quantity: 4,
        category: 'Feeding',
        order: 5,
        url: 'https://example.com/baby-bottles',
      },
    ];

    for (const item of seedItems) {
      const registryItem = this.registryItemsRepository.create(item);
      await this.registryItemsRepository.save(registryItem);
    }

    Logger.log(`Seeded ${seedItems.length} registry items`);
  }
}
