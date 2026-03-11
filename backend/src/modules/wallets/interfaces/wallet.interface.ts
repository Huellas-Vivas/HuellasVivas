/**
 * Wallet entity representing a row in the wallets table.
 * Maps snake_case DB columns to camelCase TypeScript properties.
 */
export interface Wallet {
  id: string;
  userId: string;
  publicKey: string;
  encryptedSecretKey: string;
  createdAt: Date;
}
