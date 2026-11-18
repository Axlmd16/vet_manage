import { useEffect, useId, useRef, useState } from 'react';
import { useAuth } from '../../modules/auth/auth-context';
import { ChevronsUpDownIcon, LogoutIcon, MailIcon } from '../components/icons';

// Tarjeta del usuario en el menú lateral con un panel de opciones de la cuenta.
export function UserMenu() {
  const { session, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const user = session?.user;
  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
  const primaryRole = user.roles[0]?.displayName ?? 'Sin roles asignados';
  const extraRoles = user.roles.length > 1 ? ` +${user.roles.length - 1}` : '';

  return (
    <div className="user-menu" ref={containerRef}>
      {open && (
        <div className="user-menu__panel" id={panelId} role="menu" aria-label="Opciones de la cuenta">
          <div className="user-menu__header">
            <span className="user-avatar user-avatar--large" aria-hidden="true">{initials}</span>
            <div className="user-menu__identity">
              <strong>{fullName}</strong>
              <span><MailIcon size={13} />{user.email}</span>
            </div>
          </div>

          {user.roles.length > 0 && (
            <div className="user-menu__roles">
              {user.roles.map((role) => <span key={role.name} className="role-chip">{role.displayName}</span>)}
            </div>
          )}

          <div className="user-menu__actions">
            <button className="user-menu__item user-menu__item--danger" type="button" role="menuitem" onClick={() => void logout()}>
              <LogoutIcon size={17} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      <button
        className={`user-card${open ? ' user-card--open' : ''}`}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="user-avatar" aria-hidden="true">{initials}</span>
        <span className="user-card__copy">
          <strong title={fullName}>{fullName}</strong>
          <span>{primaryRole}{extraRoles}</span>
        </span>
        <ChevronsUpDownIcon size={16} className="user-card__chevron" />
      </button>
    </div>
  );
}
