import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';
import { RegistryItem } from './entities/registry-item.entity';
import { RateLimitModule } from '../rate-limit/rate-limit.module';

@Module({
  imports: [TypeOrmModule.forFeature([RegistryItem]), RateLimitModule],
  controllers: [RegistryController],
  providers: [RegistryService],
  exports: [RegistryService],
})
export class RegistryModule {}
