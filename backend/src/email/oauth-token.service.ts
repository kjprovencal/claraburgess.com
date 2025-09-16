import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthToken } from './entities/oauth-token.entity';
import { OAuthTokenDto } from './dto/oauth-token.dto';

@Injectable()
export class OAuthTokenService {
  private readonly logger = new Logger(OAuthTokenService.name);
  private readonly provider = 'zoho';

  constructor(
    @InjectRepository(OAuthToken)
    private readonly oauthTokenRepository: Repository<OAuthToken>,
  ) {}

  /**
   * Store OAuth tokens in the database (upsert - one token per provider)
   */
  async storeTokens(tokenData: OAuthTokenDto): Promise<OAuthToken> {
    try {
      this.logger.log('Token data received in storeTokens:', {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresIn: tokenData.expiresIn,
        apiDomain: tokenData.apiDomain,
      });

      const tokenExpiry = new Date(Date.now() + tokenData.expiresIn * 1000);
      this.logger.log('Calculated tokenExpiry:', tokenExpiry);

      this.logger.log('Checking for existing token');
      let oauthToken = await this.oauthTokenRepository.findOne({
        where: { provider: this.provider },
      });

      if (oauthToken) {
        this.logger.log('Updating existing token');
        oauthToken.accessToken = tokenData.accessToken;
        oauthToken.refreshToken = tokenData.refreshToken;
        oauthToken.tokenExpiry = tokenExpiry;
        oauthToken.apiDomain = tokenData.apiDomain;
      } else {
        this.logger.log('Creating new token');
        oauthToken = this.oauthTokenRepository.create({
          provider: this.provider,
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          tokenExpiry,
          apiDomain: tokenData.apiDomain,
        });
      }

      const savedToken = await this.oauthTokenRepository.save(oauthToken);
      this.logger.log('OAuth tokens stored successfully in database');
      return savedToken;
    } catch (error) {
      this.logger.error('Failed to store OAuth tokens:', error);
      throw new Error('Failed to store OAuth tokens in database');
    }
  }

  /**
   * Get the tokens for the provider
   */
  async getActiveTokens(): Promise<OAuthToken | null> {
    try {
      return await this.oauthTokenRepository.findOne({
        where: { provider: this.provider },
      });
    } catch (error) {
      this.logger.error('Failed to retrieve OAuth tokens:', error);
      return null;
    }
  }

  /**
   * Update access token (used during refresh)
   */
  async updateAccessToken(
    accessToken: string,
    expiresIn: number,
  ): Promise<OAuthToken | null> {
    try {
      const oauthToken = await this.getActiveTokens();
      if (!oauthToken) {
        throw new Error('No active OAuth tokens found');
      }

      oauthToken.accessToken = accessToken;
      oauthToken.tokenExpiry = new Date(Date.now() + expiresIn * 1000);

      const updatedToken = await this.oauthTokenRepository.save(oauthToken);
      this.logger.log('Access token updated successfully');
      return updatedToken;
    } catch (error) {
      this.logger.error('Failed to update access token:', error);
      throw new Error('Failed to update access token');
    }
  }

  /**
   * Revoke tokens (delete from database)
   */
  async revokeTokens(): Promise<void> {
    try {
      const result = await this.oauthTokenRepository.delete({
        provider: this.provider,
      });

      if (result.affected && result.affected > 0) {
        this.logger.log('OAuth tokens revoked successfully');
      } else {
        this.logger.warn('No OAuth tokens found to revoke');
      }
    } catch (error) {
      this.logger.error('Failed to revoke OAuth tokens:', error);
      throw new Error('Failed to revoke OAuth tokens');
    }
  }

  /**
   * Check if tokens exist and are valid
   */
  async hasValidTokens(): Promise<boolean> {
    try {
      const oauthToken = await this.getActiveTokens();
      if (!oauthToken || !oauthToken.accessToken || !oauthToken.refreshToken) {
        return false;
      }

      // Check if token is expired
      if (oauthToken.tokenExpiry && oauthToken.tokenExpiry <= new Date()) {
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Failed to check token validity:', error);
      return false;
    }
  }

  /**
   * Get token status information
   */
  async getTokenStatus(): Promise<{
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    isExpired: boolean;
    expiresAt: Date | undefined;
  }> {
    try {
      const oauthToken = await this.getActiveTokens();

      if (!oauthToken) {
        return {
          hasAccessToken: false,
          hasRefreshToken: false,
          isExpired: true,
          expiresAt: undefined,
        };
      }

      const isExpired = oauthToken.tokenExpiry
        ? oauthToken.tokenExpiry <= new Date()
        : true;

      return {
        hasAccessToken: !!oauthToken.accessToken,
        hasRefreshToken: !!oauthToken.refreshToken,
        isExpired,
        expiresAt: oauthToken.tokenExpiry,
      };
    } catch (error) {
      this.logger.error('Failed to get token status:', error);
      return {
        hasAccessToken: false,
        hasRefreshToken: false,
        isExpired: true,
        expiresAt: undefined,
      };
    }
  }
}
