import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import type { Breed } from '../../../generated/prisma/client.js';

@Injectable()
export class BreedRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByNameInSpecies(speciesId: string, name: string): Promise<Breed | null> {
    return this.prisma.breed.findFirst({
      where: { speciesId, name: { equals: name.trim(), mode: 'insensitive' } },
    });
  }

  async create(data: { name: string; speciesId: string; description?: string | null }): Promise<Breed> {
    return this.prisma.breed.create({
      data: {
        name: data.name.trim(),
        speciesId: data.speciesId,
        description: data.description?.trim() || null,
        isActive: true,
      },
    });
  }
}
