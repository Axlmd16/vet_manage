import { Injectable } from '@nestjs/common';
import { ApiException } from '../../../../common/errors/api-exception.js';
import { SpeciesRepository } from '../../repositories/species.repository.js';
import { RegisterSpeciesDto } from '../../dtos/species/register-species.dto.js';
import type { Species } from '../../../../generated/prisma/client.js';

@Injectable()
export class RegisterSpeciesService {
  constructor(private readonly speciesRepository: SpeciesRepository) {}

  async execute(dto: RegisterSpeciesDto): Promise<Species> {
    const trimmedName = dto.name?.trim();

    if (!trimmedName) {
      throw ApiException.badRequest('El nombre de la especie es obligatorio');
    }

    const existing = await this.speciesRepository.findByName(trimmedName);
    if (existing) {
      throw ApiException.conflict(`Ya existe una especie registrada con el nombre "${trimmedName}"`);
    }

    return this.speciesRepository.create({
      name: trimmedName,
      description: dto.description,
    });
  }
}
