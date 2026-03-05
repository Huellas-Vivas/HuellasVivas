import { Injectable, Inject } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { AppException } from '../../common/exceptions/app.exception';
import { NonceAction } from './types/nonce-action.type';
import { INoncesRepository } from './repositories/nonces.repository.interface';

@Injectable()
export class NoncesService {
  constructor(
    @Inject('INoncesRepository')
    private readonly noncesRepository: INoncesRepository,
  ) {}

  async generate(userId: string, action: NonceAction): Promise<string> {
    const value = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.noncesRepository.create({ userId, action, value, expiresAt });
    return value;
  }

  async consume(
    userId: string,
    action: NonceAction,
    value: string,
  ): Promise<void> {
    const nonce = await this.noncesRepository.findByValue(value);

    if (!nonce) {
      throw new AppException('NONCE_INVALID', 'Nonce not found', 422);
    }

    if (nonce.userId !== userId) {
      throw new AppException(
        'NONCE_INVALID',
        'Nonce does not belong to this user',
        422,
      );
    }

    if (nonce.action !== action) {
      throw new AppException('NONCE_INVALID', 'Nonce action mismatch', 422);
    }

    if (nonce.usedAt !== null) {
      throw new AppException('NONCE_INVALID', 'Nonce already used', 422);
    }

    if (new Date() > nonce.expiresAt) {
      throw new AppException('NONCE_INVALID', 'Nonce expired', 422);
    }

    await this.noncesRepository.markUsed(nonce.id);
  }
}
