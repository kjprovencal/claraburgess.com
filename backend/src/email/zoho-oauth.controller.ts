import { Controller, Get, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { ZohoOAuthService } from './zoho-oauth.service';
import { ZohoMailApiService } from './zoho-mail-api.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

export class ZohoAuthCallbackDto {
  code: string;
  state?: string;
}

export class ZohoTokenExchangeDto {
  authorizationCode: string;
}

@Controller('zoho-oauth')
export class ZohoOAuthController {
  constructor(
    private readonly zohoOAuthService: ZohoOAuthService,
    private readonly zohoMailApiService: ZohoMailApiService,
  ) {}

  /**
   * Fetch refresh token from Zoho. Requires authorization code (from Zoho API console)
   */
  @Post('token')
  @UseGuards(JwtAuthGuard)
  async fetchRefreshToken(@Body() body: { code: string }) {
    try {
      if (!body.code) {
        throw new Error('Code is required');
      }

      await this.zohoOAuthService.fetchRefreshToken(body.code);
      return {
        success: true,
        message: 'Refresh token retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to retrieve refresh token',
      };
    }
  }

  /**
   * Revoke refresh token
   */
  @Post('revoke-token')
  @UseGuards(JwtAuthGuard)
  async revokeToken() {
    try {
      await this.zohoOAuthService.revokeRefreshToken();

      return {
        success: true,
        message: 'Refresh token revoked successfully',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to revoke refresh token',
      };
    }
  }

  /**
   * Get OAuth status
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus() {
    return {
      oauth: await this.zohoOAuthService.getTokenStatus(),
      mailApi: await this.zohoMailApiService.getStatus(),
    };
  }

  /**
   * Test email sending
   */
  @Post('test-email')
  @UseGuards(JwtAuthGuard)
  async testEmail(
    @Body() body: { to: string; subject?: string; content?: string },
  ) {
    try {
      const result = await this.zohoMailApiService.sendEmail({
        toAddress: body.to,
        subject: body.subject || 'Test Email from Clara Burgess Registry',
        content:
          body.content ||
          '<p>This is a test email to verify Zoho OAuth integration.</p>',
        mailFormat: 'html',
      });

      return result;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to send test email',
      };
    }
  }
}
