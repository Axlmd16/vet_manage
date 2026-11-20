// QA Sprint 1 · HU-07 Registrar datos del paciente · nivel unitario.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clinicToday, formatBirthDate, parseBirthDate } from '../../../src/modules/pets/services/patients/birth-date.js';
import { RegisterPatientService } from '../../../src/modules/pets/services/patients/register-patient.service.js';
import { describeError, rejection } from './support.js';

const IDS = {
  client: '11111111-1111-4111-8111-111111111111',
  canino: '22222222-2222-4222-8222-222222222222',
  felino: '33333333-3333-4333-8333-333333333333',
  huron: '44444444-4444-4444-8444-444444444444',
  labrador: '55555555-5555-4555-8555-555555555555',
};
const DAY = 86_400_000;
const today = () => formatBirthDate(new Date(clinicToday()));

const valid = (): Record<string, unknown> => ({
  name: 'Max',
  speciesId: IDS.canino,
  breedId: IDS.labrador,
  gender: 'MALE',
  birthDate: '10-02-2024',
  weightKg: 20.5,
  heightCm: 55,
  reproductiveStatus: 'NOT_STERILIZED',
  color: 'Café',
  clientId: IDS.client,
});

function build() {
  let code = 0;
  const petRepository = {
    create: vi.fn(async (data: Record<string, unknown>) => ({
      id: `pet-${code}`, code: `PAC-${String(++code).padStart(6, '0')}`, status: 'ACTIVE', createdAt: new Date(), ...data,
      species: { id: data.speciesId, name: 'Canino' }, breed: { id: data.breedId, name: 'Labrador Retriever' },
    })),
  };
  const speciesRepository = {
    findById: vi.fn(async (id: string) => ({
      [IDS.canino]: { id: IDS.canino, isActive: true },
      [IDS.felino]: { id: IDS.felino, isActive: true },
      [IDS.huron]: { id: IDS.huron, isActive: false },
    })[id] ?? null),
  };
  const breedRepository = { findById: vi.fn(async (id: string) => (id === IDS.labrador ? { id, speciesId: IDS.canino, isActive: true } : null)) };
  const clientsService = { findById: vi.fn(async (id: string) => (id === IDS.client ? { id, status: 'ACTIVE' } : null)) };
  const prisma = { $transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback({})) };
  const audit = { record: vi.fn(async () => undefined) };
  const service = new RegisterPatientService(petRepository as never, speciesRepository as never, breedRepository as never, clientsService as never, prisma as never, audit as never);
  return { service, petRepository, clientsService };
}

describe('HU-07 Registrar datos del paciente (unitarias)', () => {
  let ctx: ReturnType<typeof build>;
  const register = (patch: Record<string, unknown> = {}) => ctx.service.execute({ ...valid(), ...patch } as never, 'recep-id');

  beforeEach(() => {
    ctx = build();
  });

  it('CP-07-01 registra un paciente válido, Activo y asociado al cliente', async () => {
    const pet = await register();
    expect(pet).toMatchObject({ status: 'ACTIVE', clientId: IDS.client, name: 'Max', birthDate: '10-02-2024', weightKg: 20.5 });
    expect(pet.code).toMatch(/^PAC-\d{6}$/);
  });

  it('CP-07-02 rechaza campos obligatorios vacíos y los identifica', async () => {
    const error = await rejection(register({ name: '', weightKg: undefined }));
    expect(describeError(error)).toEqual({ status: 400, message: 'Por favor, complete todos los campos obligatorios' });
    expect(error.errors).toEqual(expect.arrayContaining(['name', 'weightKg']));
  });

  it('CP-07-03 registra sin color (opcional)', async () => {
    const pet = await register({ color: '' });
    expect(pet.color).toBeNull();
  });

  it('CP-07-04 exige seleccionar un cliente', async () => {
    const error = await rejection(register({ clientId: undefined }));
    expect(describeError(error)).toEqual({ status: 400, message: 'Debe seleccionar un cliente registrado' });
  });

  it.each([['dado de baja', 'DEACTIVATED'], ['inactivo', 'INACTIVE']])(
    'CP-07-05/06 rechaza un cliente %s',
    async (_, status) => {
      ctx.clientsService.findById.mockResolvedValueOnce({ id: IDS.client, status });
      const error = await rejection(register());
      expect(describeError(error)).toEqual({ status: 409, message: 'El cliente seleccionado no está disponible' });
    },
  );

  it('CP-07-04 rechaza un cliente que no existe', async () => {
    const error = await rejection(register({ clientId: '99999999-9999-4999-8999-999999999999' }));
    expect(describeError(error)).toEqual({ status: 404, message: 'Debe seleccionar un cliente registrado' });
  });

  it('CP-07-07 rechaza una fecha inexistente (31-02-2024)', async () => {
    const error = await rejection(register({ birthDate: '31-02-2024' }));
    expect(describeError(error)).toEqual({ status: 400, message: 'Fecha de nacimiento inválida' });
  });

  it('CP-07-08 rechaza una fecha futura (mañana)', async () => {
    const tomorrow = formatBirthDate(new Date(clinicToday() + DAY));
    const error = await rejection(register({ birthDate: tomorrow }));
    expect(describeError(error)).toEqual({ status: 400, message: 'Fecha de nacimiento inválida' });
  });

  it.each([['ISO', '2024-02-10'], ['con barras', '10/02/2024'], ['sin ceros', '1-2-2024']])(
    'CP-07-09 rechaza el formato %s',
    async (_, birthDate) => {
      const error = await rejection(register({ birthDate }));
      expect(error.message).toBe('Fecha de nacimiento inválida');
    },
  );

  it('CP-07-10 acepta la fecha de hoy (valor límite)', async () => {
    const pet = await register({ birthDate: today() });
    expect(pet.birthDate).toBe(today());
  });

  it('CP-07-11 valida el 29 de febrero según el año (bisiesto / no bisiesto)', () => {
    expect(parseBirthDate('29-02-2024')).not.toBeNull();
    expect(parseBirthDate('29-02-2023')).toBeNull();
  });

  it('CP-07-12 rechaza peso igual a cero (valor límite)', async () => {
    const error = await rejection(register({ weightKg: 0 }));
    expect(describeError(error)).toEqual({ status: 400, message: 'El peso y la talla deben ser valores numéricos mayores que cero' });
    expect(error.errors).toEqual(['weightKg']);
  });

  it.each([['talla negativa', { heightCm: -5 }, 'heightCm'], ['peso no numérico', { weightKg: 'abc' }, 'weightKg']])(
    'CP-07-13 rechaza %s',
    async (_, patch, field) => {
      const error = await rejection(register(patch));
      expect(error.message).toBe('El peso y la talla deben ser valores numéricos mayores que cero');
      expect(error.errors).toEqual([field]);
    },
  );

  it.each([[0.01], [9999.99]])('CP-07-14 acepta el peso %s (valor límite)', async (weightKg) => {
    const pet = await register({ weightKg });
    expect(pet.weightKg).toBe(weightKg);
  });

  it('CP-07-15 rechaza una talla mayor al máximo (10000)', async () => {
    const error = await rejection(register({ heightCm: 10000 }));
    expect(describeError(error)).toEqual({ status: 400, message: 'El peso y la talla no pueden superar 9999.99' });
  });

  it('CP-07-16 genera el código automáticamente e ignora el código enviado', async () => {
    const first = await register();
    const second = await register({ code: 'PAC-999999' });
    expect(second.code).not.toBe('PAC-999999');
    expect(second.code).not.toBe(first.code);
    expect(ctx.petRepository.create.mock.calls[1][0]).not.toHaveProperty('code');
  });

  it('CP-07-17 rechaza una raza que no corresponde a la especie', async () => {
    const error = await rejection(register({ speciesId: IDS.felino }));
    expect(describeError(error)).toEqual({ status: 400, message: 'La raza no corresponde a la especie seleccionada' });
  });

  it('CP-07-18 rechaza una especie inactiva', async () => {
    const error = await rejection(register({ speciesId: IDS.huron }));
    expect(describeError(error)).toEqual({ status: 409, message: 'La especie seleccionada no está disponible' });
  });

  it('CP-07-20 acepta nombre de 100 y color de 50 caracteres (máximos)', async () => {
    const pet = await register({ name: 'N'.repeat(100), color: 'c'.repeat(50) });
    expect(pet.name).toHaveLength(100);
  });

  it('CP-07-20 rechaza nombre de 101 caracteres', async () => {
    const error = await rejection(register({ name: 'N'.repeat(101) }));
    expect(error.message).toBe('El nombre no puede exceder los 100 caracteres');
  });

  it('CP-07-20 rechaza color de 51 caracteres', async () => {
    const error = await rejection(register({ color: 'c'.repeat(51) }));
    expect(error.message).toBe('El color no puede exceder los 50 caracteres');
  });

  it('CP-07-01 rechaza sexo y estado reproductivo fuera del catálogo', async () => {
    expect((await rejection(register({ gender: 'OTRO' }))).message).toBe('El sexo debe ser Macho o Hembra');
    expect((await rejection(register({ reproductiveStatus: 'CASTRADO' }))).message)
      .toBe('El estado reproductivo debe ser Esterilizado, No esterilizado o Desconocido');
  });
});
