import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export function affectedEdgeFunctions(changedFiles, root = process.cwd(), all = false) {
  const directory = resolve(root, 'supabase/functions');
  const names = readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('_') && existsSync(resolve(directory, entry.name, 'index.ts')))
    .map(entry => entry.name).sort();
  if (all) return names;
  const changed = new Set(changedFiles.map(file => resolve(root, file)));
  function dependsOnChange(file, seen = new Set()) {
    if (changed.has(file)) return true;
    if (seen.has(file)) return false;
    seen.add(file);
    const source = readFileSync(file, 'utf8');
    // Follow static relative imports, re-exports, and literal dynamic imports.
    const imports = source.matchAll(/\b(?:from\s*|import\s*\(\s*|import\s*)['"](\.[^'"]+)['"]/g);
    for (const [, path] of imports) {
      const dependency = resolve(dirname(file), path);
      if (dependsOnChange(dependency, seen)) return true;
    }
    return false;
  }
  return names.filter(name => {
    const local = resolve(directory, name) + sep;
    if ([...changed].some(file => file.startsWith(local))) return true;
    return dependsOnChange(resolve(directory, name, 'index.ts'));
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const all = process.env.EDGE_DEPLOY_ALL === 'true';
  const before = process.env.EDGE_DEPLOY_BASE || '';
  const after = process.env.EDGE_DEPLOY_HEAD || '';
  if (!all && (!/^[a-f0-9]{40}$/i.test(before) || !/^[a-f0-9]{40}$/i.test(after) || /^0+$/.test(before))) {
    throw new Error('A valid before/after commit pair is required; no functions were selected.');
  }
  const changes = all ? [] : execFileSync('git', ['diff', '--name-only', before, after], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const targets = affectedEdgeFunctions(changes, process.cwd(), all);
  for (const name of targets) {
    if (!/^[a-z0-9][a-z0-9_-]*$/.test(name)) throw new Error(`Invalid function directory: ${relative(process.cwd(), name)}`);
    console.log(name);
  }
}
