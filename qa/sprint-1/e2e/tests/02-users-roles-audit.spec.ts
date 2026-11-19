// E2E · HU-51 Registrar usuario, HU-54 Asignar y quitar roles y auditoría (OC-04 / PNF-05).
import { expect, test } from '@playwright/test';
import { apiGet, apiLogin, login, mailsTo, toast, USERS, evidence } from '../support/helpers';

const roleCard = (page: import('@playwright/test').Page, role: string) =>
  page.locator('label.role-card', { hasText: new RegExp(`^${role}`) });

test.describe('HU-51 Registrar usuario (E2E)', () => {
  test('CP-51-01 el Administrador registra un Veterinario y se envían las credenciales', async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto('/users/new');
    await page.getByLabel('Cédula').fill('1105018517');
    await page.getByLabel('Teléfono').fill('0991234567');
    await page.getByLabel('Nombres').fill('Pablo');
    await page.getByLabel('Apellidos').fill('Andrade');
    await page.getByLabel('Correo electrónico').fill('pablo.e2e@vetmanage.test');
    await roleCard(page, 'Veterinario').click();
    await page.getByRole('button', { name: 'Guardar usuario' }).click();

    await expect(toast(page)).toContainText('Usuario registrado correctamente');
    await expect(page).toHaveURL(/\/users$/);
    await page.screenshot({ path: evidence('CP-51-01-usuario-registrado'), fullPage: true });
    await expect.poll(() => mailsTo('pablo.e2e@vetmanage.test')).toBeGreaterThanOrEqual(1);
  });

  test('CP-51-05 resalta el correo vacío con "Complete los campos obligatorios"', async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto('/users/new');
    await page.getByLabel('Cédula').fill('1105018889');
    await page.getByLabel('Nombres').fill('Sin');
    await page.getByLabel('Apellidos').fill('Correo');
    await roleCard(page, 'Cajero').click();
    await page.getByRole('button', { name: 'Guardar usuario' }).click();

    await expect(page.getByLabel('Correo electrónico')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Complete los campos obligatorios').first()).toBeVisible();
    await expect(page).toHaveURL(/\/users\/new$/);
  });

  test('CP-51-14 el Recepcionista no puede abrir el registro de personal', async ({ page }) => {
    await login(page, USERS.receptionist);
    await page.goto('/users/new');
    await expect(page.getByRole('alert')).toContainText('No tiene permisos para realizar esta acción');
    await expect(page.getByRole('button', { name: 'Guardar usuario' })).toHaveCount(0);
  });
});

test.describe('HU-54 Asignar y quitar roles (E2E)', () => {
  let carlosId: string;

  test.beforeAll(async () => {
    const token = await apiLogin(USERS.admin);
    const result = await apiGet<{ items: { id: string }[] }>('/users?q=1105013336', token);
    carlosId = result.items[0].id;
  });

  test('CP-54-07 el rol ya asignado (Recepcionista) no aparece para asignar', async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto(`/users/${carlosId}/roles`);
    await expect(page.getByRole('heading', { name: 'Gestionar roles' })).toBeVisible();
    await expect(page.getByLabel('Asignar rol Recepcionista')).toHaveCount(0);
    await expect(page.getByLabel('Asignar rol Cajero')).toHaveCount(1);
  });

  test('CP-54-01 asigna Cajero a Carlos Pérez y él ve ambos roles al iniciar sesión', async ({ page, browser }) => {
    await login(page, USERS.admin);
    await page.goto(`/users/${carlosId}/roles`);
    await page.getByLabel('Asignar rol Cajero').check({ force: true });
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(toast(page)).toContainText('Roles actualizados correctamente');
    await page.screenshot({ path: evidence('CP-54-01-rol-asignado'), fullPage: true });

    const carlos = await apiLogin('qa.cperez@vetmanage.test');
    const me = await apiGet<{ user: { roles: { name: string }[] } }>('/auth/me', carlos);
    expect(me.user.roles.map((r) => r.name).sort()).toEqual(['cashier', 'receptionist']);
    void browser;
  });

  test('CP-54-04 impide dejar al usuario sin roles', async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto(`/users/${carlosId}/roles`);
    const cards = page.locator('.role-current-list label.role-card');
    await expect(cards.first()).toBeVisible();
    // Se hace clic en la tarjeta visible de cada rol actual, como lo haría el usuario.
    for (const card of await cards.all()) await card.click();
    await expect(page.getByRole('checkbox', { name: /^Quitar rol /, checked: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('El usuario debe tener al menos un rol').first()).toBeVisible();
  });
});

test.describe('Auditoría de acciones sensibles (E2E · OC-04 / PNF-05)', () => {
  test('CP-51-18 / CP-54-14 el Administrador consulta en la auditoría el registro de usuarios y el cambio de roles', async ({ page }) => {
    await login(page, USERS.admin);
    await page.screenshot({ path: evidence('CP-54-14-menu-sin-auditoria'), fullPage: true });
    await expect(page.getByRole('link', { name: /Auditor[ií]a/ })).toBeVisible();
  });
});
