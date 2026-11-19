import { getJson, postJson } from '../../../infrastructure/api/http-client';
import type { Species, RegisterSpeciesDraft, SpeciesOption } from '../types';

export const speciesApi = {
  registerSpecies(draft: RegisterSpeciesDraft) {
    return postJson<Species, RegisterSpeciesDraft>('/pets/species', draft);
  },
  listActiveSpecies() {
    return getJson<SpeciesOption[]>('/pets/species/active');
  },
};
