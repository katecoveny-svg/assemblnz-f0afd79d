import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {parseHTML} from 'linkedom/worker';
import {validSnapshot,compareApproval,normalisePlan,lineEstimate,allowedRetailer,productURL,SITE,RETAILER} from '../companion-woolworths/core.js';
const now=Date.now();
const q={version:1,url:RETAILER+'/shop/product-details/282765/woolworths-milk-standard',sku:'282765',name:'Woolworths Milk Standard 2L Bottle',store:'Woolworths pickup · Test store',priceCents:471,priceUnit:'ea',unit:'ea',quantity:1,observedAt:now,addMode:'Add to cart',loginRequired:false,promotion:'LOW PRICE. Check membership and multibuy conditions on Woolworths.'};
const list={type:'assembl.woolworths.plan',version:1,day:'Sunday',kind:'main',items:[{id:'milk',name:'Milk',unit:'2 L bottle',quantity:2,price:5000,token:'never forward'}]};
let tests=0;
function check(name,fn){fn();tests++;console.log('PASS',name);}
check('one fixed pack is quoted',()=>assert.equal(lineEstimate(q),471));
for(const patch of [{quantity:2},{unit:'kg',priceUnit:'kg'},{observedAt:now-300001},{observedAt:now+6000},{store:'Woolworths delivery'},{addMode:'Update'}])check('unsupported or stale quote blocked '+JSON.stringify(patch),()=>assert.throws(()=>validSnapshot({...q,...patch},now)));
for(const patch of [{store:'Woolworths pickup · Other store'},{priceCents:499},{name:'Other pack'},{promotion:'Member offer'},{loginRequired:true},{loginRequired:undefined}])check('changed context requires fresh approval '+JSON.stringify(patch),()=>assert.throws(()=>compareApproval(q,{...q,...patch},now)));
check('New World plans cannot cross into Woolworths',()=>assert.throws(()=>normalisePlan({...list,type:'assembl.newworld.plan'})));
check('checkout, authentication and other hosts blocked',()=>{for(const path of ['/cart','/checkout','/auth/login','/account'])assert.equal(allowedRetailer(RETAILER+path),false);assert.throws(()=>productURL('https://www.woolworths.co.nz.evil.test/shop/product-details/1/milk'));assert.throws(()=>productURL('https://www.newworld.co.nz/shop/product/1_ea_nw'));});
check('plan strips arbitrary fields',()=>assert.deepEqual(normalisePlan(list).items[0],{id:'milk',name:'Milk',quantity:2,unit:'2 L bottle'}));
const context={URL,Date};vm.createContext(context);vm.runInContext(await fs.readFile(new URL('../companion-woolworths/dom.js',import.meta.url),'utf8'),context);
// The product section was captured from the public Woolworths page on 25 October.
// The pickup and signed-in controls below are synthetic until a customer test.
const observed=await fs.readFile(new URL('fixtures/woolworths-milk.html',import.meta.url),'utf8');
check('real public markup rejects an unset shopping location',()=>assert.throws(()=>context.WWDOM.read(parseHTML(observed).document,q.url,now),/pickup store/));
const {document}=parseHTML(observed);const location=document.createElement('div');location.className='fulfilment-bar_textContainer__test';location.innerHTML='<span class="fulfilment-bar_label__test">Pick up:</span><button>Test store</button>';document.body.append(location);
check('observed product price is read without confusing comparative unit price',()=>{const read=context.WWDOM.read(document,q.url,now);assert.equal(read.priceCents,471);assert.equal(read.quantity,1);assert.equal(read.loginRequired,true);assert.equal(read.store,q.store);});
check('ambiguous promotional prices fail closed',()=>{const e=document.createElement('span');e.className='product-price_value__test';e.textContent='$3.00';document.querySelector('h1').parentElement.append(e);assert.throws(()=>context.WWDOM.read(document,q.url),/layout/);e.remove();});
check('weighed products require retailer handling',()=>{const e=document.querySelector('[class*="product-price_unit__"]');e.textContent='kg';assert.throws(()=>context.WWDOM.read(document,q.url),/weighed/);e.textContent='';});
check('disabled and existing-cart controls cannot add',()=>{const b=context.WWDOM.addButton(document);b.disabled=true;assert.throws(()=>context.WWDOM.read(document,q.url),/unavailable/);b.disabled=false;b.textContent='Update';assert.throws(()=>context.WWDOM.read(document,q.url),/unavailable/);b.textContent='Add to cart';});
check('multiple pickup locations fail closed',()=>{const copy=location.cloneNode(true);document.body.append(copy);assert.throws(()=>context.WWDOM.read(document,q.url),/pickup/);copy.remove();});
// Service-worker integration with a fake browser; the actual approval boundary is exercised.
let session={},listener,addCalls=0,tabURL=q.url,liveQuote={...q},addOutcome='verified',holdAdd;
const clone=v=>structuredClone(v);
globalThis.chrome={runtime:{id:'test-extension',getURL:p=>'chrome-extension://test-extension/'+p,onMessage:{addListener:fn=>listener=fn}},action:{onClicked:{addListener(){}}},permissions:{contains:async()=>true,remove:async()=>true},storage:{session:{get:async()=>clone(session),set:async v=>session=clone({...session,...v}),clear:async()=>session={}}},scripting:{unregisterContentScripts:async()=>{},registerContentScripts:async()=>{},executeScript:async()=>{}},tabs:{query:async()=>[],create:async()=>({id:4,url:RETAILER+'/'}),get:async()=>({id:4,url:tabURL}),update:async(_id,opts)=>{if(opts.url)tabURL=opts.url;return{id:4,url:tabURL};},sendMessage:async(_id,m)=>{if(m.type==='read-product')return {ok:true,data:clone(liveQuote)};if(m.type==='approved-add'){addCalls++;if(holdAdd)await holdAdd;if(addOutcome==='lost')throw Error('Connection lost');return{ok:true,data:{status:'verified',message:'Fixture result',result:{quantity:1,unit:'ea'}}};}return{ok:true,data:{opened:true}}}}};
await import('../companion-woolworths/worker.js?test');
const panel={id:'test-extension',url:'chrome-extension://test-extension/panel.html'},site={id:'test-extension',url:SITE+'/',frameId:0};
const msg=(m,s=panel)=>new Promise(resolve=>listener(m,s,resolve));
async function test(name,fn){await fn();tests++;console.log('PASS',name);}
await test('untrusted origin denied',async()=>assert.equal((await msg({action:'status'},{id:'test-extension',url:'https://evil.example'})).ok,false));
await test('website cannot approve a trolley action',async()=>{const r=await msg({from:'kitchen-site',action:'approve-add',approved:true},site);assert.equal(r.ok,false);assert.equal(addCalls,0);});
await msg({action:'enable'});
await msg({from:'kitchen-site',action:'prepare',plan:list},site);
await test('sending a list alone makes no trolley change',async()=>{assert.equal(addCalls,0);assert.ok(session.session.pending);assert.equal(session.session.plan,undefined);});
await msg({action:'accept-plan'});await msg({action:'search',id:'milk'});tabURL=q.url;await msg({action:'read-product'});
await test('changed price blocks add before mutation',async()=>{liveQuote.priceCents=499;const r=await msg({action:'approve-add',approved:true});assert.equal(r.ok,false);assert.equal(addCalls,0);liveQuote.priceCents=471;});
await test('approval flag required',async()=>{assert.equal((await msg({action:'approve-add'})).ok,false);assert.equal(addCalls,0);});
await test('double click produces one add',async()=>{const results=await Promise.all([msg({action:'approve-add',approved:true}),msg({action:'approve-add',approved:true})]);assert.equal(addCalls,1);assert.equal(results.filter(x=>x.ok).length,1);assert.equal(session.session.records[0].status,'verified');});
await msg({from:'kitchen-site',action:'prepare',plan:{...list,day:'Wednesday',kind:'top'}},site);await msg({action:'accept-plan'});await msg({action:'search',id:'milk'});tabURL=q.url;await msg({action:'read-product'});addOutcome='lost';
await test('lost reply recorded as uncertain and never replayed',async()=>{await msg({action:'approve-add',approved:true});assert.equal(addCalls,2);assert.equal(session.session.records[1].status,'uncertain');assert.equal((await msg({action:'search',id:'milk'})).ok,false);assert.equal(addCalls,2);});
await test('customer can record an absent result without replay',async()=>{const r=session.session.records[1];await msg({action:'verify-human',attempt:r.attempt,outcome:'absent',confirmation:'I checked the exact product, quantity and store in the Woolworths trolley'});assert.equal(session.session.records[1].status,'cancelled');assert.equal(addCalls,2);});
await test('interrupted durable intent requires customer review',async()=>{const s=clone(session.session);s.busy='interrupted';s.records[1].status='attempting';await chrome.storage.session.set({session:s});assert.equal((await msg({action:'read-product'})).ok,false);const r=await msg({action:'verify-human',attempt:s.records[1].attempt,outcome:'present',confirmation:'I checked the exact product, quantity and store in the Woolworths trolley'});assert.equal(r.ok,true);assert.equal(session.session.busy,null);});
await test('disconnect clears state and blocks further actions',async()=>{await msg({action:'disconnect'});assert.deepEqual(session,{});assert.equal((await msg({action:'approve-add',approved:true})).ok,false);assert.equal(addCalls,2);});
console.log(`${tests} Woolworths contract and boundary checks passed. No live account or cart was used.`);
// The real approval UI must render untrusted names as text and keep its gate closed.
const panelDOM=parseHTML(await fs.readFile(new URL('../companion-woolworths/panel.html',import.meta.url),'utf8'));
globalThis.document=panelDOM.document;globalThis.window=panelDOM.window;
chrome.runtime.sendMessage=m=>msg(m);
const uiQuote={...q,name:'<img src=x onerror=alert(1)>',itemId:'milk',loginRequired:true};
await chrome.storage.session.set({session:{enabled:true,plan:normalisePlan(list),planId:'ui',activeId:'milk',quote:uiQuote,records:[]}});
await import('../companion-woolworths/panel.js?test');await new Promise(resolve=>setImmediate(resolve));
await test('approval screen never interprets product names as markup',async()=>{assert.equal(panelDOM.document.querySelector('#quote img'),null);assert.match(panelDOM.document.querySelector('#quote').textContent,/<img/);});
await test('signed-out checkbox cannot enable approval',async()=>{const input=panelDOM.document.querySelector('#matchCheck');input.checked=true;input.dispatchEvent(new panelDOM.window.Event('change'));assert.equal(panelDOM.document.querySelector('#approve').disabled,true);});
console.log(`${tests} total Woolworths checks passed, including the approval UI.`);
// Exercise the actual content script against the observed product markup.
const liveDOM=parseHTML(observed),pickup=liveDOM.document.createElement('div');
pickup.className='fulfilment-bar_textContainer__test';pickup.innerHTML='<span class="fulfilment-bar_label__test">Pick up:</span><button>Test store</button>';liveDOM.document.body.append(pickup);
let contentListener,clicks=0;
const contentContext={URL,Date,Promise,document:liveDOM.document,location:{href:q.url},chrome:{runtime:{id:'own',onMessage:{addListener:fn=>contentListener=fn}}}};
vm.createContext(contentContext);
vm.runInContext(await fs.readFile(new URL('../companion-woolworths/dom.js',import.meta.url),'utf8'),contentContext);
vm.runInContext(await fs.readFile(new URL('../companion-woolworths/retailer.js',import.meta.url),'utf8'),contentContext);
const contentMsg=(m,id='own')=>new Promise(resolve=>contentListener(m,{id},resolve));
contentContext.WWDOM.addButton(liveDOM.document).click=()=>clicks++;
await test('real content script blocks signed-out mutation',async()=>{const fresh=contentContext.WWDOM.read(liveDOM.document,q.url);const r=await contentMsg({type:'approved-add',quote:fresh,attempt:'out'});assert.equal(r.ok,false);assert.equal(clicks,0);});
liveDOM.document.querySelector('[class*="login-button_loginControl__"]').textContent='Account';
const current=contentContext.WWDOM.read(liveDOM.document,q.url);
await test('real content script blocks changed price before click',async()=>{const r=await contentMsg({type:'approved-add',quote:{...current,priceCents:1},attempt:'changed'});assert.equal(r.ok,false);assert.equal(clicks,0);});
await test('real content script clicks once and never calls it verified',async()=>{const r=await contentMsg({type:'approved-add',quote:current,attempt:'one'});assert.equal(r.ok,true);assert.equal(r.data.status,'uncertain');assert.equal(clicks,1);const again=await contentMsg({type:'approved-add',quote:current,attempt:'one'});assert.equal(again.ok,false);assert.equal(clicks,1);});
await test('content script has no checkout or arbitrary-click command',async()=>{assert.equal(contentListener({type:'checkout'},{id:'own'},()=>{throw Error('must not respond');}),undefined);assert.equal(contentListener({type:'approved-add',quote:current,attempt:'alien'},{id:'alien'},()=>{throw Error('must not respond');}),undefined);assert.equal(clicks,1);});
const manifest=JSON.parse(await fs.readFile(new URL('../companion-woolworths/manifest.json',import.meta.url),'utf8'));
check('Woolworths permissions never include New World or broad browsing',()=>{assert.deepEqual(manifest.permissions,['storage','scripting']);assert.deepEqual(new Set(manifest.optional_host_permissions),new Set([SITE+'/*',RETAILER+'/*']));});
console.log(`${tests} total Woolworths checks passed. Live installation and signed-in additions remain unverified.`);
