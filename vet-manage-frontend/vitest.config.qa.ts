import { defineConfig } from 'vitest/config';

// Suite QA – Sprint 1, nivel unitario del frontend: reglas de validación de los formularios
// (lo que el usuario ve antes de llamar a la API). Archivos *.qa.test.ts para no mezclarse
// con `npm test` de desarrollo.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/test/qa/**/*.qa.test.ts'],
    reporters: ['default', 'junit', 'json'],
    outputFile: {
      junit: '../qa/sprint-1/reports/unit-frontend/junit.xml',
      json: '../qa/sprint-1/reports/unit-frontend/results.json',
    },
  },
});
