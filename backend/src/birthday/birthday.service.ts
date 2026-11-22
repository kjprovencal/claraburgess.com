import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService, type EmailTemplate } from '../email/email.service';
import { CreateBirthdayRsvpDto } from './dto/create-birthday-rsvp.dto';
import {
  BirthdayAttendance,
  BirthdayRsvp,
} from './entities/birthday-rsvp.entity';

@Injectable()
export class BirthdayService {
  private readonly logger = new Logger(BirthdayService.name);
  private readonly adminEmail: string;

  constructor(
    @InjectRepository(BirthdayRsvp)
    private readonly rsvpRepository: Repository<BirthdayRsvp>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.adminEmail =
      this.configService.get<string>('ADMIN_EMAIL') || 'admin@claraburgess.com';
  }

  async create(dto: CreateBirthdayRsvpDto): Promise<BirthdayRsvp> {
    const record = {
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      attending: dto.attending,
      guestCount: this.guestCountFor(dto.attending, dto.guestCount),
      note: dto.note?.trim() ? dto.note.trim() : null,
    };

    const existing = await this.rsvpRepository.findOne({
      where: { email: record.email },
    });
    const saved = existing
      ? await this.rsvpRepository.save(Object.assign(existing, record))
      : await this.rsvpRepository.save(this.rsvpRepository.create(record));

    await this.notifyAdmin(saved);
    this.logger.log(`Birthday RSVP saved for ${saved.email}`);
    return saved;
  }

  async list(): Promise<BirthdayRsvp[]> {
    return this.rsvpRepository.find({ order: { createdAt: 'DESC' } });
  }

  private guestCountFor(
    attending: BirthdayAttendance,
    requested: number,
  ): number {
    switch (attending) {
      case BirthdayAttendance.YES:
        if (requested < 1) {
          throw new BadRequestException('Guest count is required.');
        }
        return requested;
      case BirthdayAttendance.NO:
        return 0;
      default: {
        const exhaustive: never = attending;
        return exhaustive;
      }
    }
  }

  private attendingLabel(attending: BirthdayAttendance): string {
    switch (attending) {
      case BirthdayAttendance.YES:
        return 'Yes';
      case BirthdayAttendance.NO:
        return 'No';
      default: {
        const exhaustive: never = attending;
        return exhaustive;
      }
    }
  }

  private async notifyAdmin(rsvp: BirthdayRsvp): Promise<void> {
    const attending = this.attendingLabel(rsvp.attending);
    const note = rsvp.note ?? '';
    const template: EmailTemplate = {
      subject: 'New birthday party RSVP',
      html: `<p>${escapeHtml(rsvp.name)} (${escapeHtml(rsvp.email)}) attending: ${escapeHtml(attending)}. Guests: ${rsvp.guestCount}.</p><p>${escapeHtml(note)}</p>`,
      text: `${rsvp.name} (${rsvp.email}) attending: ${attending}. Guests: ${rsvp.guestCount}. ${note}`,
    };

    try {
      const sent = await this.emailService.sendEmail(this.adminEmail, template);
      if (!sent) {
        this.logger.warn(
          `Birthday RSVP saved but the notice email was not sent for ${rsvp.email}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Birthday RSVP saved but the notice email failed for ${rsvp.email}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
