import {
  IsEmail,
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
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
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1))
  @IsOptional()
  guestCount?: number = 1;

  @IsString()
  @IsOptional()
  dietaryRestrictions?: string;

  @IsString()
  @IsOptional()
  message?: string;
}
