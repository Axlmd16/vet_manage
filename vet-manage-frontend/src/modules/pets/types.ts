export interface Species {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterSpeciesDraft {
  name: string;
  description?: string;
}

export interface SpeciesOption {
  id: string;
  name: string;
}

export interface Breed {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  speciesId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterBreedDraft {
  name: string;
  speciesId: string;
  description?: string;
}
