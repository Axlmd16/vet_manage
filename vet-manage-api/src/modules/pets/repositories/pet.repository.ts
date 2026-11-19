import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import type { PetSex, ReproductiveStatus } from '../../../generated/prisma/client.js';

export type NewPet = {
  name: string;
  sex: PetSex;
  birthDate: Date;
  weightKg: number;
  heightCm: number;
  reproductiveStatus: ReproductiveStatus;
  color: string | null;
  clientId: string;
  speciesId: string;
  breedId: string;
};

const petWithCatalog = {
  species: { select: { id: true, name: true } },
  breed: { select: { id: true, name: true } },
} as const;

@Injectable()
export class PetRepository {
  constructor(private readonly prisma: PrismaService) {}

  // El código (PAC-NNNNNN) y el estado ACTIVE los asigna la base de datos.
  create(data: NewPet) {
    return this.prisma.patient.create({ data, include: petWithCatalog });
  }
}

export type CreatedPet = Awaited<ReturnType<PetRepository['create']>>;
