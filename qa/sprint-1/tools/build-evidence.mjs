// Genera UNA evidencia (imagen) por cada caso de la matriz, lista para el reporte.
// Cada ficha muestra: datos del caso, resultado obtenido, las pruebas que lo cubren (con el error
// esperado vs. obtenido si falló), las peticiones/respuestas de la API y las capturas de pantalla.
//
// Requisitos: haber ejecutado las suites (run-unit-api.sh, run-e2e.sh) y collect-results.mjs.
// Uso (desde qa/): node sprint-1/tools/build-evidence.mjs
// Salida: docs/modulo-1-historial-clinico/pruebas/sprint-1/evidencias/CP-xx-yy.jpg + README.md (índice)
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const sprint = join(here, '..');
const reports = join(sprint, 'reports');
const outDir = join(sprint, '..', '..', 'docs', 'modulo-1-historial-clinico', 'pruebas', 'sprint-1', 'evidencias');
const tmpDir = join(reports, 'evidence-tmp');
const manualDir = join(reports, 'e2e', 'evidencias');

const { CASES, DESIGN_DATE } = await import(pathToFileURL(join(sprint, 'matrices', 'casos-prueba.mjs')).href);
const read = (file) => (existsSync(file) ? readFileSync(file, 'utf8') : null);
const json = (file) => { const text = read(file); return text ? JSON.parse(text) : null; };
const results = json(join(sprint, 'matrices', 'resultados-ejecucion.json')) ?? {};
const summary = json(join(reports, 'resumen-ejecucion.json')) ?? { cases: {} };

// Mismo criterio que collect-results.mjs: "CP-07-05/06" → CP-07-05 y CP-07-06.
function caseIds(title) {
  const ids = [];
  for (const [, hu, first, rest] of title.matchAll(/CP-(\d{2})-(\d{2})((?:\/\d{2})*)/g)) {
    ids.push(`CP-${hu}-${first}`);
    for (const extra of rest.split('/').filter(Boolean)) ids.push(`CP-${hu}-${extra}`);
  }
  return ids;
}
const byCase = new Map();
const add = (title, kind, item) => {
  for (const id of caseIds(title)) {
    const entry = byCase.get(id) ?? { tests: [], calls: [], images: [], texts: [] };
    entry[kind].push(item);
    byCase.set(id, entry);
  }
};
const clean = (text) => String(text ?? '')
  .replace(/\u001b\[[0-9;]*m/g, '').replace(/\]633;[^\u0007\n]*(\u0007)?/g, '').replace(/\r/g, '');

// 1) Pruebas Vitest (unitarias API/frontend y Supertest).
for (const [suite, file] of [
  ['Unitaria (Vitest · API)', 'unit/results.json'],
  ['Unitaria (Vitest · frontend)', 'unit-frontend/results.json'],
  ['Integración API (Supertest)', 'api/results.json'],
]) {
  for (const testFile of json(join(reports, file))?.testResults ?? []) {
    const fileName = testFile.name.split(/[\\/]/).slice(-2).join('/');
    for (const t of testFile.assertionResults) {
      const error = clean(t.failureMessages?.[0]).split('\n').filter((l) => l.trim() && !/^\s+at /.test(l)).slice(0, 4).join('\n');
      add(t.title, 'tests', { suite, title: t.title, file: fileName, status: t.status, error });
    }
  }
}

// 2) Peticiones grabadas por Supertest (nombre completo de la prueba → llamadas).
for (const [name, calls] of Object.entries(json(join(reports, 'api', 'calls.json')) ?? {})) {
  for (const call of calls) add(name, 'calls', call);
}

// 3) Newman: una <testsuite> por petición.
const newman = read(join(reports, 'newman', 'newman-junit.xml'));
for (const [, attrs, body] of newman?.matchAll(/<testsuite ([^>]*)>([\s\S]*?)<\/testsuite>/g) ?? []) {
  const name = /name="([^"]*)"/.exec(attrs)?.[1] ?? '';
  const failures = [...body.matchAll(/<failure[^>]*message="([^"]*)"/g)].map((m) => m[1]);
  add(name, 'tests', { suite: 'Integración API (Newman)', title: name.split(' / ').pop(), status: failures.length ? 'failed' : 'passed', error: failures.join('\n') });
}

// 4) Playwright: estado y captura de pantalla final de cada prueba.
const walk = (suite) => {
  for (const spec of suite.specs ?? []) {
    const result = spec.tests?.[0]?.results?.at(-1);
    if (!result || spec.tests.every((t) => t.status === 'skipped')) continue;
    const error = clean(result.errors?.[0]?.message ?? result.error?.message).split('\n').filter((l) => l.trim()).slice(0, 4).join('\n');
    add(spec.title, 'tests', { suite: 'E2E (Playwright)', title: spec.title, file: spec.file, status: spec.ok ? 'passed' : 'failed', error });
    for (const a of result.attachments ?? []) {
      if (a.contentType === 'image/png' && a.path && existsSync(a.path)) add(spec.title, 'images', { path: a.path, caption: `Playwright – ${spec.ok ? 'pantalla final' : 'pantalla al fallar'}` });
    }
  }
  for (const child of suite.suites ?? []) walk(child);
};
for (const suite of json(join(reports, 'e2e', 'playwright-results.json'))?.suites ?? []) walk(suite);

// 5) Cucumber: estado por escenario (etiqueta @CP-…) y su captura.
for (const feature of json(join(reports, 'e2e', 'cucumber-report.json')) ?? []) {
  for (const scenario of feature.elements) {
    const tags = scenario.tags.map((t) => t.name).join(' ');
    const failed = scenario.steps.find((s) => s.result.status !== 'passed');
    add(tags, 'tests', {
      suite: 'Aceptación (Cucumber.js)', title: `${feature.name} · ${scenario.name}`, status: failed ? 'failed' : 'passed',
      error: failed ? `${failed.keyword}${failed.name}\n${clean(failed.result.error_message).split('\n').slice(0, 3).join('\n')}` : '',
    });
  }
}

// 6) Archivos de evidencia guardados en la carpeta (capturas puntuales y evidencias manuales).
for (const file of existsSync(manualDir) ? readdirSync(manualDir) : []) {
  const path = join(manualDir, file);
  const id = file.replace(/^cucumber-/, '');
  if (/\.png$/i.test(file)) add(id, 'images', { path, caption: file.startsWith('cucumber-') ? 'Cucumber.js – pantalla final del escenario' : `Captura: ${file}` });
  if (/\.txt$/i.test(file)) add(id, 'texts', { name: file, content: clean(read(path)).split('\n').filter((l) => !/^\*+$|^(Hora de|Nombre de|Usuario|Máquina|Aplicación|Id\. de|PS(Version|Edition|Compatible)|BuildVersion|CLRVersion|WSMan|PSRemoting|Serialization)/.test(l)).slice(-45).join('\n') });
}

// ───────────── Render ─────────────
const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pretty = (v, max = 900) => { const text = JSON.stringify(v, null, 2) ?? ''; return text.length > max ? `${text.slice(0, max)}\n…` : text; };
const STATE = {
  'Pasó': ['#E7F6EC', '#1E7B3A'], 'Falló': ['#FDECEC', '#B42318'], 'Bloqueado': ['#FFF4E5', '#B54708'], 'Sin ejecutar': ['#F2F4F7', '#475467'],
};
const testBadge = (s) => (s === 'passed' ? '<b class="ok">✔ Pasó</b>' : '<b class="ko">✘ Falló</b>');

function card(c, ev, alias) {
  const result = results[c.id] ?? 'Sin ejecutar';
  const source = summary.cases[c.id]?.source ?? (ev ? 'automatizada' : 'sin ejecutar');
  const [bg, fg] = STATE[result] ?? STATE['Sin ejecutar'];
  const tests = ev?.tests ?? [];
  const calls = ev?.calls ?? [];
  const images = [...new Map((ev?.images ?? []).map((i) => [i.path, i])).values()].slice(0, 4);
  const texts = ev?.texts ?? [];
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
  body{margin:0;background:#fff;font:14px/1.45 'Segoe UI',Arial,sans-serif;color:#101828;width:1100px}
  .wrap{padding:24px 28px}
  h1{margin:0;font-size:22px} .sub{color:#475467;margin-top:2px}
  .state{display:inline-block;padding:6px 14px;border-radius:8px;font-weight:700;font-size:16px;background:${bg};color:${fg};border:1px solid ${fg}}
  .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #2F5597;padding-bottom:12px;margin-bottom:14px}
  table.meta{border-collapse:collapse;width:100%;margin-bottom:14px} table.meta td{border:1px solid #D0D5DD;padding:6px 9px;vertical-align:top}
  table.meta td.k{background:#EEF2F8;font-weight:600;width:170px}
  h2{font-size:15px;margin:18px 0 8px;color:#2F5597;border-bottom:1px solid #D0D5DD;padding-bottom:4px}
  .t{border:1px solid #D0D5DD;border-radius:6px;padding:7px 10px;margin-bottom:6px}
  .t small{color:#667085} .ok{color:#1E7B3A} .ko{color:#B42318}
  pre{margin:6px 0 0;background:#F8F9FB;border:1px solid #EAECF0;border-radius:4px;padding:7px 9px;font:12px/1.4 Consolas,monospace;white-space:pre-wrap;word-break:break-word}
  pre.err{background:#FEF3F2;border-color:#FECDCA;color:#912018}
  .call{display:grid;grid-template-columns:1fr 1fr;gap:8px;border:1px solid #D0D5DD;border-radius:6px;padding:8px 10px;margin-bottom:8px}
  .call .h{grid-column:1/3;font-weight:600} .code{font-weight:700} .c2{color:#1E7B3A} .c4,.c5{color:#B42318}
  figure{margin:0 0 12px} figure img{max-width:100%;border:1px solid #D0D5DD;border-radius:4px} figcaption{color:#475467;font-size:12px}
  .foot{margin-top:14px;color:#667085;font-size:12px;border-top:1px solid #EAECF0;padding-top:8px}
  </style></head><body><div class="wrap">
  <div class="head"><div><h1>${esc(alias ?? c.id)} · ${esc(c.hu)}${alias ? ` <small style="font-size:14px;color:#475467;font-weight:400">(matriz QA: ${esc(c.id)})</small>` : ""}</h1><div class="sub">${esc(c.desc)}</div></div><span class="state">${esc(result)}</span></div>
  <table class="meta">
    <tr><td class="k">Tipo de prueba</td><td>${esc(c.tipo)} · ${esc(c.ref ?? '')}</td><td class="k">Nivel</td><td>${esc(c.nivel)}</td></tr>
    <tr><td class="k">Precondiciones</td><td colspan="3">${esc(c.pre)}</td></tr>
    <tr><td class="k">Datos de prueba</td><td colspan="3">${esc(c.datos ?? '—')}</td></tr>
    <tr><td class="k">Resultado esperado</td><td colspan="3">${esc(c.esperado)}</td></tr>
    <tr><td class="k">Ejecución</td><td colspan="3">${source === 'manual' ? 'Manual (resultado registrado por el tester; ver evidencia adjunta)' : source === 'automatizada' ? `Automatizada · ${tests.length} prueba(s)` : 'Sin ejecutar'}</td></tr>
  </table>
  ${tests.length ? `<h2>Pruebas ejecutadas</h2>${tests.map((t) => `<div class="t">${testBadge(t.status)} &nbsp;<b>${esc(t.suite)}</b> — ${esc(t.title)}${t.file ? `<br><small>${esc(t.file)}</small>` : ''}${t.error ? `<pre class="err">${esc(t.error)}</pre>` : ''}</div>`).join('')}` : ''}
  ${calls.length ? `<h2>Peticiones a la API y consultas a la base (Staging)</h2>${calls.slice(0, 7).map((k) => k.method === 'SQL'
    ? `<div class="call"><div class="h">Consulta SQL &nbsp;<small>${esc(k.as)}</small> &nbsp;→ <span class="code">${k.status} fila(s)</span></div><div><small>Consulta</small><pre>${esc(k.path)}${k.body ? `\n-- parámetros: ${esc(JSON.stringify(k.body))}` : ''}</pre></div><div><small>Resultado</small><pre>${esc(pretty(k.response, 900))}</pre></div></div>`
    : `<div class="call"><div class="h">${esc(k.method)} ${esc(k.path)} &nbsp;<small>como: ${esc(k.as)}</small> &nbsp;→ <span class="code c${String(k.status)[0]}">HTTP ${k.status}</span> &nbsp;${esc(k.response?.message ?? '')}</div><div><small>Petición</small><pre>${esc(pretty(k.body, 600))}</pre></div><div><small>Respuesta</small><pre>${esc(pretty(k.response, 700))}</pre></div></div>`).join('')}${calls.length > 7 ? `<small>(+${calls.length - 7} registros más en qa/sprint-1/reports/api/calls.json)</small>` : ''}` : ''}
  ${texts.length ? `<h2>Evidencia manual (salida de consola)</h2>${texts.map((t) => `<small>${esc(t.name)}</small><pre>${esc(t.content)}</pre>`).join('')}` : ''}
  ${images.length ? `<h2>Capturas de pantalla</h2>${images.map((i) => `<figure><img src="${pathToFileURL(i.path).href}"><figcaption>${esc(i.caption)}</figcaption></figure>`).join('')}` : ''}
  ${!tests.length && !calls.length && !images.length && !texts.length ? '<h2>Evidencia</h2><p>No hay evidencia registrada para este caso.</p>' : ''}
  <div class="foot">VetManage · QA Sprint 1 · Ambiente Staging local · Diseño ${esc(DESIGN_DATE)} · Generado ${new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}</div>
  </div></body></html>`;
}

rmSync(tmpDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });
mkdirSync(outDir, { recursive: true });
for (const f of readdirSync(outDir)) if (/^CP-.*\.(jpg|png)$/.test(f)) rmSync(join(outDir, f));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 800 }, deviceScaleFactor: 1 });
const index = [];
for (const c of CASES) {
  const ev = byCase.get(c.id);
  const html = join(tmpDir, `${c.id}.html`);
  writeFileSync(html, card(c, ev));
  await page.goto(pathToFileURL(html).href);
  await page.waitForLoadState('load');
  const file = `${c.id}.jpg`;
  await page.screenshot({ path: join(outDir, file), fullPage: true, type: 'jpeg', quality: 80 });
  const kinds = [ev?.tests.length && 'pruebas', ev?.calls.length && 'API', ev?.images.length && 'capturas', ev?.texts.length && 'consola'].filter(Boolean);
  index.push(`| ${c.id} | ${c.hu} | ${results[c.id] ?? 'Sin ejecutar'} | ${kinds.join(', ') || '—'} | [${file}](${file}) |`);
}
// Copias con la nomenclatura de la hoja del equipo (CP-016 …), para ubicarlas en el reporte.
const aliasFile = join(sprint, 'matrices', 'equivalencia-cp-equipo.json');
const aliasIndex = [];
for (const [alias, id] of Object.entries(json(aliasFile)?.map ?? {})) {
  const c = CASES.find((k) => k.id === id);
  if (!c) continue;
  const html = join(tmpDir, `${alias}.html`);
  writeFileSync(html, card(c, byCase.get(id), alias));
  await page.goto(pathToFileURL(html).href);
  await page.waitForLoadState('load');
  await page.screenshot({ path: join(outDir, `${alias}.jpg`), fullPage: true, type: 'jpeg', quality: 80 });
  aliasIndex.push(`| ${alias} | ${id} | ${c.hu} | ${esc(c.desc)} | ${results[id] ?? 'Sin ejecutar'} | [${alias}.jpg](${alias}.jpg) |`);
}
await browser.close();
rmSync(tmpDir, { recursive: true, force: true });

writeFileSync(join(outDir, 'README.md'), [
  '# Evidencias por caso de prueba – Sprint 1',
  '',
  '> Generadas por `qa/sprint-1/tools/build-evidence.mjs` a partir de los reportes de ejecución. Cada imagen es la ficha del caso: datos, resultado, pruebas que lo cubren (con el error si falló), peticiones/respuestas de la API y capturas de pantalla.',
  '',
  ...(aliasIndex.length ? ['## Según la hoja del equipo (Casos de Prueba por HU Módulo 1)', '', 'Equivalencia verificada en `qa/sprint-1/matrices/equivalencia-cp-equipo.json`.', '', '| ID equipo | ID matriz QA | HU | Caso | Resultado (retest 20/11) | Evidencia |', '| --- | --- | --- | --- | --- | --- |', ...aliasIndex, '', '## Según la matriz QA', ''] : []),
  '| Caso | HU | Resultado | Contiene | Evidencia |',
  '| --- | --- | --- | --- | --- |',
  ...index,
  '',
].join('\n'));
console.log(`Evidencias generadas: ${index.length} (matriz QA) + ${aliasIndex.length} (nomenclatura del equipo) en ${outDir}`);
