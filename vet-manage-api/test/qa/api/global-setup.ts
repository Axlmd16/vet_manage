import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Cada corrida empieza con el registro de llamadas (evidencia de API) vacío.
export default function setup() {
  rmSync(fileURLToPath(new URL('../../../../qa/sprint-1/reports/api/calls.json', import.meta.url)), { force: true });
}
