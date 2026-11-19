import { Link } from 'react-router-dom';
import { UsersIcon } from '../../../common/components/icons';
import { useAuth } from '../../auth/auth-context';
import './clients-page.css';

export function ClientsPage() {
  const { hasPermission } = useAuth();

  return (
    <section className="clients-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Administración</span>
          <h2>Clientes</h2>
          <p>Gestione los clientes de la clínica y su información de contacto.</p>
        </div>
        {hasPermission('clients:create') && (
          <Link className="button button--primary" to="/clients/new">Nuevo cliente</Link>
        )}
      </div>

      <div className="clients-list-placeholder">
        <span className="clients-list-placeholder__icon"><UsersIcon size={24} /></span>
        <strong>El listado de clientes estará disponible próximamente</strong>
        <span>Desde aquí se podrán consultar los clientes registrados.</span>
      </div>
    </section>
  );
}
