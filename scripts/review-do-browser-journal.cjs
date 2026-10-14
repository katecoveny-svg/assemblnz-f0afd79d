/* Real IndexedDB in an isolated ephemeral browser. No user profile or retailer. */
const assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const {build}=createRequire(require.resolve('tsx'))('esbuild');
const {chromium}=require(process.env.ASSEMBL_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const bundle=await build({entryPoints:['test/fixtures/do-browser/journal-proof.ts'],bundle:true,format:'iife',globalName:'JournalProof',write:false});
 const browser=await chromium.launch({headless:true,...(process.env.ASSEMBL_CHROMIUM_PATH?{executablePath:process.env.ASSEMBL_CHROMIUM_PATH}:{})});
 try {
  const context=await browser.newContext();
  let page=await context.newPage();await page.route('**/*',r=>r.fulfill({contentType:'text/html',body:'<h1>Fictional journal proof</h1>'}));
  await page.goto('http://127.0.0.1:4198');await page.addScriptTag({content:bundle.outputFiles[0].text});
  const results=await page.evaluate(()=>JournalProof.runJournalProofs());
  results['quota failure aborts claim and lock atomically']=await page.evaluate(()=>JournalProof.runStorageFailureProof());
  const restart=await page.evaluate(()=>JournalProof.preparePageRestartProof());
  await page.close();page=await context.newPage();
  await page.route('**/*',r=>r.fulfill({contentType:'text/html',body:'<h1>Restarted fictional worker</h1>'}));
  await page.goto('http://127.0.0.1:4198');await page.addScriptTag({content:bundle.outputFiles[0].text});
  results['destroyed JS realm preserves non-replayable claim']=await page.evaluate(input=>JournalProof.resumePageRestartProof(input),restart);
  for(const [name,passed] of Object.entries(results)){assert.ok(passed,name);console.log('PASS '+name);}
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
