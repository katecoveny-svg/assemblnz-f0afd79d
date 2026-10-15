/** Real web service-worker termination + IndexedDB; synthetic host, NOT MV3 transport proof. */
const assert=require('node:assert/strict'),http=require('node:http');
const {build}=require('node:module').createRequire(require.resolve('tsx'))('esbuild');
const {chromium}=require(process.env.ASSEMBL_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const bundle=await build({entryPoints:['test/fixtures/do-browser/journal-service-worker.ts'],bundle:true,format:'iife',write:false});
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/worker.js'?'text/javascript':'text/html');res.end(req.url==='/worker.js'?bundle.outputFiles[0].text:'<!doctype html><title>Fictional service worker recovery proof</title><h1>Fictional service worker recovery proof</h1>');});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,...(process.env.ASSEMBL_CHROMIUM_PATH?{executablePath:process.env.ASSEMBL_CHROMIUM_PATH}:{})});
 try{
 for(const cut of ['before-effect','after-effect']){
 const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/`);
 await page.evaluate(async cut=>{
  const state=window.state={name:'sw-proof-'+crypto.randomUUID(),epoch:crypto.randomUUID(),owner:'fictional-owner',cut,claimed:false,quantity:0,effects:0,revision:'r1',loseAck:true,scope:{connectionId:crypto.randomUUID(),tabId:4,documentId:'fictional-doc',origin:'http://127.0.0.1:4198',navigationRevision:0}};
  let serial=0;const pending=new Map();
  navigator.serviceWorker.onmessage=({data:m,source})=>{if(m.host){let value;if(m.method==='claim-committed'){state.claimed=true;return;}if(m.method==='owner')value=state.owner;if(m.method==='current')value=true;if(m.method==='observe')value={scope:state.scope,revision:state.revision,observedAt:Date.now(),currency:'NZD',items:[{productId:'fictional-oats',name:'Fictional oats',unitPriceCents:350,available:true,quantity:state.quantity}]};if(m.method==='effect'){state.quantity=m.args.quantity;state.effects++;state.revision+='+';if(state.loseAck)return;}source.postMessage({hostReply:m.host,value});return;}pending.get(m.id)?.(m);pending.delete(m.id);};
  await navigator.serviceWorker.register('/worker.js');window.registration=await navigator.serviceWorker.ready;
  window.rpc=m=>new Promise(resolve=>{const id=++serial;pending.set(id,resolve);registration.active.postMessage({...m,id});});
  window.command=async command=>{const result=await rpc({sender:'fixture-companion',command});if(!result.ok)throw new Error(result.error);return result.value;};
  window.boot=async initialize=>{const result=await rpc({action:'boot',name:state.name,epoch:state.epoch,initialize,pauseAfterClaim:state.cut==='before-effect'});if(!result.ok)throw new Error(result.error);return result.serviceWorkerRealm;};
  window.initialRealm=await boot(true);await command({action:'connect',scope:state.scope});await command({action:'allow-read'});await command({action:'observe'});
  const p=await command({action:'prepare',quantities:[{productId:'fictional-oats',targetQuantity:1}]});window.unsettled=command({action:'approve',digest:p.digest});
 },cut);
 await page.waitForFunction(()=>state.cut==='before-effect'?state.claimed:state.effects===1);
 // CDP targets this isolated browser only, never the user's Chrome profile.
 const cdp=await page.context().newCDPSession(page);await cdp.send('ServiceWorker.enable');await cdp.send('ServiceWorker.stopAllWorkers');
 const result=await page.evaluate(async()=>{
  const restartedRealm=await boot(false);const destroyedRealm=restartedRealm!==window.initialRealm;const denied=async commandValue=>{try{await command(commandValue);return false;}catch{return true;}};
  const noRestoredConsent=await denied({action:'observe'});
  await command({action:'connect',scope:state.scope});const noRestoredRead=await denied({action:'recover-read'});await command({action:'allow-read'});
  await command({action:'observe'});const second=await command({action:'prepare',quantities:[{productId:'fictional-oats',targetQuantity:2}]});
  const newIdCannotReplay=await denied({action:'approve',digest:second.digest});
  const recovery=await command({action:'recover-read'});const correctReadback=recovery.items[0].current===(state.cut==='before-effect'?0:1);
  const wrongDigestDenied=await denied({action:'recover-ack',digest:'wrong'});
  const ack=await command({action:'recover-ack',digest:recovery.digest});
  const noRecoveryReplay=await denied({action:'recover-ack',digest:recovery.digest});
  return{destroyedRealm,noRestoredConsent,noRestoredRead,newIdCannotReplay,correctReadback,wrongDigestDenied,acknowledgementOnly:ack.acknowledged&&ack.retried===false,noRecoveryReplay,noExtraEffect:state.effects===(state.cut==='before-effect'?0:1)};
 });
 for(const [name,passed] of Object.entries(result)){assert.equal(passed,true,name);console.log('PASS '+cut+' service-worker restart '+name);}
 await page.close();
 }
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
