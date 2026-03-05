import { Test, TestingModule } from '@nestjs/testing';
import { NoncesService } from './nonces.service';
import { INoncesRepository } from './repositories/nonces.repository.interface';
import { AppException } from '../../common/exceptions/app.exception';
import { NonceAction } from './types/nonce-action.type';

const NONCES_REPOSITORY_TOKEN = 'INoncesRepository';

describe('NoncesService', () => {
  let service: NoncesService;
  let repository: jest.Mocked<INoncesRepository>;

  beforeEach(async () => {
    const mockRepository: jest.Mocked<INoncesRepository> = {
      create: jest.fn(),
      findByValue: jest.fn(),
      markUsed: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoncesService,
        { provide: NONCES_REPOSITORY_TOKEN, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<NoncesService>(NoncesService);
    repository = module.get(NONCES_REPOSITORY_TOKEN);
  });

  describe('generate', () => {
    it('should create nonce with correct userId, action, and 5-minute TTL', async () => {
      const userId = 'user-123';
      const action: NonceAction = 'ESCROW_CREATE';
      const mockNonce = {
        id: 'nonce-id',
        userId,
        action,
        value: 'a'.repeat(64),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        usedAt: null,
        createdAt: new Date(),
      };

      repository.create.mockResolvedValue(mockNonce);

      await service.generate(userId, action);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          action,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value: expect.any(String),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          expiresAt: expect.any(Date),
        }),
      );

      const callArgs = repository.create.mock.calls[0][0];
      const ttl = callArgs.expiresAt.getTime() - Date.now();
      expect(ttl).toBeGreaterThanOrEqual(4.9 * 60 * 1000);
      expect(ttl).toBeLessThanOrEqual(5 * 60 * 1000);
    });

    it('should return a 64-character hex string', async () => {
      const mockNonce = {
        id: 'nonce-id',
        userId: 'user-123',
        action: 'ESCROW_CREATE' as NonceAction,
        value: 'a'.repeat(64),
        expiresAt: new Date(),
        usedAt: null,
        createdAt: new Date(),
      };

      repository.create.mockResolvedValue(mockNonce);

      const result = await service.generate('user-123', 'ESCROW_CREATE');

      expect(result).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('consume', () => {
    it('should throw NONCE_INVALID when nonce not found', async () => {
      repository.findByValue.mockResolvedValue(null);

      await expect(
        service.consume('user-123', 'ESCROW_CREATE', 'invalid-nonce'),
      ).rejects.toThrow(
        new AppException('NONCE_INVALID', 'Nonce not found', 422),
      );
    });

    it('should throw NONCE_INVALID when userId mismatch', async () => {
      const mockNonce = {
        id: 'nonce-id',
        userId: 'user-456',
        action: 'ESCROW_CREATE' as NonceAction,
        value: 'valid-nonce',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        usedAt: null,
        createdAt: new Date(),
      };

      repository.findByValue.mockResolvedValue(mockNonce);

      await expect(
        service.consume('user-123', 'ESCROW_CREATE', 'valid-nonce'),
      ).rejects.toThrow(
        new AppException(
          'NONCE_INVALID',
          'Nonce does not belong to this user',
          422,
        ),
      );
    });

    it('should throw NONCE_INVALID when action mismatch', async () => {
      const mockNonce = {
        id: 'nonce-id',
        userId: 'user-123',
        action: 'ESCROW_CREATE' as NonceAction,
        value: 'valid-nonce',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        usedAt: null,
        createdAt: new Date(),
      };

      repository.findByValue.mockResolvedValue(mockNonce);

      await expect(
        service.consume('user-123', 'ESCROW_RELEASE', 'valid-nonce'),
      ).rejects.toThrow(
        new AppException('NONCE_INVALID', 'Nonce action mismatch', 422),
      );
    });

    it('should throw NONCE_INVALID when nonce already used', async () => {
      const mockNonce = {
        id: 'nonce-id',
        userId: 'user-123',
        action: 'ESCROW_CREATE' as NonceAction,
        value: 'valid-nonce',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        usedAt: new Date(),
        createdAt: new Date(),
      };

      repository.findByValue.mockResolvedValue(mockNonce);

      await expect(
        service.consume('user-123', 'ESCROW_CREATE', 'valid-nonce'),
      ).rejects.toThrow(
        new AppException('NONCE_INVALID', 'Nonce already used', 422),
      );
    });

    it('should throw NONCE_INVALID when nonce expired', async () => {
      const mockNonce = {
        id: 'nonce-id',
        userId: 'user-123',
        action: 'ESCROW_CREATE' as NonceAction,
        value: 'valid-nonce',
        expiresAt: new Date(Date.now() - 1000),
        usedAt: null,
        createdAt: new Date(),
      };

      repository.findByValue.mockResolvedValue(mockNonce);

      await expect(
        service.consume('user-123', 'ESCROW_CREATE', 'valid-nonce'),
      ).rejects.toThrow(
        new AppException('NONCE_INVALID', 'Nonce expired', 422),
      );
    });

    it('should call markUsed when all checks pass', async () => {
      const mockNonce = {
        id: 'nonce-id',
        userId: 'user-123',
        action: 'ESCROW_CREATE' as NonceAction,
        value: 'valid-nonce',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        usedAt: null,
        createdAt: new Date(),
      };

      repository.findByValue.mockResolvedValue(mockNonce);
      repository.markUsed.mockResolvedValue();

      await service.consume('user-123', 'ESCROW_CREATE', 'valid-nonce');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.markUsed).toHaveBeenCalledWith('nonce-id');
    });
  });
});
