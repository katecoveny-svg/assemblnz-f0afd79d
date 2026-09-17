#!/usr/bin/env node
/** Refresh static mirrors. Keep VERSION + EXTENSION_FILES in sync with the download route. */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
const VERSION = '1.6.0';
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
  'portable.html',
  'portable-worker.js',
  'portable-core.js',
  'portable-background.js',
  'portable-launcher.js',
  'portable.css',
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
for (const name of EXTENSION_FILES) extension.file(name, await readFile(path.join(extensionRoot, name)));
extension.file('README.md', `# DO browser extension · v${VERSION}\n\nUnzip, then Load unpacked. Open the launch panel for signed-in workspace, voice, meetings and TypeSafe. Selection handoff needs an explicit click; no automatic capture or action.\nhttps://www.assembl.co.nz/do/install\n`);
await writeFile(path.join(outDir, `assembl-do-extension-${VERSION}.zip`), await extension.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
const macos = new JSZip();
await addDir(macos, macosRoot, 'macos');
for (const size of [192, 512]) {
  macos.file(`macos/resources/do-${size}.png`, await readFile(path.join(root, `public/do/icons/do-${size}.png`)));
}
macos.file('README.md', `# DO for Mac · development source · v${VERSION}\n\nNo notarised public installer. On a Mac with Xcode Command Line Tools: cd macos && bash build.sh ~/Desktop/do-mac-build. Source includes required icon resources. Review macOS microphone/Accessibility prompts yourself.\nhttps://www.assembl.co.nz/do/install#mac\n`);
const macosBuf = await macos.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
await writeFile(path.join(outDir, 'DO-mac-companion.zip'), macosBuf);
await writeFile(path.join(outDir, `assembl-do-macos-${VERSION}.zip`), macosBuf);
await writeFile(path.join(outDir, 'README.md'), `# DO portable downloads\n\nStatic mirrors: assembl-do-extension-${VERSION}.zip, DO-mac-companion.zip and assembl-do-macos-${VERSION}.zip.\nPrefer /api/do/download?format=extension or format=mac for the source version deployed now.\nRefresh mirrors with node scripts/package-do-downloads.mjs. Source changes alone do not regenerate binary mirrors.\n`);
console.log('DO download mirrors refreshed at', outDir);
