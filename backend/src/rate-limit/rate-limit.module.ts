import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateLimitService } from './rate-limit.service';
import { RateLimit } from './entities/rate-limit.entity';
import { RateLimitGuard } from './guards/rate-limit.guard';

@Module({
  imports: [TypeOrmModule.forFeature([RateLimit])],
  providers: [RateLimitService, RateLimitGuard],
  exports: [RateLimitService, RateLimitGuard],
})
export class RateLimitModule {}
