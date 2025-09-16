import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';
import { OAuthTokenService } from './oauth-token.service';
import { OAuthTokenDto } from './dto/oauth-token.dto';
import { plainToInstance } from 'class-transformer';

export interface ZohoTokenRefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  api_domain: string;
  token_type: string;
}

@Injectable()
export class ZohoOAuthService {
  private readonly logger = new Logger(ZohoOAuthService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly scope: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly oauthTokenService: OAuthTokenService,
  ) {
    this.clientId = this.configService.get<string>('ZOHO_CLIENT_ID') || '';
    this.clientSecret =
      this.configService.get<string>('ZOHO_CLIENT_SECRET') || '';
    this.scope =
      this.configService.get<string>('ZOHO_SCOPE') ||
      'ZohoMail.messages.CREATE,ZohoMail.messages.READ';
  }

  async fetchRefreshToken(code: string): Promise<void> {
    try {
      const params = new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });

      const tokenData = await lastValueFrom(
        this.httpService
          .post<ZohoTokenRefreshResponse>(
            `https://accounts.zoho.com/oauth/v2/token?${params.toString()}`,
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },
          )
          .pipe(map((response) => response.data)),
      );


      Logger.log('Raw Zoho API response:', tokenData);
      
      // Manual transformation to ensure proper field mapping
      const transformedData = plainToInstance(OAuthTokenDto, tokenData);
      
      Logger.log('Token data after transformation:', transformedData);
      // store new tokens
      await this.oauthTokenService.storeTokens(transformedData);
    } catch (error) {
      this.logger.error('Failed to fetch refresh token:', error);
      throw new Error('Failed to fetch refresh token');
    }
  }

  async refreshAccessToken(): Promise<string> {
    const oauthToken = await this.oauthTokenService.getActiveTokens();
    if (!oauthToken || !oauthToken.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const params = new URLSearchParams({
        refresh_token: oauthToken.refreshToken,
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });

      const tokenData = await lastValueFrom(
        this.httpService
          .post<ZohoTokenRefreshResponse>(
            `https://accounts.zoho.com/oauth/v2/token?${params.toString()}`,
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },
          )
          .pipe(map((response) => response.data)),
      );

      // Update stored tokens in database
      await this.oauthTokenService.updateAccessToken(
        tokenData.access_token,
        tokenData.expires_in,
      );

      this.logger.log('Successfully refreshed Zoho access token');
      return tokenData.access_token;
    } catch (error) {
      this.logger.error('Failed to refresh access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  async getValidAccessToken(): Promise<string> {
    const oauthToken = await this.oauthTokenService.getActiveTokens();
    if (!oauthToken || !oauthToken.accessToken) {
      throw new Error(
        'No access token available. Please complete OAuth flow first.',
      );
    }

    // Check if token is expired or will expire in the next 5 minutes
    if (
      oauthToken.tokenExpiry &&
      oauthToken.tokenExpiry.getTime() - Date.now() < 5 * 60 * 1000
    ) {
      this.logger.log('Access token expired or expiring soon, refreshing...');
      return await this.refreshAccessToken();
    }

    return oauthToken.accessToken;
  }

  async revokeRefreshToken(): Promise<void> {
    const oauthToken = await this.oauthTokenService.getActiveTokens();
    if (!oauthToken || !oauthToken.refreshToken) {
      this.logger.warn('No refresh token to revoke');
      return;
    }

    try {
      await lastValueFrom(
        this.httpService
          .post(
            `https://accounts.zoho.com/oauth/v2/token/revoke?token=${oauthToken.refreshToken}`,
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },
          )
          .pipe(map((response) => response.data)),
      );

      // Revoke tokens in database
      await this.oauthTokenService.revokeTokens();

      this.logger.log('Successfully revoked Zoho refresh token');
    } catch (error) {
      this.logger.error('Failed to revoke refresh token:', error);
      throw new Error('Failed to revoke refresh token');
    }
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  async hasValidTokens(): Promise<boolean> {
    return await this.oauthTokenService.hasValidTokens();
  }

  async getTokenStatus(): Promise<{
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    isExpired: boolean;
    expiresAt: Date | undefined;
  }> {
    return await this.oauthTokenService.getTokenStatus();
  }
}
