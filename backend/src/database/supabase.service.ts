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
    const url = config.getOrThrow<string>('SUPABASE_URL');

    this.client = createClient(url, config.getOrThrow<string>('SUPABASE_ANON_KEY'));

    this.adminClient = createClient(
      url,
      config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }
}
