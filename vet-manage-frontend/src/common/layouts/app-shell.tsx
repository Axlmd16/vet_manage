import { useState } from 'react';
import type { ComponentType } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import logo from '../../assets/logo.jpeg';
import { useAuth } from '../../modules/auth/auth-context';
import {
  BoxIcon,
  CalendarIcon,
  ChevronDownIcon,
  FolderIcon,
  HomeIcon,
  PackageIcon,
  PawIcon,
  TagIcon,
  UsersIcon,
} from '../components/icons';
import './app-shell.css';
import { UserMenu } from './user-menu';

type NavItem = { label: string; to: string; icon: ComponentType<{ size?: number }>; permission?: string };

// Cada sección se muestra si el usuario tiene su permiso de lectura; sin permiso, la ve cualquiera.
const mainNavigation: NavItem[] = [
  { label: 'Resumen', to: '/', icon: HomeIcon },
  { label: 'Agenda', to: '/appointments', icon: CalendarIcon },
  { label: 'Pacientes', to: '/pets', icon: PawIcon, permission: 'pets:read' },
  { label: 'Clientes', to: '/clients', icon: UsersIcon, permission: 'clients:read' },
];

const inventoryNavigation: NavItem[] = [
  { label: 'Productos', to: '/inventory/products', icon: PackageIcon },
  { label: 'Categorías', to: '/inventory/categories', icon: FolderIcon },
  { label: 'Marcas', to: '/inventory/brands', icon: TagIcon },
];

const linkClass = (base: string) => ({ isActive }: { isActive: boolean }) =>
  isActive ? `${base} ${base}--active` : base;

export function AppShell() {
  const [inventoryOpen, setInventoryOpen] = useState(true);
  const { session, hasPermission } = useAuth();
  const user = session?.user;
  const initials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : '';
  const visible = (items: NavItem[]) => items.filter((item) => !item.permission || hasPermission(item.permission));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand__logo"><img src={logo} alt="" /></span>
          <div>
            <strong>VetManage</strong>
            <span>Gestión veterinaria</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          <span className="sidebar-nav__label">Principal</span>
          {visible(mainNavigation).map(({ label, to, icon: ItemIcon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={linkClass('sidebar-link')}>
              <span className="sidebar-link__icon"><ItemIcon size={17} /></span>
              <span className="sidebar-link__label">{label}</span>
            </NavLink>
          ))}

          <span className="sidebar-nav__label">Operación</span>
          <button
            className="sidebar-link sidebar-group__trigger"
            type="button"
            aria-expanded={inventoryOpen}
            onClick={() => setInventoryOpen((open) => !open)}
          >
            <span className="sidebar-link__icon"><BoxIcon size={17} /></span>
            <span className="sidebar-link__label">Inventario</span>
            <ChevronDownIcon size={16} className={`sidebar-group__chevron${inventoryOpen ? ' sidebar-group__chevron--open' : ''}`} />
          </button>
          {inventoryOpen && (
            <div className="sidebar-group__items">
              {visible(inventoryNavigation).map(({ label, to, icon: ItemIcon }) => (
                <NavLink key={to} to={to} className={linkClass('sidebar-sublink')}>
                  <ItemIcon size={16} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        <UserMenu />
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Clínica principal</span>
            <h1>Panel de control</h1>
          </div>
          <span className="profile-button" aria-hidden="true">{initials}</span>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
