// Genera matrices de casos y defectos para HU-06, HU-12, HU-17 y HU-57.
// Uso (desde qa/): node sprint-1/tools/build-matrices-historias.mjs
import ExcelJS from 'exceljs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const sprint = join(here, '..');
const docsDir = join(sprint, '..', '..', 'docs', 'modulo-1-historial-clinico', 'pruebas', 'sprint-1');
const outputDir = join(docsDir, 'entregables');
const { CASES } = await import(pathToFileURL(join(sprint, 'matrices', 'casos-prueba.mjs')).href);
const { DEFECTS } = await import(pathToFileURL(join(sprint, 'matrices', 'defectos.mjs')).href);
const results = JSON.parse(readFileSync(join(sprint, 'matrices', 'resultados-ejecucion.json'), 'utf8'));

const stories = new Set(['HU-06', 'HU-12', 'HU-17', 'HU-57']);
const requirementByStory = { 'HU-06': 'RF-06', 'HU-12': 'RF-08', 'HU-17': 'RF-17', 'HU-57': 'RF-61' };
const priorityByCase = {
  'CP-06-01': 'Alta', 'CP-06-02': 'Alta', 'CP-06-03': 'Media', 'CP-06-04': 'Alta',
  'CP-12-01': 'Alta', 'CP-12-02': 'Alta', 'CP-12-03': 'Alta', 'CP-12-04': 'Alta',
  'CP-12-05': 'Media', 'CP-12-06': 'Media', 'CP-12-07': 'Media', 'CP-12-08': 'Alta', 'CP-12-09': 'Alta',
  'CP-17-01': 'Alta', 'CP-17-02': 'Media', 'CP-17-03': 'Alta', 'CP-17-04': 'Alta',
  'CP-17-05': 'Media', 'CP-17-06': 'Baja', 'CP-17-07': 'Alta', 'CP-17-08': 'Media',
  'CP-17-09': 'Alta', 'CP-17-10': 'Alta',
  'CP-57-01': 'Alta', 'CP-57-02': 'Media', 'CP-57-03': 'Alta', 'CP-57-04': 'Media',
  'CP-57-05': 'Alta', 'CP-57-06': 'Alta', 'CP-57-07': 'Media', 'CP-57-08': 'Alta',
  'CP-57-09': 'Alta', 'CP-57-10': 'Alta',
};
const rolesByCase = {
  'CP-06-04': 'Cajero (sin permiso de consulta)',
  'CP-12-09': 'Cajero (sin permiso de consulta)',
  'CP-17-10': 'Sin token y Recepcionista',
  'CP-57-01': 'Veterinario',
  'CP-57-02': 'Gerente y Administrador',
  'CP-57-03': 'Usuario con credenciales inválidas / correo inexistente',
  'CP-57-04': 'Usuario sin credenciales',
  'CP-57-05': 'Usuario qa.bloqueo',
  'CP-57-06': 'Usuario qa.bloqueo bloqueado',
  'CP-57-07': 'Usuario qa.contador',
  'CP-57-08': 'Usuario inactivo o dado de baja',
  'CP-57-09': 'Usuario con contraseña temporal',
  'CP-57-10': 'Sin token y token alterado',
};
const evidenceByCase = {
  'CP-06-01': 'qa/sprint-1/reports/e2e/evidencias/CP-06-01-clientes-placeholder.png',
  'CP-06-02': 'Verificación manual API: HTTP 200, resultados vacíos (sin captura guardada).',
  'CP-06-03': 'qa/sprint-1/reports/e2e/evidencias/CP-06-01-clientes-placeholder.png',
  'CP-06-04': 'Verificación manual API: HTTP 403 para Cajero (sin captura guardada).',
  'CP-12-01': 'qa/sprint-1/reports/e2e/evidencias/CP-12-01-pacientes-placeholder.png; API HTTP 404.',
  'CP-17-04': 'qa/sprint-1/reports/e2e/evidencias/CP-17-04-especies-disponibles.png',
  'CP-57-01': 'qa/sprint-1/reports/e2e/evidencias/cucumber-CP-57-01.png',
  'CP-57-05': 'qa/sprint-1/reports/e2e/evidencias/CP-57-05-bloqueo.png',
  'CP-57-09': 'qa/sprint-1/reports/test-results/01-login-HU-57-Iniciar-ses-c622c-o-obligatorio-de-contraseña-chromium/test-failed-1.png',
};
const observationsByCase = {
  'CP-06-01': 'Falló: pantalla sin consulta y API no incluye mascotas. DEF-08 y DEF-10.',
  'CP-06-02': 'Falló: buscar “lucia” no devuelve a Lucía Ordóñez. DEF-09.',
  'CP-06-03': 'Bloqueado: no existe la búsqueda en la pantalla Clientes. DEF-08.',
  'CP-06-04': 'Pasó: el API respondió HTTP 403 al Cajero.',
  'CP-12-01': 'Falló: pantalla de consulta no implementada y GET /pets responde 404. DEF-11.',
  'CP-12-02': 'Bloqueado: no existe búsqueda por código mientras falte la consulta de pacientes.',
  'CP-12-03': 'Bloqueado: no existe búsqueda de pacientes por nombre del cliente.',
  'CP-12-04': 'Bloqueado: no existe búsqueda de pacientes por cédula del cliente.',
  'CP-12-05': 'Bloqueado: no existe la búsqueda de pacientes que ignore tildes.',
  'CP-12-06': 'Bloqueado: no existe la búsqueda de pacientes sin resultados.',
  'CP-12-07': 'Bloqueado: no existe el formulario de búsqueda para probar el criterio vacío.',
  'CP-12-08': 'Bloqueado: no existe la consulta para verificar los estados de pacientes.',
  'CP-12-09': 'Pendiente: GET /pets responde 404; no se pudo verificar el control de permisos.',
  'CP-17-01': 'Pasó: el registro de raza respondió HTTP 201.',
  'CP-17-02': 'Pendiente: no se ejecutó esta validación.',
  'CP-17-03': 'Pendiente: no se ejecutó esta validación.',
  'CP-17-04': 'Pasó: el selector mostró especies activas y excluyó Hurón.',
  'CP-17-05': 'Pendiente: no se ejecutó este caso.',
  'CP-17-06': 'Pendiente: no se ejecutó este caso E2E.',
  'CP-17-07': 'Pasó: el nombre duplicado en Canino respondió HTTP 409.',
  'CP-17-08': 'Pasó: el mismo nombre en Conejo respondió HTTP 201.',
  'CP-17-09': 'Pasó: asociar una raza a Hurón inactiva respondió HTTP 409.',
  'CP-17-10': 'Pasó: solicitud sin token respondió HTTP 401 y Recepcionista HTTP 403.',
  'CP-57-09': 'Falló: con contraseña temporal se abre la pantalla principal, no el cambio obligatorio. DEF-06.',
};
const defectCases = {
  'DEF-06': 'CP-57-09',
  'DEF-08': 'CP-06-01, CP-06-03',
  'DEF-09': 'CP-06-02',
  'DEF-10': 'CP-06-01',
  'DEF-11': 'CP-12-01; CP-12-02 a CP-12-08 bloqueados',
};
const defectTypes = {
  'DEF-06': 'Autenticación / flujo de acceso',
  'DEF-08': 'Funcional / interfaz',
  'DEF-09': 'Funcional / búsqueda',
  'DEF-10': 'Funcional / datos relacionados',
  'DEF-11': 'Funcional / consulta API e interfaz',
};

function roleFor(testCase) {
  if (rolesByCase[testCase.id]) return rolesByCase[testCase.id];
  if (testCase.hu === 'HU-06') return 'Recepcionista';
  if (testCase.hu === 'HU-12') return 'Recepcionista, Gerente, Veterinario o Técnico Veterinario';
  if (testCase.hu === 'HU-17') return 'Veterinario';
  return 'Usuario del rol indicado en la precondición';
}

function createTableWorkbook(sheetName, columns, rows, fileName) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'QA VetManage';
  const sheet = workbook.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = columns.map(([header, key, width]) => ({ header, key, width }));
  rows.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).height = 42;
  sheet.getRow(1).eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5597' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  });
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD9E2F3' } },
        left: { style: 'thin', color: { argb: 'FFD9E2F3' } },
        bottom: { style: 'thin', color: { argb: 'FFD9E2F3' } },
        right: { style: 'thin', color: { argb: 'FFD9E2F3' } },
      };
    });
  });
  sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + columns.length)}1` };
  return workbook.xlsx.writeFile(join(outputDir, fileName));
}

const selectedCases = CASES.filter((testCase) => stories.has(testCase.hu));
const caseColumns = [
  ['ID', 'id', 14],
  ['Requisito Funcional RF', 'rf', 18],
  ['ID Historia de usuario', 'hu', 20],
  ['Tipo de prueba Ágil', 'agileType', 18],
  ['Escenario / Criterio', 'scenario', 42],
  ['Nivel / Tipo de prueba', 'level', 28],
  ['Rol', 'role', 38],
  ['Prioridad en función del Riesgo', 'priority', 22],
  ['Precondición', 'precondition', 45],
  ['Pasos de ejecución', 'steps', 48],
  ['Datos de prueba', 'data', 36],
  ['Resultado esperado', 'expected', 48],
  ['Evidencia (foto) / PR', 'evidence', 56],
  ['Responsable', 'owner', 24],
  ['Estado', 'state', 16],
  ['Observación', 'observation', 52],
];
const caseRows = selectedCases.map((testCase) => ({
  id: testCase.id,
  rf: requirementByStory[testCase.hu],
  hu: testCase.hu,
  agileType: testCase.tipo,
  scenario: `${testCase.ref}: ${testCase.desc}`,
  level: testCase.nivel,
  role: roleFor(testCase),
  priority: priorityByCase[testCase.id] ?? 'Media',
  precondition: testCase.pre,
  steps: testCase.pasos.map((step, index) => `${index + 1}. ${step}`).join('\n'),
  data: testCase.datos,
  expected: testCase.esperado,
  evidence: evidenceByCase[testCase.id] ?? 'Resultado consolidado en qa/sprint-1/reports/resumen-ejecucion.json.',
  owner: 'QA (nombre por completar)',
  state: results[testCase.id] ?? 'Pendiente',
  observation: observationsByCase[testCase.id] ?? (results[testCase.id] === 'Pasó'
    ? 'Pasó según resultados automatizados consolidados.'
    : 'Pendiente de ejecución o de evidencia individual.'),
}));

const selectedDefects = DEFECTS.filter((defect) => Object.keys(defectCases).includes(defect.id));
const defectColumns = [
  ['ID Defecto', 'id', 14],
  ['Sprint', 'sprint', 14],
  ['HU Afectada', 'story', 18],
  ['ID Caso de Prueba', 'testCase', 32],
  ['Fecha/ Hora detección', 'detectedAt', 30],
  ['Horas transcurridas (YYYY-MM-DD HH:MM)', 'elapsed', 30],
  ['Descripción', 'description', 48],
  ['Pasos para reproducir', 'steps', 58],
  ['Resultado esperado', 'expected', 48],
  ['Resultado obtenido', 'obtained', 54],
  ['Tipo', 'type', 30],
  ['Severidad', 'severity', 18],
  ['Ambiente', 'environment', 28],
  ['Estado', 'state', 20],
  ['Responsable que reporta', 'reporter', 28],
];

function detectionDate(createdDate) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}:\d{2}))?$/.exec(createdDate);
  if (!match) return 'No registrada';
  return `${match[3]}-${match[2]}-${match[1]} ${match[4] ?? '--:--'}${match[4] ? '' : ' (hora no registrada)'}`;
}

function extractReproLine(repro, prefix) {
  return repro.find((line) => line.startsWith(prefix))?.replace(prefix, '').trim() ?? 'No detallado en el registro original.';
}

const defectRows = selectedDefects.map((defect) => ({
  id: defect.id,
  sprint: 'Sprint 1',
  story: defect.userStory,
  testCase: defectCases[defect.id],
  detectedAt: detectionDate(defect.createdDate),
  elapsed: 'No calculable: defectos abiertos y hora de cierre no registrada.',
  description: defect.title,
  steps: defect.repro.filter((line) => line && !line.startsWith('Esperado') && !line.startsWith('Obtenido')).join('\n'),
  expected: extractReproLine(defect.repro, 'Esperado'),
  obtained: extractReproLine(defect.repro, 'Obtenido'),
  type: defectTypes[defect.id],
  severity: defect.severity.startsWith('2') ? 'Alta' : defect.severity.startsWith('3') ? 'Media' : defect.severity,
  environment: 'Staging QA local (Docker)',
  state: defect.state === 'New' ? 'Abierto' : defect.state,
  reporter: 'QA (nombre por completar)',
}));

await createTableWorkbook(
  'Casos de prueba',
  caseColumns,
  caseRows,
  'matriz-casos-HU-06-HU-12-HU-17-HU-57.xlsx',
);
await createTableWorkbook(
  'Defectos',
  defectColumns,
  defectRows,
  'matriz-defectos-HU-06-HU-12-HU-17-HU-57.xlsx',
);

console.log(`Matriz de casos: ${caseRows.length} casos.`);
console.log(`Matriz de defectos: ${defectRows.length} defectos.`);
