import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module.js';
import { IdentityModule } from '../identity/identity.module.js';
import { SpeciesController } from './routes/species.controller.js';
import { SpeciesRepository } from './repositories/species.repository.js';
import { RegisterSpeciesService } from './services/species/register-species.service.js';

@Module({
  imports: [PrismaModule, IdentityModule],
  controllers: [SpeciesController],
  providers: [SpeciesRepository, RegisterSpeciesService],
  exports: [SpeciesRepository, RegisterSpeciesService],
})
export class PetsModule {}
