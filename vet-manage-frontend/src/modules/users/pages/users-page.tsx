import { Link } from 'react-router-dom';
import { IdCardIcon } from '../../../common/components/icons';
import { useAuth } from '../../auth/auth-context';
import './users-page.css';

export function UsersPage() {
  const { hasPermission } = useAuth();

  return (
    <section className="users-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Administración</span>
          <h2>Usuarios</h2>
          <p>Gestione las cuentas del personal de la clínica y sus roles.</p>
        </div>
        {hasPermission('users:create') && (
          <Link className="button button--primary" to="/users/new">Nuevo usuario</Link>
        )}
      </div>

      <div className="users-list-placeholder">
        <span className="users-list-placeholder__icon"><IdCardIcon size={24} /></span>
        <strong>El listado de usuarios estará disponible próximamente</strong>
        <span>Desde aquí se podrán consultar las cuentas registradas.</span>
      </div>
    </section>
  );
}
