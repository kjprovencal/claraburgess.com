import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rsvp, AttendanceStatus } from './entities/rsvp.entity';
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class BabyShowerService {
  private readonly logger = new Logger(BabyShowerService.name);

  constructor(
    @InjectRepository(Rsvp)
    private readonly rsvpRepository: Repository<Rsvp>,
    private readonly emailService: EmailService,
  ) {}

  async createRsvp(createRsvpDto: CreateRsvpDto): Promise<Rsvp> {
    try {
      // Check if RSVP already exists for this email
      const existingRsvp = await this.rsvpRepository.findOne({
        where: { email: createRsvpDto.email },
      });

      if (existingRsvp) {
        // Update existing RSVP
        Object.assign(existingRsvp, createRsvpDto);
        const updatedRsvp = await this.rsvpRepository.save(existingRsvp);

        // Send confirmation email if attending
        if (
          updatedRsvp.attending === AttendanceStatus.YES &&
          !updatedRsvp.emailSent
        ) {
          await this.sendConfirmationEmail(updatedRsvp);
        }

        return updatedRsvp;
      }

      // Create new RSVP
      const rsvp = this.rsvpRepository.create(createRsvpDto);
      const savedRsvp = await this.rsvpRepository.save(rsvp);

      // Send confirmation email if attending
      if (savedRsvp.attending === AttendanceStatus.YES) {
        await this.sendConfirmationEmail(savedRsvp);
      }

      this.logger.log(`RSVP created for ${savedRsvp.email}`);
      return savedRsvp;
    } catch (error) {
      this.logger.error('Error creating RSVP:', error);
      throw error;
    }
  }

  async getAllRsvps(): Promise<Rsvp[]> {
    return this.rsvpRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getRsvpById(id: number): Promise<Rsvp | null> {
    return this.rsvpRepository.findOne({ where: { id } });
  }

  async getRsvpStats(): Promise<{
    total: number;
    attending: number;
    notAttending: number;
    totalGuests: number;
  }> {
    const rsvps = await this.rsvpRepository.find();

    const total = rsvps.length;
    const attending = rsvps.filter(
      (r) => r.attending === AttendanceStatus.YES,
    ).length;
    const notAttending = rsvps.filter(
      (r) => r.attending === AttendanceStatus.NO,
    ).length;
    const totalGuests = rsvps
      .filter((r) => r.attending === AttendanceStatus.YES)
      .reduce((sum, r) => sum + r.guestCount, 0);

    return {
      total,
      attending,
      notAttending,
      totalGuests,
    };
  }

  private async sendConfirmationEmail(rsvp: Rsvp): Promise<void> {
    try {
      const eventDetails = {
        date: 'Sunday, October 26th, 2025',
        time: '2:00 PM',
        location: '30 Winslow Rd, Gorham, Maine 04038',
        registryUrl: `${process.env.FRONTEND_URL}/registry`,
      };

      const emailData = {
        to: rsvp.email,
        subject: `Baby Shower RSVP Confirmation - Clara B's Celebration`,
        template: 'baby-shower-confirmation',
        data: {
          name: rsvp.name,
          guestCount: rsvp.guestCount,
          eventDetails,
          dietaryRestrictions: rsvp.dietaryRestrictions,
          message: rsvp.message,
        },
      };

      await this.emailService.sendEmail(emailData);

      // Mark email as sent
      rsvp.emailSent = true;
      await this.rsvpRepository.save(rsvp);

      this.logger.log(`Confirmation email sent to ${rsvp.email}`);
    } catch (error) {
      this.logger.error(
        `Error sending confirmation email to ${rsvp.email}:`,
        error,
      );
      // Don't throw error - RSVP should still be saved even if email fails
    }
  }
}
