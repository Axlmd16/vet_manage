import { useState } from 'react';
import { validateBreedDraft, type BreedFieldErrors } from '../schemas/breed';
import type { RegisterBreedDraft, SpeciesOption } from '../types';

interface BreedFormProps {
  species: SpeciesOption[];
  speciesLoading?: boolean;
  onSubmit: (draft: RegisterBreedDraft) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BreedForm({ species, speciesLoading = false, onSubmit, onCancel, isLoading = false }: BreedFormProps) {
  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<BreedFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const noSpecies = !speciesLoading && species.length === 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validateBreedDraft({ name, speciesId, description });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    try {
      await onSubmit(validation.value);
      setName('');
      setSpeciesId('');
      setDescription('');
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : 'Error al registrar la raza');
    }
  };

  const handleCancel = () => {
    setName('');
    setSpeciesId('');
    setDescription('');
    setErrors({});
    setSubmitError(null);
    onCancel();
  };

  return (
    <form className="species-form" onSubmit={handleSubmit}>
      <label className="field" htmlFor="breed-name">
        <span>Nombre de la raza <b>*</b></span>
        <input
          id="breed-name"
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setErrors((current) => ({ ...current, name: undefined }));
          }}
          disabled={isLoading}
          placeholder="Ej. Labrador, Siamés, Holstein..."
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? <small className="field-error">{errors.name}</small> : <small>Así aparecerá en el catálogo de pacientes.</small>}
      </label>

      <label className="field" htmlFor="breed-species">
        <span>Especie <b>*</b></span>
        <select
          id="breed-species"
          value={speciesId}
          onChange={(event) => {
            setSpeciesId(event.target.value);
            setErrors((current) => ({ ...current, speciesId: undefined }));
          }}
          disabled={isLoading || speciesLoading || noSpecies}
          aria-invalid={Boolean(errors.speciesId)}
        >
          <option value="">{speciesLoading ? 'Cargando especies...' : 'Selecciona una especie'}</option>
          {species.map((option) => (
            <option key={option.id} value={option.id}>{option.name}</option>
          ))}
        </select>
        {errors.speciesId && <small className="field-error">{errors.speciesId}</small>}
        {noSpecies && (
          <small className="field-error" role="alert">
            No hay especies activas. Registra o activa una especie antes de crear una raza.
          </small>
        )}
      </label>

      <label className="field" htmlFor="breed-description">
        <span>Descripción <small>Opcional</small></span>
        <textarea
          id="breed-description"
          rows={4}
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setErrors((current) => ({ ...current, description: undefined }));
          }}
          disabled={isLoading}
          placeholder="Observaciones o características de la raza..."
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description && <small className="field-error">{errors.description}</small>}
      </label>

      {submitError && <small className="field-error" role="alert">{submitError}</small>}

      <div className="species-form__actions">
        <button type="button" className="button button--ghost" onClick={handleCancel} disabled={isLoading}>
          Cancelar
        </button>
        <button type="submit" className="button button--primary" disabled={isLoading || speciesLoading || noSpecies}>
          {isLoading ? 'Guardando...' : 'Guardar raza'}
        </button>
      </div>
    </form>
  );
}
