import { Prisma } from '../../src/generated/prisma/client.js';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service.js';

type Tx = Prisma.TransactionClient;

class Rollback extends Error {}

describe('Persona y usuario (e2e)', () => {
  const prisma = new PrismaService();

  // Ejecuta el caso dentro de una transacción que siempre se revierte.
  async function inRollback(run: (tx: Tx) => Promise<void>) {
    try {
      await prisma.$transaction(async (tx) => {
        await run(tx);
        throw new Rollback();
      });
    } catch (error) {
      if (!(error instanceof Rollback)) throw error;
    }
  }

  const personData = (overrides: Partial<Prisma.PersonCreateInput> = {}): Prisma.PersonCreateInput => ({
    identification: '1104567890',
    firstName: 'Carlos',
    lastName: 'Pérez',
    email: 'carlos.perez@vetmanage.test',
    ...overrides,
  });

  beforeAll(() => prisma.$connect());
  afterAll(() => prisma.$disconnect());

  it('permite una persona sin cuenta de usuario', () =>
    inRollback(async (tx) => {
      const person = await tx.person.create({ data: personData() });
      const found = await tx.person.findUnique({ where: { id: person.id }, include: { user: true } });

      expect(found?.user).toBeNull();
    }));

  it('crea la cuenta con estado activo por defecto', () =>
    inRollback(async (tx) => {
      const person = await tx.person.create({ data: personData() });
      const user = await tx.user.create({ data: { personId: person.id } });

      expect(user.status).toBe('ACTIVE');
      expect(user.isLocked).toBe(false);
    }));

  it('rechaza una segunda cuenta para la misma persona', () =>
    inRollback(async (tx) => {
      const person = await tx.person.create({ data: personData() });
      await tx.user.create({ data: { personId: person.id } });

      await expect(tx.user.create({ data: { personId: person.id } })).rejects.toMatchObject({ code: 'P2002' });
    }));

  it('rechaza una cédula repetida', () =>
    inRollback(async (tx) => {
      await tx.person.create({ data: personData() });

      await expect(
        tx.person.create({ data: personData({ email: 'otro@vetmanage.test' }) }),
      ).rejects.toMatchObject({ code: 'P2002' });
    }));

  it('rechaza un correo repetido', () =>
    inRollback(async (tx) => {
      await tx.person.create({ data: personData() });

      await expect(
        tx.person.create({ data: personData({ identification: '1105555555' }) }),
      ).rejects.toMatchObject({ code: 'P2002' });
    }));

  it('no permite eliminar una persona que tiene cuenta', () =>
    inRollback(async (tx) => {
      const person = await tx.person.create({ data: personData() });
      await tx.user.create({ data: { personId: person.id } });

      await expect(tx.person.delete({ where: { id: person.id } })).rejects.toMatchObject({ code: 'P2003' });
    }));
});
