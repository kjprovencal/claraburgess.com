import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { PhotoSeedService } from './photo-seed.service';
import { RegistryItem } from '../registry/entities/registry-item.entity';
import { Photo } from '../photos/entities/photo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RegistryItem, Photo])],
  providers: [SeedService, PhotoSeedService],
  exports: [SeedService, PhotoSeedService],
})
export class SeedModule {}
