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
 const browser = await chromium.launch({headless:true,...(process.env.ASSEMBL_CHROMIUM_PATH ? {executablePath:process.env.ASSEMBL_CHROMIUM_PATH} : {channel:'chrome'})});
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

  page.on('pageerror',e=>errors.push(e.message));

  const titles=['assembl my day','assembl my trip','assembl a dinner date','assembl dinner at home','assembl clothes and gifts','assembl my shopping basket','assembl my appointments'];
  for(const width of [375,320,768,1440]) {
    await page.setViewportSize({width,height:1000});await page.goto(origin+'/do/personal',{waitUntil:'domcontentloaded'});
    await page.getByRole('heading',{name:'What would make life easier?',exact:true}).waitFor();await page.locator('#personal-assistant-input').waitFor();await page.waitForTimeout(1800);
    check(width+': input comes before collection',await page.evaluate(()=>document.querySelector('#personal-assistant-input').getBoundingClientRect().top<document.querySelector('[aria-label="Task starters"]').getBoundingClientRect().top));
    check(width+': seven whole-scene targets',await page.getByRole('region',{name:'Task starters'}).getByRole('button').count()===7);
    check(width+': no overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    check(width+': no duplicate old starter art',await page.getByRole('region',{name:'Ideas to get started'}).count()===0);
    await page.addStyleTag({content:'nextjs-portal{display:none!important}'});await page.screenshot({path:`${out}/today-${width}.png`});
    await page.locator('[data-miniature=desk]').scrollIntoViewIfNeeded();await page.waitForTimeout(2000);await page.screenshot({path:`${out}/collection-${width}.png`});
    const editor=await page.locator('#personal-assistant-input').elementHandle();await page.locator('#personal-assistant-input').fill('Fictional existing draft.');
    const row=page.getByRole('region',{name:'Task starters'}).getByRole('button').first();await row.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.activeElement?.id==='personal-assistant-input');
    check(width+': keyboard appends in same mounted editor',await editor.evaluate(e=>e===document.querySelector('#personal-assistant-input'))&&(await page.locator('#personal-assistant-input').inputValue()).startsWith('Fictional existing draft.\n\nHelp me'));
    check(width+': capability limits remain visible',(await page.getByRole('complementary',{name:'Chosen task'}).innerText()).includes('not connected'));
  }
  await page.setViewportSize({width:375,height:1000});await page.goto(origin+'/do/personal',{waitUntil:'domcontentloaded'});await page.locator('#personal-assistant-input').waitFor();
  for(const title of titles){await page.locator('#personal-assistant-input').fill('');await page.getByRole('region',{name:'Task starters'}).getByRole('button',{name:new RegExp('^'+title+' ·')}).click();check(title+': fills editable prompt',(await page.locator('#personal-assistant-input').inputValue()).startsWith('Help me'));}
  await page.locator('#personal-assistant-input').fill('a'.repeat(4000));await page.getByRole('region',{name:'Task starters'}).getByRole('button').first().click();check('full draft preserved',await page.locator('#personal-assistant-input').inputValue()==='a'.repeat(4000));check('full draft explains refusal',(await page.getByRole('complementary',{name:'Chosen task'}).innerText()).includes('nearly full'));
  await page.getByText('Add',{exact:true}).first().click();await page.getByRole('button',{name:'Note or checklist',exact:true}).click();await page.locator('#life-admin-source').fill('Fictional local note');await page.getByRole('region',{name:'Task starters'}).getByRole('button').first().click();check('local note receives starter without losing text',(await page.locator('#life-admin-source').inputValue()).startsWith('Fictional local note\n\nHelp me'));
  await page.locator('#life-admin-source').fill('b'.repeat(12000));await page.getByRole('region',{name:'Task starters'}).getByRole('button').first().click();check('full local note preserved',await page.locator('#life-admin-source').inputValue()==='b'.repeat(12000));
  await page.goto(origin+'/do/personal',{waitUntil:'domcontentloaded'});await page.locator('[data-miniature=desk]').scrollIntoViewIfNeeded();await page.waitForTimeout(2400);const scene=page.locator('[data-miniature=desk]');await scene.screenshot({path:out+'/motion-rest.png'});
  await page.getByRole('region',{name:'Task starters'}).getByRole('button').first().hover();await page.waitForTimeout(220);await scene.screenshot({path:out+'/motion-moving.png'});check('gesture changes real clay pixels',!fs.readFileSync(out+'/motion-moving.png').equals(fs.readFileSync(out+'/motion-rest.png')));
  const before=await scene.evaluate(e=>getComputedStyle(e).transform);await page.mouse.wheel(0,90);await page.waitForTimeout(250);check('scroll gives art-only depth',before!==await scene.evaluate(e=>getComputedStyle(e).transform));
  await page.locator('#personal-assistant-input').focus();await page.waitForTimeout(250);check('writing quiets depth',await scene.evaluate(e=>getComputedStyle(e).transform==='matrix(1, 0, 0, 1, 0, 0)'));
  await page.locator('[data-miniature=desk]').scrollIntoViewIfNeeded();await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(800);await scene.screenshot({path:out+'/reduced-before.png'});await page.mouse.move(0,0);await page.getByRole('region',{name:'Task starters'}).getByRole('button').first().hover();await page.waitForTimeout(500);await scene.screenshot({path:out+'/reduced-after.png'});check('reduced motion stays still',fs.readFileSync(out+'/reduced-before.png').equals(fs.readFileSync(out+'/reduced-after.png')));
  await page.locator('[data-miniature=calendar]').scrollIntoViewIfNeeded();await page.waitForTimeout(500);check('offscreen scenes release canvas',await page.locator('[data-miniature=desk] canvas').count()===0);
  console.log('RUNTIME_ERRORS',JSON.stringify(errors));check('no runtime errors',errors.length===0);check('no API writes',writes.length===0);fs.writeFileSync(out+'/results.json',JSON.stringify({checks,errors,writes},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
