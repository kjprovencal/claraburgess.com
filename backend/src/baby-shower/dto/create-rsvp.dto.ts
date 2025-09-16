import {
  IsEmail,
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { AttendanceStatus } from '../entities/rsvp.entity';

export class CreateRsvpDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(AttendanceStatus)
  attending: AttendanceStatus;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  guestCount?: number = 1;

  @IsString()
  @IsOptional()
  dietaryRestrictions?: string;

  @IsString()
  @IsOptional()
  message?: string;
}
