import { useState } from 'react';

type Props = {
  label: string;
  onCreate: (name: string) => Promise<void>;
  onCancel: () => void;
};

export function CatalogInlineCreate({ label, onCreate, onCancel }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (name.trim().length < 2) {
      setError(`Escribe un nombre de ${label.toLowerCase()} válido.`);
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onCreate(name.trim());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `No se pudo crear la ${label.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="inline-create" role="dialog" aria-label={`Crear ${label.toLowerCase()}`}>
      <label htmlFor="inline-catalog-name">Nueva {label.toLowerCase()}</label>
      <div className="inline-create__row">
        <input id="inline-catalog-name" autoFocus value={name} onChange={(event) => setName(event.target.value)} />
        <button type="button" className="button button--primary button--small" disabled={saving} onClick={submit}>
          {saving ? 'Guardando…' : 'Crear'}
        </button>
        <button type="button" className="button button--ghost button--small" onClick={onCancel}>Cancelar</button>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
