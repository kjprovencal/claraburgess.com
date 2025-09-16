import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { ZohoOAuthService } from './zoho-oauth.service';
import { ZohoMailApiService } from './zoho-mail-api.service';
import { ZohoOAuthController } from './zoho-oauth.controller';
import { OAuthTokenService } from './oauth-token.service';
import { OAuthToken } from './entities/oauth-token.entity';

@Module({
  imports: [ConfigModule, HttpModule, TypeOrmModule.forFeature([OAuthToken])],
  providers: [
    EmailService,
    ZohoOAuthService,
    ZohoMailApiService,
    OAuthTokenService,
  ],
  controllers: [ZohoOAuthController],
  exports: [
    EmailService,
    ZohoOAuthService,
    ZohoMailApiService,
    OAuthTokenService,
  ],
})
export class EmailModule {}
