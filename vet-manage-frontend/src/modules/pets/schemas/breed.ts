import type { RegisterBreedDraft } from '../types';

type BreedFormInput = {
  name: string;
  speciesId: string;
  description: string;
};

export type BreedFieldErrors = { name?: string; speciesId?: string };

type BreedValidation =
  | { valid: true; value: RegisterBreedDraft; errors: null }
  | { valid: false; value: null; errors: BreedFieldErrors };

export function validateBreedDraft(input: BreedFormInput): BreedValidation {
  const name = input.name.trim();
  const errors: BreedFieldErrors = {};

  if (!name) errors.name = 'El nombre de la raza es obligatorio';
  if (!input.speciesId) errors.speciesId = 'Debes asociar la raza a una especie';

  if (errors.name || errors.speciesId) {
    return { valid: false, value: null, errors };
  }

  return {
    valid: true,
    value: {
      name,
      speciesId: input.speciesId,
      description: input.description.trim() || undefined,
    },
    errors: null,
  };
}
