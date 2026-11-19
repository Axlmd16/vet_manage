import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module.js';
import { ClientsModule } from '../clients/clients.module.js';
import { IdentityModule } from '../identity/identity.module.js';
import { BreedController } from './routes/breed.controller.js';
import { PetsController } from './routes/pets.controller.js';
import { SpeciesController } from './routes/species.controller.js';
import { BreedRepository } from './repositories/breed.repository.js';
import { PetRepository } from './repositories/pet.repository.js';
import { SpeciesRepository } from './repositories/species.repository.js';
import { ListActiveBreedsService } from './services/breeds/list-active-breeds.service.js';
import { RegisterBreedService } from './services/breeds/register-breed.service.js';
import { RegisterPetService } from './services/pets/register-pet.service.js';
import { ListActiveSpeciesService } from './services/species/list-active-species.service.js';
import { RegisterSpeciesService } from './services/species/register-species.service.js';

@Module({
  imports: [PrismaModule, IdentityModule, ClientsModule],
  controllers: [SpeciesController, BreedController, PetsController],
  providers: [
    SpeciesRepository,
    BreedRepository,
    PetRepository,
    RegisterSpeciesService,
    ListActiveSpeciesService,
    RegisterBreedService,
    ListActiveBreedsService,
    RegisterPetService,
  ],
  exports: [SpeciesRepository, BreedRepository, RegisterSpeciesService, ListActiveSpeciesService, RegisterBreedService],
})
export class PetsModule {}
