import { defineConfig, devices } from '@playwright/test';

// E2E – Sprint 1 (≈10 % de la pirámide). Navegador real contra Staging.
// Las pruebas comparten la base de Staging: un solo worker y la base se restaura en globalSetup.
export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  outputDir: '../reports/test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: '../reports/playwright-html', open: 'never' }],
    ['json', { outputFile: '../reports/e2e/playwright-results.json' }],
    ['junit', { outputFile: '../reports/e2e/playwright-junit.xml' }],
  ],
  use: {
    baseURL: process.env.QA_WEB_URL ?? 'http://localhost:5184',
    locale: 'es-EC',
    timezoneId: 'America/Guayaquil',
    screenshot: 'on',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
