import { describe, expect, it } from 'vitest';
import { isValidPassword } from '../../../common/security/password-policy.js';
import { generateTemporaryPassword, TEMPORARY_PASSWORD_LENGTH } from './temporary-password.js';

describe('generateTemporaryPassword', () => {
  it('tiene 12 caracteres y cumple la política de contraseñas', () => {
    for (let i = 0; i < 200; i++) {
      const password = generateTemporaryPassword();
      expect(password).toHaveLength(TEMPORARY_PASSWORD_LENGTH);
      expect(isValidPassword(password)).toBe(true);
    }
  });

  it('no usa caracteres confusos', () => {
    for (let i = 0; i < 200; i++) expect(generateTemporaryPassword()).not.toMatch(/[01OlI]/);
  });

  it('genera valores distintos', () => {
    const passwords = new Set(Array.from({ length: 50 }, generateTemporaryPassword));
    expect(passwords.size).toBe(50);
  });
});
