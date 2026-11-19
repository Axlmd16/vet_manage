// Cucumber.js – pruebas de aceptación (Gherkin en español) del Sprint 1.
// Uso (desde qa/): npm run e2e:cucumber
module.exports = {
  default: {
    paths: ['sprint-1/e2e/features/**/*.feature'],
    import: ['sprint-1/e2e/features/support/**/*.mjs', 'sprint-1/e2e/features/step_definitions/**/*.mjs'],
    language: 'es',
    format: [
      'progress',
      'json:sprint-1/reports/e2e/cucumber-report.json',
      'html:sprint-1/reports/e2e/cucumber-report.html',
      'junit:sprint-1/reports/e2e/cucumber-junit.xml',
    ],
  },
};
