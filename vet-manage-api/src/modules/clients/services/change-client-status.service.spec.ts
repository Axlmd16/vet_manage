import { describe, expect, it, vi } from 'vitest';
import { ApiException } from '../../../common/errors/api-exception.js';
import { ChangeClientStatusService, CLIENT_STATUS_MESSAGES } from './change-client-status.service.js';

type Tx = {
  client: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

function build(tx: Tx) {
  const prisma = {
    $transaction: vi.fn(async (run: (client: Tx) => Promise<void>) => run(tx)),
  };
  const audit = { record: vi.fn(async () => undefined) };
  const service = new ChangeClientStatusService(prisma as never, audit as never);
  return { prisma, tx, service, audit };
}

function baseTx(clientOverrides: Record<string, unknown> = {}): Tx {
  return {
    client: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'c-1',
        status: 'ACTIVE',
        person: { identification: '1104567890', firstName: 'Juan', lastName: 'Pérez' },
        ...clientOverrides,
      }),
      update: vi.fn().mockResolvedValue(undefined),
    },
  };
}

describe('ChangeClientStatusService', () => {
  it('inactiva un cliente activo y registra la auditoría en la misma transacción', async () => {
    const tx = baseTx();
    const { service, audit } = build(tx);

    const result = await service.inactivate('c-1', 'u-receptionist');

    expect(result).toEqual({
      message: CLIENT_STATUS_MESSAGES.inactivated,
      client: { id: 'c-1', status: 'INACTIVE' },
    });
    expect(tx.client.update).toHaveBeenCalledWith({
      where: { id: 'c-1' },
      data: { status: 'INACTIVE' },
    });
    expect(audit.record).toHaveBeenCalledWith(tx, {
      actorId: 'u-receptionist',
      action: 'Inactivar',
      module: 'Clientes',
      affectedRecord: '1104567890 - Juan Pérez',
      previousValue: { status: 'Activo' },
      newValue: { status: 'Inactivo' },
    });
  });

  it('devuelve 404 si el cliente no existe y no registra auditoría', async () => {
    const tx = baseTx();
    tx.client.findUnique.mockResolvedValue(null);
    const { service, audit } = build(tx);

    await expect(service.inactivate('c-missing', 'u-receptionist')).rejects.toMatchObject({
      statusCode: 404,
      message: CLIENT_STATUS_MESSAGES.notFound,
    });
    expect(tx.client.update).not.toHaveBeenCalled();
    expect(audit.record).not.toHaveBeenCalled();
  });

  it('rechaza inactivar un cliente dado de baja', async () => {
    const tx = baseTx({ status: 'DEACTIVATED' });
    const { service, audit } = build(tx);

    const error = await service.inactivate('c-1', 'u-manager').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiException);
    expect((error as ApiException).statusCode).toBe(400);
    expect((error as ApiException).message).toBe(CLIENT_STATUS_MESSAGES.deactivated);
    expect(tx.client.update).not.toHaveBeenCalled();
    expect(audit.record).not.toHaveBeenCalled();
  });

  it('es idempotente si el cliente ya está inactivo y no duplica auditoría', async () => {
    const tx = baseTx({ status: 'INACTIVE' });
    const { service, audit } = build(tx);

    const result = await service.inactivate('c-1', 'u-receptionist');

    expect(result).toEqual({
      message: CLIENT_STATUS_MESSAGES.inactivated,
      client: { id: 'c-1', status: 'INACTIVE' },
    });
    expect(tx.client.update).not.toHaveBeenCalled();
    expect(audit.record).not.toHaveBeenCalled();
  });
});
