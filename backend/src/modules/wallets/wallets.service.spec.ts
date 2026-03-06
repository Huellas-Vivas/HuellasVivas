import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Keypair } from '@stellar/stellar-sdk';
import { randomBytes } from 'crypto';
import { WalletsService } from './wallets.service';
import { WalletsRepository } from './wallets.repository';
import { encryptSecretKey } from './wallets.crypto';
import { AppException } from '../../common/exceptions/app.exception';

// ─── Test Constants ──────────────────────────────────────────────────────────

const TEST_KEY_HEX = randomBytes(32).toString('hex');
const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

// ─── Mock Repository ─────────────────────────────────────────────────────────

const mockWalletsRepository = {
  create: jest.fn().mockResolvedValue({
    id: 'wallet-uuid',
    userId: TEST_USER_ID,
    publicKey: 'G...',
    encryptedSecretKey: 'iv:tag:ct',
    createdAt: new Date(),
  }),
  findByUserId: jest.fn(),
};

// ─── Mock ConfigService ──────────────────────────────────────────────────────

const mockConfigService = {
  get: jest.fn((key: string) => {
    const values: Record<string, string> = {
      STELLAR_NETWORK: 'testnet',
      WALLET_ENCRYPTION_KEY: TEST_KEY_HEX,
    };
    return values[key];
  }),
  getOrThrow: jest.fn((key: string) => {
    const values: Record<string, string> = {
      WALLET_ENCRYPTION_KEY: TEST_KEY_HEX,
    };
    if (values[key]) return values[key];
    throw new Error(`Missing config: ${key}`);
  }),
};

// ─── Mock global fetch ───────────────────────────────────────────────────────

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('WalletsService', () => {
  let service: WalletsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Silence logger output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        { provide: WalletsRepository, useValue: mockWalletsRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
  });

  // ─── generateAndSave ────────────────────────────────────────────────────────

  describe('generateAndSave', () => {
    it('should call Keypair.random() and save to repository', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      const keypairSpy = jest.spyOn(Keypair, 'random');

      await service.generateAndSave(TEST_USER_ID);

      // Keypair.random() was called
      expect(keypairSpy).toHaveBeenCalled();

      // Repository.create() was called with correct structure
      expect(mockWalletsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: TEST_USER_ID,
          publicKey: expect.stringMatching(/^G[A-Z2-7]{55}$/),
          encryptedSecretKey: expect.stringContaining(':'),
        }),
      );
    });

    it('should store encrypted (not plain) secret key', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await service.generateAndSave(TEST_USER_ID);

      const callArgs = mockWalletsRepository.create.mock.calls[0][0];
      const encryptedKey = callArgs.encryptedSecretKey;

      // The encrypted key must be in iv:tag:ciphertext format
      const parts = encryptedKey.split(':');
      expect(parts).toHaveLength(3);

      // It must NOT be a plain Stellar secret key (which starts with 'S')
      expect(encryptedKey).not.toMatch(/^S[A-Z2-7]{55}$/);
    });

    it('should call Friendbot on testnet', async () => {
      mockConfigService.get.mockReturnValue('testnet');
      mockFetch.mockResolvedValueOnce({ ok: true });

      await service.generateAndSave(TEST_USER_ID);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('friendbot.stellar.org'),
      );
    });

    it('should NOT call Friendbot on mainnet', async () => {
      mockConfigService.get.mockReturnValue('mainnet');

      await service.generateAndSave(TEST_USER_ID);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not throw if Friendbot fails', async () => {
      mockConfigService.get.mockReturnValue('testnet');
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      // Should not throw — error is caught and logged
      await expect(
        service.generateAndSave(TEST_USER_ID),
      ).resolves.toBeUndefined();

      // The error logger should have been called
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Friendbot funding failed'),
        expect.anything(),
      );
    });

    it('should not throw if Friendbot network errors', async () => {
      mockConfigService.get.mockReturnValue('testnet');
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        service.generateAndSave(TEST_USER_ID),
      ).resolves.toBeUndefined();

      expect(Logger.prototype.error).toHaveBeenCalled();
    });

    it('should generate a valid Stellar public key (starts with G, 56 chars)', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await service.generateAndSave(TEST_USER_ID);

      const callArgs = mockWalletsRepository.create.mock.calls[0][0];
      expect(callArgs.publicKey).toMatch(/^G[A-Z2-7]{55}$/);
      expect(callArgs.publicKey).toHaveLength(56);
    });
  });

  // ─── getDecryptedKeypair ───────────────────────────────────────────────────

  describe('getDecryptedKeypair', () => {
    it('should throw WALLET_NOT_FOUND if no wallet exists', async () => {
      mockWalletsRepository.findByUserId.mockResolvedValue(null);

      await expect(service.getDecryptedKeypair(TEST_USER_ID)).rejects.toThrow(
        AppException,
      );

      await expect(
        service.getDecryptedKeypair(TEST_USER_ID),
      ).rejects.toMatchObject({
        code: 'WALLET_NOT_FOUND',
      });
    });

    it('should return a valid Keypair when wallet exists', async () => {
      // Create a real encrypted key for a known keypair
      const originalKeypair = Keypair.random();
      const encrypted = encryptSecretKey(
        originalKeypair.secret(),
        TEST_KEY_HEX,
      );

      mockWalletsRepository.findByUserId.mockResolvedValueOnce({
        id: 'wallet-uuid',
        userId: TEST_USER_ID,
        publicKey: originalKeypair.publicKey(),
        encryptedSecretKey: encrypted,
        createdAt: new Date(),
      });

      const result = await service.getDecryptedKeypair(TEST_USER_ID);

      expect(result).toBeInstanceOf(Keypair);
      expect(result.publicKey()).toBe(originalKeypair.publicKey());
      expect(result.secret()).toBe(originalKeypair.secret());
    });

    it('should call findByUserId with the correct userId', async () => {
      const keypair = Keypair.random();
      const encrypted = encryptSecretKey(keypair.secret(), TEST_KEY_HEX);

      mockWalletsRepository.findByUserId.mockResolvedValueOnce({
        id: 'wallet-uuid',
        userId: TEST_USER_ID,
        publicKey: keypair.publicKey(),
        encryptedSecretKey: encrypted,
        createdAt: new Date(),
      });

      await service.getDecryptedKeypair(TEST_USER_ID);

      expect(mockWalletsRepository.findByUserId).toHaveBeenCalledWith(
        TEST_USER_ID,
      );
    });
  });
});
