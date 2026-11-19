// E2E · HU-01 Registrar cliente, HU-07 Registrar paciente y HU-13 Registrar especie.
import { expect, test, type Page } from '@playwright/test';
import { apiGet, apiLogin, login, toast, USERS, evidence } from '../support/helpers';

// El listado de especies (HU-16) no está en este sprint: se verifica el catálogo por la API.
async function activeSpeciesNames() {
  const token = await apiLogin(USERS.veterinarian);
  return (await apiGet<{ name: string }[]>('/pets/species/active', token)).map((s) => s.name);
}

test.describe('HU-01 Registrar cliente (E2E)', () => {
  test('CP-01-01 la Recepcionista registra un cliente y ve "Cliente registrado exitosamente"', async ({ page }) => {
    await login(page, USERS.receptionist);
    await page.goto('/clients/new');
    await page.getByLabel('Cédula').fill('1105019994');
    await page.getByLabel('Teléfono').fill('0987654321');
    await page.getByLabel('Nombres').fill('Mateo');
    await page.getByLabel('Apellidos').fill('Cueva');
    await page.getByLabel('Correo electrónico').fill('mateo.e2e@correo.test');
    await page.getByLabel('Dirección').fill('Av. Orillas del Zamora');
    await page.getByRole('button', { name: 'Guardar cliente' }).click();

    await expect(page).toHaveURL(/\/clients$/);
    await page.screenshot({ path: evidence('CP-01-01-cliente-registrado'), fullPage: true });
    await expect(toast(page)).toContainText('Cliente registrado exitosamente');
  });

  test('CP-01-04 los obligatorios vacíos muestran "Por favor, complete todos los campos obligatorios"', async ({ page }) => {
    await login(page, USERS.receptionist);
    await page.goto('/clients/new');
    await page.getByRole('button', { name: 'Guardar cliente' }).click();
    await expect(page.getByLabel('Cédula')).toHaveAttribute('aria-invalid', 'true');
    await page.screenshot({ path: evidence('CP-01-04-obligatorios'), fullPage: true });
    await expect(page.getByText('Por favor, complete todos los campos obligatorios').first()).toBeVisible();
  });

  test('CP-01-14 el Cajero no puede registrar clientes', async ({ page }) => {
    await login(page, USERS.cashier);
    await page.goto('/clients/new');
    await expect(page.getByRole('alert')).toContainText('No tiene permisos para realizar esta acción');
  });
});

async function openPetForm(page: Page) {
  await login(page, USERS.receptionist);
  await page.goto('/pets');
  await page.getByRole('button', { name: 'Nuevo paciente' }).click();
}

async function pickClient(page: Page, term: string) {
  await page.getByPlaceholder('Buscar por nombre o cédula').fill(term);
}

test.describe('HU-07 Registrar paciente (E2E)', () => {
  test('CP-07-01 / CP-07-16 registra un paciente asociado a Pedro Castillo, sin campo de código editable', async ({ page }) => {
    await openPetForm(page);
    await expect(page.getByLabel(/c[óo]digo/i)).toHaveCount(0);

    await page.getByLabel('Nombre').fill('Max E2E');
    await page.getByLabel('Especie').selectOption({ label: 'Canino' });
    await page.getByLabel('Raza').selectOption({ label: 'Labrador Retriever' });
    await page.getByLabel('Sexo').selectOption({ label: 'Macho' });
    await page.getByLabel('Fecha de nacimiento').fill('10022024');
    await page.getByLabel('Estado reproductivo').selectOption({ index: 1 });
    await page.getByLabel('Peso (kg)').fill('20.5');
    await page.getByLabel('Talla (cm)').fill('55');
    await pickClient(page, 'Castillo');
    await page.getByRole('listbox', { name: 'Clientes activos' }).getByRole('button', { name: /Pedro Castillo/ }).click();
    await page.getByRole('button', { name: 'Guardar', exact: true }).click();

    await expect(toast(page)).toContainText('Paciente registrado exitosamente');
    await page.screenshot({ path: evidence('CP-07-01-paciente-registrado'), fullPage: true });
  });

  test('CP-07-04 sin cliente muestra "Debe seleccionar un cliente registrado"', async ({ page }) => {
    await openPetForm(page);
    await page.getByLabel('Nombre').fill('Sin Dueño');
    await page.getByLabel('Especie').selectOption({ label: 'Canino' });
    await page.getByLabel('Raza').selectOption({ label: 'Mestizo' });
    await page.getByLabel('Sexo').selectOption({ label: 'Hembra' });
    await page.getByLabel('Fecha de nacimiento').fill('01012022');
    await page.getByLabel('Estado reproductivo').selectOption({ index: 1 });
    await page.getByLabel('Peso (kg)').fill('8');
    await page.getByLabel('Talla (cm)').fill('30');
    await page.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(page.getByText('Debe seleccionar un cliente registrado').first()).toBeVisible();
  });

  test('CP-07-05 un cliente dado de baja (Hugo Vivanco) no aparece en el selector', async ({ page }) => {
    await openPetForm(page);
    await pickClient(page, 'Castillo');
    await expect(page.getByRole('listbox', { name: 'Clientes activos' })).toBeVisible();
    const search = page.waitForResponse((r) => r.url().includes('/clients') && r.url().includes('Vivanco'));
    await pickClient(page, 'Vivanco');
    await search;
    await expect(page.getByRole('button', { name: /Castillo/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Hugo Vivanco/ })).toHaveCount(0);
  });
});

test.describe('HU-13 Registrar especie (E2E)', () => {
  test('CP-13-01 el Veterinario registra una especie', async ({ page }) => {
    await login(page, USERS.veterinarian);
    await page.goto('/catalogs');
    await page.getByRole('button', { name: 'Nueva especie' }).click();
    await page.locator('#species-name').fill('Roedor E2E');
    await page.locator('#species-description').fill('Hámsters y cobayos');
    await page.getByRole('button', { name: 'Guardar especie' }).click();
    await expect(toast(page)).toContainText('Especie registrada exitosamente');
    await page.screenshot({ path: evidence('CP-13-01-especie-registrada'), fullPage: true });
    expect(await activeSpeciesNames()).toContain('Roedor E2E');
  });

  test('CP-13-02 sin nombre muestra que el nombre es obligatorio', async ({ page }) => {
    await login(page, USERS.veterinarian);
    await page.goto('/catalogs');
    await page.getByRole('button', { name: 'Nueva especie' }).click();
    await page.getByRole('button', { name: 'Guardar especie' }).click();
    await expect(page.getByText('El nombre de la especie es obligatorio')).toBeVisible();
  });

  test('CP-13-05 cancelar no guarda la especie', async ({ page }) => {
    await login(page, USERS.veterinarian);
    await page.goto('/catalogs');
    await page.getByRole('button', { name: 'Nueva especie' }).click();
    await page.locator('#species-name').fill('Anfibio Cancelado');
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.locator('#species-name')).toHaveCount(0);
    expect(await activeSpeciesNames()).not.toContain('Anfibio Cancelado');
  });
});
