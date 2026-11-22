import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RateLimit } from '../rate-limit/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../rate-limit/guards/rate-limit.guard';
import { BirthdayGateGuard } from './birthday-gate.guard';
import { BirthdayService } from './birthday.service';
import { CreateBirthdayRsvpDto } from './dto/create-birthday-rsvp.dto';
import { BirthdayRsvp } from './entities/birthday-rsvp.entity';

@Controller('birthday')
export class BirthdayController {
  constructor(private readonly birthdayService: BirthdayService) {}

  @Post('rsvp')
  @UseGuards(BirthdayGateGuard, RateLimitGuard)
  @RateLimit({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    blockDurationMs: 60 * 60 * 1000,
    endpoint: 'birthday-rsvp',
  })
  async create(@Body() dto: CreateBirthdayRsvpDto): Promise<{ success: true }> {
    await this.birthdayService.create(dto);
    return { success: true };
  }

  @Get('rsvp')
  @UseGuards(JwtAuthGuard)
  async list(): Promise<BirthdayRsvp[]> {
    return this.birthdayService.list();
  }
}
