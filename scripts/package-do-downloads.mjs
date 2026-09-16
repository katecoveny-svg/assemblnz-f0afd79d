#!/usr/bin/env node
/**
 * Refresh static DO download zips under public/do/downloads/.
 * Keep in sync with app/api/do/download/route.ts VERSION + file lists.
 */
import { createWriteStream } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const VERSION = '1.5.0';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public/do/downloads');
const extensionRoot = path.join(root, 'apps/do/extension');
const macosRoot = path.join(root, 'apps/do/macos');

const EXTENSION_FILES = [
  'manifest.json',
  'background.js',
  'sidepanel.html',
  'sidepanel.js',
  'sidepanel.css',
  'floating.js',
  'selection-badge.js',
  'popup.html',
  'popup.js',
  'popup.css',
  'icons/icon16.png',
  'icons/icon32.png',
  'icons/icon48.png',
  'icons/icon128.png',
  'icons/do-spark.svg',
];

async function addDir(zip, dir, prefix) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) await addDir(zip, full, name);
    else zip.file(name, await readFile(full));
  }
}

await mkdir(outDir, { recursive: true });

const extension = new JSZip();
for (const name of EXTENSION_FILES) {
  extension.file(name, await readFile(path.join(extensionRoot, name)));
}
extension.file(
  'README.md',
  `# DO browser extension · v${VERSION}\n\nLoad unpacked after unzip. Guide: https://www.assembl.co.nz/do/install\n`,
);
const extensionPath = path.join(outDir, `assembl-do-extension-${VERSION}.zip`);
await writeFile(
  extensionPath,
  await extension.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }),
);

const macos = new JSZip();
await addDir(macos, macosRoot, 'macos');
macos.file(
  'README.md',
  `# DO for Mac · development source · v${VERSION}\n\nNo notarised public installer. Build with ./macos/build.sh on a Mac.\nhttps://www.assembl.co.nz/do/install#mac\n`,
);
const macosPath = path.join(outDir, `DO-mac-companion.zip`);
const macosBuf = await macos.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
await writeFile(macosPath, macosBuf);
await writeFile(path.join(outDir, `assembl-do-macos-${VERSION}.zip`), macosBuf);

console.log('Wrote', extensionPath);
console.log('Wrote', macosPath);
// silence unused import if bundlers complain
void createWriteStream;
