import { Injectable, Logger } from '@nestjs/common';
import { ZohoOAuthService } from './zoho-oauth.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

export interface ZohoEmailMessage {
  toAddress: string;
  subject: string;
  content: string;
  mailFormat?: 'html' | 'plaintext';
  fromAddress?: string;
}

export interface ZohoEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class ZohoMailApiService {
  private readonly logger = new Logger(ZohoMailApiService.name);
  private readonly apiDomain: string;
  private readonly accountId: string;

  constructor(
    private readonly zohoOAuthService: ZohoOAuthService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiDomain = 'https://mail.zoho.com/api';
    this.accountId = this.configService.getOrThrow<string>('ZOHO_ACCOUNT_ID');
  }

  /**
   * Send email using Zoho Mail API
   */
  async sendEmail(emailMessage: ZohoEmailMessage): Promise<ZohoEmailResponse> {
    try {
      if (!this.zohoOAuthService.isConfigured()) {
        throw new Error('Zoho OAuth is not configured');
      }

      if (!(await this.zohoOAuthService.hasValidTokens())) {
        throw new Error(
          'Zoho OAuth tokens not available. Please complete OAuth flow first.',
        );
      }

      const accessToken = await this.zohoOAuthService.getValidAccessToken();

      const emailData = {
        fromAddress: 'admin@claraburgess.com',
        toAddress: emailMessage.toAddress,
        subject: emailMessage.subject,
        content: emailMessage.content,
        mailFormat: emailMessage.mailFormat || 'html',
      };

      const response = await lastValueFrom(
        this.httpService
          .post<ZohoEmailResponse>(
            `${this.apiDomain}/accounts/${this.accountId}/messages`,
            emailData,
            {
              headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(map((response) => response.data)),
      );

      this.logger.log(`Email sent successfully to ${emailMessage.toAddress}`);

      return {
        success: true,
        messageId: response.messageId,
      };
    } catch (error) {
      this.logger.error(`Failed to send email:`, error);
      if (!(error instanceof AxiosError))
        return {
          success: false,
          error: error.message || 'Unknown error occurred',
        };

      if (error.status !== 401)
        return {
          success: false,
          error:
            error.response?.data?.message ||
            'Failed to send email via Zoho API',
        };

      // Token might be invalid, try to refresh
      try {
        await this.zohoOAuthService.refreshAccessToken();
        return await this.sendEmail(emailMessage);
      } catch (refreshError) {
        this.logger.error('Failed to refresh token and retry:', refreshError);
        throw refreshError;
      }
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<any> {
    try {
      const accessToken = await this.zohoOAuthService.getValidAccessToken();

      const response = await lastValueFrom(
        this.httpService
          .get(`${this.apiDomain}/accounts/${this.accountId}`, {
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
          })
          .pipe(map((response) => response.data)),
      );

      return response;
    } catch (error) {
      this.logger.error('Failed to get account info:', error);
      throw error;
    }
  }

  /**
   * Get folders
   */
  async getFolders(): Promise<any> {
    try {
      const accessToken = await this.zohoOAuthService.getValidAccessToken();

      const response = await lastValueFrom(
        this.httpService
          .get(`${this.apiDomain}/folders`, {
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
          })
          .pipe(map((response) => response.data)),
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get folders:', error);
      throw error;
    }
  }

  /**
   * Get messages from a folder
   */
  async getMessages(folderId: string, limit: number = 20): Promise<any> {
    try {
      const accessToken = await this.zohoOAuthService.getValidAccessToken();

      const response = await lastValueFrom(
        this.httpService
          .get(`${this.apiDomain}/folders/${folderId}/messages`, {
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
            params: {
              limit,
            },
          })
          .pipe(map((response) => response.data)),
      );

      return response;
    } catch (error) {
      this.logger.error('Failed to get messages:', error);
      throw error;
    }
  }

  /**
   * Check if the service is ready to send emails
   */
  async isReady(): Promise<boolean> {
    return (
      this.zohoOAuthService.isConfigured() &&
      (await this.zohoOAuthService.hasValidTokens())
    );
  }

  /**
   * Get OAuth configuration status
   */
  async getStatus(): Promise<{
    isConfigured: boolean;
    hasValidTokens: boolean;
    tokenStatus: any;
  }> {
    return {
      isConfigured: this.zohoOAuthService.isConfigured(),
      hasValidTokens: await this.zohoOAuthService.hasValidTokens(),
      tokenStatus: await this.zohoOAuthService.getTokenStatus(),
    };
  }
}
