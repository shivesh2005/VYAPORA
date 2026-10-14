import crypto from 'crypto';
import { config } from '../config/env';

// Derive 32-byte key safely using scrypt
const getEncryptionKey = (): Buffer => {
  const secret = process.env.ENCRYPTION_KEY || config.jwtSecret || 'vyapora-secure-ai-key-secret-32-chars!';
  return crypto.scryptSync(secret, 'vyapora_ai_salt_secure_2026', 32);
};

/**
 * Encrypt sensitive secret using AES-256-GCM authenticated encryption
 */
export const encryptSecret = (plaintext: string): string => {
  if (!plaintext || plaintext.trim() === '') return '';

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext.trim(), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
};

/**
 * Decrypt sensitive secret using AES-256-GCM authenticated encryption
 */
export const decryptSecret = (payload: string): string => {
  if (!payload || !payload.includes(':')) return '';

  try {
    const [ivHex, authTagHex, encryptedHex] = payload.split(':');
    if (!ivHex || !authTagHex || !encryptedHex) return '';

    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err: any) {
    console.error('Failed to decrypt secret payload:', err.message);
    return '';
  }
};

/**
 * Produce masked representation for safe UI rendering (e.g., AIza••••••••••••9Xz2)
 */
export const maskSecret = (secret: string): string => {
  if (!secret || typeof secret !== 'string') return '';
  const trimmed = secret.trim();
  if (trimmed.length <= 8) {
    return '••••••••';
  }
  return `${trimmed.slice(0, 4)}••••••••••••${trimmed.slice(-4)}`;
};
