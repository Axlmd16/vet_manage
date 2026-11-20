// QA Sprint 1 · HU-13 Registrar especie · nivel unitario.
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterSpeciesDto } from '../../../src/modules/pets/dtos/species/register-species.dto.js';
import { RegisterSpeciesService } from '../../../src/modules/pets/services/species/register-species.service.js';
import { describeError, rejection } from './support.js';

function build(existing: string[] = ['Canino']) {
  const speciesRepository = {
    findByName: vi.fn(async (name: string) => (existing.some((e) => e.toLowerCase() === name.toLowerCase()) ? { id: 's1', name } : null)),
    create: vi.fn(async (data: { name: string; description?: string }) => ({ id: 's-new', isActive: true, description: null, ...data })),
  };
  const prisma = { $transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback({})) };
  const audit = { record: vi.fn(async () => undefined) };
  return { service: new RegisterSpeciesService(speciesRepository as never, prisma as never, audit as never), speciesRepository, audit };
}

const dtoErrors = async (body: object) =>
  (await validate(plainToInstance(RegisterSpeciesDto, body))).flatMap((e) => Object.values(e.constraints ?? {}));

describe('HU-13 Registrar especie (unitarias)', () => {
  let ctx: ReturnType<typeof build>;

  beforeEach(() => {
    ctx = build();
  });

  it('CP-13-01 registra una especie con nombre y descripción', async () => {
    const species = await ctx.service.execute({ name: 'Roedor', description: 'Hámsters, cobayos y similares' }, 'vet-id');
    expect(species).toMatchObject({ name: 'Roedor', isActive: true, description: 'Hámsters, cobayos y similares' });
  });

  it('CP-13-01 guarda el nombre sin espacios al inicio ni al final', async () => {
    const species = await ctx.service.execute({ name: '  Roedor  ' }, 'vet-id');
    expect(species.name).toBe('Roedor');
  });

  it('CP-13-02 rechaza el nombre vacío', async () => {
    const error = await rejection(ctx.service.execute({ name: '' }, 'vet-id'));
    expect(describeError(error)).toEqual({ status: 400, message: 'El nombre de la especie es obligatorio' });
    expect(ctx.speciesRepository.create).not.toHaveBeenCalled();
  });

  it('CP-13-03 rechaza un nombre con solo espacios', async () => {
    const error = await rejection(ctx.service.execute({ name: '   ' }, 'vet-id'));
    expect(describeError(error)).toEqual({ status: 400, message: 'El nombre de la especie es obligatorio' });
  });

  it('CP-13-04 registra sin descripción (opcional)', async () => {
    await ctx.service.execute({ name: 'Pez' }, 'vet-id');
    expect(ctx.speciesRepository.create).toHaveBeenCalledWith({ name: 'Pez', description: undefined }, expect.anything());
  });

  it.each([['Canino'], ['canino'], ['CANINO']])('CP-13-06 rechaza el nombre duplicado "%s"', async (name) => {
    const error = await rejection(ctx.service.execute({ name }, 'vet-id'));
    expect(error.statusCode).toBe(409);
    expect(error.message).toContain('Ya existe una especie registrada con el nombre');
  });

  it('CP-13-07 el DTO acepta 100 caracteres y rechaza 101 (valor límite)', async () => {
    expect(await dtoErrors({ name: 'E'.repeat(100) })).toEqual([]);
    expect(await dtoErrors({ name: 'E'.repeat(101) })).toContain('El nombre no puede exceder los 100 caracteres');
  });

  it('CP-13-02 el DTO exige el nombre', async () => {
    expect(await dtoErrors({})).toContain('El nombre de la especie es obligatorio');
  });
});
