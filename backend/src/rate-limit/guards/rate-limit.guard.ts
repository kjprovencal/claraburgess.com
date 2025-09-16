import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RateLimitService } from '../rate-limit.service';
import {
  RATE_LIMIT_KEY,
  RateLimitOptions,
} from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ipAddress = this.getClientIp(request);

    // Get rate limit options from decorator
    const rateLimitOptions = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rateLimitOptions) {
      return true; // No rate limiting configured
    }

    try {
      const result = await this.rateLimitService.checkRateLimit(
        ipAddress,
        rateLimitOptions.endpoint,
        {
          windowMs: rateLimitOptions.windowMs || 15 * 60 * 1000,
          maxRequests: rateLimitOptions.maxRequests || 5,
          blockDurationMs: rateLimitOptions.blockDurationMs,
        },
      );

      if (!result.allowed) {
        const errorMessage = result.retryAfter
          ? `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`
          : 'Rate limit exceeded. Please try again later.';

        this.logger.warn(
          `Rate limit exceeded for IP ${ipAddress} on endpoint ${rateLimitOptions.endpoint}`,
        );

        throw new HttpException(
          {
            message: errorMessage,
            retryAfter: result.retryAfter,
            resetTime: result.resetTime,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Add rate limit headers to response
      const response = context.switchToHttp().getResponse();
      response.setHeader(
        'X-RateLimit-Limit',
        rateLimitOptions.maxRequests || 5,
      );
      response.setHeader('X-RateLimit-Remaining', result.remaining);
      response.setHeader('X-RateLimit-Reset', result.resetTime.getTime());

      this.logger.debug(
        `Rate limit check for IP ${ipAddress}: allowed=${result.allowed}, remaining=${result.remaining}`,
      );

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Rate limit check failed:', error);
      // Fail open - allow request if rate limiting fails
      return true;
    }
  }

  private getClientIp(request: Request): string {
    // Check for forwarded IP (from proxy/load balancer)
    const forwarded = request.headers['x-forwarded-for'] as string;
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    // Check for real IP header
    const realIp = request.headers['x-real-ip'] as string;
    if (realIp) {
      return realIp;
    }

    // Fall back to connection remote address
    return request.connection?.remoteAddress || request.ip || 'unknown';
  }
}
