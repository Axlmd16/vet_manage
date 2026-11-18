import type { RegisterSpeciesDraft } from '../types';

type SpeciesFormInput = {
  name: string;
  description: string;
};

type SpeciesValidation =
  | { valid: true; value: RegisterSpeciesDraft; error: null }
  | { valid: false; value: null; error: string };

export function validateSpeciesDraft(input: SpeciesFormInput): SpeciesValidation {
  const name = input.name.trim();

  if (!name) {
    return {
      valid: false,
      value: null,
      error: 'El nombre de la especie es obligatorio',
    };
  }

  return {
    valid: true,
    value: {
      name,
      description: input.description.trim() || undefined,
    },
    error: null,
  };
}
