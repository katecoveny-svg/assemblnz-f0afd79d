/** Reproduce the native activeTab boundary blocking headless interruption testing. Not an execution proof. */
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const JSZip=require('jszip');
const {chromium}=require(process.env.ASSEMBL_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'do-mv3-proof-')),extension=path.join(root,'extension'),profile=path.join(root,'profile');
 const zip=await JSZip.loadAsync(await fs.readFile('public/do/downloads/assembl-do-browser-pilot-1.9.0.zip'));
 for(const entry of Object.values(zip.files)){if(entry.dir)continue;const file=path.join(extension,entry.name);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,await entry.async('nodebuffer'));}
 assert.deepEqual(JSON.parse(await fs.readFile(path.join(extension,'manifest.json'),'utf8')),JSON.parse(await fs.readFile('apps/do/extension/pilot/manifest.json','utf8')));
 const launch=()=>chromium.launchPersistentContext(profile,{headless:true,channel:'chromium',...(process.env.ASSEMBL_CHROMIUM_PATH?{executablePath:process.env.ASSEMBL_CHROMIUM_PATH}:{}),args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
 let context;
 try {
  context=await launch();
  let worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');
  const id=new URL(worker.url()).host,page=await context.newPage();
  await page.goto(`chrome-extension://${id}/browser-connection.html`);
  await page.locator('#setup').evaluate(el=>el.open=true);
  await page.locator('#setup-journal').waitFor({state:'visible'});
  console.log('PASS actual MV3 missing journal requires explicit setup');
  await page.locator('#setup-journal').click();
  await page.waitForFunction(()=>document.querySelector('#journal-status').textContent.includes('Local recovery is ready.'));
  console.log('PASS actual MV3 trusted companion setup persists journal');
  // All navigation is fulfilled locally; no live first-party session is read.
  const fixture=await fs.readFile('test/fixtures/do-browser/cart-fixture.html','utf8');
  await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.href==='http://127.0.0.1:4198/cart-fixture.html')return r.fulfill({contentType:'text/html',body:fixture});if(u.href==='https://www.assembl.co.nz/api/do/session')return r.fulfill({contentType:'application/json',body:JSON.stringify({workspaceKey:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'})});if(u.href==='https://www.assembl.co.nz/do/personal')return r.fulfill({contentType:'text/html',body:'<h1>Fictional Personal DO</h1>'});return r.abort();});
  const workspace=await context.newPage();await workspace.goto('https://www.assembl.co.nz/do/personal');
  const cart=await context.newPage();await cart.goto('http://127.0.0.1:4198/cart-fixture.html');await cart.bringToFront();
  const evidence=await page.evaluate(async()=>{
   const inspect=await chrome.runtime.sendMessage({type:'do:browser-companion',action:'inspect'});
   const [active]=await chrome.tabs.query({active:true,currentWindow:true});
   const workspaceId=inspect.data.workspaces[0]?.id;
   // Probe the real native boundary, without forging sender, broker or permission.
   const connect=await chrome.runtime.sendMessage({type:'do:browser-companion',action:'connect',targetId:active.id,workspaceId});
   let injectionError=null;try{await chrome.scripting.executeScript({target:{tabId:active.id},func:()=>location.href});}catch(e){injectionError=e.message;}
   return {selectionIssue:inspect.data.selectionIssue,workspaceFound:Boolean(workspaceId),connect,injectionError};
  });
  assert.equal(evidence.workspaceFound,true);
  assert.equal(evidence.connect.ok,false);
  assert.match(evidence.injectionError,/permission|access/i);
  evidence.quantity=await cart.locator('[data-product]').evaluateAll(rows=>rows.map(r=>({id:r.dataset.product,quantity:Number(r.querySelector('output').value)})));
  assert.ok(evidence.quantity.every(i=>i.quantity===0));
  const out='output/playwright/mv3-interruption';await fs.mkdir(out,{recursive:true});
  await fs.writeFile(path.join(out,'platform-boundary.json'),JSON.stringify(evidence,null,2)+'\n');
  const session=await context.newCDPSession(cart);evidence.browser=await session.send('Browser.getVersion');const {targetInfo}=await session.send('Target.getTargetInfo');
  const browserSession=await context.browser().newBrowserCDPSession();
  try{await browserSession.send('Extensions.triggerAction',{id,targetId:targetInfo.targetId});evidence.triggerAction='supported';}catch(e){evidence.triggerAction=e.message;}
  await fs.writeFile(path.join(out,'platform-boundary.json'),JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify(evidence,null,2));
  assert.notEqual(evidence.triggerAction,'supported','Runtime supports native action: extend this harness to the interruption scenarios.');
  console.log('BLOCKED before dispatch: unchanged pilot requires native toolbar activeTab gesture; headless profile has no toolbar gesture. No effect or claim was made.');
 }finally{await context?.close();await fs.rm(root,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
