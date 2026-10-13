/** Entry-only regression; all APIs fictional, all writes and media blocked. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.ASSEMBL_PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.ASSEMBL_REVIEW_ORIGIN||'http://localhost:3034';
const out=process.env.ASSEMBL_REVIEW_OUTPUT||'output/playwright/do-entry-chrome';
const checks=[],posts=[],errors=[];
const check=(name,value)=>{assert.ok(value,name);checks.push(name);console.log('PASS '+name)};
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.ASSEMBL_CHROMIUM_PATH?{executablePath:process.env.ASSEMBL_CHROMIUM_PATH}:{channel:'chrome'})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
 const profile={displayName:'DO',avatar:'bloom',tone:'warm',responseLength:'brief',initiative:'on_request',preferences:'',voiceName:'Aoede',onboardingCompleted:true,updatedAt:'2026-10-12T00:00:00Z'};
 await context.addInitScript(()=>{window.__media=0;navigator.mediaDevices.getUserMedia=async()=>{window.__media++;throw new Error('Test blocks microphone')};});
 await context.route('**/*',route=>{
  const request=route.request(),url=new URL(request.url());
  if(url.origin!==origin)return route.abort();
  if(request.method()!=='GET'){posts.push(url.pathname);return route.abort()}
  if(url.pathname==='/api/do/personal')return route.fulfill({json:{workspaceKey:'10000000-0000-4000-8000-000000000001',responsibilities:[],runs:[],worker:{configured:false,lastSeenAt:null}}});
  if(url.pathname==='/api/do/personal/profile')return route.fulfill({json:{saved:true,profile}});
  if(url.pathname==='/api/do/personal/assistant')return route.fulfill({json:{ready:true,signedIn:true,message:'Ready'}});
  if(url.pathname==='/api/do/live-token')return route.fulfill({json:{enabled:true,configured:true,signedIn:true,remaining:3,dailyLimit:3,sessionSeconds:300,model:'fictional'}});
  if(url.pathname.startsWith('/api/'))return route.fulfill({status:503,json:{error:'Synthetic test: unavailable'}});
  return route.continue();
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(30000);
 try{
  await page.goto(origin+'/do');
  await page.locator('#personal-assistant-input').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:out+'/do-desktop.png',fullPage:false});
  const editor=await page.locator('#personal-assistant-input').elementHandle();
  await page.locator('#personal-assistant-input').fill('Fictional weekend plan.');
  await page.getByRole('button',{name:'Shop Plan this week’s shop',exact:true}).click();
  check('capability shortcut appends to existing draft',await page.locator('#personal-assistant-input').inputValue()==='Fictional weekend plan.\n\nPlan this week’s shop');
  await page.getByRole('button',{name:'Talk',exact:true}).click();
  await page.locator('.do-live-panel').waitFor();
  await page.getByRole('button',{name:'Write',exact:true}).click();
  check('Talk and Write preserve the actual mounted editor',await editor.evaluate(e=>e===document.querySelector('#personal-assistant-input')) && (await page.locator('#personal-assistant-input').inputValue()).startsWith('Fictional weekend plan.'));
  const entry=page.getByRole('navigation',{name:'Choose how to start'});
  await entry.locator('summary').click();
  check('unsupported uploads are explicit',await entry.getByText('Images and pasted text. PDF and other file uploads are not available here.',{exact:true}).isVisible());
  await entry.getByRole('button',{name:'Note or checklist',exact:true}).click();
  await page.locator('#life-admin-source').fill('Fictional checklist note to retain.');
  await page.getByRole('button',{name:'Write',exact:true}).click();
  await entry.locator('summary').click();
  await entry.getByRole('button',{name:'Note or checklist',exact:true}).click();
  check('local checklist draft survives entry changes',await page.locator('#life-admin-source').inputValue()==='Fictional checklist note to retain.');
  await page.getByRole('button',{name:'Write',exact:true}).click();
  check('Add closes after choosing a capture mode',await entry.locator('details').evaluate(e=>!e.open));
  const menu=page.getByRole('navigation',{name:'DO',exact:true}).locator('details').first();
  await menu.locator('summary').first().click();
  check('legacy tools are secondary, not deleted',!await menu.getByRole('link',{name:'Builder · prepare a plan'}).isVisible());
  await menu.locator('summary').filter({hasText:'Tools & examples'}).click();
  check('legacy routes remain reachable',await menu.getByRole('link',{name:'Builder · prepare a plan'}).getAttribute('href')==='/do/builder' && await menu.getByRole('link',{name:'Bills · examples and CSV'}).getAttribute('href')==='/do/bills');
  await menu.locator('summary').filter({hasText:'Tools & examples'}).press('Escape');
  check('Escape closes menu and restores focus',await menu.evaluate(e=>!e.open&&document.activeElement===e.querySelector('summary')));
  check('navigation and shortcuts never start microphone or submit data',posts.length===0&&await page.evaluate(()=>window.__media===0));
  for(const width of [375,320,768,1440]){
   await page.setViewportSize({width,height:width<600?844:1000});
   check(width+'px no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  check('reduced motion disables shortcut transitions',await page.getByRole('button',{name:'Shop Plan this week’s shop',exact:true}).evaluate(e=>getComputedStyle(e).transitionDuration.split(',').every(value=>parseFloat(value)===0)));
  await page.locator('#personal-assistant-input').focus();
  check('editor focus is visible',await page.locator('#personal-assistant-input').evaluate(e=>getComputedStyle(e).outlineStyle!=='none'));
  await page.goto(origin+'/do/personal');
  await page.locator('#personal-assistant-input').waitFor();
  await page.setViewportSize({width:375,height:844});
  await page.evaluate(()=>document.fonts.ready);await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:out+'/do-mobile.png',fullPage:false});
  check('/do/personal uses the same entry',await page.getByRole('heading',{name:'What would you like done?',exact:true}).count()===1);
  check('no runtime errors',errors.length===0);
  fs.writeFileSync(out+'/report.json',JSON.stringify({checks,posts,errors,scope:'Synthetic browser checks. No installed PWA/native or live account/provider claim.'},null,2));
 }finally{await page.screenshot({path:out+'/final-state.png',fullPage:false}).catch(()=>{});await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
