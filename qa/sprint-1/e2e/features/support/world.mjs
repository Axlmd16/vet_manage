// Mundo de Cucumber: un navegador Chromium (Playwright) por escenario contra Staging.
import { After, AfterAll, Before, BeforeAll, setDefaultTimeout, setWorldConstructor, Status, World } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const WEB_URL = process.env.QA_WEB_URL ?? 'http://localhost:5184';
export const API_URL = process.env.QA_API_URL ?? 'http://localhost:3180/api/v1';
export const MAILPIT_URL = process.env.QA_MAILPIT_URL ?? 'http://localhost:59025';
export const PASSWORD = 'QaVet2026';

// Rol (como lo nombran las HU) → cuenta de la semilla QA.
export const ACCOUNTS = {
  Administrador: 'qa.admin@vetmanage.test',
  Gerente: 'qa.gerente@vetmanage.test',
  Veterinario: 'qa.veterinario@vetmanage.test',
  'Técnico Veterinario': 'qa.tecnico@vetmanage.test',
  Recepcionista: 'qa.recepcion@vetmanage.test',
  Cajero: 'qa.cajero@vetmanage.test',
  Bodeguero: 'qa.bodeguero@vetmanage.test',
  Cliente: 'qa.cliente@vetmanage.test',
};

setDefaultTimeout(45_000);
let browser;

class VetWorld extends World {
  async login(email, password = PASSWORD) {
    await this.page.goto(`${WEB_URL}/login`);
    await this.page.locator('#login-email').fill(email);
    await this.page.locator('#login-password').fill(password);
    await this.page.getByRole('button', { name: 'Iniciar sesión' }).click();
  }

  // Inicia sesión y espera a entrar a la aplicación.
  async signIn(email) {
    await this.login(email);
    await this.page.waitForURL((url) => !url.pathname.startsWith('/login'));
  }

  async api(path, { method = 'GET', token, body } = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: response.status, body: await response.json() };
  }

  async apiToken(email) {
    return (await this.api('/auth/login', { method: 'POST', body: { email, password: PASSWORD } })).body.data.accessToken;
  }
}
setWorldConstructor(VetWorld);

BeforeAll(async () => {
  // Datos deterministas: se restaura la semilla con pg_restore antes de las pruebas de aceptación.
  if (process.env.QA_SKIP_RESTORE !== '1') {
    const script = fileURLToPath(new URL('../../../staging/scripts/restore-staging.sh', import.meta.url));
    execFileSync('bash', [script], { stdio: 'inherit' });
  }
  browser = await chromium.launch();
});

Before(async function () {
  this.context = await browser.newContext({ locale: 'es-EC', timezoneId: 'America/Guayaquil' });
  this.page = await this.context.newPage();
});

After(async function ({ result, pickle }) {
  // Evidencia de cada escenario (se sobrescribe en cada corrida); al reporte HTML solo se adjunta si falla.
  const tag = pickle.tags.map((t) => t.name).find((name) => name.startsWith('@CP-'))?.slice(1) ?? 'escenario';
  const path = fileURLToPath(new URL(`../../../reports/e2e/evidencias/cucumber-${tag}.png`, import.meta.url));
  const image = await this.page.screenshot({ path, fullPage: true });
  if (result?.status === Status.FAILED) this.attach(image, 'image/png');
  await this.context.close();
});

AfterAll(async () => {
  await browser?.close();
});
