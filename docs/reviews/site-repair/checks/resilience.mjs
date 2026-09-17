const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const base=process.env.BASE_URL||'http://127.0.0.1:3000';
const b=await chromium.launch({headless:true});
try{
 for (const opts of [{reducedMotion:'reduce'},{viewport:{width:375,height:812}},{javaScriptEnabled:false}]) {
  const p=await b.newPage(opts);await p.goto(base,{waitUntil:'networkidle',timeout:120000});
  const summary=p.getByLabel('The complete work loop');await summary.waitFor();
  for(const text of ['An opportunity worth reviewing.','Useful work, ready for your review.','Something people can see and try.'])assert.equal(await summary.getByText(text,{exact:true}).isVisible(),true);
  assert.equal(await p.locator('canvas').count(),0);await p.close();
 }
 const p=await b.newPage({viewport:{width:1440,height:1000}});await p.goto(base,{waitUntil:'networkidle',timeout:120000});
 await p.locator('canvas').waitFor({timeout:60000});await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));
 await p.waitForFunction(()=>!document.querySelector('canvas'),null,{timeout:10000});
 await p.evaluate(()=>scrollTo(0,0));await p.locator('canvas').waitFor({timeout:60000});
 await p.screenshot({path:'/tmp/assembl-site-qa/evidence/restored-scene.png'});await p.close();
 console.log('PASS: full static product loop for reduced/mobile/no-JS; no canvas; offscreen unmount and restored scene.');
}finally{await b.close();}
