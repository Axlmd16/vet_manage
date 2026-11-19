import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sendMail = vi.fn();
const createTransport = vi.fn(() => ({ sendMail }));
vi.mock('nodemailer', () => ({ default: { createTransport } }));

const { MailService } = await import('./mail.service.js');

const mailConfig = { host: 'smtp.test', port: 25, secure: false, from: 'VetManage <no-reply@test>' };

function build(overrides: Record<string, unknown> = {}) {
  const config = { getOrThrow: () => ({ ...mailConfig, ...overrides }) } as unknown as ConfigService;
  return new MailService(config);
}

describe('MailService', () => {
  beforeEach(() => {
    sendMail.mockReset();
    createTransport.mockClear();
  });

  it('envía el mensaje con el remitente configurado', async () => {
    sendMail.mockResolvedValue({});
    await build().send({ to: 'ana@test.com', subject: 'Hola', text: 'texto' });

    expect(sendMail).toHaveBeenCalledWith({
      from: 'VetManage <no-reply@test>',
      to: 'ana@test.com',
      subject: 'Hola',
      text: 'texto',
    });
  });

  it('autentica solo cuando hay usuario', () => {
    build();
    expect(createTransport).toHaveBeenLastCalledWith(expect.objectContaining({ auth: undefined }));

    build({ user: 'u', password: 'p' });
    expect(createTransport).toHaveBeenLastCalledWith(expect.objectContaining({ auth: { user: 'u', pass: 'p' } }));
  });

  it('propaga el error del transporte', async () => {
    sendMail.mockRejectedValue(new Error('conexión rechazada'));
    await expect(build().send({ to: 'a@b.co', subject: 's', text: 't' })).rejects.toThrow('conexión rechazada');
  });
});
