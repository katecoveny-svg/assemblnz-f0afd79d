/* Phone viewport/companion regression proof. Physical iPhone and native keyboard QA remain separate. */
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.ASSEMBL_PLAYWRIGHT_MODULE||'playwright');
const out=process.env.ASSEMBL_REVIEW_OUTPUT||'/tmp/assembl-do-mobile-review';
const origin='http://127.0.0.1:3021';
const checks=[];
const check=(label,value)=>{assert.ok(value,label);checks.push(label);console.log('PASS '+label)};
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const log=fs.openSync(out+'/server.log','w');
 const server=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3021'],{stdio:['ignore',log,log]});
 let browser;
 try{
  for(let i=0;i<90;i++){try{await fetch(origin+'/do',{signal:AbortSignal.timeout(60000)});break}catch{await new Promise(r=>setTimeout(r,500))}}
  browser=await chromium.launch({executablePath:process.env.ASSEMBL_CHROMIUM_PATH,headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000},hasTouch:true});
  let page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const visit=async route=>{await page.goto(origin+route,{waitUntil:'networkidle',timeout:120000});await page.addStyleTag({content:'nextjs-portal{display:none!important}'});};
  const fit=async label=>check(label+' fits',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const snap=async name=>page.screenshot({path:out+'/'+name+'.png',animations:'disabled'});
  await visit('/do');await fit('DO desktop');await snap('do-desktop');
  check('Editorial art loads',await page.locator('img[src*="work-in-your-pocket"]').first().evaluate(e=>e.complete&&e.naturalWidth>0));
  await page.setViewportSize({width:375,height:812});await visit('/do');await fit('DO 375px');await snap('do-mobile');
  await visit('/do/widget');await fit('Workspace 375px');await snap('workspace-mobile');
  const source=page.locator('textarea').first();await source.fill('Please prepare a short reply about the Friday proposal.');
  check('Phone editor avoids auto zoom',await source.evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=16));
  await page.getByRole('button',{name:'Talk',exact:true}).click();
  await page.getByRole('button',{name:'Write',exact:true}).click();
  check('Mode switch preserves writing',await source.inputValue()==='Please prepare a short reply about the Friday proposal.');
  await page.setViewportSize({width:320,height:640});await fit('Workspace 320px');
  await page.setViewportSize({width:812,height:375});await fit('Workspace landscape');
  await page.setViewportSize({width:375,height:812});await visit('/do/install#keyboard');
  check('Keyboard release status is honest',await page.getByText('IN DEVELOPMENT · NOT YET INSTALLABLE',{exact:true}).isVisible());
  // Isolate the distribution surface from the React UI; use the exact generated source.
  await page.close(); page=await context.newPage(); await page.setViewportSize({width:375,height:812}); page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://www.assembl.co.nz/do/widget',route=>route.fulfill({contentType:'text/html',body:'<main>Workspace fixture: no provider calls</main>'}));
  await page.setContent('<main><p style="padding:20px;margin-top:180px" id="brief">Prepare the Thursday proposal.</p></main>');
  await page.addScriptTag({content:fs.readFileSync('apps/do/extension/floating.js','utf8')});
  const launch=page.locator('.launch');await launch.tap();
  const panel=page.locator('.panel');check('Tap opens companion',await panel.isVisible());
  await page.locator('.close').tap();
  const before=await launch.boundingBox();
  const session=await context.newCDPSession(page);
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:before.x+30,y:before.y+30}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:50,y:220}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const after=await launch.boundingBox();check('Touch drag moves launcher',Math.abs(after.y-before.y)>30);
  await page.evaluate(()=>window.assemblDo.open());
  // Simulate the visual viewport shrinking as the phone software keyboard opens.
  await page.evaluate(()=>{Object.defineProperty(window,'visualViewport',{configurable:true,value:{width:375,height:350,offsetLeft:0,offsetTop:0}});dispatchEvent(new Event('resize'));});
  const small=await panel.boundingBox();check('Companion stays in keyboard viewport',small.y>=8&&small.y+small.height<=343);
  await page.locator('.dock').tap();check('Reset keeps header reachable',(await panel.boundingBox()).y===8);
  await page.evaluate(()=>{delete window.visualViewport;dispatchEvent(new Event('resize'));});
  await page.locator('.tools button').first().tap();
  await page.locator('#brief').tap();
  check('Touch context requires review',await page.locator('.review').isVisible());
  check('Only chosen text reaches review',(await page.locator('.review textarea').inputValue()).includes('Thursday proposal'));
  await snap('companion-mobile-review');
  await page.locator('.close').tap();check('Minimise retains workspace frame',(await page.locator('iframe').getAttribute('src')).endsWith('/do/widget'));
  await page.emulateMedia({reducedMotion:'reduce'});await visit('/do');
  check('Reduced motion removes editorial transition',await page.locator('img[src*="work-in-your-pocket"]').first().evaluate(e=>parseFloat(getComputedStyle(e).transitionDuration)<=0.00001));
  check('No page runtime errors',errors.length===0);
  fs.writeFileSync(out+'/results.json',JSON.stringify({checks,errors,nativeDeviceTested:false},null,2));
 }finally{await browser?.close();server.kill('SIGTERM');fs.closeSync(log)}
})().catch(e=>{console.error(e);process.exitCode=1});
