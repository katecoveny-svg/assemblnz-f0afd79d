/* Local synthetic proof. All API requests mocked; no microphone or providers. */
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://localhost:3196';
const out = process.env.ASSEMBL_REVIEW_OUTPUT || 'output/playwright/clay';
const checks = [], errors = [], writes = [];
const check = (name, value) => { assert.ok(value, name); checks.push(name); console.log('PASS '+name); };
(async () => {
 fs.mkdirSync(out, {recursive:true});
 const browser = await chromium.launch({headless:true,channel:'chrome'});
 try {
  const context = await browser.newContext({ reducedMotion:'no-preference', serviceWorkers:'block' });
  let owner = 'guest';
  await context.route('**/*', async route => {
   const req=route.request(), url=new URL(req.url());
   if(url.origin !== origin) return route.abort();
   if(!url.pathname.startsWith('/api/')) return route.continue();
   if(req.method() !== 'GET') writes.push(url.pathname);
   if(url.pathname === '/api/do/personal') return route.fulfill({status:owner === 'guest' ? 401 : 200,json:{workspaceKey:owner,responsibilities:[],runs:[],worker:{configured:false}}});
   if(url.pathname === '/api/do/session') return route.fulfill({json:{workspaceKey:owner}});
   if(url.pathname === '/api/do/personal/assistant') return route.fulfill({json:{ready:false,signedIn:owner !== 'guest',reason:'sign_in_required',message:'Sign in to ask DO. You can write here first.',externalActions:false}});
   if(url.pathname === '/api/do/live-token') return route.fulfill({json:{enabled:false,configured:false,signedIn:false,remaining:0}});
   return route.fulfill({status:503,json:{error:'Synthetic connection unavailable',enabled:false}});
  });
  const page=await context.newPage();


  await page.setViewportSize({width:375,height:900});await page.goto(origin+'/do/widget?entry=write');await page.locator('#personal-assistant-input').waitFor();await page.locator('#personal-assistant-input').fill('Fictional companion draft.');const editor=await page.locator('#personal-assistant-input').elementHandle();
  const list=page.getByRole('region',{name:'Task starters'});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:out+'/companion-375.png'});await list.scrollIntoViewIfNeeded();await page.waitForTimeout(4000);await page.addStyleTag({content:'nextjs-portal{display:none!important}'});await list.screenshot({path:out+'/companion-paper-375.png'});
  await list.getByRole('button',{name:'assembl my trip · Flights & stays · task starter'}).click();await page.waitForFunction(()=>document.activeElement?.id==='personal-assistant-input');check('companion starter focuses same mounted editor and appends without losing draft',await editor.evaluate(e=>e===document.querySelector('#personal-assistant-input'))&&(await page.locator('#personal-assistant-input').inputValue()).startsWith('Fictional companion draft.\n\nHelp me'));check('companion starter context visible',await page.getByRole('note').isVisible());check('companion no writes',writes.length===0);const existing=await page.locator('#personal-assistant-input').inputValue();
  const rejection=await page.locator('#personal-assistant-input').evaluate(e=>{const parent=e.closest('fieldset');parent.disabled=true;const detail={text:'Blocked thought',purpose:'starter'};window.dispatchEvent(new CustomEvent('assembl:do-assistant-note',{detail}));parent.disabled=false;return detail.result;});check('disabled handoff editor rejects starter',rejection?.accepted===false&&await page.locator('#personal-assistant-input').inputValue()===existing);
  const hidden=await page.locator('#personal-assistant-input').evaluate(e=>{const parent=e.closest('fieldset');parent.hidden=true;const detail={text:'Blocked hidden thought',purpose:'starter'};window.dispatchEvent(new CustomEvent('assembl:do-assistant-note',{detail}));parent.hidden=false;return detail.result;});check('hidden call editor rejects starter',hidden?.accepted===false&&await page.locator('#personal-assistant-input').inputValue()===existing);
  fs.writeFileSync(out+'/companion-starter-results.json',JSON.stringify(checks));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
