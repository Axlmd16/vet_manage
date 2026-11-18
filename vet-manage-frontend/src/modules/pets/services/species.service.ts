import { postJson } from '../../../infrastructure/api/http-client';
import type { Species, RegisterSpeciesDraft } from '../types';

export const speciesApi = {
  registerSpecies(draft: RegisterSpeciesDraft) {
    return postJson<Species, RegisterSpeciesDraft>('/pets/species', draft);
  },
};
