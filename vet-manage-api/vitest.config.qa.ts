import { defineConfig } from 'vitest/config';

// Suite QA – Sprint 1, nivel unitario (≈60 % de la pirámide).
// Vitest es compatible con la API de Jest (describe/it/expect/vi.fn ≈ jest.fn).
// Los archivos usan la extensión *.qa-spec.ts para que `npm test` de desarrollo no los ejecute:
// estas pruebas verifican los criterios de aceptación tal como están escritos en las HU y
// las que fallan se reportan como defectos en la matriz de errores.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['test/qa/unit/**/*.qa-spec.ts'],
    reporters: ['default', 'junit', 'json'],
    outputFile: {
      junit: '../qa/sprint-1/reports/unit/junit.xml',
      json: '../qa/sprint-1/reports/unit/results.json',
    },
    coverage: {
      provider: 'v8',
      // Lógica de negocio de las HU del Sprint 1.
      include: [
        'src/common/validation/identification.ts',
        'src/modules/identity/services/user-registration.service.ts',
        'src/modules/identity/services/user-role-assignment.service.ts',
        'src/modules/identity/services/auth.service.ts',
        'src/modules/identity/services/client-registration.service.ts',
        'src/modules/pets/services/pets/register-pet.service.ts',
        'src/modules/pets/services/pets/birth-date.ts',
        'src/modules/pets/services/species/register-species.service.ts',
      ],
      reporter: ['text', 'html', 'json-summary'],
      // Las pruebas que fallan son defectos reportados; la cobertura se genera igual.
      reportOnFailure: true,
      reportsDirectory: '../qa/sprint-1/reports/coverage',
    },
  },
});
