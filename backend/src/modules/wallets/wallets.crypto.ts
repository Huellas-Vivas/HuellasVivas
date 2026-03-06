import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypts a Stellar secret key using AES-256-GCM.
 *
 * @param secretKey - The Stellar secret key (starts with 'S', 56 chars)
 * @param keyHex    - The 32-byte encryption key as a 64-char hex string
 * @returns A string in the format `iv:authTag:ciphertext` (all base64-encoded)
 */
export function encryptSecretKey(secretKey: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex'); // 32 bytes
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(secretKey, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

/**
 * Decrypts a stored Stellar secret key using AES-256-GCM.
 *
 * @param stored - The encrypted value in `iv:authTag:ciphertext` format (base64)
 * @param keyHex - The 32-byte encryption key as a 64-char hex string
 * @returns The original Stellar secret key
 * @throws If the ciphertext or auth tag has been tampered with
 */
export function decryptSecretKey(stored: string, keyHex: string): string {
  const [ivB64, tagB64, ctB64] = stored.split(':');
  const key = Buffer.from(keyHex, 'hex');
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivB64, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));

  return (
    decipher.update(Buffer.from(ctB64, 'base64')).toString('utf8') +
    decipher.final('utf8')
  );
}
