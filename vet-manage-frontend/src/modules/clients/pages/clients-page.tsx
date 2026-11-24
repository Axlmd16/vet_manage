import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/auth-context';
import { clientsApi } from '../services/clients-api';
import type { ClientListItem, ClientPage, ClientPet, ClientQuery, ClientStatus } from '../types';
import './clients-page.css';

const SEARCH_VALIDATION_MESSAGE = 'Ingrese al menos 2 caracteres para buscar por nombre o los 10 dígitos de la cédula';

const statusLabels: Record<ClientStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  DEACTIVATED: 'De baja',
};

const statusClasses: Record<ClientStatus, string> = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DEACTIVATED: 'deactivated',
};

function InactivateClientIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="17" y1="8" x2="22" y2="13" />
      <line x1="22" y1="8" x2="17" y2="13" />
    </svg>
  );
}

function emptyPage(page: number, pageSize: number): ClientPage {
  return { items: [], total: 0, page, pageSize, totalPages: 0 };
}

export function ClientsPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('clients:create');
  const canInactivate = hasPermission('clients:inactivate');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState<ClientQuery>({ page: 1, pageSize: 20 });
  const [result, setResult] = useState<ClientPage>(emptyPage(1, 20));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [pendingClient, setPendingClient] = useState<ClientListItem | null>(null);
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [petsByClient, setPetsByClient] = useState<Record<string, ClientPet[]>>({});
  const [petsLoading, setPetsLoading] = useState(false);
  const [petsError, setPetsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    clientsApi.list(query)
      .then((page) => {
        if (cancelled) return;
        setResult(page);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setResult(emptyPage(query.page ?? 1, query.pageSize ?? 20));
        setError(cause instanceof Error ? cause.message : 'No se pudo cargar la lista de clientes.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  useEffect(() => {
    if (!expandedClient) return;
    let cancelled = false;

    clientsApi.pets(expandedClient)
      .then((pets) => {
        if (!cancelled) setPetsByClient((current) => ({ ...current, [expandedClient]: pets }));
      })
      .catch((cause: unknown) => {
        if (!cancelled) setPetsError(cause instanceof Error ? cause.message : 'No se pudieron cargar las mascotas.');
      })
      .finally(() => {
        if (!cancelled) setPetsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [expandedClient]);

  const totalPages = Math.max(1, result.totalPages || Math.ceil(result.total / result.pageSize));

  function request(changes: Partial<ClientQuery>, resetPage: boolean) {
    setLoading(true);
    setError(null);
    setQuery((current) => ({
      ...current,
      ...changes,
      ...(resetPage ? { page: 1 } : {}),
    }));
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = search.trim();
    if (term.length > 0 && term.length < 2) {
      setValidationError(SEARCH_VALIDATION_MESSAGE);
      return;
    }
    setValidationError(null);
    request({ search: term || undefined }, true);
  }

  function clearSearch() {
    setSearch('');
    setValidationError(null);
    request({ search: undefined, status: undefined }, true);
  }

  function togglePets(clientId: string) {
    setPetsError(null);
    if (expandedClient === clientId) {
      setExpandedClient(null);
      return;
    }
    setPetsLoading(true);
    setExpandedClient(clientId);
  }

  async function confirmInactivation() {
    if (!pendingClient) return;
    const target = pendingClient;
    setSubmittingStatus(true);
    setFeedback(null);

    try {
      await clientsApi.inactivate(target.id);
      if (query.status) {
        const refreshed = await clientsApi.list(query);
        setResult(refreshed);
      } else {
        setResult((current) => ({
          ...current,
          items: current.items.map((item) => (item.id === target.id ? { ...item, status: 'INACTIVE' } : item)),
        }));
      }
      setFeedback({ kind: 'success', text: 'Cliente inactivado correctamente' });
      setPendingClient(null);
    } catch (cause: unknown) {
      setFeedback({
        kind: 'error',
        text: cause instanceof Error ? cause.message : 'No se pudo inactivar al cliente.',
      });
      setPendingClient(null);
    } finally {
      setSubmittingStatus(false);
    }
  }

  return (
    <section className="clients-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Administración</span>
          <h2>Clientes</h2>
          <p>Consulte los clientes registrados y sus mascotas vinculadas.</p>
        </div>
        {canCreate && (
          <Link className="button button--primary" to="/clients/new">Nuevo cliente</Link>
        )}
      </div>

      <form className="clients-filters" onSubmit={submitSearch}>
        <label className="field clients-filter clients-filter--search">
          <span>Buscar</span>
          <input
            aria-label="Buscar clientes"
            value={search}
            onChange={(event) => {
              const value = event.target.value;
              setSearch(value);
              setValidationError(null);
              if (value === '' && query.search) {
                request({ search: undefined }, true);
              }
            }}
            placeholder="Cédula, nombre o apellido"
          />
        </label>
        <label className="field clients-filter">
          <span>Estado</span>
          <select
            aria-label="Filtrar por estado"
            value={query.status ?? ''}
            onChange={(event) => request({ status: (event.target.value || undefined) as ClientStatus | undefined }, true)}
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
            <option value="DEACTIVATED">De baja</option>
          </select>
        </label>
        <div className="clients-filter-actions">
          <button className="button button--secondary clients-search-button" type="submit">Buscar</button>
          <button className="button button--ghost" type="button" onClick={clearSearch}>Limpiar búsqueda</button>
        </div>
      </form>

      {validationError && <div className="inline-notice inline-notice--error" role="alert">{validationError}</div>}

      {feedback && (
        <div
          className={`inline-notice inline-notice--${feedback.kind} clients-feedback`}
          role={feedback.kind === 'error' ? 'alert' : 'status'}
        >
          {feedback.text}
        </div>
      )}

      <div className="catalog-card">
        {loading ? (
          <div className="empty-state">Cargando clientes…</div>
        ) : error ? (
          <div className="inline-notice inline-notice--error" role="alert">{error}</div>
        ) : result.items.length === 0 ? (
          <div className="empty-state clients-empty-state">
            <strong>No se encontraron clientes registrados con el criterio ingresado</strong>
            {canCreate && (
              <Link className="button button--secondary" to="/clients/new">Registrar nuevo cliente</Link>
            )}
          </div>
        ) : (
          <div className="product-table-wrap">
            <table className="product-table clients-table" aria-label="Clientes">
              <thead>
                <tr>
                  <th>Cédula</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Estado</th>
                  <th>Mascotas</th>
                  {canInactivate && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {result.items.map((client) => (
                  <FragmentRow
                    key={client.id}
                    client={client}
                    canInactivate={canInactivate}
                    expanded={expandedClient === client.id}
                    pets={petsByClient[client.id]}
                    petsLoading={petsLoading && expandedClient === client.id}
                    petsError={petsError && expandedClient === client.id ? petsError : null}
                    onToggle={() => togglePets(client.id)}
                    onInactivate={() => {
                      setFeedback(null);
                      setPendingClient(client);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="clients-pagination">
        <span>{result.total} clientes</span>
        <div className="clients-pagination__controls">
          <button
            className="button button--ghost button--small"
            type="button"
            disabled={loading || result.page <= 1}
            onClick={() => request({ page: (query.page ?? 1) - 1 }, false)}
          >
            Anterior
          </button>
          <span>Página {result.page} de {totalPages}</span>
          <button
            className="button button--ghost button--small"
            type="button"
            disabled={loading || result.page >= totalPages}
            onClick={() => request({ page: (query.page ?? 1) + 1 }, false)}
          >
            Siguiente
          </button>
        </div>
      </div>

      {pendingClient && (
        <div
          className="clients-modal-backdrop"
          onClick={() => {
            if (!submittingStatus) setPendingClient(null);
          }}
        >
          <div
            className="clients-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-status-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="clients-modal__header">
              <div className="clients-modal__icon">
                <InactivateClientIcon />
              </div>
              <div className="clients-modal__title-wrap">
                <span className="clients-modal__eyebrow">Gestión de clientes</span>
                <h3 id="client-status-dialog-title">Inactivar cliente</h3>
              </div>
              <button
                className="clients-modal__close"
                type="button"
                aria-label="Cerrar"
                disabled={submittingStatus}
                onClick={() => setPendingClient(null)}
              >
                ×
              </button>
            </div>

            <div className="clients-modal__body">
              <div className="clients-modal__client-card">
                <div className="clients-modal__client-info">
                  <strong>{pendingClient.firstName} {pendingClient.lastName}</strong>
                  <span>{pendingClient.email}</span>
                </div>
                <div className="clients-modal__transition">
                  <span className="status-badge status-badge--active">Activo</span>
                  <span className="clients-modal__arrow" aria-hidden="true">→</span>
                  <span className="status-badge status-badge--inactive">Inactivo</span>
                </div>
              </div>

              <p className="clients-modal__description">
                El cliente no podrá ser seleccionado en nuevas transacciones mientras esté inactivo. Su información y los historiales clínicos de sus mascotas se conservarán intactos.
              </p>
            </div>

            <div className="clients-modal__actions">
              <button
                className="button button--ghost"
                type="button"
                disabled={submittingStatus}
                onClick={() => setPendingClient(null)}
              >
                Cancelar
              </button>
              <button
                className="button clients-modal__confirm"
                type="button"
                disabled={submittingStatus}
                onClick={() => void confirmInactivation()}
              >
                {submittingStatus ? 'Guardando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

type FragmentRowProps = {
  client: ClientListItem;
  canInactivate: boolean;
  expanded: boolean;
  pets: ClientPet[] | undefined;
  petsLoading: boolean;
  petsError: string | null;
  onToggle: () => void;
  onInactivate: () => void;
};

function FragmentRow({
  client,
  canInactivate,
  expanded,
  pets,
  petsLoading,
  petsError,
  onToggle,
  onInactivate,
}: FragmentRowProps) {
  return (
    <>
      <tr>
        <td><span className="code-pill">{client.identification}</span></td>
        <td><strong>{client.firstName} {client.lastName}</strong></td>
        <td>{client.email}</td>
        <td>
          <span className={`status-badge status-badge--${statusClasses[client.status]}`}>
            {statusLabels[client.status]}
          </span>
        </td>
        <td className="clients-pets-cell">
          <button
            className="button button--ghost button--small"
            type="button"
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Ocultar' : 'Ver'} mascotas de ${client.firstName} ${client.lastName}`}
            onClick={onToggle}
          >
            {expanded ? 'Ocultar mascotas' : 'Ver mascotas'}
          </button>
        </td>
        {canInactivate && (
          <td className="clients-actions-cell">
            {client.status === 'ACTIVE' && (
              <button
                className="clients-icon-btn clients-icon-btn--inactivate"
                type="button"
                aria-label="Inactivar"
                title="Inactivar"
                data-tooltip="Inactivar"
                onClick={onInactivate}
              >
                <InactivateClientIcon />
              </button>
            )}
          </td>
        )}
      </tr>
      {expanded && (
        <tr className="clients-pets-row">
          <td colSpan={canInactivate ? 6 : 5}>
            {petsLoading ? (
              <span>Cargando mascotas…</span>
            ) : petsError ? (
              <span className="inline-notice inline-notice--error" role="alert">{petsError}</span>
            ) : pets && pets.length > 0 ? (
              <ul className="clients-pets-list">
                {pets.map((pet) => (
                  <li key={pet.id}>
                    <strong>{pet.name}</strong>
                    <span>{pet.code}</span>
                    <span>{pet.species} · {pet.breed}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span>Sin mascotas vinculadas</span>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
