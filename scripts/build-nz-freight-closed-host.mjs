import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const { build }=createRequire(resolve(root,'packages/canvas/package.json'))('tsup');
// Deliberately not root .vercel/output: no existing Git deployment can mount this review build.
const out=resolve(root,'.local-plugin-packages/freight-closed-host/.vercel/output');
const fn=resolve(out,'functions/closed.func');
await build({entry:{index:resolve(root,'security-proposals/nz-plugin-hosting/node-entry.ts')},outDir:fn,format:['esm'],outExtension:()=>({js:'.mjs'}),platform:'node',target:'node24',bundle:true,splitting:false,clean:true,silent:true});
await mkdir(out,{recursive:true});
await writeFile(resolve(fn,'.vc-config.json'),JSON.stringify({runtime:'nodejs24.x',handler:'index.mjs',launcherType:'Nodejs',maxDuration:15,regions:['iad1']},null,2)+'\n');
await writeFile(resolve(out,'config.json'),JSON.stringify({version:3,routes:[{src:'/.*',dest:'/closed'}]},null,2)+'\n');
console.log('Built closed freight-only review artifact; no deployment or root output');
