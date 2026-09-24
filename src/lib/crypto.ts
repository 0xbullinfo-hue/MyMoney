import 'server-only'; // build error if this module is ever imported from client code
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV is the standard size for GCM
const TAG_LENGTH = 16; // full 128-bit auth tag

let cachedKey: Buffer | null = null;

// Loaded lazily so `next build` doesn't fail when env vars aren't present at build time,
// but any real encrypt/decrypt call fails closed if the key is missing or malformed.
function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error('ENCRYPTION_KEY must be set to 64 hex characters (32 bytes).');
  }
  cachedKey = Buffer.from(hex, 'hex');
  return cachedKey;
}

export interface EncryptedToken {
  encryptedData: string;
  iv: string;
  tag: string;
}

/**
 * `aad` (additional authenticated data) binds the ciphertext to a context, e.g.
 * `${userId}:${bankConnectionId}`, so a valid blob copied to another row fails to decrypt.
 * Pass the same value to decryptOAuthToken.
 */
export function encryptOAuthToken(token: string, aad?: string): EncryptedToken {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv, { authTagLength: TAG_LENGTH });
  if (aad) cipher.setAAD(Buffer.from(aad, 'utf8'));

  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);

  return {
    encryptedData: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex'),
  };
}

export function decryptOAuthToken(
  encryptedData: string,
  iv: string,
  tag: string,
  aad?: string
): string {
  const ivBuf = Buffer.from(iv, 'hex');
  const tagBuf = Buffer.from(tag, 'hex');
  if (ivBuf.length !== IV_LENGTH || tagBuf.length !== TAG_LENGTH) {
    throw new Error('Malformed encrypted token.');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), ivBuf, {
    authTagLength: TAG_LENGTH,
  });
  decipher.setAuthTag(tagBuf);
  if (aad) decipher.setAAD(Buffer.from(aad, 'utf8'));

  // final() throws if the tag doesn't verify (tampered data, wrong key, wrong aad)
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
