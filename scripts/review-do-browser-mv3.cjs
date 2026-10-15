/** Actual packaged MV3 setup/lifecycle proof. No activeTab grant or cart execution. */
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
  const boot=()=>page.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('do-browser-mutation-journal-v1');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,q=db.transaction('state').objectStore('state').get('meta');q.onsuccess=()=>{resolve(q.result.boot);db.close();};q.onerror=()=>reject(q.error);};}));
  const oldBoot=await boot();
  const cdp=await context.newCDPSession(page);await cdp.send('ServiceWorker.enable');
  await cdp.send('ServiceWorker.stopAllWorkers');
  await page.reload();
  
  await page.waitForFunction(()=>document.querySelector('#journal-status').textContent.includes('Local recovery is ready.'));
  assert.notEqual(await boot(),oldBoot);
  assert.equal(await page.locator('#journal-setup').isVisible(),false);
  assert.equal(await page.locator('#recovery').isVisible(),false);
  console.log('PASS actual MV3 worker restart resumes journal without connection');
  await context.close();context=await launch();
  const restarted=await context.newPage();await restarted.goto(`chrome-extension://${id}/browser-connection.html`);
  await restarted.waitForFunction(()=>document.querySelector('#journal-status').textContent.includes('Local recovery is ready.'));
  assert.equal(await restarted.locator('#journal-setup').isVisible(),false);
  assert.equal(await restarted.locator('#recovery').isVisible(),false);
  console.log('PASS actual MV3 browser restart preserves setup without restoring consent');
 }finally{await context?.close();await fs.rm(root,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
