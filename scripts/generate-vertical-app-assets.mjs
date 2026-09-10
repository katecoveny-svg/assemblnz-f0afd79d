import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const items = [
  { slug: 'arc', name: 'ARC', field: 'ARCHITECTURE & DESIGN', lines: ['Talk the', 'plan through.'], image: 'public/brand/agent-studies/arc-harbour-terraces.webp', mark: '<path d="M154 330V234L256 161l102 73v96M154 234l102 68 102-68M256 302v48"/>' },
  { slug: 'forge', name: 'Forge', field: 'AUTOMOTIVE', lines: ['Keep the next', 'step moving.'], image: 'public/brand/transport/subaru-reference.webp', mark: '<path d="M150 292l23-69h166l23 69M145 292h222v43H145zM179 335v17m155-17v17M182 274h148"/><circle cx="184" cy="310" r="6"/><circle cx="328" cy="310" r="6"/>' },
  { slug: 'customs', name: 'Gateway', field: 'CUSTOMS & FREIGHT', lines: ['Get the entry', 'ready for review.'], image: 'public/brand/transport/boat-reference.webp', mark: '<path d="M149 287h214l-32 58H181zM183 287v-72h145v72M218 215v72m37-72v72m37-72v72M157 366h198M201 195v-31h94v31"/>' },
  { slug: 'ensemble', name: 'Ensemble', field: 'CREATIVE STUDIO', lines: ['Put your', 'brief to work.'], image: 'public/generated/creative-agency/anchors/prism-cafe.png', mark: '<path d="M159 173h151v151H159zM202 215h151v151H202zM181 195h151v151H181z"/>' },
];
const esc = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;');
const svg = (w,h,body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
for (const v of items) {
  const dir = `public/brand/vertical-apps/${v.slug}`;
  await mkdir(dir, { recursive: true });
  const icon = svg(512,512,`<rect width="512" height="512" fill="#240b21"/><rect x="38" y="38" width="436" height="436" rx="98" fill="none" stroke="#916a70" stroke-width="2"/><g fill="none" stroke="#fffdfb" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">${v.mark}</g><circle cx="364" cy="154" r="8" fill="#916a70"/>`);
  await writeFile(`${dir}/icon.svg`, icon);
  for (const size of [180,192,512]) await sharp(icon).resize(size,size).png().toFile(`${dir}/icon-${size}.png`);
  const image = await sharp(v.image).resize(636,554,{fit:'cover'}).png().toBuffer();
  const layout = svg(1200,630,`<rect width="1200" height="630" fill="#fffdfb"/><rect width="510" height="630" fill="#240b21"/><text x="48" y="73" font-family="Helvetica,Arial,sans-serif" font-size="36" letter-spacing="-1" fill="#fffdfb">${v.name}</text><path d="M48 103H462" stroke="#916a70"/><text x="48" y="152" font-family="Helvetica,Arial,sans-serif" font-size="11" letter-spacing="2" fill="#d9c2cd">${esc(v.field)}</text>${v.lines.map((line,i)=>`<text x="46" y="${263+i*57}" font-family="Helvetica,Arial,sans-serif" font-size="${v.slug==='customs'?43:49}" letter-spacing="-2" fill="#fffdfb">${line}</text>`).join('')}<rect x="48" y="381" width="153" height="43" rx="22" fill="#fffdfb"/><text x="73" y="408" font-family="Helvetica,Arial,sans-serif" font-size="14" fill="#240b21">Open the app ↗</text><text x="48" y="536" font-family="Helvetica,Arial,sans-serif" font-size="10" letter-spacing="2" fill="#d9c2cd">ASK · PREPARE · REVIEW</text><text x="48" y="584" font-family="Helvetica,Arial,sans-serif" font-size="23" fill="#fffdfb">assembl</text><text x="538" y="608" font-family="Helvetica,Arial,sans-serif" font-size="10" letter-spacing="1" fill="#654a4e">ILLUSTRATIVE STUDY</text><text x="1134" y="608" text-anchor="end" font-family="Helvetica,Arial,sans-serif" font-size="11" fill="#654a4e">assembl.co.nz</text>`);
  await sharp(layout).composite([{input:image,left:538,top:26}]).jpeg({quality:90}).toFile(`${dir}/share.jpg`);
  const portraitImage = await sharp(v.image).resize(984,680,{fit:'cover'}).png().toBuffer();
  const portrait = svg(1080,1350,`<rect width="1080" height="1350" fill="#fffdfb"/><rect width="1080" height="598" fill="#240b21"/><text x="50" y="98" font-family="Helvetica,Arial,sans-serif" font-size="53" letter-spacing="-2" fill="#fffdfb">${v.name}</text><text x="50" y="173" font-family="Helvetica,Arial,sans-serif" font-size="15" letter-spacing="3" fill="#d9c2cd">${esc(v.field)}</text>${v.lines.map((line,i)=>`<text x="46" y="${300+i*91}" font-family="Helvetica,Arial,sans-serif" font-size="83" letter-spacing="-3.5" fill="#fffdfb">${line}</text>`).join('')}<text x="50" y="513" font-family="Helvetica,Arial,sans-serif" font-size="24" fill="#fffdfb">Open the app at assembl.co.nz/agents/${v.slug}/app</text><text x="48" y="1310" font-family="Helvetica,Arial,sans-serif" font-size="27" fill="#240b21">assembl</text><text x="1032" y="1310" text-anchor="end" font-family="Helvetica,Arial,sans-serif" font-size="14" letter-spacing="1" fill="#654a4e">ASK · PREPARE · REVIEW</text>`);
  await sharp(portrait).composite([{input:portraitImage,left:48,top:576}]).jpeg({quality:92}).toFile(`${dir}/portrait.jpg`);
  console.log(`${v.name}: icons, link preview and portrait share card`);
}
