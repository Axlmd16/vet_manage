import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiException } from '../../../../common/errors/api-exception.js';
import { PET_MESSAGES, RegisterPetService } from './register-pet.service.js';

const CLIENT_ID = '11111111-1111-4111-8111-111111111111';
const SPECIES_ID = '22222222-2222-4222-8222-222222222222';
const BREED_ID = '33333333-3333-4333-8333-333333333333';
const OTHER_SPECIES_ID = '44444444-4444-4444-8444-444444444444';

const validInput = () => ({
  name: '  Firulais  ',
  speciesId: SPECIES_ID,
  breedId: BREED_ID,
  sex: 'MALE',
  birthDate: '10-05-2024',
  weightKg: 12.5,
  heightCm: '45.3',
  reproductiveStatus: 'STERILIZED',
  color: '  Café  ',
  clientId: CLIENT_ID,
});

function build() {
  const create = vi.fn(async (data: Record<string, unknown>) => ({
    id: 'pet-1',
    code: 'PAC-000001',
    status: 'ACTIVE',
    createdAt: new Date('2026-11-19T12:00:00.000Z'),
    species: { id: SPECIES_ID, name: 'Canino' },
    breed: { id: BREED_ID, name: 'Labrador' },
    ...data,
  }));
  const findClient = vi.fn(async () => ({ id: CLIENT_ID, status: 'ACTIVE' }));
  const findSpecies = vi.fn(async () => ({ id: SPECIES_ID, name: 'Canino', isActive: true }));
  const findBreed = vi.fn(async () => ({ id: BREED_ID, name: 'Labrador', isActive: true, speciesId: SPECIES_ID }));

  const service = new RegisterPetService(
    { create } as never,
    { findById: findSpecies } as never,
    { findById: findBreed } as never,
    { findById: findClient } as never,
  );
  return { service, create, findClient, findSpecies, findBreed };
}

async function expectError(promise: Promise<unknown>, message: string, status: number, fields?: string[]) {
  const error = await promise.catch((caught: unknown) => caught);
  expect(error).toBeInstanceOf(ApiException);
  expect((error as ApiException).message).toBe(message);
  expect((error as ApiException).statusCode).toBe(status);
  if (fields) expect((error as ApiException).errors).toEqual(fields);
}

describe('RegisterPetService', () => {
  let ctx: ReturnType<typeof build>;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 19, 12));
    ctx = build();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Escenario 1: registro exitoso', () => {
    it('guarda los datos normalizados y devuelve el paciente con su código', async () => {
      const pet = await ctx.service.execute(validInput());

      expect(ctx.create).toHaveBeenCalledWith({
        name: 'Firulais',
        sex: 'MALE',
        birthDate: new Date(Date.UTC(2024, 4, 10)),
        weightKg: 12.5,
        heightCm: 45.3,
        reproductiveStatus: 'STERILIZED',
        color: 'Café',
        clientId: CLIENT_ID,
        speciesId: SPECIES_ID,
        breedId: BREED_ID,
      });
      expect(pet).toMatchObject({
        code: 'PAC-000001',
        status: 'ACTIVE',
        birthDate: '10-05-2024',
        weightKg: 12.5,
        heightCm: 45.3,
        species: { name: 'Canino' },
        breed: { name: 'Labrador' },
      });
    });

    it('redondea peso y talla a dos decimales', async () => {
      await ctx.service.execute({ ...validInput(), weightKg: 3.14159, heightCm: 20.005 });

      expect(ctx.create.mock.calls[0][0]).toMatchObject({ weightKg: 3.14, heightCm: 20.01 });
    });
  });

  describe('Escenario 2: campos obligatorios', () => {
    it('lista todos los campos faltantes', async () => {
      await expectError(
        ctx.service.execute({ clientId: CLIENT_ID, name: '   ', sex: 'MALE' }),
        PET_MESSAGES.missing,
        400,
        ['name', 'speciesId', 'breedId', 'birthDate', 'weightKg', 'heightCm', 'reproductiveStatus'],
      );
      expect(ctx.create).not.toHaveBeenCalled();
    });

    it('rechaza un sexo fuera de las opciones', async () => {
      await expectError(ctx.service.execute({ ...validInput(), sex: 'OTHER' }), PET_MESSAGES.invalidSex, 400, ['sex']);
    });

    it('rechaza un estado reproductivo fuera de las opciones', async () => {
      await expectError(
        ctx.service.execute({ ...validInput(), reproductiveStatus: 'MAYBE' }),
        PET_MESSAGES.invalidReproductiveStatus,
        400,
        ['reproductiveStatus'],
      );
    });

    it('rechaza identificadores sin formato UUID', async () => {
      await expectError(ctx.service.execute({ ...validInput(), breedId: 'abc' }), PET_MESSAGES.invalidId, 400, ['breedId']);
    });
  });

  describe('Escenario 3: color opcional', () => {
    it.each([undefined, '', '   ', null])('guarda el color como null cuando es %j', async (color) => {
      const pet = await ctx.service.execute({ ...validInput(), color });

      expect(ctx.create.mock.calls[0][0]).toMatchObject({ color: null });
      expect(pet.color).toBeNull();
    });
  });

  describe('Escenario 4: cliente obligatorio', () => {
    it('exige seleccionar un cliente antes que cualquier otro campo', async () => {
      await expectError(ctx.service.execute({}), PET_MESSAGES.clientRequired, 400, ['clientId']);
    });

    it('responde 404 si el cliente no existe', async () => {
      ctx.findClient.mockResolvedValueOnce(null as never);

      await expectError(ctx.service.execute(validInput()), PET_MESSAGES.clientRequired, 404, ['clientId']);
      expect(ctx.create).not.toHaveBeenCalled();
    });
  });

  describe('Escenario 5: cliente no disponible', () => {
    it.each(['DEACTIVATED', 'INACTIVE'])('responde 409 si el cliente está %s', async (status) => {
      ctx.findClient.mockResolvedValueOnce({ id: CLIENT_ID, status });

      await expectError(ctx.service.execute(validInput()), PET_MESSAGES.clientUnavailable, 409, ['clientId']);
      expect(ctx.create).not.toHaveBeenCalled();
    });
  });

  describe('Escenario 6: fecha de nacimiento', () => {
    it.each(['2024-05-10', '31-02-2024', '20-11-2026'])('rechaza %s', async (birthDate) => {
      await expectError(
        ctx.service.execute({ ...validInput(), birthDate }),
        PET_MESSAGES.invalidBirthDate,
        400,
        ['birthDate'],
      );
    });

    it('acepta la fecha de hoy', async () => {
      await expect(ctx.service.execute({ ...validInput(), birthDate: '19-11-2026' })).resolves.toBeDefined();
    });
  });

  describe('Escenario 7: peso y talla', () => {
    it.each([
      [{ weightKg: 0 }, ['weightKg']],
      [{ heightCm: -3 }, ['heightCm']],
      [{ weightKg: 'abc' }, ['weightKg']],
      [{ weightKg: '1e3', heightCm: true }, ['weightKg', 'heightCm']],
    ])('rechaza %j', async (override, fields) => {
      await expectError(
        ctx.service.execute({ ...validInput(), ...override }),
        PET_MESSAGES.invalidMeasures,
        400,
        fields,
      );
    });

    it('rechaza valores que no caben en la columna', async () => {
      await expectError(
        ctx.service.execute({ ...validInput(), weightKg: 10000 }),
        PET_MESSAGES.measureTooLarge,
        400,
        ['weightKg'],
      );
    });
  });

  describe('especie y raza', () => {
    it('responde 404 si la especie no existe', async () => {
      ctx.findSpecies.mockResolvedValueOnce(null as never);
      await expectError(ctx.service.execute(validInput()), PET_MESSAGES.speciesNotFound, 404);
    });

    it('responde 409 si la especie está inactiva', async () => {
      ctx.findSpecies.mockResolvedValueOnce({ id: SPECIES_ID, name: 'Canino', isActive: false });
      await expectError(ctx.service.execute(validInput()), PET_MESSAGES.speciesInactive, 409);
    });

    it('responde 404 si la raza no existe', async () => {
      ctx.findBreed.mockResolvedValueOnce(null as never);
      await expectError(ctx.service.execute(validInput()), PET_MESSAGES.breedNotFound, 404);
    });

    it('responde 400 si la raza es de otra especie', async () => {
      ctx.findBreed.mockResolvedValueOnce({ id: BREED_ID, name: 'Siamés', isActive: true, speciesId: OTHER_SPECIES_ID });
      await expectError(ctx.service.execute(validInput()), PET_MESSAGES.breedMismatch, 400, ['breedId']);
    });

    it('responde 409 si la raza está inactiva', async () => {
      ctx.findBreed.mockResolvedValueOnce({ id: BREED_ID, name: 'Labrador', isActive: false, speciesId: SPECIES_ID });
      await expectError(ctx.service.execute(validInput()), PET_MESSAGES.breedInactive, 409);
    });
  });

  describe('Escenario 9: código no editable', () => {
    it('ignora el código enviado por el usuario', async () => {
      await ctx.service.execute({ ...validInput(), code: 'PAC-999999' });

      expect(ctx.create.mock.calls[0][0]).not.toHaveProperty('code');
    });
  });
});
