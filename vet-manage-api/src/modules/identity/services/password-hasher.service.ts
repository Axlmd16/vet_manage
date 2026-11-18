import { Injectable } from '@nestjs/common';
import { hashPassword, verifyPassword } from '../../../common/security/password-hash.js';

@Injectable()
export class PasswordHasher {
  hash(password: string): Promise<string> {
    return hashPassword(password);
  }

  verify(password: string, stored: string): Promise<boolean> {
    return verifyPassword(password, stored);
  }
}
