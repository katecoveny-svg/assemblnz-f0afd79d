const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const b=await chromium.launch({headless:true}); const p=await b.newPage({viewport:{width:1440,height:1000}});
try {
 await p.goto(process.env.BASE_URL || 'http://127.0.0.1:3000',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>{const c=document.querySelector('canvas'); const poster=document.querySelector('img[src*="atelier-poster"]');return c&&poster&&getComputedStyle(poster).opacity==='0';},null,{timeout:60000});
 await p.evaluate(()=>document.querySelector('canvas').dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
 await p.waitForFunction(()=>{const img=document.querySelector('img[src*="atelier-poster"]');return img&&Number(getComputedStyle(img).opacity)>0.99;},null,{timeout:5000});
 assert.equal(await p.getByRole('heading',{name:'assembl the work.',exact:true}).isVisible(),true);
 console.log('Context loss restores poster and retains job entry');
} finally {await b.close();}
