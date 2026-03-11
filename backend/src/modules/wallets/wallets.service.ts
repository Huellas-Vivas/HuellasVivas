import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Keypair } from '@stellar/stellar-sdk';
import { AppException } from '../../common/exceptions/app.exception';
import { encryptSecretKey, decryptSecretKey } from './wallets.crypto';
import { WalletsRepository } from './wallets.repository';

/**
 * STELLAR_NETWORKS defines network-specific configuration.
 * Friendbot is only available on testnet.
 */
const STELLAR_NETWORKS = {
  testnet: {
    friendbotUrl: 'https://friendbot.stellar.org',
  },
  mainnet: {
    friendbotUrl: null,
  },
} as const;

/**
 * WalletsService handles:
 * - Stellar keypair generation
 * - AES-256-GCM encryption of secret keys
 * - Wallet persistence via WalletsRepository
 * - Testnet account funding via Friendbot
 * - Decryption of stored keys for transaction signing
 */
@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);

  constructor(
    private readonly walletsRepository: WalletsRepository,
    private readonly config: ConfigService,
  ) {}

  /**
   * Generates a Stellar keypair, encrypts the secret key, saves to DB,
   * and optionally funds the account on testnet via Friendbot.
   *
   * This method is designed to be called fire-and-forget from AuthService.register().
   * It must never throw in a way that blocks the registration response.
   *
   * @param userId - The UUID of the newly registered user
   */
  async generateAndSave(userId: string): Promise<void> {
    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret(); // starts with 'S'

    const encryptedKey = encryptSecretKey(
      secretKey,
      this.config.getOrThrow<string>('WALLET_ENCRYPTION_KEY'),
    );

    await this.walletsRepository.create({
      userId,
      publicKey,
      encryptedSecretKey: encryptedKey,
    });

    this.logger.log(`Wallet created for user ${userId}: ${publicKey}`);

    if (this.config.get<string>('STELLAR_NETWORK') === 'testnet') {
      await this.fundTestnetAccount(publicKey).catch((err) =>
        this.logger.error(
          `Friendbot funding failed for ${publicKey}`,
          err instanceof Error ? err.stack : String(err),
        ),
      );
    }
  }

  /**
   * Retrieves and decrypts the Stellar keypair for a given user.
   *
   * @param userId - The UUID of the user
   * @returns The decrypted Stellar Keypair
   * @throws AppException with code WALLET_NOT_FOUND if no wallet exists
   */
  async getDecryptedKeypair(userId: string): Promise<Keypair> {
    const wallet = await this.walletsRepository.findByUserId(userId);

    if (!wallet) {
      throw new AppException(
        'WALLET_NOT_FOUND',
        'No wallet found for this user',
        HttpStatus.NOT_FOUND,
      );
    }

    const secretKey = decryptSecretKey(
      wallet.encryptedSecretKey,
      this.config.getOrThrow<string>('WALLET_ENCRYPTION_KEY'),
    );

    // The decrypted secret stays in memory only for the duration of this call.
    // JS strings are immutable — manual zeroing is not possible.
    return Keypair.fromSecret(secretKey);
  }

  /**
   * Funds a Stellar account on testnet via Friendbot.
   * Only called when STELLAR_NETWORK === 'testnet'.
   *
   * @param publicKey - The Stellar public key to fund
   */
  private async fundTestnetAccount(publicKey: string): Promise<void> {
    const { friendbotUrl } = STELLAR_NETWORKS.testnet;
    const url = `${friendbotUrl}?addr=${encodeURIComponent(publicKey)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new AppException(
        'STELLAR_TRANSACTION_FAILED',
        `Friendbot funding failed with status ${response.status}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    this.logger.log(`Testnet account funded via Friendbot: ${publicKey}`);
  }
}
