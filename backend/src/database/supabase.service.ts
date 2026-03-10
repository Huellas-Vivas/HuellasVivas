import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
