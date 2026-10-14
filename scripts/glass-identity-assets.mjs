/** Locked raster identity exports. No glyph redraw, font substitution or generation.
 * Web only. Native packages are applied separately by the portable-app owner. */
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
export async function glassIconSvg(kind){
  const raster=await readFile(`public/brand/${kind==='do'?'do':'assembl'}-assembled-plum.webp`);
  // Crop source paper around the complete approved form, then contain it within
  // the maskable safe circle. The original source remains byte-for-byte intact.
  const crop=await sharp(raster).extract({left:300,top:40,width:600,height:700}).png().toBuffer();
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><clipPath id="safe"><circle cx="50" cy="50" r="39.8"/></clipPath></defs><rect width="100" height="100" fill="#FFFDFB"/><image x="14" y="14" width="72" height="72" preserveAspectRatio="xMidYMid meet" clip-path="url(#safe)" href="data:image/png;base64,${crop.toString('base64')}"/></svg>`;
  return svg;
}
export async function glassIcon(kind,size){return sharp(Buffer.from(await glassIconSvg(kind)),{density:576}).resize(size,size).png().toBuffer();}
export async function writeIco(path,pngs){
  const sizes=[16,32,48],header=Buffer.alloc(6+16*sizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);let offset=header.length;
  sizes.forEach((size,i)=>{const at=6+i*16,png=pngs.get(size);header[at]=size;header[at+1]=size;header.writeUInt16LE(1,at+4);header.writeUInt16LE(32,at+6);header.writeUInt32LE(png.length,at+8);header.writeUInt32LE(offset,at+12);offset+=png.length;});
  await writeFile(path,Buffer.concat([header,...sizes.map(size=>pngs.get(size))]));
}
