import { useEffect, useState } from 'react';
import { speciesApi } from '../services/species.service';
import { SpeciesForm } from '../components/species-form';
import type { Species, RegisterSpeciesDraft } from '../types';

export function SpeciesPage() {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let isMounted = true;
    speciesApi
      .listSpecies()
      .then((data) => {
        if (isMounted) setSpeciesList(data);
      })
      .catch((cause) => {
        if (isMounted) setLoadError(cause instanceof Error ? cause.message : 'No se pudieron cargar las especies');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRegister = async (draft: RegisterSpeciesDraft) => {
    setLoading(true);
    try {
      const newSpecies = await speciesApi.registerSpecies(draft);
      setSpeciesList((prev) => [...prev, newSpecies].sort((a, b) => a.name.localeCompare(b.name)));
      setNotification({ message: 'Especie registrada exitosamente', type: 'success' });
      setTimeout(() => setNotification(null), 4000);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Error al registrar especie';
      setNotification({ message, type: 'error' });
      throw cause;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="species-layout">
      <section className="catalog-card species-form-card">
        <div className="species-form-card__heading">
          <span className="eyebrow">Nuevo registro</span>
          <h3>Registrar especie</h3>
          <p>Completa los datos para agregarla al catálogo.</p>
        </div>
        <SpeciesForm onSubmit={handleRegister} onCancel={() => setNotification(null)} isLoading={loading} />
      </section>

      <section className="catalog-card species-list-card">
        <div className="catalog-card__heading">
          <div>
            <h3>Especies registradas</h3>
            <p>Especies disponibles para clasificar a los pacientes.</p>
          </div>
          <span className="count-pill">{speciesList.length}</span>
        </div>

        {notification && (
          <div className={`inline-notice inline-notice--${notification.type}`}>{notification.message}</div>
        )}

        {loadError ? (
          <div className="empty-state">
            <strong>No se pudo cargar el catálogo</strong>
            <span>{loadError}</span>
          </div>
        ) : speciesList.length === 0 ? (
          <div className="empty-state">
            <strong>Aún no hay especies registradas</strong>
            <span>Usa el formulario para agregar la primera especie.</span>
          </div>
        ) : (
          <div className="product-table-wrap">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {speciesList.map((species) => (
                  <tr key={species.id}>
                    <td>
                      <strong>{species.name}</strong>
                    </td>
                    <td>{species.description || '—'}</td>
                    <td>
                      <span className={`status-badge ${species.isActive ? 'status-badge--active' : 'status-badge--inactive'}`}>
                        {species.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
