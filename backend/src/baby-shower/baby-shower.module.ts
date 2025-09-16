import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BabyShowerController } from './baby-shower.controller';
import { BabyShowerService } from './baby-shower.service';
import { Rsvp } from './entities/rsvp.entity';
import { EmailModule } from '../email/email.module';
import { RateLimitModule } from '../rate-limit/rate-limit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Rsvp]), EmailModule, RateLimitModule],
  controllers: [BabyShowerController],
  providers: [BabyShowerService],
  exports: [BabyShowerService],
})
export class BabyShowerModule {}
