import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['app', 'components', 'legacy-vite/src/pages'];
const BAD_FORMS = [
  { bad: /\bPikau\b/g, good: 'Pīkau' },
  { bad: /\bMatauranga\b/g, good: 'Mātauranga' },
  { bad: /\bToro\b/g, good: 'Tōro' },
  { bad: /\bTa\b/g, good: 'Tā' },
];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) return files(path);
    return /\.(tsx|ts)$/.test(path) ? [path] : [];
  });
}

const failures: string[] = [];

for (const file of ROOTS.flatMap(files)) {
  const source = readFileSync(file, 'utf8');
  for (const form of BAD_FORMS) {
    const matches = source.match(form.bad);
    if (matches) failures.push(`${file}: use ${form.good}, not ${matches[0]}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

