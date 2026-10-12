const fs=require('node:fs');const path=require('node:path');
const {chromium}=require(process.env.ASSEMBL_PLAYWRIGHT_MODULE||'playwright');
const axe=process.env.ASSEMBL_AXE_MODULE||require.resolve('axe-core/axe.min.js');
const base=process.env.ASSEMBL_REVIEW_URL||'http://127.0.0.1:3100';
const out=path.resolve('docs/recovery/evidence');fs.mkdirSync(out,{recursive:true});
const assert=(v,m)=>{if(!v)throw Error(m);};
(async()=>{const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGEERROR',e.message);});page.on('console',m=>{if(m.type()==='error')console.error('CONSOLE',m.text());});const checks=[];
try{
 for(const route of ['/do/messages','/creative-studio/voices']){
  await page.goto(base+route,{waitUntil:'domcontentloaded'});await page.locator('a[href="#main-content"]').focus();await page.keyboard.press('Enter');assert(await page.locator('#main-content').evaluate(el=>el===document.activeElement),'Keyboard skip link');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);
  for(const width of [375,768,1440]){
   await page.setViewportSize({width,height:1000});await page.waitForTimeout(100);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow '+route+' '+width);
   await page.addScriptTag({path:axe});const results=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
   const violations=results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));
   const name=route.includes('messages')?'messages':'voice-studio';await page.screenshot({path:path.join(out,name+'-'+width+'.png'),fullPage:true});
   checks.push({route,width,overflow:false,violations,font:await page.locator('h1').evaluate(el=>getComputedStyle(el).fontFamily)});
   assert(!violations.length,'Accessibility '+JSON.stringify(violations));
  }
 }
 await page.goto(base+'/do/messages',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'Try an example',exact:true}).click();await page.getByRole('button',{name:'Find possible next steps'}).click();assert(await page.getByLabel('Step 1',{exact:true}).inputValue()==='Please confirm whether Thursday afternoon suits.','Literal task');
 await page.getByText('Private notes',{exact:true}).click();await page.getByLabel('Only for you',{exact:true}).fill('DO NOT SHARE PRIVATE NOTE');await page.getByLabel('Your reply',{exact:true}).fill('Thursday suits.');
 assert(await page.getByLabel('Ready to share',{exact:true}).inputValue()==='Thursday suits.','Private notes excluded');
 assert(await page.getByRole('button',{name:'Copy',exact:true}).isDisabled(),'Review required');await page.getByLabel('I’ve reviewed this exact reply',{exact:true}).check();assert(await page.getByRole('button',{name:'Copy',exact:true}).isEnabled(),'Review unlocks sharing');
 await page.getByLabel('Your reply',{exact:true}).fill('Friday suits.');assert(await page.getByRole('button',{name:'Copy',exact:true}).isDisabled(),'Edit clears review');
 await page.getByText('Save, load or back up your workspace',{exact:true}).click();await page.getByRole('button',{name:'Save on this device',exact:true}).click();
 await page.getByRole('button',{name:'New conversation',exact:true}).click();assert(await page.getByLabel('Your reply',{exact:true}).inputValue()==='','Thread isolation');
 await page.getByRole('button',{name:'Load saved copy',exact:true}).click();await page.getByRole('button',{name:'Replace current workspace',exact:true}).click();assert(await page.getByLabel('Your reply',{exact:true}).inputValue()==='Friday suits.','Storage roundtrip');assert(await page.getByRole('button',{name:'Copy',exact:true}).isDisabled(),'Load clears review');
 checks.push({flow:'messages',literalCandidates:true,privateExclusion:true,reviewInvalidation:true,threadIsolation:true,storageRoundtrip:true});
 // Controlled API responses exercise the signed-in UI, not a live Supabase session.
 const id='00000000-0000-4000-8000-000000000002';let submitted=false,deleted=false;
 const record={id,state:'ready',text:'A controlled UI script.',presets:['warm'],expiresAt:Date.now()+1800000,accentReview:'pending',outputs:[{preset:'warm',duration:8.72,sha256:'a'.repeat(64)}]};
 await context.route(/\/api\/creative\/voices(?:\/|$)/,async route=>{const req=route.request();console.log('CONTROLLED',req.method(),new URL(req.url()).pathname);if(req.method()==='DELETE'){deleted=true;return route.fulfill({status:204});}if(req.url().includes('/audio/'))return route.fulfill({status:200,contentType:'audio/wav',body:fs.readFileSync('public/do/voice/assembl/warm.wav')});if(req.method()==='POST'){submitted=true;return route.fulfill({status:202,json:record});}return route.fulfill({status:200,json:req.url().endsWith('/voices')?{available:true}:record});});
 await page.goto(base+'/creative-studio/voices',{waitUntil:'domcontentloaded'});await page.getByLabel('Your script',{exact:true}).fill('A controlled UI script.');assert(await page.getByRole('button',{name:'Generate voice options',exact:true}).isDisabled(),'Voice consent required');await page.getByLabel(/Clear.*Steady/).uncheck();await page.getByLabel(/Bright.*expressive/).uncheck();
 await page.getByLabel('I can use this script and want assembl to generate the selected voices.',{exact:true}).check();await page.getByRole('button',{name:'Generate voice options',exact:true}).click();await page.getByText('Ready to listen',{exact:true}).waitFor();await page.addScriptTag({path:axe});assert((await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}))).violations.length===0,'Ready voice accessibility');assert(submitted,'Request submitted');
 page.on('response',r=>{if(r.url().includes('/audio/'))console.log('AUDIO',r.status(),r.url());});const player=page.getByLabel('warm generated voice',{exact:true});await player.evaluate(async a=>{await a.play();});await page.waitForTimeout(200);assert(await player.evaluate(a=>a.currentTime>0),'Real WAV playback');await player.evaluate(a=>a.pause());
 await page.screenshot({path:path.join(out,'voice-controlled-owner.png'),fullPage:true});await page.getByRole('button',{name:'Remove temporary voice job'}).click();assert(deleted,'Delete request');await page.getByText('Generated audio will appear here.',{exact:true}).waitFor();
 checks.push({flow:'voice-controlled-owner',consent:true,submission:true,realWavPlayback:true,deletion:true,liveSupabaseSession:false});
 assert(errors.length===0,'Browser errors '+errors.join('; '));
 fs.writeFileSync(path.join(out,'browser-proof.json'),JSON.stringify({base,checks,errors},null,2)+'\n');console.log(JSON.stringify({checks:checks.length,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
