import { registerAs } from '@nestjs/config';

export default registerAs('stellar', () => ({
  network: process.env.STELLAR_NETWORK || 'testnet',
  encryptionKey: process.env.WALLET_ENCRYPTION_KEY,
}));
