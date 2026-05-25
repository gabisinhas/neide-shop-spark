import { randomBytes } from 'node:crypto';

export class SessionTokenService {
  static generate() {
    return randomBytes(48).toString('hex');
  }
}