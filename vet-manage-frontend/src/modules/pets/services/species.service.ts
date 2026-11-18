import { getJson, postJson } from '../../../infrastructure/api/http-client';
import type { Species, RegisterSpeciesDraft } from '../types';

export const speciesApi = {
  listSpecies() {
    return getJson<Species[]>('/pets/species');
  },
  registerSpecies(draft: RegisterSpeciesDraft) {
    return postJson<Species, RegisterSpeciesDraft>('/pets/species', draft);
  },
};
