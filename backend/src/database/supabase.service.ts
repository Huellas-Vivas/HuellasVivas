import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * SupabaseService provides two Supabase clients:
 * - `client`      — uses the anon key (respects Row Level Security)
 * - `adminClient` — uses the service_role key (bypasses RLS, use sparingly)
 */
@Injectable()
export class SupabaseService {
  readonly client: SupabaseClient;
  readonly adminClient: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    const url = this.config.getOrThrow<string>('supabase.url');
    const anon = this.config.getOrThrow<string>('supabase.anonKey');
    const svc = this.config.getOrThrow<string>('supabase.serviceRoleKey');
    this.client = createClient(url, anon);
    this.adminClient = createClient(url, svc, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
}
