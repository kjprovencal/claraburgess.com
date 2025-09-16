import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BabyShowerService } from './baby-shower.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { Rsvp } from './entities/rsvp.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RateLimitGuard } from '../rate-limit/guards/rate-limit.guard';
import { RateLimit } from '../rate-limit/decorators/rate-limit.decorator';

@Controller('baby-shower')
export class BabyShowerController {
  constructor(private readonly babyShowerService: BabyShowerService) {}

  @Post('rsvp')
  @UseGuards(RateLimitGuard)
  @RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 3, // 3 RSVP submissions per 15 minutes
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
    endpoint: 'rsvp',
  })
  async createRsvp(@Body() createRsvpDto: CreateRsvpDto): Promise<{
    success: boolean;
    message: string;
    rsvp: Rsvp;
  }> {
    const rsvp = await this.babyShowerService.createRsvp(createRsvpDto);

    return {
      success: true,
      message: 'RSVP submitted successfully!',
      rsvp,
    };
  }

  @Get('rsvp')
  @UseGuards(JwtAuthGuard)
  async getAllRsvps(): Promise<Rsvp[]> {
    return this.babyShowerService.getAllRsvps();
  }

  @Get('rsvp/:id')
  @UseGuards(JwtAuthGuard)
  async getRsvpById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Rsvp | null> {
    return this.babyShowerService.getRsvpById(id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getRsvpStats(): Promise<{
    total: number;
    attending: number;
    notAttending: number;
    totalGuests: number;
  }> {
    return this.babyShowerService.getRsvpStats();
  }
}
