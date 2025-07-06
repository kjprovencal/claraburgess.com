import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserStatus } from '../entities/user.entity';

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

export class RegisterDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class ApproveUserDto {
  @IsString()
  userId: string;

  @IsEnum(UserStatus)
  status: UserStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class CreatePreApprovedUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  role?: string;
}

export class CompleteRegistrationDto {
  @IsString()
  @MinLength(8)
  password: string;
}

export class RequestPasswordResetDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
