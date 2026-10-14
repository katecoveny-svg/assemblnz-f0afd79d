/** Web identity exports from the user-locked glass original; press wordmark stays outlined Instrument Sans. */
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { glassIcon, writeIco } from './glass-identity-assets.mjs';
const pngs=new Map();
for(const size of [16,32,48,180,192,512]){const png=await glassIcon('assembl',size);pngs.set(size,png);await writeFile(`public/icons/assembl-icon-${size}x${size}.png`,png);}
await writeIco('public/icons/favicon.ico',pngs);await writeIco('app/favicon.ico',pngs);
await writeFile('app/icon.png',pngs.get(32));await writeFile('app/apple-icon.png',pngs.get(180));
await sharp(await readFile('brand/assembl-identity/wordmark.svg')).png().toFile('public/img/press/assembl-wordmark.png');
console.log('assembl web identity exported from locked glass artwork. Native packages untouched.');
