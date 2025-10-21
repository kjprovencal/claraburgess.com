import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';
import { RegistryItem } from './entities/registry-item.entity';
import { Purchase } from './entities/purchase.entity';
import { RateLimitModule } from '../rate-limit/rate-limit.module';

@Module({
  imports: [TypeOrmModule.forFeature([RegistryItem, Purchase]), RateLimitModule],
  controllers: [RegistryController],
  providers: [RegistryService],
  exports: [RegistryService],
})
export class RegistryModule {}
