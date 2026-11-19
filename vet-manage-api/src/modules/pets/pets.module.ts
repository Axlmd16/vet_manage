import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module.js';
import { IdentityModule } from '../identity/identity.module.js';
import { BreedController } from './routes/breed.controller.js';
import { SpeciesController } from './routes/species.controller.js';
import { BreedRepository } from './repositories/breed.repository.js';
import { SpeciesRepository } from './repositories/species.repository.js';
import { RegisterBreedService } from './services/breeds/register-breed.service.js';
import { ListActiveSpeciesService } from './services/species/list-active-species.service.js';
import { RegisterSpeciesService } from './services/species/register-species.service.js';

@Module({
  imports: [PrismaModule, IdentityModule],
  controllers: [SpeciesController, BreedController],
  providers: [SpeciesRepository, BreedRepository, RegisterSpeciesService, ListActiveSpeciesService, RegisterBreedService],
  exports: [SpeciesRepository, BreedRepository, RegisterSpeciesService, ListActiveSpeciesService, RegisterBreedService],
})
export class PetsModule {}
