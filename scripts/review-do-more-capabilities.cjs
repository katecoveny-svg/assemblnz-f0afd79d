/** Entry-only regression; all APIs fictional, all writes and media blocked. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.ASSEMBL_PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.ASSEMBL_REVIEW_ORIGIN||'http://localhost:3034';
const out=process.env.ASSEMBL_REVIEW_OUTPUT||'output/playwright/do-more-capabilities';
const checks=[],posts=[],errors=[],geometry=[];
const visibleInPanel=async(link,panel)=>{const a=await link.boundingBox(),b=await panel.boundingBox();return a&&b&&a.y>=b.y&&a.y+a.height<=b.y+b.height};
const inspect=async(panel)=>panel.evaluate(e=>{const r=e.getBoundingClientRect();return {display:getComputedStyle(e).display,x:r.x,y:r.y,width:r.width,height:r.height,viewport:[innerWidth,innerHeight],scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight,links:[...e.querySelectorAll('a')].filter(a=>a.getClientRects().length).map(a=>{const b=a.getBoundingClientRect();return {text:a.textContent,x:b.x,right:b.right,width:b.width,height:b.height,font:getComputedStyle(a).fontSize}})}});
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
  if(url.pathname==='/entry-fixture')return route.fulfill({contentType:'text/html',body:'<!doctype html><title>Fictional companion host</title><p>Fictional practice note.</p><script src="/api/do/widget" defer></script>'});
  if(url.pathname==='/api/do/widget')return route.continue();
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
  const editor=page.locator('#personal-assistant-input');
  await editor.fill('Fictional draft to retain across menus.');
  const more=page.getByRole('navigation',{name:'DO',exact:true}).locator('details[data-do-overlay]');
  const add=page.getByRole('navigation',{name:'Choose how to start'}).locator('details[data-do-overlay]');
  for(const width of [1488,1190,744,375,320]){
    await page.setViewportSize({width,height:width<600?812:906});await page.evaluate(()=>window.scrollTo(0,0));
    await more.locator('summary').first().click();
    const tools=more.locator('details');if(!await tools.evaluate(e=>e.open))await tools.locator('summary').click();
    const panel=page.getByRole('navigation',{name:'More DO tools'});
    await panel.getByRole('link',{name:'Privacy',exact:true}).scrollIntoViewIfNeeded();
    const g=await inspect(panel);geometry.push({surface:'page',width,...g});
    check('More fits viewport with no horizontal clipping at '+width,g.display==='block'&&g.x>=15&&g.x+g.width<=width-15&&g.y>=0&&g.y+g.height<=g.viewport[1]-15&&g.scrollWidth<=g.clientWidth);
    check('links are full readable rows at '+width,g.links.every(a=>a.width>=g.width-60&&a.height>=44&&a.x>=g.x&&a.right<=g.x+g.width&&parseFloat(a.font)>=14));
    check('Privacy remains reachable by scrolling at '+width,await visibleInPanel(panel.getByRole('link',{name:'Privacy',exact:true}),panel));
    const textContrast=await panel.evaluate(e=>{const lum=s=>s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);const bg=lum(getComputedStyle(e).backgroundColor);return Math.min(...[...e.querySelectorAll('a,small,p,summary')].map(n=>{const fg=lum(getComputedStyle(n).color);return (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05)}))});geometry[geometry.length-1].minTextContrast=textContrast;check('More text contrast exceeds 4.5 at '+width,textContrast>=4.5);
    await panel.evaluate(e=>{e.scrollTop=0});
    await page.screenshot({path:out+'/more-'+width+'.png'});
    await more.locator('summary').first().focus();await page.keyboard.press('Escape');
    check('Escape closes More and restores its trigger at '+width,await more.evaluate(e=>!e.open&&document.activeElement===e.querySelector('summary')));
    await page.keyboard.press('Enter');await panel.waitFor({state:'visible'});
    await page.keyboard.press('Tab');check('Tab enters menu at '+width,await panel.evaluate(e=>e.contains(document.activeElement)));
    await page.keyboard.press('Escape');
    await add.locator('summary').click();
    await more.locator('summary').first().click();check('opening More closes Add at '+width,!await add.evaluate(e=>e.open));
    await add.locator('summary').focus();await page.keyboard.press('Enter');check('opening Add closes More at '+width,!await more.evaluate(e=>e.open));
    const a=await inspect(add.locator('[data-do-overlay-panel]'));check('Add remains open at '+width,await add.evaluate(e=>e.open));check('Add fits viewport at '+width,a.x>=15&&a.x+a.width<=width-15&&a.scrollWidth<=a.clientWidth);
    await page.screenshot({path:out+'/add-'+width+'.png'});
    await page.getByRole('heading',{name:'What would you like done?',exact:true}).click();check('outside click closes Add at '+width,!await add.evaluate(e=>e.open));
    await more.locator('summary').first().click();await page.getByRole('heading',{name:'What would you like done?',exact:true}).click();check('outside click closes More at '+width,!await more.evaluate(e=>e.open));
    check('menus preserve draft at '+width,await editor.inputValue()==='Fictional draft to retain across menus.');
    check('page has no horizontal overflow at '+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  check('page navigation never starts microphone',await page.evaluate(()=>window.__media===0));
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('[data-do-idea=agenda]').click();
  check('agenda appends without submitting',await editor.inputValue()==='Fictional draft to retain across menus.\n\nHelp me plan the week ahead');
  await page.getByText('More ways DO can help',{exact:true}).click();
  const expected=await page.locator('[data-do-idea]').evaluateAll(es=>es.map(e=>({id:e.dataset.doIdea,label:e.getAttribute('aria-label')})));
  check('nine shared capability examples are available',expected.length===9);
  await page.getByRole('region',{name:'Ideas to get started'}).screenshot({path:out+'/capabilities-desktop.png'});
  await page.setViewportSize({width:375,height:812});check('all phone example text wraps within its control',await page.locator('[data-do-idea]').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth)));await page.getByRole('region',{name:'Ideas to get started'}).screenshot({path:out+'/capabilities-phone.png'});
  for(const [surface,url,width] of [['widget','/do/widget',1440],['phone-web','/do/widget',375],['native-hosted','/do/widget?nativeReview=1',430]]){
    await page.setViewportSize({width,height:900});await page.goto(origin+url);await page.locator('#do-source').waitFor();
    const actual=await page.locator('[data-do-idea]').evaluateAll(es=>es.map(e=>({id:e.dataset.doIdea,label:e.getAttribute('aria-label')})));
    check(surface+' uses the same capability definitions',JSON.stringify(actual)===JSON.stringify(expected));
    await page.locator('#do-source').fill('Fictional existing widget draft.');await page.locator('.do-source-details>summary').click();await page.locator('#do-source-title').fill('Fictional source title');await page.locator('#do-source-url').fill('https://example.com/notes');await page.locator('[data-do-idea=agenda]').click();
    await page.waitForFunction(()=>document.querySelector('#do-source').value.includes('Help me plan'));
    check(surface+' appends and retains draft',await page.locator('#do-source').inputValue()==='Fictional existing widget draft.\n\nHelp me plan the week ahead');
    check(surface+' retains source metadata',await page.locator('#do-source-title').inputValue()==='Fictional source title'&&await page.locator('#do-source-url').inputValue()==='https://example.com/notes');
    await page.evaluate(()=>window.scrollTo(0,0));const menu=page.locator('details[data-do-overlay]');await menu.locator('summary').first().click();await menu.locator('details>summary').click();
    const panel=page.getByRole('navigation',{name:'More DO tools'});const g=await inspect(panel);geometry.push({surface,width,...g});check(surface+' More remains inside viewport',g.x>=15&&g.x+g.width<=width-15&&g.scrollWidth<=g.clientWidth);
    await page.screenshot({path:out+'/'+surface+'-more.png'});await page.keyboard.press('Escape');check(surface+' never starts microphone',await page.evaluate(()=>window.__media===0));
  }
  await page.setViewportSize({width:500,height:900});await page.goto(origin+'/entry-fixture');await page.getByRole('button',{name:'Open DO. Drag to move or use Alt and arrow keys.',exact:true}).click();
  const frame=page.frameLocator('iframe');await frame.locator('#do-source').waitFor();
  check('companion iframe uses the same capability definitions',JSON.stringify(await frame.locator('[data-do-idea]').evaluateAll(es=>es.map(e=>({id:e.dataset.doIdea,label:e.getAttribute('aria-label')}))))===JSON.stringify(expected));
  await frame.locator('#do-source').fill('Fictional companion draft.');await frame.locator('[data-do-idea=school]').click();
  await page.waitForTimeout(100);check('companion preserves draft when adding an idea',(await frame.locator('#do-source').inputValue()).startsWith('Fictional companion draft.\n\n'));
  const menu=frame.locator('details[data-do-overlay]');await menu.locator('summary').first().click();await menu.locator('details>summary').click();
  check('embedded tool links open separately',await menu.getByRole('link',{name:'School briefing'}).getAttribute('target')==='_blank');
  const embeddedPanel=frame.getByRole('navigation',{name:'More DO tools'});const embeddedGeometry=await inspect(embeddedPanel);geometry.push({surface:'companion-iframe',...embeddedGeometry});check('companion menu fits its own viewport',embeddedGeometry.x>=15&&embeddedGeometry.x+embeddedGeometry.width<=embeddedGeometry.viewport[0]-15&&embeddedGeometry.y+embeddedGeometry.height<=embeddedGeometry.viewport[1]-15&&embeddedGeometry.scrollWidth<=embeddedGeometry.clientWidth);
  await embeddedPanel.getByRole('link',{name:'Privacy',exact:true}).scrollIntoViewIfNeeded();check('companion menu scroll reaches Privacy',await visibleInPanel(embeddedPanel.getByRole('link',{name:'Privacy',exact:true}),embeddedPanel));await embeddedPanel.evaluate(e=>{e.scrollTop=0});
  await frame.locator('body').evaluate(()=>{const s=document.createElement('style');s.textContent='nextjs-portal{display:none!important}';document.head.append(s)});
  await page.screenshot({path:out+'/companion-iframe-more.png'});
  check('companion never starts microphone',await frame.locator('body').evaluate(()=>window.__media===0));
  check('no writes or microphone starts',posts.length===0&&await page.evaluate(()=>window.__media===0));
  check('no runtime errors',errors.length===0);
  fs.writeFileSync(out+'/report.json',JSON.stringify({checks,geometry,posts,errors,scope:'Fictional APIs; isolated Chrome. Phone is web viewport, native-hosted is its existing URL, not native binary proof. 1488 desktop and 1190/744 effective viewport reflow cover zoom-like constraints; screenshot alone does not disclose actual browser zoom.'},null,2));
 }finally{await page.screenshot({path:out+'/final-state.png'}).catch(()=>{});await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
