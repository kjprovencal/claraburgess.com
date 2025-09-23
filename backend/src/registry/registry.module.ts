import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';
import { LinkPreviewService } from './link-preview.service';
import { RegistryItem } from './entities/registry-item.entity';
import { LinkPreviewCache } from './entities/link-preview-cache.entity';
import { RateLimitModule } from '../rate-limit/rate-limit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RegistryItem, LinkPreviewCache]), 
    RateLimitModule
  ],
  controllers: [RegistryController],
  providers: [RegistryService, LinkPreviewService],
  exports: [RegistryService, LinkPreviewService],
})
export class RegistryModule {}
