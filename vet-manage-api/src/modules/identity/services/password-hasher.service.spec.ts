import { isValidPassword } from '../../../common/security/password-policy.js';
import { PasswordHasher } from './password-hasher.service.js';

describe('PasswordHasher', () => {
  const hasher = new PasswordHasher();

  it('no guarda la contraseña en claro', async () => {
    const hash = await hasher.hash('Vet12345');

    expect(hash).not.toContain('Vet12345');
    expect(hash.startsWith('scrypt$')).toBe(true);
  });

  it('genera hashes distintos para la misma contraseña', async () => {
    expect(await hasher.hash('Vet12345')).not.toBe(await hasher.hash('Vet12345'));
  });

  it('verifica la contraseña correcta y rechaza otra', async () => {
    const hash = await hasher.hash('Vet12345');

    expect(await hasher.verify('Vet12345', hash)).toBe(true);
    expect(await hasher.verify('Vet12346', hash)).toBe(false);
  });

  it('rechaza un hash con formato inválido', async () => {
    expect(await hasher.verify('Vet12345', 'texto-plano')).toBe(false);
  });
});

describe('Política de contraseñas', () => {
  it.each(['Vet12345', 'Abcdefg1', 'Contraseña1'])('acepta %s', (password) => {
    expect(isValidPassword(password)).toBe(true);
  });

  it.each(['vet12345', 'VET12345', 'Vetvetvet', 'Vet1'])('rechaza %s', (password) => {
    expect(isValidPassword(password)).toBe(false);
  });
});
