import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth-context';

// Muestra las rutas hijas solo con sesión iniciada; si no, envía al inicio de sesión.
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <div className="auth-loading" role="status">Cargando sesión…</div>;
  }
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
