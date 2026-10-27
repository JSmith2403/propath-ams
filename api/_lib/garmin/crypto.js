// Encrypts / decrypts an athlete's Garmin personal API key for storage.
// AES-256-GCM with a key derived from the GARMIN_KEY_SECRET env var (Vercel project
// setting — long random string, never committed). Without that variable the connect
// step refuses to run, so a key is never stored unprotected.

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

function secretKey() {
  const secret = (process.env.GARMIN_KEY_SECRET || '').trim();
  if (secret.length < 24) return null;
  return createHash('sha256').update(secret).digest();   // 32 bytes
}

export const encryptionConfigured = () => !!secretKey();

export function encryptKey(plain) {
  const key = secretKey();
  if (!key) throw new Error('GARMIN_KEY_SECRET is not set on the server.');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), enc].map(b => b.toString('base64')).join('.');
}

export function decryptKey(stored) {
  const key = secretKey();
  if (!key) throw new Error('GARMIN_KEY_SECRET is not set on the server.');
  const [iv, tag, enc] = String(stored).split('.').map(p => Buffer.from(p, 'base64'));
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}
