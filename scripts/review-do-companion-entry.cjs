/** Synthetic navigation proof in isolated Chromium. No user browser, accounts, audio or provider calls. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
// Next's existing widget route pins its development origin to localhost.
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://localhost:3030';
const out = process.env.ASSEMBL_REVIEW_OUTPUT || 'output/playwright/companion-entry';
const checks=[];
const check=(name,value)=>{assert.ok(value,name);checks.push(name);console.log('PASS '+name);};
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.ASSEMBL_CHROMIUM_PATH?{executablePath:process.env.ASSEMBL_CHROMIUM_PATH}:{channel:'chrome'})});
 const context=await browser.newContext({viewport:{width:375,height:812},serviceWorkers:'block'});
 let ready=false; let remaining=2; let profileFailure=false; const posts=[]; const foreign=[];const errors=[];
 await context.addInitScript(()=>{
  window.__entryMicReads=0;window.__entrySpeech=0;
  navigator.mediaDevices.getUserMedia=async()=>{window.__entryMicReads++;throw new Error('Synthetic test: microphone disabled');};
  speechSynthesis.speak=()=>{window.__entrySpeech++;};
 });
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin!==origin){foreign.push(url.origin);return route.abort();}
  if(route.request().method()!=='GET'){posts.push(url.pathname);return route.abort();}
  if(url.pathname==='/api/do/session'||url.pathname==='/api/do/personal')return route.fulfill({json:{workspaceKey:'10000000-0000-4000-8000-000000000001'}});
  if(url.pathname==='/api/do/runtime')return route.fulfill({json:{signedIn:true,availability:{available:false}}});
  if(url.pathname==='/api/do/live-token')return route.fulfill({json:{enabled:ready,configured:ready,signedIn:true,remaining,dailyLimit:20,sessionSeconds:300,model:'fictional'}});
  if(url.pathname==='/api/do/personal/profile')return route.fulfill({status:profileFailure?503:200,json:profileFailure?{}:{saved:true,profile:{displayName:'Fictional Alex',avatar:'bloom',tone:'warm',responseLength:'brief',initiative:'on_request',preferences:'Fictional reviewed style',voiceName:'Aoede',onboardingCompleted:true,updatedAt:'2026-10-12T00:00:00Z'}}});
  if(url.pathname==='/entry-fixture')return route.fulfill({contentType:'text/html',body:'<!doctype html><title>Fictional companion host</title><p>Fictional practice note.</p><script src="/api/do/widget" defer></script>'});
  return route.continue();
 });
 await context.routeWebSocket('**/*', socket=>{ if(new URL(socket.url()).pathname.includes('webpack-hmr'))return socket.connectToServer();foreign.push(socket.url());socket.close(); });
 try {
  const page=await context.newPage();page.setDefaultTimeout(60000);page.setDefaultNavigationTimeout(90000);page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/do/widget?entry=write');
  await page.waitForFunction(()=>document.activeElement?.id==='do-source');
  const editor=await page.locator('#do-source').elementHandle();
  await page.locator('#do-source').fill('Fictional note: prepare the Friday outline.');
  await page.getByRole('button',{name:'Write',exact:true}).click();
  await page.waitForFunction(()=>document.activeElement?.id==='do-source');
  check('Write returns focus to the same editor',await editor.evaluate(e=>e===document.querySelector('#do-source')&&document.activeElement===e));
  await page.waitForFunction(()=>document.querySelector('#do-talk-readiness')?.textContent.includes('not available'));
  check('unavailable Talk is disabled',await page.getByRole('button',{name:'Talk',exact:true}).isDisabled());
  check('native navigation cannot bypass unavailable Talk',await page.evaluate(()=>window.assemblDoCompanionEntry.enter('talk'))===false);
  await page.screenshot({animations:'disabled',path:out+'/write-unavailable-375.png',fullPage:false});
  ready=true;profileFailure=true;
  await page.getByRole('button',{name:'Check Talk',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#do-talk-readiness')?.textContent.includes('preferences could not'));
  check('unchecked saved preferences keep Talk disabled',await page.getByRole('button',{name:'Talk',exact:true}).isDisabled());
  profileFailure=false;await page.getByRole('button',{name:'Check Talk',exact:true}).click();
  await page.waitForFunction(()=>window.assemblDoCompanionEntry?.readiness()==='ready');
  await page.getByRole('button',{name:'Talk',exact:true}).click();
  await page.getByRole('button',{name:'Back to Write',exact:true}).waitFor({state:'visible'});
  check('Talk opens real existing conversation controls with reviewed profile',await page.locator('.do-live-panel').count()===1 && (await page.locator('body').textContent()).includes('Fictional Alex'));
  check('opening Talk starts neither microphone nor speech playback',await page.evaluate(()=>window.__entryMicReads===0&&window.__entrySpeech===0)&&posts.length===0);
  await page.screenshot({animations:'disabled',path:out+'/talk-consent-375.png',fullPage:false});
  const talkPanel=await page.locator('.do-live-panel').elementHandle();
  remaining=0;profileFailure=true;await page.getByRole('button',{name:'Check Talk',exact:true}).click();
  await page.waitForFunction(()=>window.assemblDoCompanionEntry?.readiness()==='allowance');
  check('readiness refresh preserves the admitted Talk panel and reviewed profile',await talkPanel.evaluate(e=>e===document.querySelector('.do-live-panel'))&&(await page.locator('body').textContent()).includes('Fictional Alex'));
  await page.getByRole('button',{name:'Back to Write',exact:true}).click();
  await page.waitForFunction(()=>document.activeElement?.id==='do-source');
  check('Back to Write preserves text and editor identity',await page.locator('#do-source').inputValue()==='Fictional note: prepare the Friday outline.'&&await editor.evaluate(e=>e===document.querySelector('#do-source')));
  check('phone has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.setViewportSize({width:1440,height:1000});await page.screenshot({animations:'disabled',path:out+'/write-1440.png',fullPage:false});
  ready=false;remaining=2;profileFailure=false;
  await page.goto(origin+'/do/widget?entry=talk');
  await page.waitForFunction(()=>window.assemblDoCompanionEntry?.readiness()==='unavailable');
  await page.getByRole('button',{name:'Write',exact:true}).click();
  ready=true;await page.getByRole('button',{name:'Check Talk',exact:true}).click();
  await page.waitForFunction(()=>window.assemblDoCompanionEntry?.readiness()==='ready');
  check('choosing Write cancels a queued Talk request',await page.locator('.do-live-panel').count()===0&&await page.getByRole('button',{name:'Write',exact:true}).getAttribute('aria-pressed')==='true');
  await page.goto(origin+'/entry-fixture');
  await page.getByRole('button',{name:'Open DO. Drag to move or use Alt and arrow keys.',exact:true}).click();
  const iframe=page.frameLocator('iframe[title="DO — prepare and review"]');
  await iframe.locator('#do-source').waitFor({state:'visible'});
  await iframe.locator('#do-source').fill('Fictional embedded note.');
  const frameIdentity=await page.locator('iframe').elementHandle();
  await page.getByRole('button',{name:'Write',exact:true}).click();
  const child=page.frames().find(frame=>frame.url().includes('/do/widget'));
  await child.waitForFunction(()=>document.activeElement?.id==='do-source');
  check('embedded Write keeps the same iframe and draft',await frameIdentity.evaluate(e=>e===document.querySelector('[data-do-companion]').shadowRoot.querySelector('iframe'))&&await iframe.locator('#do-source').inputValue()==='Fictional embedded note.');
  await page.getByRole('button',{name:'Minimise DO workspace',exact:true}).click();
  check('close returns keyboard focus to the launcher',await page.getByRole('button',{name:'Open DO. Drag to move or use Alt and arrow keys.',exact:true}).evaluate(e=>e.getRootNode().activeElement===e));
  await page.getByRole('button',{name:'Open DO. Drag to move or use Alt and arrow keys.',exact:true}).click();
  check('reopening preserves the iframe draft',await iframe.locator('#do-source').inputValue()==='Fictional embedded note.');
  await page.screenshot({animations:'disabled',path:out+'/embedded-1440.png',fullPage:false});
  check('no provider POST, foreign traffic or runtime errors',posts.length===0&&foreign.length===0&&errors.length===0);
  fs.writeFileSync(out+'/report.json',JSON.stringify({checks,posts,foreign,errors,scope:'Synthetic UI navigation; no live voice session or installed app changed.'},null,2));
 } catch(error) {fs.writeFileSync(out+'/failure.json',JSON.stringify({checks,posts,foreign,errors,message:error.message},null,2));throw error;} finally {await context.close();await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
