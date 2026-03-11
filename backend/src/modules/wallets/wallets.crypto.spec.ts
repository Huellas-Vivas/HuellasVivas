import { encryptSecretKey, decryptSecretKey } from './wallets.crypto';

// Generate a valid 32-byte hex key for tests (mock for testing)
const TEST_KEY_HEX = '0'.repeat(64);

describe('wallets.crypto', () => {
  const sampleSecret = 'SCZANGBA5YHTNYVVV3C7CAZMCLXPILHSE6PGYIG2INQHVMCN2WWROTE';

  describe('encryptSecretKey', () => {
    it('should return a string in iv:tag:ciphertext format', () => {
      const encrypted = encryptSecretKey(sampleSecret, TEST_KEY_HEX);

      const parts = encrypted.split(':');
      expect(parts).toHaveLength(3);

      // Each part must be valid base64
      for (const part of parts) {
        expect(() => Buffer.from(part, 'base64')).not.toThrow();
        expect(part.length).toBeGreaterThan(0);
      }
    });

    it('should produce different ciphertexts for the same input (random IV)', () => {
      const encrypted1 = encryptSecretKey(sampleSecret, TEST_KEY_HEX);
      const encrypted2 = encryptSecretKey(sampleSecret, TEST_KEY_HEX);

      expect(encrypted1).not.toEqual(encrypted2);
    });

    it('should not contain the plain secret in the output', () => {
      const encrypted = encryptSecretKey(sampleSecret, TEST_KEY_HEX);

      expect(encrypted).not.toContain(sampleSecret);
    });
  });

  describe('decryptSecretKey', () => {
    it('should round-trip: decrypt(encrypt(secret, key), key) === secret', () => {
      const encrypted = encryptSecretKey(sampleSecret, TEST_KEY_HEX);
      const decrypted = decryptSecretKey(encrypted, TEST_KEY_HEX);

      expect(decrypted).toEqual(sampleSecret);
    });

    it('should work with various secret key values', () => {
      const secrets = [
        'SCZANGBA5YHTNYVVV3C7CAZMCLXPILHSE6PGYIG2INQHVMCN2WWROTE',
        'SBFGFF27Y64ZUGFAIG5AMJGQODZZKV2YQKAVUUN46J7UGUCG7ABUCWOV',
        'SA5OGQPSP3WOPNPZAB2RTQB45F3AIQCMPXJ52M3TP7G6D5KZSMFOEXAMPLE',
      ];

      for (const secret of secrets) {
        const encrypted = encryptSecretKey(secret, TEST_KEY_HEX);
        const decrypted = decryptSecretKey(encrypted, TEST_KEY_HEX);
        expect(decrypted).toEqual(secret);
      }
    });

    it('should throw when ciphertext is tampered with', () => {
      const encrypted = encryptSecretKey(sampleSecret, TEST_KEY_HEX);
      const parts = encrypted.split(':');

      // Tamper with the ciphertext portion (third part)
      const tamperedCt = Buffer.from(parts[2], 'base64');
      tamperedCt[0] ^= 0xff; // Flip bits in the first byte
      parts[2] = tamperedCt.toString('base64');

      const tampered = parts.join(':');

      expect(() => decryptSecretKey(tampered, TEST_KEY_HEX)).toThrow();
    });

    it('should throw when auth tag is tampered with', () => {
      const encrypted = encryptSecretKey(sampleSecret, TEST_KEY_HEX);
      const parts = encrypted.split(':');

      // Tamper with the auth tag (second part)
      const tamperedTag = Buffer.from(parts[1], 'base64');
      tamperedTag[0] ^= 0xff;
      parts[1] = tamperedTag.toString('base64');

      const tampered = parts.join(':');

      expect(() => decryptSecretKey(tampered, TEST_KEY_HEX)).toThrow();
    });

    it('should throw when using the wrong key', () => {
      const encrypted = encryptSecretKey(sampleSecret, TEST_KEY_HEX);
      const wrongKey = '1'.repeat(64);

      expect(() => decryptSecretKey(encrypted, wrongKey)).toThrow();
    });
  });
});

