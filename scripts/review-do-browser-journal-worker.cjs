const assert=require('node:assert/strict'),fs=require('node:fs');
const {build}=require('node:module').createRequire(require.resolve('tsx'))('esbuild');
const {chromium}=require(process.env.ASSEMBL_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const bundle=await build({entryPoints:['test/fixtures/do-browser/journal-worker-entry.ts'],bundle:true,format:'iife',write:false});
 const browser=await chromium.launch({headless:true,...(process.env.ASSEMBL_CHROMIUM_PATH?{executablePath:process.env.ASSEMBL_CHROMIUM_PATH}:{})});
 try{
 const page=await browser.newPage();await page.route('**/*',r=>r.fulfill({contentType:r.request().url().endsWith('worker.js')?'text/javascript':'text/html',body:r.request().url().endsWith('worker.js')?bundle.outputFiles[0].text:fs.readFileSync('test/fixtures/do-browser/journal-recovery.html','utf8')}));
 await page.goto('http://127.0.0.1:4198/recovery');
 const initial=await page.evaluate(async()=>{
  const state={name:'fixture-worker-'+crypto.randomUUID(),epoch:crypto.randomUUID(),owner:'fictional-owner',quantity:0,effects:0,revision:'r1',loseAck:true,current:true,scope:{connectionId:crypto.randomUUID(),tabId:4,documentId:'fictional-doc',origin:'http://127.0.0.1:4198',navigationRevision:0}};
  window.testState=state;let worker,seq=0,pending=new Map();
  window.spawnFixture=()=>{worker=new Worker('/worker.js');window.testWorker=worker;worker.onmessage=async({data:m})=>{
   if(m.host){let value;if(m.method==='owner')value=state.owner;if(m.method==='current')value=state.current;if(m.method==='observe')value={scope:state.scope,revision:state.revision,observedAt:Date.now(),currency:'NZD',items:[{productId:'fictional-oats',name:'Fixture oats',unitPriceCents:300,available:true,quantity:state.quantity}]};
    if(m.method==='effect'){state.quantity=m.args.quantity;state.revision='r'+(++state.effects+1);if(state.loseAck)return;}
    worker.postMessage({hostReply:m.host,value});return;}
   const callback=pending.get(m.id);pending.delete(m.id);callback?.(m);
  };};
  window.rpc=m=>new Promise(resolve=>{const id=++seq;pending.set(id,resolve);worker.postMessage({...m,id});});
  window.fixtureCommand=async(command,sender='fixture-companion')=>{const r=await window.rpc({sender,command});if(!r.ok)throw new Error(r.error);return r.value;};
  window.boot=initialize=>window.rpc({action:'boot',name:state.name,epoch:state.epoch,initialize});
  window.spawnFixture();await window.boot(true);await window.fixtureCommand({action:'connect',scope:state.scope});await window.fixtureCommand({action:'allow-read'});await window.fixtureCommand({action:'observe'});
  const review=await window.fixtureCommand({action:'prepare',quantities:[{productId:'fictional-oats',targetQuantity:1}]});
  window.lostPromise=window.fixtureCommand({action:'approve',digest:review.digest});return true;
 });assert.ok(initial);
 await page.waitForFunction(()=>window.testState.effects===1);
 await page.evaluate(()=>window.testWorker.terminate());
 const result=await page.evaluate(async()=>{window.spawnFixture();await window.boot(false);let requiresConnect=false;try{await window.fixtureCommand({action:'observe'});}catch{requiresConnect=true;}
 await window.fixtureCommand({action:'connect',scope:window.testState.scope});let readDenied=false;try{await window.fixtureCommand({action:'recover-read'});}catch{readDenied=true;}
 await window.fixtureCommand({action:'allow-read'});await window.fixtureCommand({action:'observe'});const review=await window.fixtureCommand({action:'prepare',quantities:[{productId:'fictional-oats',targetQuantity:2}]});let replayDenied=false;try{await window.fixtureCommand({action:'approve',digest:review.digest});}catch{replayDenied=true;}
 let pageDenied=false;try{await window.fixtureCommand({action:'recover-read'},'page');}catch{pageDenied=true;}
 return{requiresConnect,readDenied,replayDenied,pageDenied,effects:window.testState.effects};});
 for(const [key,value] of Object.entries(result)){assert.ok(key==='effects'?value===1:value,key);console.log('PASS '+key);}
 await page.getByRole('button',{name:'Approve fresh fictional-cart read'}).click();await page.getByRole('button',{name:'Acknowledge uncertainty — do not retry'}).waitFor({state:'visible'});
 await page.waitForFunction(()=>!document.getElementById('ack').disabled);
 assert.match(await page.locator('#review').innerText(),/"current": 1/);
 await page.getByRole('button',{name:'Acknowledge uncertainty — do not retry'}).click();await page.waitForFunction(()=>document.getElementById('result').textContent.includes('"acknowledged":true'));
 assert.equal(await page.evaluate(()=>window.testState.effects),1);console.log('PASS recovery UI acknowledges without replay');
 const denied=await page.evaluate(async()=>{window.testState.owner='other-fictional-owner';try{await window.fixtureCommand({action:'observe'});return false;}catch{return true;}});assert.ok(denied);console.log('PASS owner switch revokes worker connection');
 fs.mkdirSync('output/playwright/journal-worker',{recursive:true});await page.screenshot({path:'output/playwright/journal-worker/recovery.png'});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
