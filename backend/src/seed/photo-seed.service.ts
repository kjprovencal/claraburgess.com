import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Photo } from '../photos/entities/photo.entity';

@Injectable()
export class PhotoSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Photo)
    private photosRepository: Repository<Photo>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Only seed in development or if explicitly enabled
    const shouldSeed =
      this.configService.get<string>('NODE_ENV') === 'development' ||
      this.configService.get<string>('ENABLE_SEEDING') === 'true';

    if (shouldSeed) {
      await this.seedPhotos();
    } else {
      Logger.log(
        'Photo seeding disabled in production. Set ENABLE_SEEDING=true to enable.',
      );
    }
  }

  async seedPhotos() {
    const existingPhotos = await this.photosRepository.count();
    if (existingPhotos > 0) {
      Logger.log('Photos already exist, skipping seed');
      return;
    }

    const seedPhotos = [
      {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/samples/people/baby-shoes.jpg',
        alt: "Clara's first ultrasound",
        caption: 'Our first glimpse of little Clara at 12 weeks!',
        date: '2024-01-15',
        category: 'Ultrasound',
        width: 800,
        height: 600,
      },
      {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/samples/people/baby-shoes.jpg',
        alt: 'Baby bump at 20 weeks',
        caption: 'Halfway there! Clara is growing so beautifully.',
        date: '2024-02-20',
        category: 'Bump',
        width: 800,
        height: 600,
      },
      {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/samples/people/baby-shoes.jpg',
        alt: 'Nursery preparation',
        caption: "Getting Clara's room ready with love and care.",
        date: '2024-03-10',
        category: 'Celebration',
        width: 800,
        height: 600,
      },
    ];

    for (const photo of seedPhotos) {
      const photoEntity = this.photosRepository.create(photo);
      await this.photosRepository.save(photoEntity);
    }

    Logger.log(`Seeded ${seedPhotos.length} photos`);
  }
}
