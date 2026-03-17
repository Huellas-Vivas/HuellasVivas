import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { RefreshToken } from './entities/refresh-token.entity';

interface SaveRefreshTokenPayload {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);

  constructor(private readonly supabase: SupabaseService) {}

  async saveRefreshToken(payload: SaveRefreshTokenPayload): Promise<void> {
    const { error } = await this.supabase.adminClient
      .from('refresh_tokens')
      .insert({
        user_id: payload.userId,
        token_hash: payload.tokenHash,
        expires_at: payload.expiresAt.toISOString(),
      });

    if (error) {
      this.logger.error('Failed to save refresh token', error);
      throw error;
    }
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    const { data, error } = await this.supabase.adminClient
      .from('refresh_tokens')
      .select('id, user_id, token_hash, expires_at, revoked_at, created_at')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (error) {
      this.logger.error('Failed to find refresh token', error);
      throw error;
    }

    return data ? this.mapRow(data) : null;
  }

  async revokeRefreshToken(id: string): Promise<void> {
    const { error } = await this.supabase.adminClient
      .from('refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      this.logger.error('Failed to revoke refresh token', error);
      throw error;
    }
  }

  private mapRow(row: Record<string, unknown>): RefreshToken {
    return {
      id: row['id'] as string,
      userId: row['user_id'] as string,
      tokenHash: row['token_hash'] as string,
      expiresAt: new Date(row['expires_at'] as string),
      revokedAt: row['revoked_at'] ? new Date(row['revoked_at'] as string) : null,
      createdAt: new Date(row['created_at'] as string),
    };
  }
}
