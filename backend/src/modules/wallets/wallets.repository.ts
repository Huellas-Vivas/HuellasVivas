import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { Wallet } from './interfaces/wallet.interface';

/**
 * WalletsRepository handles all database operations for the wallets table.
 *
 * Uses `adminClient` because wallet creation is a backend-only operation
 * that bypasses Row Level Security.
 */
@Injectable()
export class WalletsRepository {
  private readonly logger = new Logger(WalletsRepository.name);

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Insert a new wallet record.
   */
  async create(payload: {
    userId: string;
    publicKey: string;
    encryptedSecretKey: string;
  }): Promise<Wallet> {
    const { data, error } = await this.supabase.adminClient
      .from('wallets')
      .insert(this.toRow(payload))
      .select('id, user_id, public_key, encrypted_secret_key, created_at')
      .single();

    if (error) {
      this.logger.error('Failed to insert wallet', error);
      throw error;
    }

    return this.mapRow(data);
  }

  /**
   * Find a wallet by user ID.
   */
  async findByUserId(userId: string): Promise<Wallet | null> {
    const { data, error } = await this.supabase.adminClient
      .from('wallets')
      .select('id, user_id, public_key, encrypted_secret_key, created_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      // PGRST116: "JSON object requested, multiple (or no) rows returned"
      // Expected when the wallet doesn't exist yet — not a real error
      if (error.code === 'PGRST116') return null;
      this.logger.error(`Failed to fetch wallet for user ${userId}`, error);
      throw error;
    }

    if (!data) return null;
    return this.mapRow(data);
  }

  // ─── Private Mappers ───────────────────────────────────────────────────────

  private mapRow(row: Record<string, unknown>): Wallet {
    return {
      id: row['id'] as string,
      userId: row['user_id'] as string,
      publicKey: row['public_key'] as string,
      encryptedSecretKey: row['encrypted_secret_key'] as string,
      createdAt: new Date(row['created_at'] as string),
    };
  }

  private toRow(entity: {
    userId: string;
    publicKey: string;
    encryptedSecretKey: string;
  }): Record<string, unknown> {
    return {
      user_id: entity.userId,
      public_key: entity.publicKey,
      encrypted_secret_key: entity.encryptedSecretKey,
    };
  }
}
