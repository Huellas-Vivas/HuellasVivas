import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuthTokensDto {
  @ApiProperty({ description: 'JWT access token (RS256, 15 min TTL)' })
  @Expose()
  accessToken: string;

  @ApiProperty({ description: 'Opaque refresh token (7 day TTL)' })
  @Expose()
  refreshToken: string;
}
