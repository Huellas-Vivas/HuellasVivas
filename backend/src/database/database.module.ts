import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

/**
 * DatabaseModule provides the SupabaseService globally.
 * Import this module in any feature module that needs database access.
 */
@Global()
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class DatabaseModule {}
