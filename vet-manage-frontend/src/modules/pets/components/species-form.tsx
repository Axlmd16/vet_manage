import { useState } from 'react';
import type { RegisterSpeciesDraft } from '../types';

interface SpeciesFormProps {
  onSubmit: (draft: RegisterSpeciesDraft) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SpeciesForm({ onSubmit, onCancel, isLoading = false }: SpeciesFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('El nombre de la especie es obligatorio');
      return;
    }

    setError(null);
    try {
      await onSubmit({
        name: trimmedName,
        description: description.trim() ? description.trim() : undefined,
      });
      setName('');
      setDescription('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error al registrar la especie');
    }
  };

  const handleReset = () => {
    setName('');
    setDescription('');
    setError(null);
    onCancel();
  };

  return (
    <form className="species-form" onSubmit={handleSubmit}>
      <label className="field" htmlFor="species-name">
        <span>Nombre de la especie <b>*</b></span>
        <input
          id="species-name"
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (error) setError(null);
          }}
          disabled={isLoading}
          placeholder="Ej. Canino, Felino, Bovino..."
          aria-invalid={Boolean(error)}
        />
        {error ? <small className="field-error">{error}</small> : <small>Así aparecerá en el catálogo de pacientes.</small>}
      </label>

      <label className="field" htmlFor="species-description">
        <span>Descripción <small>Opcional</small></span>
        <textarea
          id="species-description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isLoading}
          placeholder="Observaciones o características generales..."
        />
      </label>

      <div className="species-form__actions">
        <button type="button" className="button button--ghost" onClick={handleReset} disabled={isLoading}>
          Limpiar
        </button>
        <button type="submit" className="button button--primary" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar especie'}
        </button>
      </div>
    </form>
  );
}
