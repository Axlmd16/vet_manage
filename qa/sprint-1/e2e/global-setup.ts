import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Restaura Staging desde la semilla QA (pg_restore) antes de la corrida E2E.
export default function globalSetup() {
  if (process.env.QA_SKIP_RESTORE === '1') return;
  const script = fileURLToPath(new URL('../staging/scripts/restore-staging.sh', import.meta.url));
  execFileSync('bash', [script], { stdio: 'inherit' });
}
