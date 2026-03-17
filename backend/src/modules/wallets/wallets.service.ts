import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);

  async generateAndSave(userId: string): Promise<void> {
    this.logger.log(`Generating Stellar wallet for user: ${userId}`);
    // TODO: Implement full Stellar keypair generation (see backend/docs/standards/blockchain.md)
    // 1. Generate Stellar keypair with stellar-base
    // 2. Encrypt secretKey with encryptSecretKey() using WALLET_ENCRYPTION_KEY
    // 3. Insert { user_id, public_key, encrypted_secret_key } into wallets table
  }
}
