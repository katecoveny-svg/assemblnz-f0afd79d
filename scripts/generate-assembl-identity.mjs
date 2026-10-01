/** Rasterise the reviewed lowercase assembl outlines. No system-font dependency. */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const file = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));
const source = await readFile(file('brand/assembl-identity/mark.svg'));
const sizes = [16, 32, 48, 180, 192, 512];
const pngs = new Map();

for (const size of sizes) {
  const png = await sharp(source, { density: 576 }).resize(size, size).png().toBuffer();
  pngs.set(size, png);
  await writeFile(file(`public/icons/assembl-icon-${size}x${size}.png`), png);
}

// A conventional ICO directory with actual 16/32/48px PNG frames. Do not rename
// a lone PNG to .ico: Next's file convention and older favicon clients use this.
const iconSizes = [16, 32, 48];
const header = Buffer.alloc(6 + 16 * iconSizes.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(iconSizes.length, 4);
let offset = header.length;
for (const [index, size] of iconSizes.entries()) {
  const start = 6 + index * 16;
  const png = pngs.get(size);
  header[start] = size;
  header[start + 1] = size;
  header.writeUInt16LE(1, start + 4);
  header.writeUInt16LE(32, start + 6);
  header.writeUInt32LE(png.length, start + 8);
  header.writeUInt32LE(offset, start + 12);
  offset += png.length;
}
const ico = Buffer.concat([header, ...iconSizes.map((size) => pngs.get(size))]);
await writeFile(file('public/icons/favicon.ico'), ico);
await writeFile(file('app/favicon.ico'), ico);
await writeFile(file('app/icon.png'), pngs.get(32));
await writeFile(file('app/apple-icon.png'), pngs.get(180));
await sharp(await readFile(file('brand/assembl-identity/wordmark.svg')))
  .png().toFile(file('public/img/press/assembl-wordmark.png'));
console.log('assembl identity regenerated: lowercase Instrument Sans, plum/paper.');
