import { expect, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

// Capturas de evidencia: qa/sprint-1/reports/e2e/evidencias/<nombre>.png (independiente del directorio actual).
export const evidence = (name: string) => fileURLToPath(new URL(`../../reports/e2e/evidencias/${name}.png`, import.meta.url));

export const PASSWORD = 'QaVet2026';
export const API_URL = process.env.QA_API_URL ?? 'http://localhost:3180/api/v1';
export const MAILPIT_URL = process.env.QA_MAILPIT_URL ?? 'http://localhost:59025';

export const USERS = {
  admin: 'qa.admin@vetmanage.test',
  manager: 'qa.gerente@vetmanage.test',
  veterinarian: 'qa.veterinario@vetmanage.test',
  receptionist: 'qa.recepcion@vetmanage.test',
  cashier: 'qa.cajero@vetmanage.test',
  temporary: 'qa.temporal@vetmanage.test',
  lockout: 'qa.bloqueo@vetmanage.test',
} as const;

export async function fillLogin(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
}

export async function login(page: Page, email: string, password = PASSWORD) {
  await fillLogin(page, email, password);
  await expect(page).not.toHaveURL(/\/login/);
}

// Avisos (toasts) que muestra la aplicación tras guardar.
export const toast = (page: Page) => page.locator('.toast-region');

export async function mailsTo(address: string): Promise<number> {
  const response = await fetch(`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:"${address}"`)}`);
  return (await response.json()).messages_count as number;
}

export async function apiLogin(email: string): Promise<string> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: PASSWORD }),
  });
  return (await response.json()).data.accessToken as string;
}

export async function apiGet<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { headers: { authorization: `Bearer ${token}` } });
  return (await response.json()).data as T;
}
