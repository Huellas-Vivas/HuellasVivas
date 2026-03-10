import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  INoncesRepository,
  Nonce,
  CreateNonceDto,
} from './nonces.repository.interface';

interface NonceRow {
  id: string;
  user_id: string;
  action: string;
  value: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

@Injectable()
export class NoncesRepository implements INoncesRepository {
  private supabase: SupabaseClient<any, 'public', any>;

  constructor(private configService: ConfigService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.supabase = createClient(
      this.configService.get<string>('supabase.url')!,
      this.configService.get<string>('supabase.serviceRoleKey')!,
    );
  }

  async create(data: CreateNonceDto): Promise<Nonce> {
    const { data: nonce, error } = await this.supabase
      .from('nonces')
      .insert({
        user_id: data.userId,
        action: data.action,
        value: data.value,
        expires_at: data.expiresAt.toISOString(),
      })
      .select()
      .single<NonceRow>();

    if (error) throw error;
    if (!nonce) throw new Error('Failed to create nonce');
    return this.mapToEntity(nonce);
  }

  async findByValue(value: string): Promise<Nonce | null> {
    const { data, error } = await this.supabase
      .from('nonces')
      .select('*')
      .eq('value', value)
      .single<NonceRow>();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapToEntity(data) : null;
  }

  async markUsed(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('nonces')
      .update({ used_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  private mapToEntity(row: NonceRow): Nonce {
    return {
      id: row.id,
      userId: row.user_id,
      action: row.action as Nonce['action'],
      value: row.value,
      expiresAt: new Date(row.expires_at),
      usedAt: row.used_at ? new Date(row.used_at) : null,
      createdAt: new Date(row.created_at),
    };
  }
}
