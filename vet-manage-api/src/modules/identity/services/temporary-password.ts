import { randomInt } from 'node:crypto';

// Alfabeto sin caracteres que se confunden al leerlos (0/O, 1/l/I).
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const ALL = UPPER + LOWER + DIGITS;

export const TEMPORARY_PASSWORD_LENGTH = 12;

const pick = (alphabet: string) => alphabet[randomInt(alphabet.length)];

// Contraseña temporal de 12 caracteres con al menos una mayúscula, una minúscula y un número.
export function generateTemporaryPassword(): string {
  const chars = [pick(UPPER), pick(LOWER), pick(DIGITS)];
  while (chars.length < TEMPORARY_PASSWORD_LENGTH) chars.push(pick(ALL));

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
