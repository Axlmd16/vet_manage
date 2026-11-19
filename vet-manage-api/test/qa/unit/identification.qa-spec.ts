// QA Sprint 1 · Regla compartida de cédula ecuatoriana (HU-51, HU-01) · nivel unitario.
import { describe, expect, it } from 'vitest';
import { identificationCheckDigit, isValidIdentification } from '../../../src/common/validation/identification.js';

describe('Validación de cédula (unitarias)', () => {
  it('acepta las cédulas de la semilla QA (dígito verificador módulo 10)', () => {
    for (const id of ['1105010001', '1105010373', '1105016669', '1105018517']) {
      expect(isValidIdentification(id), id).toBe(true);
    }
  });

  it('calcula el dígito verificador', () => {
    expect(identificationCheckDigit('110501000')).toBe(1);
    expect(identificationCheckDigit('110501037')).toBe(3);
  });

  it('acepta la provincia 30 (ecuatorianos en el exterior) y la 24 (límite superior)', () => {
    const with30 = `305010000`;
    const with24 = `245010000`;
    expect(isValidIdentification(with30 + identificationCheckDigit(with30))).toBe(true);
    expect(isValidIdentification(with24 + identificationCheckDigit(with24))).toBe(true);
  });

  it('rechaza provincia 00 y 25 (fuera de rango)', () => {
    for (const nine of ['005010000', '255010000']) {
      expect(isValidIdentification(nine + identificationCheckDigit(nine))).toBe(false);
    }
  });

  it('rechaza un tercer dígito ≥ 6 (valor límite: 5 válido, 6 inválido)', () => {
    const five = '115010000';
    const six = '116010000';
    expect(isValidIdentification(five + identificationCheckDigit(five))).toBe(true);
    expect(isValidIdentification(six + identificationCheckDigit(six))).toBe(false);
  });

  it('rechaza alfanuméricos, espacios y longitudes distintas de 10', () => {
    for (const value of ['11050A0001', ' 1105010001', '110501000', '11050100011', '']) {
      expect(isValidIdentification(value), JSON.stringify(value)).toBe(false);
    }
  });

  it('rechaza las cédulas de ejemplo de las HU (verificador incorrecto)', () => {
    expect(isValidIdentification('1104567890')).toBe(false);
    expect(isValidIdentification('1105555555')).toBe(false);
  });
});
