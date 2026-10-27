import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {parseHTML} from 'linkedom/worker';
import {validSnapshot,compareApproval,normalisePlan,lineEstimate,allowedRetailer,productURL,SITE,RETAILER} from '../companion/core.js';
const now=Date.now();
const q={version:1,url:RETAILER+'/shop/product/5201479_ea_000nw',sku:'5201479_ea_000nw',name:'Test milk 2l',store:'New World Test store',priceCents:471,priceUnit:'ea',unit:'ea',quantity:2,observedAt:now,addMode:'Add',loginRequired:false,promotion:'Displayed price.'};
let tests=0;
function check(name,fn){fn();tests++;console.log('PASS',name);}
check('quote uses integer cents and selected packs',()=>assert.equal(lineEstimate(q),942));
check('stale quote rejected',()=>assert.throws(()=>validSnapshot({...q,observedAt:now-300001},now),/expired/));
check('future timestamp rejected',()=>assert.throws(()=>validSnapshot({...q,observedAt:now+6000},now),/expired/));
check('weighted ea mismatch rejected',()=>assert.throws(()=>validSnapshot({...q,priceUnit:'kg'},now),/Choose kg/));
check('decimal each quantity rejected',()=>assert.throws(()=>validSnapshot({...q,quantity:1.5},now),/quantity/));
check('weighted quantity priced correctly',()=>assert.equal(lineEstimate({...q,quantity:.6,priceCents:1999,unit:'kg',priceUnit:'kg'}),1199));
for(const [field,value] of Object.entries({store:'New World Different store',priceCents:499,quantity:3,unit:'kg',name:'Test milk 3l',url:RETAILER+'/shop/product/5201490_ea_000nw',promotion:'Changed offer.'}))check('approval invalidated by '+field,()=>assert.throws(()=>compareApproval(q,{...q,[field]:value},now)));
check('signed-out add blocked',()=>assert.throws(()=>compareApproval(q,{...q,loginRequired:true},now),/Sign in/));
check('existing or unavailable product blocked',()=>assert.throws(()=>validSnapshot({...q,addMode:'Update'},now),/already/));
check('lookalike retailer host rejected',()=>assert.throws(()=>productURL('https://www.newworld.co.nz.bad.example/shop/product/1_ea_000nw')));
check('checkout and account pages disallowed',()=>{for(const path of ['/shop/checkout','/shop/shopping-cart','/shop/my-account','/shop/fulfillment'])assert.equal(allowedRetailer(RETAILER+path),false);});
const list={type:'assembl.newworld.plan',version:1,day:'Sunday',kind:'main',items:[{id:'milk',name:'Milk',unit:'2 L bottle',quantity:2,price:5000,token:'never forward'}]};
check('plan accepts no credentials or estimated quotes',()=>assert.deepEqual(normalisePlan(list).items[0],{id:'milk',name:'Milk',unit:'2 L bottle',quantity:2}));
check('duplicate lines rejected',()=>assert.throws(()=>normalisePlan({...list,items:[...list.items,...list.items]}),/duplicate/));
check('empty and oversized plans rejected',()=>{assert.throws(()=>normalisePlan({...list,items:[]}));assert.throws(()=>normalisePlan({...list,items:Array(31).fill(list.items[0])}));});
check('extreme quantities rejected',()=>assert.throws(()=>normalisePlan({...list,items:[{...list.items[0],quantity:Infinity}]})));
// Minimal fixtures reproduce the public DOM contract observed on 23 Oct 2026.
// They are not live signed-in price or trolley evidence.
const fixture=`<html><body><button data-testid="choose-store">New World Test store</button><button>Log in</button><h1 data-testid="product-title">Test milk 2l</h1><div data-testid="product"><p data-testid="price-dollars">4</p><p data-testid="price-cents">71</p><p data-testid="price-per">ea</p><input data-testid="quantity-edit" value="2"><span data-testid="quantity-unit">ea</span><button data-testid="add-to-cart">Add</button><p data-testid="non-promo-comparative-price">$2.36/1L</p></div><h3 data-testid="product-title">Recommended item</h3></body></html>`;
const context={URL,Date};vm.createContext(context);vm.runInContext(await fs.readFile(new URL('../companion/dom.js',import.meta.url),'utf8'),context);
const {document}=parseHTML(fixture);let read=context.NWDOM.read(document,q.url,now);
check('DOM reads regular displayed price, pack, store and quantity',()=>{assert.equal(read.priceCents,471);assert.equal(read.name,'Test milk 2l');assert.equal(read.quantity,2);assert.equal(read.store,q.store);assert.equal(read.loginRequired,true);});
check('ambiguous price fails closed',()=>{const p=document.querySelector('[data-testid="product"]'),e=document.createElement('p');e.dataset.testid='price-dollars';e.textContent='3';p.append(e);assert.throws(()=>context.NWDOM.read(document,q.url,now),/layout changed/);e.remove();});
check('malformed cents fail closed',()=>{const e=document.querySelector('[data-testid="price-cents"]');e.textContent='SALE';assert.throws(()=>context.NWDOM.read(document,q.url,now),/cannot be read/);e.textContent='71';});
check('multiple different stores fail closed',()=>{const e=document.createElement('button');e.dataset.testid='choose-store';e.textContent='New World Other store';document.body.append(e);assert.throws(()=>context.NWDOM.read(document,q.url,now),/Choose your/);e.remove();});
check('conditional pricing retained',()=>{const e=document.createElement('button');e.dataset.testid='non-promo-info-btn';e.textContent='Non-Club+ Price';document.querySelector('[data-testid="product"]').append(e);assert.match(context.NWDOM.read(document,q.url,now).promotion,/non-Club/);e.remove();});
check('cart verification requires exact SKU, quantity and unit',()=>{const box=document.createElement('div');box.dataset.testid='cart-preview';box.innerHTML=`<div><a href="/shop/product/5201479_ea_000nw">Test milk</a><input data-testid="quantity-edit" value="2"><span data-testid="quantity-unit">ea</span></div><span data-testid="cart-preview-subtotal">$9.42</span><span data-testid="cart-preview-fees">$1.50</span>`;document.body.append(box);const r=context.NWDOM.cart(document,q.url);assert.equal(r.quantity,2);assert.equal(r.unit,'ea');assert.equal(r.subtotal,'$9.42');assert.equal(context.NWDOM.cart(document,RETAILER+'/shop/product/9999999_ea_000nw').found,false);box.remove();});
// Service-worker integration with a fake browser; the actual approval boundary is exercised.
let session={},listener,addCalls=0,tabURL=q.url,liveQuote={...q},addOutcome='verified',holdAdd;
const clone=v=>structuredClone(v);
globalThis.chrome={runtime:{id:'test-extension',getURL:p=>'chrome-extension://test-extension/'+p,onMessage:{addListener:fn=>listener=fn}},action:{onClicked:{addListener(){}}},permissions:{contains:async()=>true,remove:async()=>true},storage:{session:{get:async()=>clone(session),set:async v=>session=clone({...session,...v}),clear:async()=>session={}}},scripting:{unregisterContentScripts:async()=>{},registerContentScripts:async()=>{},executeScript:async()=>{}},tabs:{query:async()=>[],create:async()=>({id:4,url:RETAILER+'/'}),get:async()=>({id:4,url:tabURL}),update:async(_id,opts)=>{if(opts.url)tabURL=opts.url;return{id:4,url:tabURL};},sendMessage:async(_id,m)=>{if(m.type==='read-product')return {ok:true,data:clone(liveQuote)};if(m.type==='approved-add'){addCalls++;if(holdAdd)await holdAdd;if(addOutcome==='lost')throw Error('Connection lost');return{ok:true,data:{status:'verified',message:'Fixture result',result:{quantity:2,unit:'ea'}}};}return{ok:true,data:{opened:true}}}}};
await import('../companion/worker.js?test');
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
await test('customer can record an absent result without replay',async()=>{const r=session.session.records[1];await msg({action:'verify-human',attempt:r.attempt,outcome:'absent',confirmation:'I checked the exact product, quantity and store in the New World trolley'});assert.equal(session.session.records[1].status,'cancelled');assert.equal(addCalls,2);});
await test('interrupted durable intent requires customer review',async()=>{const s=clone(session.session);s.busy='interrupted';s.records[1].status='attempting';await chrome.storage.session.set({session:s});assert.equal((await msg({action:'read-product'})).ok,false);const r=await msg({action:'verify-human',attempt:s.records[1].attempt,outcome:'present',confirmation:'I checked the exact product, quantity and store in the New World trolley'});assert.equal(r.ok,true);assert.equal(session.session.busy,null);});
await test('disconnect clears state and blocks further actions',async()=>{await msg({action:'disconnect'});assert.deepEqual(session,{});assert.equal((await msg({action:'approve-add',approved:true})).ok,false);assert.equal(addCalls,2);});
console.log(`${tests} New World contract and boundary checks passed. No live account or cart was used.`);
// The real approval UI must render untrusted names as text and keep its gate closed.
const panelDOM=parseHTML(await fs.readFile(new URL('../companion/panel.html',import.meta.url),'utf8'));
globalThis.document=panelDOM.document;globalThis.window=panelDOM.window;
chrome.runtime.sendMessage=m=>msg(m);
const uiQuote={...q,name:'<img src=x onerror=alert(1)>',itemId:'milk',loginRequired:true};
await chrome.storage.session.set({session:{enabled:true,plan:normalisePlan(list),planId:'ui',activeId:'milk',quote:uiQuote,records:[]}});
await import('../companion/panel.js?test');await new Promise(resolve=>setImmediate(resolve));
await test('approval screen never interprets product names as markup',async()=>{assert.equal(panelDOM.document.querySelector('#quote img'),null);assert.match(panelDOM.document.querySelector('#quote').textContent,/<img/);});
await test('signed-out checkbox cannot enable approval',async()=>{const input=panelDOM.document.querySelector('#matchCheck');input.checked=true;input.dispatchEvent(new panelDOM.window.Event('change'));assert.equal(panelDOM.document.querySelector('#approve').disabled,true);});
console.log(`${tests} total New World checks passed, including the approval UI.`);
