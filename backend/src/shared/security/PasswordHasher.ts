import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(nodeScrypt);

export class PasswordHasher {
  static async hash(value: string) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(value, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  static async verify(value: string, storedHash: string) {
    const [salt, hash] = storedHash.split(':');

    if (!salt || !hash) {
      return false;
    }

    const derivedKey = (await scrypt(value, salt, 64)) as Buffer;
    const hashBuffer = Buffer.from(hash, 'hex');

    return hashBuffer.length === derivedKey.length && timingSafeEqual(hashBuffer, derivedKey);
  }
}