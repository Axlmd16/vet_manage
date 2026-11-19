// Definición de pasos (Gherkin en español) con Playwright.
import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ACCOUNTS, MAILPIT_URL, PASSWORD, WEB_URL } from '../support/world.mjs';

const toast = (page) => page.locator('.toast-region');

// ───────────── Sesión ─────────────
Given('que el {string} tiene una cuenta activa', function (role) {
  this.email = ACCOUNTS[role];
});

Given('que un/el {string} inició sesión', async function (role) {
  await this.signIn(ACCOUNTS[role]);
  await expect(this.page).not.toHaveURL(/\/login/);
});

When('ingresa su correo y la contraseña {string} y presiona {string}', async function (password, _button) {
  await this.login(this.email, password);
});

Then('el sistema debe iniciar la sesión', async function () {
  await expect(this.page).not.toHaveURL(/\/login/);
});

Then('debe mostrar la pantalla principal con la opción {string}', async function (option) {
  await expect(this.page.getByRole('link', { name: new RegExp(option) }).first()).toBeVisible();
});

Given('que el usuario {string} ha fallado {int} intentos consecutivos de inicio de sesión', async function (email, attempts) {
  this.email = email;
  for (let i = 0; i < attempts; i += 1) {
    await this.login(email, 'Incorrecta1');
    await expect(this.page.getByRole('alert')).toContainText('Correo o contraseña incorrectos');
  }
});

When('falla el quinto intento', async function () {
  await this.login(this.email, 'Incorrecta1');
});

Then('el sistema debe mostrar el mensaje {string}', async function (message) {
  await expect(this.page.getByRole('alert')).toContainText(message);
});

Then('con la contraseña correcta el acceso sigue bloqueado', async function () {
  await this.login(this.email, PASSWORD);
  await expect(this.page.getByRole('alert')).toContainText('Cuenta bloqueada temporalmente');
  await expect(this.page).toHaveURL(/\/login/);
});

// ───────────── HU-51 ─────────────
Given('que el {string} se encuentra en el formulario de registro de personal', async function (role) {
  await this.signIn(ACCOUNTS[role]);
  await this.page.goto(`${WEB_URL}/users/new`);
});

When('ingresa cédula {string}, nombres {string}, apellidos {string}, correo {string} y teléfono {string}',
  async function (identification, firstName, lastName, email, phone) {
    const page = this.page;
    await page.getByLabel('Cédula').fill(identification);
    await page.getByLabel('Nombres').fill(firstName);
    await page.getByLabel('Apellidos').fill(lastName);
    await page.getByLabel('Correo electrónico').fill(email);
    await page.getByLabel('Teléfono').fill(phone);
    this.identification = identification;
  });

When('selecciona el rol {string} y presiona {string}', async function (role, button) {
  await this.page.locator('label.role-card', { hasText: new RegExp(`^${role}`) }).click();
  await this.page.getByRole('button', { name: button }).click();
});

Then('debe mostrar el mensaje {string}', async function (message) {
  await expect(toast(this.page)).toContainText(message);
});

Then('la cuenta {string} debe quedar en estado {string} con el rol {string}', async function (email, status, role) {
  const admin = await this.apiToken(ACCOUNTS.Administrador);
  const { body } = await this.api(`/users?q=${this.identification}`, { token: admin });
  const user = body.data.items.find((item) => item.email === email);
  expect(user, `No se encontró ${email}`).toBeTruthy();
  expect(user.status).toBe(status);
  expect(user.roles.map((r) => r.name)).toContain(role);
});

Then('debe enviar las credenciales al correo {string}', async function (email) {
  await expect.poll(async () => {
    const response = await fetch(`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`);
    return (await response.json()).messages_count;
  }).toBeGreaterThanOrEqual(1);
});

When('intenta abrir el formulario de registro de personal', async function () {
  await this.page.goto(`${WEB_URL}/users/new`);
});

// ───────────── HU-54 ─────────────
Given('que {string} tiene el rol {string}', async function (fullName, roleDisplay) {
  const admin = await this.apiToken(ACCOUNTS.Administrador);
  const { body } = await this.api(`/users?q=${encodeURIComponent(fullName.split(' ')[0])}`, { token: admin });
  const user = body.data.items.find((item) => `${item.firstName} ${item.lastName}` === fullName);
  expect(user.roles.map((r) => r.displayName)).toEqual([roleDisplay]);
  this.targetUser = user;
});

When('el {string} le asigna el rol {string} y presiona {string}', async function (role, roleDisplay, button) {
  await this.signIn(ACCOUNTS[role]);
  await this.page.goto(`${WEB_URL}/users/${this.targetUser.id}/roles`);
  await this.page.getByRole('checkbox', { name: `Asignar rol ${roleDisplay}` }).check({ force: true });
  await this.page.getByRole('button', { name: button }).click();
});

Then('en su siguiente inicio de sesión Carlos debe tener los roles {string}', async function (roles) {
  const token = await this.apiToken(this.targetUser.email);
  const { body } = await this.api('/auth/me', { token });
  expect(body.data.user.roles.map((r) => r.name).sort().join(',')).toBe(roles);
});

// ───────────── HU-01 ─────────────
Given('que el {string} se encuentra en el formulario de registro de cliente', async function (role) {
  await this.signIn(ACCOUNTS[role]);
  await this.page.goto(`${WEB_URL}/clients/new`);
});

When('ingresa cédula {string}, nombres {string}, apellidos {string}, teléfono {string} y correo {string}',
  async function (identification, firstName, lastName, phone, email) {
    const page = this.page;
    await page.getByLabel('Cédula').fill(identification);
    await page.getByLabel('Nombres').fill(firstName);
    await page.getByLabel('Apellidos').fill(lastName);
    await page.getByLabel('Teléfono').fill(phone);
    await page.getByLabel('Correo electrónico').fill(email);
  });

When('presiona {string}', async function (button) {
  await this.page.getByRole('button', { name: button, exact: true }).click();
});

Then('el cliente {string} debe quedar guardado con estado {string}', async function (identification, status) {
  const token = await this.apiToken(ACCOUNTS.Recepcionista);
  await expect.poll(async () => {
    const { body } = await this.api(`/clients?search=${identification}`, { token });
    return body.data.items[0]?.status;
  }).toBe(status);
});

// ───────────── HU-07 ─────────────
Given('que el {string} se encuentra en el formulario de registro de pacientes', async function (role) {
  await this.signIn(ACCOUNTS[role]);
  await this.page.goto(`${WEB_URL}/pets`);
  await this.page.getByRole('button', { name: 'Nuevo paciente' }).click();
});

When('ingresa nombre {string}, especie {string}, raza {string}, sexo {string}, nacimiento {string}, peso {string} y talla {string}',
  async function (name, species, breed, sex, birthDate, weight, height) {
    const page = this.page;
    await page.getByLabel('Nombre').fill(name);
    await page.getByLabel('Especie').selectOption({ label: species });
    await page.getByLabel('Raza').selectOption({ label: breed });
    await page.getByLabel('Sexo').selectOption({ label: sex });
    await page.getByLabel('Fecha de nacimiento').fill(birthDate);
    await page.getByLabel('Estado reproductivo').selectOption({ index: 1 });
    await page.getByLabel('Peso (kg)').fill(weight);
    await page.getByLabel('Talla (cm)').fill(height);
    this.petName = name;
  });

When('selecciona al cliente {string} y presiona {string}', async function (term, button) {
  await this.page.getByPlaceholder('Buscar por nombre o cédula').fill(term);
  await this.page.getByRole('listbox', { name: 'Clientes activos' }).getByRole('button', { name: new RegExp(term) }).click();
  this.petResponse = this.page.waitForResponse((r) => r.url().endsWith('/pets') && r.request().method() === 'POST');
  await this.page.getByRole('button', { name: button, exact: true }).click();
});

Then('el paciente {string} debe quedar {string} con un código {string} generado', async function (name, status, _codeFormat) {
  const response = await this.petResponse;
  const { data } = await response.json();
  expect(data.name).toBe(name);
  expect(data.status).toBe(status);
  expect(data.code).toMatch(/^PAC-\d{6}$/);
});

// ───────────── HU-13 ─────────────
Given('que el {string} accede al módulo de gestión de especies', async function (role) {
  await this.signIn(ACCOUNTS[role]);
  await this.page.goto(`${WEB_URL}/catalogs`);
  await this.page.getByRole('button', { name: 'Nueva especie' }).click();
});

When('ingresa el nombre {string}, la descripción {string} y selecciona {string}', async function (name, description, button) {
  await this.page.locator('#species-name').fill(name);
  await this.page.locator('#species-description').fill(description);
  await this.page.getByRole('button', { name: button }).click();
});

When('ingresa el nombre {string} y selecciona {string}', async function (name, button) {
  await this.page.locator('#species-name').fill(name);
  await this.page.getByRole('button', { name: button }).click();
});

async function activeSpecies(world) {
  const token = await world.apiToken(ACCOUNTS.Veterinario);
  return (await world.api('/pets/species/active', { token })).body.data.map((s) => s.name);
}

Then('la especie {string} debe estar disponible en el catálogo', async function (name) {
  expect(await activeSpecies(this)).toContain(name);
});

Then('la especie {string} no debe estar en el catálogo', async function (name) {
  await expect(this.page.locator('#species-name')).toHaveCount(0);
  expect(await activeSpecies(this)).not.toContain(name);
});
