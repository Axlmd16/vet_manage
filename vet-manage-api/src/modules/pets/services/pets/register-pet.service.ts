import { Injectable } from '@nestjs/common';
import { ApiException } from '../../../../common/errors/api-exception.js';
import { ClientsService } from '../../../clients/services/clients.service.js';
import type { RegisterPetDto } from '../../dtos/pets/register-pet.dto.js';
import { BreedRepository } from '../../repositories/breed.repository.js';
import { PetRepository, type CreatedPet, type NewPet } from '../../repositories/pet.repository.js';
import { SpeciesRepository } from '../../repositories/species.repository.js';
import { formatBirthDate, parseBirthDate } from './birth-date.js';

export const PET_MESSAGES = {
  registered: 'Paciente registrado exitosamente',
  missing: 'Por favor, complete todos los campos obligatorios',
  clientRequired: 'Debe seleccionar un cliente registrado',
  clientUnavailable: 'El cliente seleccionado no está disponible',
  invalidBirthDate: 'Fecha de nacimiento inválida',
  invalidMeasures: 'El peso y la talla deben ser valores numéricos mayores que cero',
  invalidSex: 'El sexo debe ser Macho o Hembra',
  invalidReproductiveStatus: 'El estado reproductivo debe ser Esterilizado, No esterilizado o Desconocido',
  nameTooLong: 'El nombre no puede exceder los 100 caracteres',
  colorTooLong: 'El color no puede exceder los 50 caracteres',
  measureTooLarge: 'El peso y la talla no pueden superar 9999.99',
  invalidId: 'Identificador inválido',
  speciesNotFound: 'La especie seleccionada no existe',
  speciesInactive: 'La especie seleccionada no está disponible',
  breedNotFound: 'La raza seleccionada no existe',
  breedInactive: 'La raza seleccionada no está disponible',
  breedMismatch: 'La raza no corresponde a la especie seleccionada',
} as const;

const SEXES: readonly string[] = ['MALE', 'FEMALE'];
const REPRODUCTIVE_STATUSES: readonly string[] = ['STERILIZED', 'NOT_STERILIZED', 'UNKNOWN'];
const REQUIRED = ['name', 'speciesId', 'breedId', 'sex', 'birthDate', 'weightKg', 'heightCm', 'reproductiveStatus'] as const;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MEASURE_MAX = 9999.99;

const isBlank = (value: unknown) =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : String(value));

// Acepta números o textos numéricos ("12.5"); cualquier otra cosa es NaN.
const toNumber = (value: unknown) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && /^\s*-?\d+(\.\d+)?\s*$/.test(value)) return Number(value);
  return Number.NaN;
};

const fail = (message: string, status: number, fields: string[], code: string) =>
  new ApiException(message, status, fields, code);

const fieldsWhere = (checks: [string, boolean][]) => checks.filter(([, invalid]) => invalid).map(([field]) => field);

export type RegisteredPet = {
  id: string;
  code: string;
  name: string;
  sex: string;
  birthDate: string;
  weightKg: number;
  heightCm: number;
  reproductiveStatus: string;
  color: string | null;
  status: string;
  clientId: string;
  species: { id: string; name: string };
  breed: { id: string; name: string };
  createdAt: string;
};

@Injectable()
export class RegisterPetService {
  constructor(
    private readonly petRepository: PetRepository,
    private readonly speciesRepository: SpeciesRepository,
    private readonly breedRepository: BreedRepository,
    private readonly clientsService: ClientsService,
  ) {}

  async execute(dto: RegisterPetDto): Promise<RegisteredPet> {
    const data = this.validate(dto);

    // El dueño se valida con el servicio de clientes, no con su tabla.
    const client = await this.clientsService.findById(data.clientId);
    if (!client) throw fail(PET_MESSAGES.clientRequired, 404, ['clientId'], 'PET_CLIENT_NOT_FOUND');
    if (client.status !== 'ACTIVE') throw fail(PET_MESSAGES.clientUnavailable, 409, ['clientId'], 'PET_CLIENT_UNAVAILABLE');

    const species = await this.speciesRepository.findById(data.speciesId);
    if (!species) throw fail(PET_MESSAGES.speciesNotFound, 404, ['speciesId'], 'PET_SPECIES_NOT_FOUND');
    if (!species.isActive) throw fail(PET_MESSAGES.speciesInactive, 409, ['speciesId'], 'PET_SPECIES_INACTIVE');

    const breed = await this.breedRepository.findById(data.breedId);
    if (!breed) throw fail(PET_MESSAGES.breedNotFound, 404, ['breedId'], 'PET_BREED_NOT_FOUND');
    if (breed.speciesId !== species.id) throw fail(PET_MESSAGES.breedMismatch, 400, ['breedId'], 'PET_BREED_MISMATCH');
    if (!breed.isActive) throw fail(PET_MESSAGES.breedInactive, 409, ['breedId'], 'PET_BREED_INACTIVE');

    return this.toResponse(await this.petRepository.create(data));
  }

  // Valida en el orden de los criterios de aceptación; dto.code se ignora a propósito.
  private validate(dto: RegisterPetDto): NewPet {
    if (isBlank(dto.clientId)) throw fail(PET_MESSAGES.clientRequired, 400, ['clientId'], 'PET_CLIENT_REQUIRED');

    const missing = REQUIRED.filter((field) => isBlank(dto[field]));
    if (missing.length > 0) throw fail(PET_MESSAGES.missing, 400, [...missing], 'PET_MISSING_FIELDS');

    const invalidIds = (['clientId', 'speciesId', 'breedId'] as const).filter((field) => !UUID_PATTERN.test(text(dto[field])));
    if (invalidIds.length > 0) throw fail(PET_MESSAGES.invalidId, 400, invalidIds, 'PET_INVALID_ID');

    const name = text(dto.name);
    if (name.length > 100) throw fail(PET_MESSAGES.nameTooLong, 400, ['name'], 'PET_INVALID_NAME');

    const sex = text(dto.sex);
    if (!SEXES.includes(sex)) throw fail(PET_MESSAGES.invalidSex, 400, ['sex'], 'PET_INVALID_SEX');

    const reproductiveStatus = text(dto.reproductiveStatus);
    if (!REPRODUCTIVE_STATUSES.includes(reproductiveStatus)) {
      throw fail(PET_MESSAGES.invalidReproductiveStatus, 400, ['reproductiveStatus'], 'PET_INVALID_REPRODUCTIVE_STATUS');
    }

    const birthDate = parseBirthDate(dto.birthDate);
    if (!birthDate) throw fail(PET_MESSAGES.invalidBirthDate, 400, ['birthDate'], 'PET_INVALID_BIRTH_DATE');

    const weightKg = toNumber(dto.weightKg);
    const heightCm = toNumber(dto.heightCm);
    // !(x > 0) también atrapa NaN.
    const invalidMeasures = fieldsWhere([['weightKg', !(weightKg > 0)], ['heightCm', !(heightCm > 0)]]);
    if (invalidMeasures.length > 0) throw fail(PET_MESSAGES.invalidMeasures, 400, invalidMeasures, 'PET_INVALID_MEASURES');

    const tooLarge = fieldsWhere([['weightKg', weightKg > MEASURE_MAX], ['heightCm', heightCm > MEASURE_MAX]]);
    if (tooLarge.length > 0) throw fail(PET_MESSAGES.measureTooLarge, 400, tooLarge, 'PET_INVALID_MEASURES');

    const color = isBlank(dto.color) ? null : text(dto.color);
    if (color && color.length > 50) throw fail(PET_MESSAGES.colorTooLong, 400, ['color'], 'PET_INVALID_COLOR');

    return {
      name,
      sex: sex as NewPet['sex'],
      birthDate,
      weightKg: Math.round(weightKg * 100) / 100,
      heightCm: Math.round(heightCm * 100) / 100,
      reproductiveStatus: reproductiveStatus as NewPet['reproductiveStatus'],
      color,
      clientId: text(dto.clientId),
      speciesId: text(dto.speciesId),
      breedId: text(dto.breedId),
    };
  }

  private toResponse(pet: CreatedPet): RegisteredPet {
    return {
      id: pet.id,
      code: pet.code,
      name: pet.name,
      sex: pet.sex,
      birthDate: formatBirthDate(pet.birthDate),
      weightKg: Number(pet.weightKg),
      heightCm: Number(pet.heightCm),
      reproductiveStatus: pet.reproductiveStatus,
      color: pet.color,
      status: pet.status,
      clientId: pet.clientId,
      species: pet.species,
      breed: pet.breed,
      createdAt: pet.createdAt.toISOString(),
    };
  }
}
