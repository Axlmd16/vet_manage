import { describe, expect, it } from 'vitest';
import { isValidIdentification } from './identification';

describe('isValidIdentification', () => {
  it.each(['1700000001', '1710034065', '0912345675', '3000000004'])('acepta %s', (value) => {
    expect(isValidIdentification(value)).toBe(true);
  });

  it.each(['11045', '', '17000000011', '17000000a1', ' 1700000001'])('rechaza el formato %j', (value) => {
    expect(isValidIdentification(value)).toBe(false);
  });

  it('rechaza provincia inválida, tercer dígito alto y verificador incorrecto', () => {
    expect(isValidIdentification('2500000001')).toBe(false);
    expect(isValidIdentification('1760000008')).toBe(false);
    expect(isValidIdentification('1104567890')).toBe(false);
  });
});
