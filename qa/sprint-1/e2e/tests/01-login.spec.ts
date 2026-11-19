// E2E · HU-57 Iniciar sesión: login, mensajes y bloqueo al 5.º intento fallido.
import { expect, test } from '@playwright/test';
import { fillLogin, login, PASSWORD, USERS, evidence } from '../support/helpers';

test.describe('HU-57 Iniciar sesión (E2E)', () => {
  test('CP-57-01 el Veterinario inicia sesión y ve la pantalla principal con sus funciones', async ({ page }) => {
    await login(page, USERS.veterinarian);
    await expect(page.getByText('Valeria', { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Pacientes/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Usuarios/ })).toHaveCount(0);
  });

  test('CP-57-03 contraseña incorrecta muestra un mensaje genérico', async ({ page }) => {
    await fillLogin(page, USERS.manager, 'Mala1234');
    await expect(page.getByRole('alert')).toContainText('Correo o contraseña incorrectos');
    await expect(page).toHaveURL(/\/login/);
  });

  test('CP-57-04 campos vacíos muestran "Ingrese su correo y contraseña" sin llamar a la API', async ({ page }) => {
    let calls = 0;
    page.on('request', (request) => { if (request.url().includes('/auth/login')) calls += 1; });
    await page.goto('/login');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.getByRole('alert')).toContainText('Ingrese su correo y contraseña');
    expect(calls).toBe(0);
  });

  test('CP-57-05/06 bloquea la cuenta al 5.º intento fallido y la mantiene bloqueada con la contraseña correcta', async ({ page }) => {
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      await fillLogin(page, USERS.lockout, 'Incorrecta1');
      await expect(page.getByRole('alert')).toContainText('Correo o contraseña incorrectos');
    }
    await expect(page.getByRole('alert')).toContainText('Le queda 1 intento');

    await fillLogin(page, USERS.lockout, 'Incorrecta1');
    await expect(page.getByRole('alert')).toContainText('Cuenta bloqueada temporalmente. Intente en 15 minutos');
    await page.screenshot({ path: evidence('CP-57-05-bloqueo'), fullPage: true });

    await fillLogin(page, USERS.lockout, PASSWORD);
    await expect(page.getByRole('alert')).toContainText('Cuenta bloqueada temporalmente');
    await expect(page).toHaveURL(/\/login/);
  });

  test('CP-57-09 el primer ingreso con contraseña temporal lleva al cambio obligatorio de contraseña', async ({ page }) => {
    await fillLogin(page, USERS.temporary, PASSWORD);
    await expect(page.getByRole('heading', { name: /cambi(ar|o de) contraseña/i })).toBeVisible();
  });
});
