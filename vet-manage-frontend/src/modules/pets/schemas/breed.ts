import type { RegisterBreedDraft } from '../types';

type BreedFormInput = {
  name: string;
  speciesId: string;
  description: string;
};

export const BREED_DESCRIPTION_MAX = 500;

export type BreedFieldErrors = { name?: string; speciesId?: string; description?: string };

type BreedValidation =
  | { valid: true; value: RegisterBreedDraft; errors: null }
  | { valid: false; value: null; errors: BreedFieldErrors };

// Valida el formulario y devuelve el borrador limpio o los errores por campo
export function validateBreedDraft(input: BreedFormInput): BreedValidation {
  const name = input.name.trim();
  const errors: BreedFieldErrors = {};

  if (!name) errors.name = 'El nombre de la raza es obligatorio';
  if (!input.speciesId) errors.speciesId = 'Debes asociar la raza a una especie';

  if (input.description.trim().length > BREED_DESCRIPTION_MAX) {
    errors.description = `La descripción no puede exceder los ${BREED_DESCRIPTION_MAX} caracteres`;
  }

  if (errors.name || errors.speciesId || errors.description) {
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
