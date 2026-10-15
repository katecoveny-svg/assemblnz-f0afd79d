const { openPersonalEntry } = require('./personal-entry-helpers.cjs');
/** Entry-only regression; all APIs fictional, all writes and media blocked. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.ASSEMBL_PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.ASSEMBL_REVIEW_ORIGIN||'http://localhost:3034';
const out=process.env.ASSEMBL_REVIEW_OUTPUT||'output/playwright/do-entry-chrome';
const checks=[],posts=[],errors=[],contrast=[];
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
  if (url.pathname === '/api/do/session') return route.fulfill({ json: { workspaceKey: '10000000-0000-4000-8000-000000000001' } });
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
  await openPersonalEntry(page);
  await page.evaluate(()=>document.fonts.ready);
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:out+'/do-desktop.png',fullPage:false});
  const selectedWrite=page.getByRole('button',{name:'Write',exact:true});
  const luminance=rgb=>rgb.map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
  const ratio=(a,b)=>(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  const measure=async(state,width)=>{
    const style=await selectedWrite.evaluate(e=>{const s=getComputedStyle(e);return {color:s.color,opacity:s.opacity,background:s.background,outlineColor:s.outlineColor,outlineWidth:s.outlineWidth,focus:e.matches(':focus-visible'),disabled:e.disabled,hover:e.matches(':hover'),active:e.matches(':active')};});
    const rgb=style.color.match(/[\d.]+/g).slice(0,3).map(Number),foreground=luminance(rgb);
    const oldStyle=await selectedWrite.getAttribute('style');
    let pixels;
    try {await selectedWrite.evaluate(e=>e.style.setProperty('color','transparent','important'));pixels=await require('sharp')(await selectedWrite.screenshot()).removeAlpha().raw().toBuffer({resolveWithObject:true});}
    finally {await selectedWrite.evaluate((e,value)=>value===null?e.removeAttribute('style'):e.setAttribute('style',value),oldStyle);}
    let minimum=Infinity;
    for(let y=12;y<pixels.info.height-12;y++)for(let x=22;x<pixels.info.width-22;x++){const offset=(y*pixels.info.width+x)*pixels.info.channels;minimum=Math.min(minimum,ratio(foreground,luminance([...pixels.data.subarray(offset,offset+3)])));}
    const sample={width,state,minContrast:Number(minimum.toFixed(2)),...style};
    if(state==='focus'){const adjacent=await selectedWrite.evaluate(e=>getComputedStyle(e.closest('nav')).backgroundColor);sample.focusContrast=Number(ratio(luminance(style.outlineColor.match(/[\d.]+/g).slice(0,3).map(Number)),luminance(adjacent.match(/[\d.]+/g).slice(0,3).map(Number))).toFixed(2));}
    contrast.push(sample);
    check('selected Write '+state+' contrast at '+width+'px is at least 4.5:1 ('+sample.minContrast+')',minimum>=4.5&&style.opacity==='1');
    if(state==='focus')check('keyboard focus remains visible at '+width+'px',style.focus&&parseFloat(style.outlineWidth)>=3&&sample.focusContrast>=3);
    if(state==='hover'||state==='active'||state==='disabled')check(state+' is actually engaged at '+width+'px',style[state]);
    await page.screenshot({path:out+'/write-'+state+'-'+width+'.png',fullPage:false});
  };
  for(const width of [1440,375]){
    await page.setViewportSize({width,height:width===1440?1000:812});
    await selectedWrite.click();await page.mouse.move(0,0);await measure('rest',width);
    await selectedWrite.hover();await measure('hover',width);
    await page.mouse.move(0,0);await selectedWrite.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await measure('focus',width);
    await selectedWrite.hover();await page.mouse.down();await measure('active',width);await page.mouse.up();
    // CSS-only disabled coverage: the product does not currently disable Write.
    // Set the native property only inside this isolated fixture, never add app logic.
    await selectedWrite.evaluate(e=>{e.disabled=true});await measure('disabled',width);await selectedWrite.evaluate(e=>{e.disabled=false});
    check('state inspection has no horizontal overflow at '+width+'px',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.setViewportSize({width:1440,height:1000});
  const editor=await page.locator('#personal-assistant-input').elementHandle();
  await page.locator('#personal-assistant-input').fill('Fictional weekend plan.');
  await page.getByText('Draft something else',{exact:true}).click();
  await page.getByText('More ways DO can help',{exact:true}).click();
  await page.locator('[data-do-idea=shop]').click();
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
  check('legacy routes remain reachable',await menu.getByRole('link',{name:'Builder · prepare a plan'}).getAttribute('href')==='/do/builder' && await menu.getByRole('link',{name:'Bills · CSV and invoice review'}).getAttribute('href')==='/do/bills');
  await menu.locator('summary').filter({hasText:'Tools & examples'}).press('Escape');
  check('Escape closes menu and restores focus',await menu.evaluate(e=>!e.open&&document.activeElement===e.querySelector('summary')));
  check('navigation and shortcuts never start microphone or submit data',posts.length===0&&await page.evaluate(()=>window.__media===0));
  for(const width of [375,320,768,1440]){
   await page.setViewportSize({width,height:width<600?844:1000});
   check(width+'px no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  check('reduced motion disables shortcut transitions',await page.locator('[data-do-idea=shop]').evaluate(e=>getComputedStyle(e).transitionProperty==='none'||getComputedStyle(e).transitionDuration.split(',').every(value=>parseFloat(value)<=.00001)));
  await page.locator('#personal-assistant-input').focus();
  check('editor focus is visible',await page.locator('#personal-assistant-input').evaluate(e=>getComputedStyle(e).outlineStyle!=='none'));
  await page.goto(origin+'/do/personal');
  await openPersonalEntry(page);
  await page.setViewportSize({width:375,height:844});
  await page.evaluate(()=>document.fonts.ready);await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:out+'/do-mobile.png',fullPage:false});
  check('/do/personal uses the same entry',await page.getByRole('heading',{name:'What would you like done?',exact:true}).count()===1);
  check('no runtime errors',errors.length===0);
  fs.writeFileSync(out+'/report.json',JSON.stringify({checks,contrast,posts,errors,scope:'Synthetic browser checks. No installed PWA/native or live account/provider claim.'},null,2));
 }finally{await page.screenshot({path:out+'/final-state.png',fullPage:false}).catch(()=>{});await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
