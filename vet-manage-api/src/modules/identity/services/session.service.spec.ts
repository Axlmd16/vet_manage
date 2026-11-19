import { durationToMs } from './session.service.js';

describe('durationToMs', () => {
  it.each([
    ['30s', 30_000],
    ['15m', 900_000],
    ['12h', 43_200_000],
    ['7d', 604_800_000],
  ])('convierte %s', (value, expected) => {
    expect(durationToMs(value)).toBe(expected);
  });

  it('rechaza un formato inválido', () => {
    expect(() => durationToMs('12 horas')).toThrow();
  });
});
