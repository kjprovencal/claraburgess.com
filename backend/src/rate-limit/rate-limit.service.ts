import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RateLimit } from './entities/rate-limit.entity';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  blockDurationMs?: number; // How long to block after exceeding limit
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
  };

  constructor(
    @InjectRepository(RateLimit)
    private readonly rateLimitRepository: Repository<RateLimit>,
  ) {}

  /**
   * Check if an IP address is within rate limits
   * @param ipAddress - The IP address to check
   * @param endpoint - The endpoint being accessed (optional)
   * @param config - Custom rate limit configuration (optional)
   * @returns Promise<{ allowed: boolean; remaining: number; resetTime: Date }>
   */
  async checkRateLimit(
    ipAddress: string,
    endpoint?: string,
    config: RateLimitConfig = this.defaultConfig,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    retryAfter?: number;
  }> {
    try {
      this.logger.debug(
        `Checking rate limit for IP ${ipAddress}, endpoint ${endpoint || 'default'}`,
      );
      const now = new Date();
      const windowStart = new Date(now.getTime() - config.windowMs);
      const blockExpiry = new Date(
        now.getTime() - (config.blockDurationMs || 0),
      );

      // Check if IP is currently blocked
      const blockedRecord = await this.rateLimitRepository.findOne({
        where: {
          ipAddress,
          endpoint: endpoint || 'default',
          isBlocked: true,
        },
      });

      if (
        blockedRecord &&
        blockedRecord.blockedUntil &&
        blockedRecord.blockedUntil > now
      ) {
        const retryAfter = Math.ceil(
          (blockedRecord.blockedUntil.getTime() - now.getTime()) / 1000,
        );
        return {
          allowed: false,
          remaining: 0,
          resetTime: blockedRecord.blockedUntil,
          retryAfter,
        };
      }

      // Clean up expired records
      await this.cleanupExpiredRecords(ipAddress, endpoint);

      // Count requests in current window
      const requestCount = await this.rateLimitRepository
        .createQueryBuilder('rateLimit')
        .where('rateLimit.ipAddress = :ipAddress', { ipAddress })
        .andWhere('rateLimit.endpoint = :endpoint', {
          endpoint: endpoint || 'default',
        })
        .andWhere('rateLimit.timestamp >= :windowStart', { windowStart })
        .andWhere('rateLimit.isBlocked = :isBlocked', { isBlocked: false })
        .getCount();

      const remaining = Math.max(0, config.maxRequests - requestCount);
      const resetTime = new Date(now.getTime() + config.windowMs);

      if (requestCount >= config.maxRequests) {
        // Block the IP
        await this.blockIp(ipAddress, endpoint, config.blockDurationMs);

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter: Math.ceil(config.windowMs / 1000),
        };
      }

      // Record this request
      await this.recordRequest(ipAddress, endpoint);

      return {
        allowed: true,
        remaining,
        resetTime,
      };
    } catch (error) {
      this.logger.error('Error checking rate limit:', error);
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remaining: this.defaultConfig.maxRequests,
        resetTime: new Date(Date.now() + this.defaultConfig.windowMs),
      };
    }
  }

  /**
   * Record a request for rate limiting
   */
  private async recordRequest(
    ipAddress: string,
    endpoint?: string,
  ): Promise<void> {
    const record = this.rateLimitRepository.create({
      ipAddress,
      endpoint: endpoint || 'default',
      timestamp: new Date(),
      isBlocked: false,
    });

    await this.rateLimitRepository.save(record);
  }

  /**
   * Block an IP address
   */
  private async blockIp(
    ipAddress: string,
    endpoint?: string,
    blockDurationMs?: number,
  ): Promise<void> {
    const blockedUntil = blockDurationMs
      ? new Date(Date.now() + blockDurationMs)
      : null;

    const record = this.rateLimitRepository.create({
      ipAddress,
      endpoint: endpoint || 'default',
      timestamp: new Date(),
      isBlocked: true,
      blockedUntil: blockedUntil || undefined,
    });

    await this.rateLimitRepository.save(record);
    this.logger.warn(
      `IP ${ipAddress} blocked for endpoint ${endpoint || 'default'}`,
    );
  }

  /**
   * Clean up expired records
   */
  private async cleanupExpiredRecords(
    ipAddress: string,
    endpoint?: string,
  ): Promise<void> {
    const cutoffTime = new Date(Date.now() - this.defaultConfig.windowMs * 2);

    await this.rateLimitRepository
      .createQueryBuilder()
      .delete()
      .where('ipAddress = :ipAddress', { ipAddress })
      .andWhere('endpoint = :endpoint', { endpoint: endpoint || 'default' })
      .andWhere('timestamp < :cutoffTime', { cutoffTime })
      .execute();
  }

  /**
   * Get rate limit status for an IP
   */
  async getRateLimitStatus(
    ipAddress: string,
    endpoint?: string,
  ): Promise<{
    isBlocked: boolean;
    blockedUntil?: Date;
    requestCount: number;
    remaining: number;
    resetTime: Date;
  }> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - this.defaultConfig.windowMs);

    const [blockedRecord, requestCount] = await Promise.all([
      this.rateLimitRepository.findOne({
        where: {
          ipAddress,
          endpoint: endpoint || 'default',
          isBlocked: true,
        },
      }),
      this.rateLimitRepository
        .createQueryBuilder('rateLimit')
        .where('rateLimit.ipAddress = :ipAddress', { ipAddress })
        .andWhere('rateLimit.endpoint = :endpoint', {
          endpoint: endpoint || 'default',
        })
        .andWhere('rateLimit.timestamp >= :windowStart', { windowStart })
        .andWhere('rateLimit.isBlocked = :isBlocked', { isBlocked: false })
        .getCount(),
    ]);

    const remaining = Math.max(
      0,
      this.defaultConfig.maxRequests - requestCount,
    );
    const resetTime = new Date(now.getTime() + this.defaultConfig.windowMs);

    return {
      isBlocked: !!(
        blockedRecord &&
        blockedRecord.blockedUntil &&
        blockedRecord.blockedUntil > now
      ),
      blockedUntil: blockedRecord?.blockedUntil,
      requestCount,
      remaining,
      resetTime,
    };
  }

  /**
   * Manually unblock an IP address
   */
  async unblockIp(ipAddress: string, endpoint?: string): Promise<void> {
    await this.rateLimitRepository.update(
      {
        ipAddress,
        endpoint: endpoint || 'default',
        isBlocked: true,
      },
      {
        isBlocked: false,
        blockedUntil: undefined,
      },
    );

    this.logger.log(
      `IP ${ipAddress} unblocked for endpoint ${endpoint || 'default'}`,
    );
  }
}
