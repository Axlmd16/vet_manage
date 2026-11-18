import { postJson } from '../../../infrastructure/api/http-client';
import type { Breed, RegisterBreedDraft } from '../types';

export const breedApi = {
  registerBreed(draft: RegisterBreedDraft) {
    return postJson<Breed, RegisterBreedDraft>('/pets/breeds', draft);
  },
};
