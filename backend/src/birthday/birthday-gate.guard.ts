import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { verifyBirthdayGate } from './birthday-gate';

@Injectable()
export class BirthdayGateGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = (
      this.configService.get<string>('TURNSTILE_SECRET_KEY') ?? ''
    ).trim();
    if (secret === '') {
      throw new ServiceUnavailableException();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const timestamp = request.header('x-birthday-timestamp') ?? '';
    const signature = request.header('x-birthday-signature') ?? '';
    if (!verifyBirthdayGate(secret, timestamp, signature, Date.now())) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
