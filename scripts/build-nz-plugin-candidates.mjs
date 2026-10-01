import { createRequire } from 'node:module';
import { AjvJsonSchemaValidator } from '@modelcontextprotocol/server/validators/ajv';
import { readFile, mkdir, readdir, lstat, writeFile, copyFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { zipSync } from 'fflate';
const root = resolve(import.meta.dirname, '..');
const require = createRequire(join(root, 'packages/canvas/package.json'));
const { build } = require('tsup');
const ajv = new AjvJsonSchemaValidator();
const validatePlugin = ajv.getValidator(JSON.parse(await readFile(join(root, 'plugins/mcp-servers/mcp-nz-evidence/review/schemas/plugin.schema.json'), 'utf8')));
const validateMcp = ajv.getValidator(JSON.parse(await readFile(join(root, 'plugins/mcp-servers/mcp-nz-evidence/review/schemas/mcp.schema.json'), 'utf8')));
const dist = join(root, '.local-plugin-packages');
await mkdir(dist, { recursive: true });
const output = [];
for (const domain of ['freight', 'architecture']) {
    const base = join(root, `plugins/assembl-nz-${domain}`);
    const plugin = JSON.parse(await readFile(join(base, 'plugin.json'), 'utf8')), mcp = JSON.parse(await readFile(join(base, 'mcp.json'), 'utf8'));
    const pv = validatePlugin(plugin), mv = validateMcp(mcp);
    if (!pv.valid || !mv.valid)
        throw new Error(JSON.stringify([pv, mv]));
    await build({ entry: { index: join(root, 'plugins/mcp-servers/mcp-nz-evidence/src/index.ts') }, outDir: join(base, 'server'), format: ['esm'], outExtension: () => ({ js: '.mjs' }), platform: 'node', target: 'node24', bundle: true, splitting: false, clean: true, metafile: true, noExternal: [/.*/], silent: true });
    const meta = JSON.parse(await readFile(join(base, 'server/metafile-esm.json'), 'utf8'));
    const licences = new Set();
    const files = {};
    for (const input of Object.keys(meta.inputs)) {
        if (!input.includes('node_modules'))
            continue;
        let dir = dirname(resolve(root, input));
        while (dir.startsWith(root)) {
            try {
                const p = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'));
                if (p.name) {
                    licences.add(dir);
                    break;
                }
            }
            catch { }
            const parent = dirname(dir);
            if (parent === dir)
                break;
            dir = parent;
        }
    }
    const notices = [];
    for (const dir of [...licences].sort()) {
        const p = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'));
        notices.push(`## ${p.name}@${p.version} (${p.license ?? 'see licence'})`);
        for (const f of await readdir(dir))
            if (/^(?:LICEN[CS]E|COPYING|NOTICE)(?:\..*)?$/i.test(f))
                try {
                    notices.push(await readFile(join(dir, f), 'utf8'));
                }
                catch { }
    }
    await writeFile(join(base, 'server/THIRD-PARTY-NOTICES.txt'), notices.join('\n\n'));
    const walk = async (dir, prefix = '') => { for (const name of (await readdir(dir)).sort()) {
        if (name === '.gitignore' || name === 'metafile-esm.json')
            continue;
        const path = join(dir, name), rel = prefix + name, stat = await lstat(path);
        if (stat.isSymbolicLink())
            throw new Error('Symlinks are prohibited');
        if (stat.isDirectory())
            await walk(path, rel + '/');
        else {
            if (/(?:^|\/)\.env|\.pem$|\.key$/.test(rel))
                throw new Error('Forbidden archive member');
            files[rel] = [new Uint8Array(await readFile(path)), { mtime: new Date('2026-01-01T00:00:00Z') }];
        }
    } };
    await walk(base);
    if (Object.keys(files).length > 5000)
        throw new Error('Too many files');
    if (Object.values(files).reduce((sum, [b]) => sum + b.length, 0) > 512 * 1024 * 1024)
        throw new Error('Expanded archive too large');
    const bytes = zipSync(files, { level: 6 });
    if (bytes.length > 100 * 1024 * 1024)
        throw new Error('Too large');
    const name = `assembl-nz-${domain}-0.1.0-development.zip`;
    await writeFile(join(dist, name), bytes);
    output.push({ name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), status: 'local development only; public HTTPS/listing/release gates pending', entries: Object.keys(files) });
}
await writeFile(join(dist, 'manifest.json'), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output.map(({ entries, ...v }) => v), null, 2));
