import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

export const paths = {
  root: ROOT,
  fonts: join(ROOT, 'assets', 'fonts'),
  out: join(ROOT, 'assets', 'generated'),
  certificates: join(ROOT, 'assets', 'certificates'),
  logos: join(ROOT, 'assets', 'logos'),
  cache: join(ROOT, 'scripts', 'data', 'telemetry.json'),
} as const;
