import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../modules/auth/auth-context';

// Cada sección se muestra si el usuario tiene su permiso de lectura; sin permiso, la ve cualquiera.
const navigation: { label: string; to: string; permission?: string }[] = [
  { label: 'Resumen', to: '/' },
  { label: 'Pacientes', to: '/pets', permission: 'pets:read' },
  { label: 'Clientes', to: '/clients', permission: 'clients:read' },
  { label: 'Agenda', to: '/appointments' },
];

export function AppShell() {
  const [inventoryOpen, setInventoryOpen] = useState(true);
  const { session, logout, hasPermission } = useAuth();
  const user = session?.user;
  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const initials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : '';
  const roles = user?.roles.map((role) => role.displayName).join(', ') ?? '';
  const visibleNavigation = navigation.filter((item) => !item.permission || hasPermission(item.permission));
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">V</div>
          <div>
            <strong>Vet Manage</strong>
            <span>Gestión veterinaria</span>
          </div>
        </div>

        <nav className="main-nav" aria-label="Navegación principal">
          {visibleNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
          <div className="nav-group">
            <button className="nav-group__trigger" type="button" aria-expanded={inventoryOpen} onClick={() => setInventoryOpen((open) => !open)}><span>Inventario</span><span className={`nav-chevron ${inventoryOpen ? 'nav-chevron--open' : ''}`}>⌄</span></button>
            {inventoryOpen && <div className="nav-group__items"><NavLink className={({ isActive }) => (isActive ? 'nav-link nav-link--child nav-link--active' : 'nav-link nav-link--child')} to="/inventory/products">Productos</NavLink><NavLink className={({ isActive }) => (isActive ? 'nav-link nav-link--child nav-link--active' : 'nav-link nav-link--child')} to="/inventory/categories">Categorías</NavLink><NavLink className={({ isActive }) => (isActive ? 'nav-link nav-link--child nav-link--active' : 'nav-link nav-link--child')} to="/inventory/brands">Marcas</NavLink></div>}
          </div>
        </nav>

        <div className="sidebar-footer">
          <span className="avatar" aria-hidden="true">{initials}</span>
          <div className="sidebar-user">
            <strong title={fullName}>{fullName}</strong>
            <span title={roles}>{roles || 'Sin roles asignados'}</span>
          </div>
        </div>
        <button className="button button--ghost button--small logout-button" type="button" onClick={logout}>
          Cerrar sesión
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Clínica principal</span>
            <h1>Panel de control</h1>
          </div>
          <span className="profile-button" title={fullName} aria-hidden="true">
            {initials}
          </span>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
