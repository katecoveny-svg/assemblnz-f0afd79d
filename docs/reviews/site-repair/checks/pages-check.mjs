const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.BASE_URL||'http://127.0.0.1:3000';
const b=await chromium.launch({headless:true});const results=[];
try{
 for(const [path,name] of [['/creative-studio','studio'],['/about','about'],['/contact?product=studio','contact'],['/studio/do-maker','maker'],['/do/office','office'],['/do/browser','browser']]){
  for(const width of [1440,375]){
   const p=await b.newPage({viewport:{width,height:900},reducedMotion:'reduce'}); const errors=[];p.on('pageerror',e=>errors.push(e.message));
   const r=await p.goto(base+path,{waitUntil:'networkidle',timeout:120000});
   const state=await p.evaluate(()=>({title:document.title,h1:document.querySelector('h1')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth}));
   assert.equal(r.status(),200,path);assert.equal(state.overflow,false,path);assert.deepEqual(errors,[],path);
   await p.screenshot({path:`/tmp/assembl-site-qa/evidence/${name}-${width}.png`});
   if(name==='studio'){await p.locator('#studio-work').scrollIntoViewIfNeeded();await p.screenshot({path:`/tmp/assembl-site-qa/evidence/${name}-work-${width}.png`});}
   results.push({path,width,status:r.status(),...state,errors});await p.close();
  }
 }
 await fs.writeFile('/tmp/assembl-site-qa/evidence/pages-check.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}finally{await b.close();}
