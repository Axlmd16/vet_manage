import { Injectable } from '@nestjs/common';
import { SpeciesRepository } from '../../repositories/species.repository.js';

@Injectable()
export class ListActiveSpeciesService {
  constructor(private readonly speciesRepository: SpeciesRepository) {}

  execute() {
    return this.speciesRepository.findActive();
  }
}
