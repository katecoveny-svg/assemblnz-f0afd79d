const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.BASE_URL||'http://127.0.0.1:3000';
const out=(process.env.QA_OUTPUT || '/tmp/assembl-site-qa/evidence');
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];const requests=[];page.on('pageerror',e=>errors.push({message:e.message,stack:e.stack}));page.on('request',r=>{if(r.method()==='POST')requests.push(r.url());});
await page.goto(base,{waitUntil:'networkidle',timeout:120000});
await page.waitForFunction(()=>{const el=document.querySelector('canvas');return el&&el.width>0&&Number(getComputedStyle(el.parentElement.parentElement).opacity)>0.9;},{},{timeout:60000});
for(const [name,progress] of [['arrival',0],['do-chapter',.5],['studio-chapter',.88]]){
 await page.evaluate(p=>{const r=document.querySelector('section[aria-labelledby="atw-hero-title"]');window.scrollTo(0,p*(r.offsetHeight-innerHeight));},progress);
 // Wait for labelled chapter rather than blind page timing.
 if(progress>0)await page.getByRole('complementary',{name:'The work, step by step'}).getByRole('heading',{name:progress>.7?'show it.':'DO it.',exact:true}).waitFor();
 await page.screenshot({path:`${out}/${name}.png`,timeout:60000});
}
await page.getByRole('button',{name:'Pause',exact:true}).click();
assert.equal(await page.getByRole('button',{name:'Resume',exact:true}).getAttribute('aria-pressed'),'true');
const launcher=page.getByRole('button',{name:'Open DO. Drag to move, or use Alt and arrow keys. Escape resets position.'});
await launcher.focus();const before=await launcher.boundingBox();await page.keyboard.press('Alt+ArrowLeft');const after=await launcher.boundingBox();assert.ok(after.x<before.x);
assert.equal(await page.getByRole('dialog',{name:'DO workspace'}).isVisible(),false);
await launcher.click();await page.getByRole('dialog',{name:'DO workspace'}).waitFor();await page.screenshot({path:`${out}/widget-open.png`});
await page.getByRole('button',{name:'Close DO workspace'}).click();assert.equal(await page.getByRole('dialog',{name:'DO workspace'}).isVisible(),false);
await page.locator('#atw-do-intent').fill('Synthetic handoff only. Prepare a website outline for review; do not publish.');
await page.getByRole('button',{name:'Give DO the job',exact:true}).click();await page.waitForURL(/\/do\?/, {timeout:60000});
assert.equal(requests.some(u=>/\/api\/do\/(prepare|image|vision)$/.test(u)),false);
await fs.writeFile(`${out}/interactions.json`,JSON.stringify({url:page.url(),errors,posts:requests,checks:['scene mounted','chapter DOM changes','pause','keyboard move','open/close dialog','homepage draft handoff without execution']},null,2));
console.log(JSON.stringify({url:page.url(),errors,posts:requests},null,2));await browser.close();assert.deepEqual(errors,[], 'No page errors during the interaction journey');
