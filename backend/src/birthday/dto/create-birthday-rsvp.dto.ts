import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { BirthdayAttendance } from '../entities/birthday-rsvp.entity';

export class CreateBirthdayRsvpDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsEmail()
  @MaxLength(320)
  email: string;

  @IsEnum(BirthdayAttendance)
  attending: BirthdayAttendance;

  @IsInt()
  @Min(0)
  @Max(10)
  guestCount: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
