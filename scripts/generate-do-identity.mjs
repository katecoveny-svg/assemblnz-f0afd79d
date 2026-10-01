/** Reproducible canonical DO icon for web, Chrome and Mac source packages. */
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
const source = await readFile('components/do/DoMark.tsx', 'utf8');
const path = source.match(/DO_MARK_PATH = "([^"]+)"/)[1];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><linearGradient id="tile" x2=".8" y2="1"><stop stop-color="#ECE6FC"/><stop offset="1" stop-color="#DAD2F4"/></linearGradient><linearGradient id="face" x2=".7" y2="1"><stop stop-color="#916A70"/><stop offset=".35" stop-color="#654A4E"/><stop offset=".7" stop-color="#240B21"/><stop offset="1" stop-color="#4D2944"/></linearGradient><radialGradient id="dot" cx="30%" cy="25%"><stop stop-color="#FFFDFB"/><stop offset=".5" stop-color="#F5E4E7"/><stop offset="1" stop-color="#D0A6C3"/></radialGradient></defs><rect width="80" height="80" rx="23" fill="url(#tile)"/><rect x="1" y="1" width="78" height="78" rx="22" fill="none" stroke="#FFFDFB" stroke-opacity=".65"/><g transform="translate(9 10) scale(.9)"><path d="${path}" fill="none" stroke="#654A4E" stroke-width="9" stroke-linejoin="round" transform="translate(2.5 2.5)"/><path d="${path}" fill="none" stroke="url(#face)" stroke-width="9" stroke-linejoin="round"/><path d="M13 49V12Q13 9 16 9H29C43 9 53 18 55 28" fill="none" stroke="#FFFDFB" stroke-width=".45" stroke-opacity=".65"/><circle cx="30" cy="32" r="6" fill="url(#dot)"/><circle cx="28" cy="30" r="1.7" fill="#FFFDFB" opacity=".5"/></g></svg>`;
for (const file of ['public/do/icons/do-mark.svg', 'public/do/icons/do-spark.svg', 'apps/do/extension/icons/do-spark.svg']) await writeFile(file, svg);
for (const size of [180,192,512]) await sharp(Buffer.from(svg)).resize(size,size).png().toFile(`public/do/icons/do-${size}.png`);
for (const size of [16,32,48,128]) await sharp(Buffer.from(svg)).resize(size,size).png().toFile(`apps/do/extension/icons/icon${size}.png`);
for (const size of [192,512]) await writeFile(`apps/do/macos/resources/do-${size}.png`, await readFile(`public/do/icons/do-${size}.png`));
console.log('DO identity regenerated from the canonical path.');
