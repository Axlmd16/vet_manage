import { describe, expect, it } from 'vitest';
import { identificationCheckDigit, isValidIdentification } from './identification.js';

describe('isValidIdentification', () => {
  it.each(['1700000001', '1710034065', '0912345675', '3000000004'])('acepta %s', (value) => {
    expect(isValidIdentification(value)).toBe(true);
  });

  it.each(['11045', '', '17000000011', '17000000a1', ' 1700000001'])('rechaza el formato %j', (value) => {
    expect(isValidIdentification(value)).toBe(false);
  });

  it('rechaza una provincia inválida', () => {
    expect(isValidIdentification('2500000001')).toBe(false);
    expect(isValidIdentification('0000000000')).toBe(false);
  });

  it('rechaza un tercer dígito mayor o igual que 6', () => {
    expect(isValidIdentification('1760000008')).toBe(false);
  });

  it('rechaza un dígito verificador incorrecto', () => {
    expect(isValidIdentification('1700000002')).toBe(false);
    expect(isValidIdentification('1104567890')).toBe(false);
  });
});

describe('identificationCheckDigit', () => {
  it('calcula el verificador de los nueve primeros dígitos', () => {
    expect(identificationCheckDigit('170000000')).toBe(1);
  });
});
