const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const esbuild = createRequire(require.resolve('tsx'))('esbuild');
const output = path.resolve('docs/reviews/do-companion-local/selected-tab-extension');
fs.mkdirSync(output,{recursive:true});
const base = JSON.parse(fs.readFileSync('apps/do/extension/pilot/manifest.json','utf8'));
const manifest = {...base, name:'DO selected page — read only', description:'Explicit image and selected-text snapshots for your DO conversation. No page actions.', action:{...base.action,default_title:'Connect this selected page to DO'}, background:{service_worker:'worker.js'}, side_panel:{default_path:'panel.html'}};
fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
for(const name of ['worker.js','panel.html','panel.css','panel.js']) fs.copyFileSync('apps/do/extension/selected-tab/'+name,path.join(output,name));
fs.cpSync('apps/do/extension/icons',path.join(output,'icons'),{recursive:true});
esbuild.buildSync({entryPoints:['apps/do/browser/selected-tab/extension-host.ts'],bundle:true,format:'iife',globalName:'DoSelectedTab',outfile:path.join(output,'selected-tab-host.js'),target:'chrome116'});
console.log(output);
const JSZip = require('jszip');
async function packageCandidate(){
  const zip=new JSZip();
  function add(dir,prefix=''){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const name=prefix+item.name;const full=path.join(dir,item.name);if(item.isDirectory())add(full,name+'/');else zip.file(name,fs.readFileSync(full));}}
  add(output);
  zip.file('README.md','# DO selected page\n\nLoad this unpacked folder in Chrome. Open a signed-in DO workspace and click this extension toolbar once to bind your owner. Then click the toolbar on the chosen page, choose an image or selected-text snapshot, review it and offer it to the conversation. Access expires after 60 seconds. No page actions or background scanning.\n');
  fs.mkdirSync('public/do/downloads',{recursive:true});
  fs.writeFileSync('public/do/downloads/assembl-do-selected-page.zip',await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));
}
packageCandidate().catch(error=>{console.error(error);process.exitCode=1;});
