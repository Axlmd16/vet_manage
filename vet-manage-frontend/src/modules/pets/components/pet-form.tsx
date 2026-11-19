import { useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  CalendarIcon, GenderIcon, HeartIcon, PaletteIcon, PawIcon, RulerIcon, ScaleIcon, TagIcon, UserIcon,
} from '../../../common/components/icons';
import { ApiError } from '../../../infrastructure/api/http-client';
import { emptyPetForm, maskBirthDate, validatePetDraft } from '../schemas/pet';
import type { PetField, PetFieldErrors, PetFormInput } from '../schemas/pet';
import { PET_SEX_LABELS, REPRODUCTIVE_STATUS_LABELS } from '../types';
import type { ClientOption, RegisterPetDraft, SpeciesOption } from '../types';
import { ClientPicker } from './client-picker';

interface PetFormProps {
  species: SpeciesOption[];
  speciesLoading?: boolean;
  loadBreeds: (speciesId: string) => Promise<SpeciesOption[]>;
  searchClients: (term: string) => Promise<ClientOption[]>;
  onSubmit: (draft: RegisterPetDraft) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const FIELDS = new Set<string>(Object.keys(emptyPetForm));

export function PetForm({
  species, speciesLoading = false, loadBreeds, searchClients, onSubmit, onCancel, isLoading = false,
}: PetFormProps) {
  const [form, setForm] = useState<PetFormInput>(emptyPetForm);
  const [client, setClient] = useState<ClientOption | null>(null);
  const [breeds, setBreeds] = useState<SpeciesOption[]>([]);
  const [breedsLoading, setBreedsLoading] = useState(false);
  const [errors, setErrors] = useState<PetFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Especie de la última carga de razas, para ignorar respuestas que lleguen tarde.
  const latestSpecies = useRef('');

  const update = (field: PetField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  // Al cambiar la especie se limpia la raza y se cargan las razas activas de la nueva especie.
  const changeSpecies = (speciesId: string) => {
    update('speciesId', speciesId);
    setForm((current) => ({ ...current, breedId: '' }));
    setBreeds([]);
    latestSpecies.current = speciesId;
    if (!speciesId) return;

    setBreedsLoading(true);
    loadBreeds(speciesId)
      .then((found) => { if (latestSpecies.current === speciesId) setBreeds(found); })
      .catch(() => { if (latestSpecies.current === speciesId) setBreeds([]); })
      .finally(() => { if (latestSpecies.current === speciesId) setBreedsLoading(false); });
  };

  const selectClient = (selected: ClientOption | null) => {
    setClient(selected);
    update('clientId', selected?.id ?? '');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validation = validatePetDraft(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      setFormError(validation.message);
      return;
    }

    setErrors({});
    setFormError(null);
    try {
      await onSubmit(validation.value);
    } catch (cause) {
      // El backend devuelve en `errors` los campos que hay que resaltar.
      const message = cause instanceof Error ? cause.message : 'Error al registrar el paciente';
      if (cause instanceof ApiError) {
        const fieldErrors: PetFieldErrors = {};
        for (const field of cause.errors) if (FIELDS.has(field)) fieldErrors[field as PetField] = message;
        setErrors(fieldErrors);
      }
      setFormError(message);
    }
  };

  const noSpecies = !speciesLoading && species.length === 0;
  const busy = isLoading;

  return (
    <form className="pet-form" onSubmit={handleSubmit} noValidate>
      <section className="pet-form__section">
        {/* Tres columnas iguales: identificación, datos biológicos y medidas. */}
        <div className="pet-form__grid">
          <Field id="pet-name" label="Nombre" required error={errors.name} icon={<PawIcon size={16} />}>
            <input id="pet-name" value={form.name} maxLength={100} placeholder="Ej. Firulais" disabled={busy}
              aria-invalid={Boolean(errors.name)} onChange={(event) => update('name', event.target.value)} />
          </Field>

          <Field id="pet-species" label="Especie" required error={errors.speciesId} icon={<PawIcon size={16} />}
            hint={noSpecies ? 'No hay especies activas registradas' : undefined}>
            <select id="pet-species" value={form.speciesId} disabled={busy || speciesLoading || noSpecies}
              aria-invalid={Boolean(errors.speciesId)} onChange={(event) => changeSpecies(event.target.value)}>
              <option value="">{speciesLoading ? 'Cargando especies...' : 'Selecciona una especie'}</option>
              {species.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
            </select>
          </Field>

          <Field id="pet-breed" label="Raza" required error={errors.breedId} icon={<TagIcon size={16} />}
            hint={form.speciesId && !breedsLoading && breeds.length === 0 ? 'La especie no tiene razas activas' : undefined}>
            <select id="pet-breed" value={form.breedId} disabled={busy || !form.speciesId || breedsLoading}
              aria-invalid={Boolean(errors.breedId)} onChange={(event) => update('breedId', event.target.value)}>
              <option value="">
                {!form.speciesId ? 'Primero elige la especie' : breedsLoading ? 'Cargando razas...' : 'Selecciona una raza'}
              </option>
              {breeds.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
            </select>
          </Field>

          <Field id="pet-sex" label="Sexo" required error={errors.sex} icon={<GenderIcon size={16} />}>
            <select id="pet-sex" value={form.sex} disabled={busy} aria-invalid={Boolean(errors.sex)}
              onChange={(event) => update('sex', event.target.value)}>
              <option value="">Selecciona el sexo</option>
              {Object.entries(PET_SEX_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </Field>

          <Field id="pet-birth-date" label="Fecha de nacimiento" required error={errors.birthDate}
            icon={<CalendarIcon size={16} />}>
            <input id="pet-birth-date" value={form.birthDate} inputMode="numeric" placeholder="DD-MM-YYYY" maxLength={10}
              disabled={busy} aria-invalid={Boolean(errors.birthDate)}
              onChange={(event) => update('birthDate', maskBirthDate(event.target.value))} />
          </Field>

          <Field id="pet-reproductive-status" label="Estado reproductivo" required error={errors.reproductiveStatus}
            icon={<HeartIcon size={16} />}>
            <select id="pet-reproductive-status" value={form.reproductiveStatus} disabled={busy}
              aria-invalid={Boolean(errors.reproductiveStatus)}
              onChange={(event) => update('reproductiveStatus', event.target.value)}>
              <option value="">Selecciona el estado</option>
              {Object.entries(REPRODUCTIVE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>

          <Field id="pet-weight" label="Peso (kg)" required error={errors.weightKg} icon={<ScaleIcon size={16} />}>
            <input id="pet-weight" value={form.weightKg} inputMode="decimal" placeholder="Ej. 12.5" disabled={busy}
              aria-invalid={Boolean(errors.weightKg)} onChange={(event) => update('weightKg', event.target.value)} />
          </Field>

          <Field id="pet-height" label="Talla (cm)" required error={errors.heightCm} icon={<RulerIcon size={16} />}>
            <input id="pet-height" value={form.heightCm} inputMode="decimal" placeholder="Ej. 45" disabled={busy}
              aria-invalid={Boolean(errors.heightCm)} onChange={(event) => update('heightCm', event.target.value)} />
          </Field>

          <Field id="pet-color" label="Color" optional error={errors.color} icon={<PaletteIcon size={16} />}>
            <input id="pet-color" value={form.color} maxLength={50} placeholder="Ej. Café con blanco" disabled={busy}
              onChange={(event) => update('color', event.target.value)} />
          </Field>
        </div>
      </section>

      <section className="pet-form__section">
        <header className="pet-form__heading">
          <span className="pet-form__heading-icon"><UserIcon size={16} /></span>
          <div>
            <h4>Dueño</h4>
            <p>Solo se muestran clientes activos.</p>
          </div>
        </header>
        <ClientPicker value={client} onChange={selectClient} search={searchClients} error={errors.clientId} disabled={busy} />
      </section>

      {formError && <p className="field-error pet-form__error" role="alert">{formError}</p>}

      <div className="pet-form__actions">
        <button type="button" className="button button--ghost" onClick={onCancel} disabled={busy}>Cancelar</button>
        <button type="submit" className="button button--primary" disabled={busy || speciesLoading}>
          {busy ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

function Field({ id, label, required, optional, hint, error, icon, children }: {
  id: string; label: string; required?: boolean; optional?: boolean; hint?: string; error?: string; icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="field pet-field">
      <label htmlFor={id}>
        {label}{required && <b> *</b>}{optional && <small className="pet-field__optional"> (opcional)</small>}
      </label>
      <div className="pet-field__control">
        {icon}
        {children}
      </div>
      {hint && !error && <small>{hint}</small>}
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}
