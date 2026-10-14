/* Exact companion worker/relay/UI + actual PersonalDoAssistant/BrowserTaskReview.
 * Chrome API transport is simulated; no extension installation or real session.
 * All network requests are intercepted; fictional identity and storefront only. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { build } = createRequire(require.resolve('tsx'))('esbuild');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const out = 'output/playwright/browser-connection';
const checks = [], check = (name, ok) => { assert.ok(ok, name); checks.push(name); console.log('PASS ' + name); };
(async () => {
 fs.mkdirSync(out, { recursive: true });
 await build({ entryPoints:['test/fixtures/do-browser-connection/entry.tsx'],bundle:true,format:'iife',outfile:out+'/ui.js',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},loader:{'.png':'dataurl','.webp':'dataurl'}});
 const browser = await chromium.launch({headless:true,...(process.env.ASSEMBL_CHROMIUM_PATH?{executablePath:process.env.ASSEMBL_CHROMIUM_PATH}:{})});
 const context = await browser.newContext({viewport:{width:1000,height:1000},serviceWorkers:'block'});
 let owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 const errors=[], requested=[];
 await context.route('**/*',route=>{
  const url=new URL(route.request().url());requested.push(url.href);
  if(url.origin==='http://localhost:3000') {
   if(url.pathname==='/api/do/session')return route.fulfill({json:{workspaceKey:owner}});
   if(url.pathname.startsWith('/api/'))return route.fulfill({status:503,json:{ready:false,signedIn:true,message:'Synthetic provider disabled'}});
   if(url.pathname==='/ui.js')return route.fulfill({contentType:'text/javascript',body:fs.readFileSync(out+'/ui.js','utf8')});
   if(url.pathname==='/ui.css')return route.fulfill({contentType:'text/css',body:fs.readFileSync(out+'/ui.css','utf8')});
   return route.fulfill({contentType:'text/html',body:'<meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/ui.css"><div id="root"></div><script src="/ui.js"></script>'});
  }
  if(url.href==='http://127.0.0.1:4198/cart-fixture.html')return route.fulfill({contentType:'text/html',body:fs.readFileSync('test/fixtures/do-browser/cart-fixture.html','utf8').replace(/<script[^>]*>[\s\S]*?<\/script>/g,'')});
  if(url.origin==='http://127.0.0.1:4199') {
   const file=url.pathname.slice(1);if(!['browser-connection.html','browser-connection.js','portable.css'].includes(file))return route.abort();
   return route.fulfill({contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html',body:fs.readFileSync('apps/do/extension/'+file,'utf8')});
  }
  return route.abort();
 });
 const workspace=await context.newPage(),storefront=await context.newPage(),companion=await context.newPage();
 for(const page of [workspace,storefront,companion])page.on('pageerror',e=>errors.push(e.message));
 const tabs=new Map([[4,{page:storefront,url:'http://127.0.0.1:4198/cart-fixture.html',documentId:'fixture-doc'}],[8,{page:workspace,url:'http://localhost:3000/do/personal',documentId:'do-doc'}]]);
 let listener, removed, updated;
 const extensionUrl='chrome-extension://synthetic/browser-connection.html';
 const invoke=(message,sender)=>new Promise(resolve=>listener(message,sender,resolve));
 await workspace.exposeFunction('fixtureSend',message=>invoke(message,{id:'synthetic',tab:{id:8},documentId:tabs.get(8).documentId,url:tabs.get(8).url}));
 await companion.exposeFunction('fixtureSend',message=>invoke(message,{id:'synthetic',url:extensionUrl}));
 for(const page of [workspace,companion])await page.addInitScript(()=>{window.process={env:{NODE_ENV:'production'}};window.chrome={runtime:{sendMessage:message=>window.fixtureSend(message)}};});
 const sandbox={console,crypto:require('node:crypto').webcrypto,TextEncoder,setTimeout,clearTimeout,URL,AbortSignal};
 sandbox.chrome={runtime:{id:'synthetic',getURL:file=>'chrome-extension://synthetic/'+file,onMessage:{addListener:fn=>{listener=fn;}}},tabs:{
  get:async id=>{const t=tabs.get(id);if(!t)throw Error('Tab closed');return{id,url:t.url};},
  query:async q=>q.active?[{id:4,url:tabs.get(4).url}]:[...tabs].map(([id,t])=>({id,url:t.url})),
  onRemoved:{addListener:fn=>{removed=fn;}},onUpdated:{addListener:fn=>{updated=fn;}}
 },scripting:{executeScript:async options=>{
  const t=tabs.get(options.target.tabId);if(!t||options.target.documentIds&&!options.target.documentIds.includes(t.documentId))throw Error('Document changed');
  if(options.files){for(const file of options.files)await t.page.addScriptTag({content:fs.readFileSync('apps/do/extension/'+file,'utf8')});return[{documentId:t.documentId}];}
  const result=await t.page.evaluate(({source,args})=>(0,eval)('('+source+')')(...args),{source:options.func.toString(),args:options.args||[]});
  return[{documentId:t.documentId,result}];
 }}};
 vm.createContext(sandbox);sandbox.importScripts=file=>vm.runInContext(fs.readFileSync('apps/do/extension/'+file,'utf8'),sandbox);
 vm.runInContext(fs.readFileSync('apps/do/extension/browser-task-worker.js','utf8'),sandbox);
 try {
  await workspace.goto(tabs.get(8).url);await storefront.goto(tabs.get(4).url);
  await storefront.evaluate(()=>{document.querySelectorAll('[data-set-quantity]').forEach(button=>button.addEventListener('click',()=>{const row=button.closest('[data-product]');row.querySelector('output').value=row.querySelector('input').value;const root=document.querySelector('[data-do-cart-fixture]');root.dataset.revision=String(Number(root.dataset.revision)+1);}));});
  await companion.goto('http://127.0.0.1:4199/browser-connection.html');
  await companion.getByRole('button',{name:'Check selected tab and DO windows'}).click();
  await companion.getByRole('button',{name:'Connect this tab for two minutes'}).click();
  await companion.locator('#status').filter({hasText:'Connected only'}).waitFor();
  check('connection reads no product data',await storefront.locator('output').first().textContent()==='0');
  await workspace.locator('#personal-assistant-input').fill('Please prepare two fictional oats');
  await workspace.getByRole('button',{name:'Review this as a browser task'}).click();
  const panel=workspace.getByRole('region',{name:'Browser task review'});
  await panel.getByRole('button',{name:'Check companion connection'}).click();
  await panel.getByRole('checkbox',{name:/Read fictional product/}).check();
  await panel.getByRole('button',{name:'Read reviewed product fields'}).click();
  check('quantity control accessible name includes canonical product ID', await panel.getByLabel('Fixture oats (oats) target quantity', {exact:true}).count() === 1);
  await panel.getByLabel('Fixture oats (oats) target quantity', {exact:true}).fill('2');
  await panel.getByRole('button',{name:'Preview these fixture edits'}).click();
  await panel.getByRole('heading',{name:'Awaiting companion approval'}).waitFor();
  check('Personal DO preview alone cannot mutate',await storefront.locator('output').first().textContent()==='0');
  await companion.locator('#items').filter({hasText:'ID/SKU: oats'}).waitFor();
  check('companion approval identifies exact proposal product ID', (await companion.locator('#items').textContent()).includes('ID/SKU: oats'));
  await companion.getByRole('button',{name:'Approve these fixture quantities'}).click();
  await panel.getByRole('heading',{name:'Fixture changes verified'}).waitFor();
  check('actual fixture DOM quantity verified',await storefront.locator('output').first().textContent()==='2');
  const receipt=JSON.parse(await companion.locator('#receipt').textContent());
  check('receipt explicitly denies retailer execution',receipt.retailerExecuted===false&&receipt.items[0].observedQuantity===2);
  const bad=await invoke({type:'do:browser-page',command:{action:'execute'}},{id:'synthetic',tab:{id:8},documentId:'do-doc',url:tabs.get(8).url});check('page cannot invoke approval or arbitrary execution',!bad.ok);
  const forged=await invoke({type:'do:browser-companion',action:'approve',connectionId:'x',digest:'x'},{id:'synthetic',tab:{id:8},documentId:'do-doc',url:tabs.get(8).url});check('website cannot impersonate companion review',!forged.ok);
  await workspace.screenshot({path:out+'/text-receipt.png',fullPage:true});
  await panel.getByRole('button',{name:'Disconnect and cancel remaining actions'}).click();
  await workspace.getByRole('button',{name:'Close task',exact:true}).click();
  await workspace.getByRole('button',{name:'Accept synthetic reviewed voice brief'}).click();
  check('reviewed voice enters same review component without authority',(await panel.getByLabel('Reviewed task').inputValue()).includes('Reviewed voice'));
  await workspace.setViewportSize({width:375,height:812});await workspace.screenshot({path:out+'/voice-375.png',fullPage:true});
  check('375px review fits viewport',await workspace.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await companion.getByRole('button',{name:'Connect this tab for two minutes'}).click();
  await companion.locator('#status').filter({hasText:'Connected only'}).waitFor();
  await panel.getByRole('button',{name:'Check companion connection'}).click();
  await panel.getByRole('checkbox',{name:/Read fictional product/}).check();
  await panel.getByRole('button',{name:'Read reviewed product fields'}).click();
  await panel.getByLabel('Fixture oats (oats) target quantity').waitFor();
  owner='guest';await panel.getByRole('button',{name:'Check companion connection'}).click();
  await panel.getByLabel('Fixture oats (oats) target quantity').waitFor({state:'detached'});
  check('owner loss clears observed product review',await panel.getByLabel('Fixture oats (oats) target quantity').count()===0);
  updated(4,{url:'https://example.com'});removed(8);
  check('no browser runtime errors',errors.length===0);
  fs.writeFileSync(out+'/results.json',JSON.stringify({checks,errors,chromeApiSimulated:true,ownerSynthetic:true,extensionInstalled:false,realRetailer:false,requested},null,2));
 } catch(error) { fs.writeFileSync(out+'/failure.json',JSON.stringify({errors,text:await workspace.locator('body').innerText()},null,2));await workspace.screenshot({path:out+'/failure.png',fullPage:true});throw error; } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
