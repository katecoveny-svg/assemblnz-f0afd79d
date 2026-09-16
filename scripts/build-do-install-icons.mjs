/** Rasterise the existing DoMark contour for installed app icons. No new identity. */
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
const component = await readFile(new URL('../components/do/DoMark.tsx', import.meta.url), 'utf8');
const contour = component.match(/d="(M16[^\"]+)"/)?.[1];
if (!contour) throw new Error('Canonical DoMark contour was not found; review the source before rebuilding icons.');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><radialGradient id="plum" cx="25%" cy="15%" r="95%"><stop stop-color="#976384"/><stop offset=".55" stop-color="#513044"/><stop offset="1" stop-color="#240b21"/></radialGradient><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter></defs><rect width="64" height="64" fill="#240b21"/><rect x="3" y="3" width="58" height="58" rx="18" fill="url(#plum)"/><g transform="translate(9 9) scale(.72)" stroke="#edbedd" stroke-width="7" stroke-linejoin="round" fill="none"><path d="${contour}" filter="url(#glow)"/><path d="${contour}"/><circle cx="30" cy="32" r="6" stroke="none" fill="#edbedd"/></g></svg>`;
await writeFile(new URL('../public/do/icons/do-mark.svg', import.meta.url), svg);
for (const size of [180,192,512]) {
  await sharp(Buffer.from(svg)).resize(size,size).png().toFile(new URL(`../public/do/icons/do-${size}.png`,import.meta.url).pathname);
}
console.log('Built DO install icons from the existing D contour.');
