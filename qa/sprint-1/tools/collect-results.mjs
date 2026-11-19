// Consolida los resultados de todas las suites en matrices/resultados-ejecucion.json (por ID de caso).
// Un caso "Falló" si cualquiera de sus pruebas falló en cualquier nivel; "Pasó" si todas pasaron.
// Uso (desde qa/): node sprint-1/tools/collect-results.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const reports = join(here, '..', 'reports');
const outcomes = new Map(); // CP → { passed, failed, suites:Set }
const suiteTotals = {};

// "CP-07-05/06" → [CP-07-05, CP-07-06]; "CP-51-18 / CP-54-14" → [CP-51-18, CP-54-14].
function caseIds(title) {
  const ids = [];
  for (const [, hu, first, rest] of title.matchAll(/CP-(\d{2})-(\d{2})((?:\/\d{2})*)/g)) {
    ids.push(`CP-${hu}-${first}`);
    for (const extra of rest.split('/').filter(Boolean)) ids.push(`CP-${hu}-${extra}`);
  }
  return ids;
}

function record(suite, title, passed) {
  suiteTotals[suite] ??= { total: 0, passed: 0, failed: 0 };
  suiteTotals[suite].total += 1;
  suiteTotals[suite][passed ? 'passed' : 'failed'] += 1;
  for (const id of caseIds(title)) {
    const entry = outcomes.get(id) ?? { passed: 0, failed: 0, suites: new Set() };
    entry[passed ? 'passed' : 'failed'] += 1;
    entry.suites.add(suite);
    outcomes.set(id, entry);
  }
}

const read = (file) => (existsSync(file) ? readFileSync(file, 'utf8') : null);

// Vitest (JSON compatible con Jest).
for (const [suite, file] of [
  ['Unitarias API', 'unit/results.json'],
  ['Unitarias frontend', 'unit-frontend/results.json'],
  ['Integración Supertest', 'api/results.json'],
]) {
  const json = read(join(reports, file));
  if (!json) continue;
  for (const testFile of JSON.parse(json).testResults) {
    for (const test of testFile.assertionResults) record(suite, test.title, test.status === 'passed');
  }
}

// Newman (JUnit): una <testsuite> por petición, nombrada "Carpeta / CP-xx-yy …".
const newman = read(join(reports, 'newman', 'newman-junit.xml'));
if (newman) {
  for (const [, attrs, body] of newman.matchAll(/<testsuite ([^>]*)>([\s\S]*?)<\/testsuite>/g)) {
    const name = /name="([^"]*)"/.exec(attrs)?.[1] ?? '';
    if (!/CP-\d{2}-\d{2}/.test(name)) continue;
    record('Integración Newman', name, !/<failure/.test(body));
  }
}

// Playwright (JSON).
const playwright = read(join(reports, 'e2e', 'playwright-results.json'));
if (playwright) {
  const walk = (suite) => {
    for (const spec of suite.specs ?? []) record('E2E Playwright', spec.title, spec.ok);
    for (const child of suite.suites ?? []) walk(child);
  };
  for (const suite of JSON.parse(playwright).suites) walk(suite);
}

// Cucumber (JSON): el ID del caso va en la etiqueta del escenario.
const cucumber = read(join(reports, 'e2e', 'cucumber-report.json'));
if (cucumber) {
  for (const feature of JSON.parse(cucumber)) {
    for (const scenario of feature.elements) {
      const tags = scenario.tags.map((t) => t.name).join(' ');
      record('Aceptación Cucumber', tags, scenario.steps.every((s) => s.result.status === 'passed'));
    }
  }
}

const results = {};
const detail = {};
for (const [id, entry] of [...outcomes.entries()].sort()) {
  results[id] = entry.failed > 0 ? 'Falló' : 'Pasó';
  detail[id] = { ...entry, suites: [...entry.suites] };
}

writeFileSync(join(here, '..', 'matrices', 'resultados-ejecucion.json'), JSON.stringify(results, null, 2) + '\n');
writeFileSync(join(reports, 'resumen-ejecucion.json'), JSON.stringify({ suites: suiteTotals, cases: detail }, null, 2) + '\n');

console.table(suiteTotals);
const counts = Object.values(results).reduce((acc, r) => ({ ...acc, [r]: (acc[r] ?? 0) + 1 }), {});
console.log('Casos ejecutados:', Object.keys(results).length, counts);
console.log('Fallidos:', Object.entries(results).filter(([, r]) => r === 'Falló').map(([id]) => id).join(', '));
