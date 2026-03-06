import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { WalletsService } from './wallets.service';
import { WalletsRepository } from './wallets.repository';

/**
 * WalletsModule manages Stellar wallet generation and encryption.
 *
 * This module does NOT expose HTTP routes (no controller).
 * It exports WalletsService for use by other modules (e.g., AuthModule).
 */
@Module({
  imports: [DatabaseModule],
  providers: [WalletsService, WalletsRepository],
  exports: [WalletsService],
})
export class WalletsModule {}
