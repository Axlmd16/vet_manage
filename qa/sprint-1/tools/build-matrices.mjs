// Genera los entregables de las matrices (Markdown + Excel) desde las fuentes de datos.
// Uso (desde qa/): npm run matrices
import ExcelJS from 'exceljs';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const sprint = join(here, '..');
const docsDir = join(sprint, '..', '..', 'docs', 'modulo-1-historial-clinico', 'pruebas', 'sprint-1');
const deliverables = join(docsDir, 'entregables');
mkdirSync(deliverables, { recursive: true });

const md = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, '<br>');

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5597' } };
const LABEL_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B9BD5' } };
const BORDER = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

// ───────────── Matriz de casos de prueba ─────────────
async function buildCases() {
  const { CASES, DESIGN_DATE } = await import(pathToFileURL(join(sprint, 'matrices', 'casos-prueba.mjs')).href);
  const results = loadResults();

  const columns = [
    ['ID', 'id', 11], ['HU', 'hu', 8], ['Fecha de diseño', 'fecha', 12], ['Precondiciones', 'pre', 38],
    ['Descripción', 'desc', 38], ['Pasos', 'pasos', 48], ['Datos de prueba', 'datos', 34],
    ['Resultado esperado', 'esperado', 50], ['Tipo de prueba', 'tipo', 13], ['Nivel / herramienta', 'nivel', 24],
    ['Escenario / riesgo', 'ref', 14], ['Resultado de ejecución', 'estado', 14],
  ];
  const rows = CASES.map((c) => ({
    ...c,
    fecha: DESIGN_DATE,
    pasos: c.pasos.map((step, i) => `${i + 1}. ${step}`).join('\n'),
    estado: results[c.id] ?? 'Pendiente',
  }));

  const wb = new ExcelJS.Workbook();
  wb.creator = 'QA VetManage';
  const ws = wb.addWorksheet('Casos de prueba', { views: [{ state: 'frozen', ySplit: 1, xSplit: 1 }] });
  ws.columns = columns.map(([header, key, width]) => ({ header, key, width }));
  rows.forEach((row) => ws.addRow(row));
  ws.getRow(1).eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  });
  ws.eachRow((row, n) => row.eachCell((cell) => {
    cell.border = BORDER;
    if (n > 1) cell.alignment = { vertical: 'top', wrapText: true };
  }));
  ws.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + columns.length)}1` };

  const summary = wb.addWorksheet('Resumen');
  summary.columns = [{ header: 'HU', key: 'hu', width: 10 }, { header: 'Positiva', key: 'Positiva', width: 10 },
    { header: 'Negativa', key: 'Negativa', width: 10 }, { header: 'Valor límite', key: 'Valor límite', width: 12 },
    { header: 'Total', key: 'total', width: 8 }];
  const byHu = {};
  for (const c of CASES) {
    byHu[c.hu] ??= { hu: c.hu, Positiva: 0, Negativa: 0, 'Valor límite': 0, total: 0 };
    byHu[c.hu][c.tipo] += 1;
    byHu[c.hu].total += 1;
  }
  const totals = { hu: 'TOTAL', Positiva: 0, Negativa: 0, 'Valor límite': 0, total: 0 };
  for (const r of Object.values(byHu)) {
    summary.addRow(r);
    for (const k of ['Positiva', 'Negativa', 'Valor límite', 'total']) totals[k] += r[k];
  }
  summary.addRow(totals).font = { bold: true };
  summary.getRow(1).eachCell((cell) => { cell.fill = HEADER_FILL; cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; });

  await wb.xlsx.writeFile(join(deliverables, 'matriz-casos-prueba-sprint-1.xlsx'));

  const lines = [
    '# Matriz de casos de prueba – Sprint 1',
    '',
    '> Archivo generado por `qa/sprint-1/tools/build-matrices.mjs` desde `qa/sprint-1/matrices/casos-prueba.mjs`. No editar a mano: editar la fuente y ejecutar `npm run matrices` en `qa/`.',
    '> Versión Excel: [`entregables/matriz-casos-prueba-sprint-1.xlsx`](entregables/matriz-casos-prueba-sprint-1.xlsx).',
    '',
    '## Resumen por HU y tipo de prueba',
    '',
    '| HU | Positiva | Negativa | Valor límite | Total |',
    '| --- | :-: | :-: | :-: | :-: |',
    ...Object.values(byHu).map((r) => `| ${r.hu} | ${r.Positiva} | ${r.Negativa} | ${r['Valor límite']} | ${r.total} |`),
    `| **TOTAL** | **${totals.Positiva}** | **${totals.Negativa}** | **${totals['Valor límite']}** | **${totals.total}** |`,
    '',
    '## Casos',
    '',
    `| ${columns.map(([h]) => h).join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    ...rows.map((r) => `| ${columns.map(([, key]) => md(r[key])).join(' | ')} |`),
    '',
  ];
  writeFileSync(join(docsDir, '01-matriz-casos-prueba.md'), lines.join('\n'), 'utf8');
  console.log(`Matriz de casos: ${CASES.length} casos.`);
}

// Resultados de ejecución (los llena la Etapa 2/3). Formato: { "CP-51-01": "Pasó" | "Falló" | "Bloqueado" }.
function loadResults() {
  const file = join(sprint, 'matrices', 'resultados-ejecucion.json');
  if (!existsSync(file)) return {};
  return JSON.parse(readFileSync(file, 'utf8'));
}

// ───────────── Matriz de errores (formato de la plantilla) ─────────────
async function buildDefects() {
  const file = join(sprint, 'matrices', 'defectos.mjs');
  if (!existsSync(file)) return;
  const { DEFECTS } = await import(pathToFileURL(file).href);

  const fields = [
    ['ID', 'id'], ['USER_STORY_ID', 'userStory'], ['FUNCIONALIDAD', 'funcionalidad'], ['TITLE', 'title'],
    ['REPRO_STEPS', 'repro'], ['ASSIGNED TO', 'assignedTo'], ['SEVERITY', 'severity'], ['PRIORITY', 'priority'],
    ['REASON', 'reason'], ['BUG_CYCLE', 'bugCycle'], ['STATE', 'state'], ['CREATED BY', 'createdBy'],
    ['CREATED DATE', 'createdDate'],
  ];

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Defectos reportados', { views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }] });
  ws.getColumn(1).width = 18;
  DEFECTS.forEach((_, i) => { ws.getColumn(i + 2).width = 42; });

  const head = ws.getRow(1);
  head.getCell(1).value = 'ITEMS';
  head.getCell(2).value = 'DEFECTOS REPORTADOS';
  if (DEFECTS.length > 1) ws.mergeCells(1, 2, 1, DEFECTS.length + 1);
  [1, 2].forEach((col) => {
    const cell = head.getCell(col);
    cell.fill = HEADER_FILL;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  fields.forEach(([label, key], index) => {
    const row = ws.getRow(index + 2);
    row.getCell(1).value = label;
    row.getCell(1).fill = LABEL_FILL;
    row.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    DEFECTS.forEach((defect, i) => {
      const cell = row.getCell(i + 2);
      cell.value = key === 'repro' ? defect.repro.join('\n') : defect[key];
      cell.alignment = { vertical: 'top', wrapText: true };
      if (['severity', 'state'].includes(key)) cell.border = { ...BORDER, top: { style: 'medium', color: { argb: 'FFFF0000' } }, bottom: { style: 'medium', color: { argb: 'FFFF0000' } }, left: { style: 'medium', color: { argb: 'FFFF0000' } }, right: { style: 'medium', color: { argb: 'FFFF0000' } } };
    });
    row.eachCell((cell) => { cell.border ??= BORDER; if (!cell.border.top) cell.border = BORDER; });
  });

  // Vista tabular (una fila por defecto) para filtrar en Excel.
  const flat = wb.addWorksheet('Vista tabla');
  flat.columns = fields.map(([header, key]) => ({ header, key, width: key === 'repro' ? 60 : 20 }));
  DEFECTS.forEach((d) => flat.addRow({ ...d, repro: d.repro.join('\n') }));
  flat.getRow(1).eachCell((cell) => { cell.fill = HEADER_FILL; cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; });
  flat.eachRow((row, n) => n > 1 && row.eachCell((cell) => { cell.alignment = { vertical: 'top', wrapText: true }; }));

  await wb.xlsx.writeFile(join(deliverables, 'matriz-errores-sprint-1.xlsx'));

  const lines = [
    '# Matriz de errores – Sprint 1',
    '',
    '> Generado por `qa/sprint-1/tools/build-matrices.mjs` desde `qa/sprint-1/matrices/defectos.mjs`.',
    '> Versión Excel (formato de la plantilla, un defecto por columna): [`entregables/matriz-errores-sprint-1.xlsx`](entregables/matriz-errores-sprint-1.xlsx).',
    '',
    '| ITEMS | ' + DEFECTS.map((d) => d.id).join(' | ') + ' |',
    '| --- | ' + DEFECTS.map(() => '---').join(' | ') + ' |',
    ...fields.map(([label, key]) => `| **${label}** | ${DEFECTS.map((d) => md(key === 'repro' ? d.repro.join('\n') : d[key])).join(' | ')} |`),
    '',
  ];
  writeFileSync(join(docsDir, '05-matriz-errores.md'), lines.join('\n'), 'utf8');
  console.log(`Matriz de errores: ${DEFECTS.length} defectos.`);
}

// ───────────── Documento de datos semilla ─────────────
function buildSeedDoc() {
  const seed = JSON.parse(readFileSync(join(sprint, 'staging', 'seed', 'qa-seed.data.json'), 'utf8'));
  const roleNames = {
    administrator: 'Administrador', manager: 'Gerente', veterinarian: 'Veterinario',
    veterinary_technician: 'Técnico Veterinario', receptionist: 'Recepcionista', cashier: 'Cajero',
    warehouse_keeper: 'Bodeguero', client: 'Cliente',
  };
  const owners = Object.fromEntries(seed.clients.map((c) => [c.key, `${c.firstName} ${c.lastName}`]));
  const lines = [
    '# Datos semilla – Sprint 1',
    '',
    '> Generado desde `qa/sprint-1/staging/seed/qa-seed.data.json` (fuente única). El SQL se genera con `npm run seed:sql` y se carga/respalda con `pg_restore`/`pg_dump` (ver [03-staging-y-ejecucion-unit-api.md](03-staging-y-ejecucion-unit-api.md)).',
    '',
    `- Contraseña común de las cuentas QA: \`${seed.password}\` (solo para el ambiente Staging local).`,
    '- Todas las cédulas cumplen el algoritmo módulo 10 (provincia 11 – Loja). Las cédulas de los ejemplos de las HU (1104567890, 1105555555) **no** son válidas, por eso se reemplazaron.',
    '- Además de esta semilla, Staging carga el seed de la aplicación (`npm run seed`): especies Canino, Felino, Bovino, Equino, Porcino, Conejo, Ave, Reptil y sus razas.',
    '',
    '## 1. Usuarios – los 8 roles del sistema',
    '',
    '| # | Rol | Nombre | Cédula | Correo | Estado | Uso en las pruebas |',
    '| :-: | --- | --- | --- | --- | --- | --- |',
    ...seed.users.slice(0, 8).map((u, i) => `| ${i + 1} | ${u.roles.map((r) => roleNames[r]).join(' + ')} | ${u.firstName} ${u.lastName} | ${u.identification} | ${u.email} | ${u.status ?? 'ACTIVE'} | ${md(u.purpose)} |`),
    '',
    '## 2. Usuarios para escenarios específicos',
    '',
    '| Rol(es) | Nombre | Cédula | Correo | Estado | Uso en las pruebas |',
    '| --- | --- | --- | --- | --- | --- |',
    ...seed.users.slice(8).map((u) => `| ${u.roles.map((r) => roleNames[r]).join(' + ')} | ${u.firstName} ${u.lastName} | ${u.identification} | ${u.email} | ${u.status ?? 'ACTIVE'}${u.mustChangePassword ? ' · contraseña temporal' : ''} | ${md(u.purpose)} |`),
    '',
    '## 3. Clientes',
    '',
    '| Nombre | Cédula | Correo | Teléfono | Dirección | Estado | Uso en las pruebas |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...seed.clients.map((c) => `| ${c.firstName} ${c.lastName} | ${c.identification} | ${c.email} | ${c.phone} | ${c.address ?? '—'} | ${c.status} | ${md(c.purpose)} |`),
    '',
    '## 4. Pacientes',
    '',
    '| Nombre | Especie / raza | Sexo | Nacimiento | Peso (kg) | Talla (cm) | Estado reproductivo | Color | Dueño |',
    '| --- | --- | --- | --- | :-: | :-: | --- | --- | --- |',
    ...seed.pets.map((p) => `| ${p.name} | ${p.species} / ${p.breed} | ${p.sex} | ${p.birthDate} | ${p.weightKg} | ${p.heightCm} | ${p.reproductiveStatus} | ${p.color ?? '—'} | ${owners[p.client]} |`),
    '',
    '## 5. Catálogo adicional',
    '',
    ...seed.species.map((s) => `- Especie **${s.name}** (${s.isActive ? 'activa' : 'inactiva'}): ${s.purpose}`),
    '',
    '## 6. Cédulas reservadas para crear registros nuevos',
    '',
    'No existen en la semilla; las pruebas las usan para altas. Como la base se restaura antes de cada corrida, se pueden reutilizar.',
    '',
    seed.reservedIdentifications.values.map((v) => `\`${v}\``).join(' · '),
    '',
  ];
  writeFileSync(join(docsDir, '02-datos-semilla.md'), lines.join('\n'), 'utf8');
  console.log('Documento de datos semilla generado.');
}

await buildCases();
buildSeedDoc();
await buildDefects();
