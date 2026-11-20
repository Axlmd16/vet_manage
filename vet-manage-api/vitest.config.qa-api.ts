import { defineConfig } from 'vitest/config';

// Suite QA – Sprint 1, nivel de integración de API (≈25 % de la pirámide).
// Caja negra con Supertest contra el ambiente Staging (QA_API_URL), con la base restaurada
// desde la semilla (pg_restore) antes de cada corrida.
export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['test/qa/api/**/*.qa-spec.ts'],
    globalSetup: ['./test/qa/api/global-setup.ts'],
    // Las pruebas comparten la base de Staging: se ejecutan en serie y en orden.
    fileParallelism: false,
    sequence: { concurrent: false },
    testTimeout: 30_000,
    hookTimeout: 60_000,
    reporters: ['default', 'junit', 'json'],
    outputFile: {
      junit: '../qa/sprint-1/reports/api/junit.xml',
      json: '../qa/sprint-1/reports/api/results.json',
    },
  },
});
