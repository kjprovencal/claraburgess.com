import { SetMetadata } from '@nestjs/common';

export interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  blockDurationMs?: number;
  endpoint?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export const RATE_LIMIT_KEY = 'rateLimit';

export const RateLimit = (options: RateLimitOptions = {}) =>
  SetMetadata(RATE_LIMIT_KEY, options);
