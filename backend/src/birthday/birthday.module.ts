import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '../email/email.module';
import { RateLimitModule } from '../rate-limit/rate-limit.module';
import { BirthdayController } from './birthday.controller';
import { BirthdayGateGuard } from './birthday-gate.guard';
import { BirthdayService } from './birthday.service';
import { BirthdayRsvp } from './entities/birthday-rsvp.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BirthdayRsvp]),
    EmailModule,
    RateLimitModule,
  ],
  controllers: [BirthdayController],
  providers: [BirthdayService, BirthdayGateGuard],
})
export class BirthdayModule {}
