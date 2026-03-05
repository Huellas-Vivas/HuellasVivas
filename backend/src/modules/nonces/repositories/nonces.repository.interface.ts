import { NonceAction } from '../types/nonce-action.type';

export interface Nonce {
  id: string;
  userId: string;
  action: NonceAction;
  value: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface CreateNonceDto {
  userId: string;
  action: NonceAction;
  value: string;
  expiresAt: Date;
}

export interface INoncesRepository {
  create(data: CreateNonceDto): Promise<Nonce>;
  findByValue(value: string): Promise<Nonce | null>;
  markUsed(id: string): Promise<void>;
}
