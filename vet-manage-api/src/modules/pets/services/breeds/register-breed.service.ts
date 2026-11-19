import { Injectable } from '@nestjs/common';
import { ApiException } from '../../../../common/errors/api-exception.js';
import { BreedRepository } from '../../repositories/breed.repository.js';
import { SpeciesRepository } from '../../repositories/species.repository.js';
import { RegisterBreedDto } from '../../dtos/breeds/register-breed.dto.js';
import type { Breed } from '../../../../generated/prisma/client.js';

// P2002 es el código de Prisma para violación de unicidad
const isUniqueViolation = (error: unknown) =>
  typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002';

@Injectable()
export class RegisterBreedService {
  constructor(
    private readonly breedRepository: BreedRepository,
    private readonly speciesRepository: SpeciesRepository,
  ) {}

  async execute(dto: RegisterBreedDto): Promise<Breed> {
    // Normaliza el nombre antes de validar
    const name = dto.name?.trim();
    if (!name) {
      throw ApiException.badRequest('El nombre de la raza es obligatorio');
    }

    // La especie debe existir y estar activa
    const species = await this.speciesRepository.findById(dto.speciesId);
    if (!species) {
      throw ApiException.notFound('La especie seleccionada no existe');
    }
    if (!species.isActive) {
      throw ApiException.conflict('La especie seleccionada está inactiva');
    }

    // Evita razas repetidas dentro de la misma especie
    const duplicateMessage = `Ya existe una raza "${name}" para la especie ${species.name}`;
    if (await this.breedRepository.findByNameInSpecies(species.id, name)) {
      throw ApiException.conflict(duplicateMessage);
    }

    // Cubre la condición de carrera si otro registro se crea entre la consulta y el insert
    try {
      return await this.breedRepository.create({ name, speciesId: species.id, description: dto.description });
    } catch (error) {
      if (isUniqueViolation(error)) throw ApiException.conflict(duplicateMessage);
      throw error;
    }
  }
}
