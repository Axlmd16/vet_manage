import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service.js';

const SECRET = 'secreto-de-prueba-con-mas-de-treinta-y-dos-caracteres';

function build(expiresIn = '15m', secret = SECRET) {
  const config = { getOrThrow: () => expiresIn } as unknown as ConfigService;
  return new TokenService(new JwtService({ secret }), config);
}

describe('TokenService', () => {
  it('valida un token vigente y devuelve el usuario', async () => {
    const service = build();

    expect(await service.verify(await service.issue('user-1'))).toBe('user-1');
  });

  it('rechaza un token vencido', async () => {
    const service = build('1s');
    const token = await service.issue('user-1');
    await new Promise((resolve) => setTimeout(resolve, 1500));

    expect(await service.verify(token)).toBeNull();
  });

  it('rechaza un token firmado con otro secreto', async () => {
    const token = await build('15m', 'otro-secreto-distinto-con-mas-de-treinta-y-dos-caracteres').issue('user-1');

    expect(await build().verify(token)).toBeNull();
  });

  it('rechaza un token alterado', async () => {
    const [header, payload, signature] = (await build().issue('user-1')).split('.');
    const forged = Buffer.from(JSON.stringify({ sub: 'user-2' })).toString('base64url');

    expect(await build().verify(`${header}.${forged}.${signature}`)).toBeNull();
    expect(payload).not.toBe(forged);
  });

  it('rechaza texto que no es un token', async () => {
    expect(await build().verify('no-es-un-token')).toBeNull();
  });
});
