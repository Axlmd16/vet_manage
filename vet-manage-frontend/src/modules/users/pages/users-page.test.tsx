import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '../../auth/auth-context';
import { RequirePermission } from '../../auth/components/require-permission';
import { usersApi } from '../services/users-api';
import type { UserListItem, UserPage, UserStatus } from '../types';
import { UsersPage } from './users-page';

vi.mock('../services/users-api', () => ({
  usersApi: {
    list: vi.fn(),
    assignableRoles: vi.fn(),
    changeStatus: vi.fn(),
  },
}));

function makeUser(id: string, firstName: string, lastName: string, status: UserStatus = 'ACTIVE'): UserListItem {
  return {
    id,
    identification: `99${id}`,
    firstName,
    lastName,
    email: `${id}@example.test`,
    roles: [{ name: 'veterinarian', displayName: 'Veterinario' }],
    status,
  };
}

function makePage(page: number, total: number): UserPage {
  const size = Math.min(20, Math.max(0, total - (page - 1) * 20));
  return {
    items: Array.from({ length: size }, (_, index) => makeUser(`u${page}-${index}`, `Usuario${page}${index}`, `Apellido${page}${index}`)),
    total,
    page,
    pageSize: 20,
  };
}

function renderPage(overrides: Partial<AuthContextValue> = {}) {
  const auth: AuthContextValue = {
    status: 'authenticated',
    session: null,
    login: vi.fn(async () => ({
      mustChangePassword: false,
      user: { id: 'admin', firstName: 'Ana', lastName: 'Admin', email: 'admin@example.test', roles: [], permissions: [] },
    })),
    logout: vi.fn(async () => undefined),
    hasPermission: () => true,
    ...overrides,
  };

  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter>
        <RequirePermission permission="users:read">
          <UsersPage />
        </RequirePermission>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usersApi.assignableRoles).mockResolvedValue([
      { name: 'veterinarian', displayName: 'Veterinario', description: null },
      { name: 'cashier', displayName: 'Cajero', description: null },
    ]);
    vi.mocked(usersApi.list).mockResolvedValue({
      items: [makeUser('1', 'Ana', 'Aguilar', 'INACTIVE'), makeUser('2', 'Luis', 'Mena')],
      total: 2,
      page: 1,
      pageSize: 20,
    });
  });

  it('muestra la lista inicial con cédula, nombre, correo, roles y estado', async () => {
    renderPage();

    const table = await screen.findByRole('table', { name: 'Usuarios' });
    expect(table).toBeInTheDocument();
    expect(within(table).getByText('Ana Aguilar')).toBeInTheDocument();
    expect(within(table).getByText('1@example.test')).toBeInTheDocument();
    expect(within(table).getAllByText('Veterinario')).toHaveLength(2);
    expect(within(table).getByText('Inactivo')).toBeInTheDocument();
    expect(screen.getByText('2 usuarios')).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 1')).toBeInTheDocument();
    expect(screen.queryByText(/próximamente/i)).not.toBeInTheDocument();
    expect(usersApi.list).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
  });

  it('combina búsqueda, rol y estado y reinicia la página', async () => {
    renderPage();
    await screen.findByText('Ana Aguilar');

    await userEvent.type(screen.getByLabelText('Buscar usuarios'), 'Pérez');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    await userEvent.selectOptions(screen.getByLabelText('Filtrar por rol'), 'veterinarian');
    await userEvent.selectOptions(screen.getByLabelText('Filtrar por estado'), 'INACTIVE');

    await waitFor(() => {
      expect(usersApi.list).toHaveBeenLastCalledWith({
        q: 'Pérez',
        role: 'veterinarian',
        status: 'INACTIVE',
        page: 1,
        pageSize: 20,
      });
    });
  });

  it('conserva los filtros al avanzar de página', async () => {
    vi.mocked(usersApi.list).mockImplementation(async (query = {}) => makePage(query.page ?? 1, 45));
    renderPage();
    await userEvent.type(screen.getByLabelText('Buscar usuarios'), 'Pérez');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    await userEvent.selectOptions(screen.getByLabelText('Filtrar por rol'), 'veterinarian');
    await userEvent.selectOptions(screen.getByLabelText('Filtrar por estado'), 'ACTIVE');
    await screen.findByText(/Usuario10/);

    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    await waitFor(() => {
      expect(usersApi.list).toHaveBeenLastCalledWith({
        q: 'Pérez',
        role: 'veterinarian',
        status: 'ACTIVE',
        page: 2,
        pageSize: 20,
      });
    });
    expect(await screen.findByText('Página 2 de 3')).toBeInTheDocument();
    expect(screen.getByText(/Usuario20/)).toBeInTheDocument();
  });

  it('muestra el mensaje sin resultados y no renderiza filas', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 });
    renderPage();

    expect(await screen.findByText('No se encontraron usuarios')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('recarga el listado sin búsqueda al borrar todo el campo', async () => {
    renderPage();
    await screen.findByText('Ana Aguilar');

    await userEvent.type(screen.getByLabelText('Buscar usuarios'), 'Pérez');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    await userEvent.selectOptions(screen.getByLabelText('Filtrar por rol'), 'veterinarian');

    await waitFor(() => {
      expect(usersApi.list).toHaveBeenLastCalledWith({
        q: 'Pérez',
        role: 'veterinarian',
        page: 1,
        pageSize: 20,
      });
    });

    await userEvent.clear(screen.getByLabelText('Buscar usuarios'));

    await waitFor(() => {
      expect(usersApi.list).toHaveBeenLastCalledWith({
        role: 'veterinarian',
        page: 1,
        pageSize: 20,
      });
    });
  });

  it('restablece búsqueda y filtros con Limpiar búsqueda', async () => {
    renderPage();
    await screen.findByText('Ana Aguilar');

    const searchInput = screen.getByLabelText('Buscar usuarios');
    await userEvent.type(searchInput, 'Pérez');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    await userEvent.selectOptions(screen.getByLabelText('Filtrar por rol'), 'veterinarian');
    await userEvent.selectOptions(screen.getByLabelText('Filtrar por estado'), 'INACTIVE');

    await userEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));

    expect(searchInput).toHaveValue('');
    expect(screen.getByLabelText('Filtrar por rol')).toHaveValue('');
    expect(screen.getByLabelText('Filtrar por estado')).toHaveValue('');
    await waitFor(() => {
      expect(usersApi.list).toHaveBeenLastCalledWith({ page: 1, pageSize: 20 });
    });
  });

  it('niega la vista a un usuario sin users:read', () => {
    renderPage({ hasPermission: () => false });

    expect(screen.getByText('No tiene permisos para realizar esta acción')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(usersApi.list).not.toHaveBeenCalled();
  });

  it('muestra Inactivar para activos, Activar para inactivos y oculta ambos para dados de baja', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({
      items: [
        makeUser('1', 'Luis', 'Torres', 'ACTIVE'),
        makeUser('2', 'Ana', 'Aguilar', 'INACTIVE'),
        makeUser('3', 'Carlos', 'Baja', 'DEACTIVATED'),
      ],
      total: 3,
      page: 1,
      pageSize: 20,
    });

    renderPage();
    const table = await screen.findByRole('table', { name: 'Usuarios' });
    const rows = within(table).getAllByRole('row').slice(1);

    expect(within(rows[0]).getByRole('button', { name: 'Inactivar' })).toBeInTheDocument();
    expect(within(rows[1]).getByRole('button', { name: 'Activar' })).toBeInTheDocument();
    expect(within(rows[2]).queryByRole('button', { name: 'Inactivar' })).not.toBeInTheDocument();
    expect(within(rows[2]).queryByRole('button', { name: 'Activar' })).not.toBeInTheDocument();
  });

  it('oculta Inactivar y Activar cuando no tiene permiso users:change-status', async () => {
    renderPage({ hasPermission: (permission) => permission === 'users:read' });
    await screen.findByRole('table', { name: 'Usuarios' });

    expect(screen.queryByRole('button', { name: 'Inactivar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Activar' })).not.toBeInTheDocument();
  });

  it('inactiva una cuenta tras confirmar el diálogo y actualiza el estado', async () => {
    vi.mocked(usersApi.changeStatus).mockResolvedValue({ id: '2', status: 'INACTIVE' });
    renderPage();
    await screen.findByText('Luis Mena');

    await userEvent.click(screen.getByRole('button', { name: 'Inactivar' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/Luis Mena/)).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => {
      expect(usersApi.changeStatus).toHaveBeenCalledWith('2', 'INACTIVE');
    });
    expect(screen.getByRole('status')).toHaveTextContent('Cuenta inactivada correctamente');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('cancela la inactivación sin llamar a la API', async () => {
    renderPage();
    await screen.findByText('Luis Mena');

    await userEvent.click(screen.getByRole('button', { name: 'Inactivar' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(usersApi.changeStatus).not.toHaveBeenCalled();
  });

  it('activa una cuenta inactiva tras confirmar el diálogo', async () => {
    vi.mocked(usersApi.changeStatus).mockResolvedValue({ id: '1', status: 'ACTIVE' });
    renderPage();
    await screen.findByText('Ana Aguilar');

    await userEvent.click(screen.getByRole('button', { name: 'Activar' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => {
      expect(usersApi.changeStatus).toHaveBeenCalledWith('1', 'ACTIVE');
    });
    expect(screen.getByRole('status')).toHaveTextContent('Cuenta activada correctamente');
  });

  it('muestra el mensaje de error del backend si se rechaza el cambio de estado', async () => {
    vi.mocked(usersApi.changeStatus).mockRejectedValue(new Error('No puede inactivar su propia cuenta'));
    renderPage();
    await screen.findByText('Luis Mena');

    await userEvent.click(screen.getByRole('button', { name: 'Inactivar' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirmar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No puede inactivar su propia cuenta');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
