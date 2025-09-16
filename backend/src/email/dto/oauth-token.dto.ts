import { Expose } from 'class-transformer';

export class OAuthTokenDto {
  @Expose({ name: 'access_token' })
  accessToken: string;

  @Expose({ name: 'refresh_token' })
  refreshToken: string;

  @Expose({ name: 'expires_in' })
  expiresIn: number;

  @Expose({ name: 'api_domain' })
  apiDomain: string;

  @Expose({ name: 'token_type' })
  tokenType: string;

  scope: string;
}
