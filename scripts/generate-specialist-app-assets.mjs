import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
const apps = [
  { slug:'retirement', name:'Retirement guide', field:'RETIREMENT LIVING · AOTEAROA', lines:['A next chapter.', 'At their pace.'], sheets:['Their wishes.', 'Sources & questions.', 'A family plan.'], mark:'<path d="M158 253l98-83 98 83v97H158zM235 350v-76h44v76M299 206v-36"/>' },
  { slug:'flux', name:'Flux', field:'SALES & CUSTOMER RELATIONSHIPS', lines:['Every lead.', 'A considered next step.'], sheets:['A real customer need.', 'The evidence.', 'A considered follow-up.'], mark:'<path d="M159 324h64v-64h65v-64h65M159 292v32h32M320 164l33 32-33 32"/>' },
  { slug:'aroha', name:'Aroha', field:'PEOPLE & WORK · AOTEAROA', lines:['Good work begins', 'with people.'], sheets:['The person & facts.', 'Current sources.', 'A fair next step.'], mark:'<circle cx="225" cy="210" r="35"/><path d="M158 337v-21a67 67 0 0 1 134 0v21M285 181a35 35 0 0 1 0 69M310 272a67 67 0 0 1 42 62"/>' },
];
const esc=s=>s.replaceAll('&','&amp;');
const svg=(w,h,body)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><style>text{font-family:Arial,sans-serif}</style>${body}</svg>`);
for(const a of apps){
  const dir=`public/brand/vertical-apps/${a.slug}`;await mkdir(dir,{recursive:true});
  const icon=svg(512,512,`<rect width="512" height="512" fill="#240b21"/><rect x="44" y="44" width="424" height="424" rx="90" fill="none" stroke="#916a70" stroke-width="2"/><g fill="none" stroke="#fffdfb" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">${a.mark}</g>`);
  await writeFile(`${dir}/icon.svg`,icon);for(const size of [180,192,512])await sharp(icon).resize(size,size).png().toFile(`${dir}/icon-${size}.png`);
  const folio=svg(600,650,`<rect width="600" height="650" fill="#f5f1f2"/>${a.sheets.map((s,i)=>`<g transform="translate(${50+i*38} ${125+i*95}) rotate(${-7+i*5} 220 80)"><rect width="390" height="155" rx="3" fill="#fffdfb" stroke="#916a70"/><text x="24" y="38" font-size="10" letter-spacing="2" fill="#654a4e">0${i+1} / PREPARATION</text><text x="24" y="84" font-size="26" letter-spacing="-1" fill="#240b21">${esc(s)}</text><path d="M24 110h305M24 126h185" stroke="#240b21" stroke-opacity=".2"/></g>`).join('')}<text x="54" y="605" font-size="11" fill="#654a4e" letter-spacing="2">PREPARED FOR YOUR REVIEW</text>`);
  await sharp(folio).png().toFile(`${dir}/study.png`);
  const layout=svg(1200,630,`<rect width="1200" height="630" fill="#240b21"/><text x="50" y="83" font-size="36" letter-spacing="-1" fill="#fffdfb">${a.name}</text><text x="50" y="154" font-size="10" letter-spacing="1.7" fill="#f5f1f2">${esc(a.field)}</text>${a.lines.map((s,i)=>`<text x="48" y="${274+i*58}" font-size="${a.slug==='flux'?38:44}" letter-spacing="-1.7" fill="#fffdfb">${esc(s)}</text>`).join('')}<text x="50" y="438" font-size="16" fill="#fffdfb">Open the app →</text><text x="50" y="578" font-size="29" fill="#fffdfb" letter-spacing="-1">assembl</text>`);
  await sharp(layout).composite([{input:await sharp(folio).resize(581,630).toBuffer(),left:619,top:0}]).jpeg({quality:92}).toFile(`${dir}/share.jpg`);
  const portrait=svg(1080,1350,`<rect width="1080" height="1350" fill="#fffdfb"/><rect width="1080" height="555" fill="#240b21"/><text x="52" y="95" font-size="48" fill="#fffdfb">${a.name}</text><text x="52" y="174" font-size="15" letter-spacing="2" fill="#f5f1f2">${esc(a.field)}</text>${a.lines.map((s,i)=>`<text x="50" y="${284+i*83}" font-size="${a.slug==='flux'?65:75}" letter-spacing="-3" fill="#fffdfb">${esc(s)}</text>`).join('')}<text x="52" y="470" font-size="20" fill="#fffdfb">assembl.co.nz/agents/${a.slug}/app</text><text x="52" y="1302" font-size="34" fill="#240b21">assembl</text>`);
  await sharp(portrait).composite([{input:await sharp(folio).resize(660,715).toBuffer(),left:210,top:555}]).jpeg({quality:92}).toFile(`${dir}/portrait.jpg`);
  console.log(`${a.slug}: app icons and share cards`);
}
