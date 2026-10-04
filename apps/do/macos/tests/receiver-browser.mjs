// Actual React receiver; all auth/transport is fictional. No dependencies installed.
import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {deflateSync} from 'node:zlib';
const require=createRequire(import.meta.url);
const {build}=require(process.env.DO_ESBUILD_MODULE||'esbuild');
const {chromium}=require(process.env.DO_PLAYWRIGHT_MODULE||'playwright');
const out=resolve('output/native-receiver');await mkdir(out,{recursive:true});
const stubs={
 'next/navigation':`export const usePathname=()=>location.pathname;`,
 '@/components/do/DoShareButton':`export function DoShareButton(){return null;}`,
 '@/lib/supabase/client':`export const createClient=()=>({auth:{onAuthStateChange(callback){window.__authListeners??=new Set();window.__authListeners.add(callback);window.__auth=(...args)=>{for(const listener of [...window.__authListeners])listener(...args)};callback('INITIAL_SESSION',{user:{id:window.__owner}});return {data:{subscription:{unsubscribe(){window.__authListeners.delete(callback);if(!window.__authListeners.size)window.__auth=null}}}};}}});`,
};
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {DoTextWorkspace} from './app/do/DoTextWorkspace';window.__root=createRoot(document.getElementById('root'));window.__root.render(React.createElement(DoTextWorkspace,{focus:true,onNativeReveal:()=>{window.__reveals++}}));`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,platform:'browser',format:'iife',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'fictional-only',setup(b){b.onResolve({filter:/.*/},a=>stubs[a.path]?{path:a.path,namespace:'fixture'}:undefined);b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:stubs[a.path],loader:'js'}));}}]});
const script=bundle.outputFiles[0].text;await writeFile(resolve(out,'actual-receiver.js'),script);
const browser=await chromium.launch({headless:true,...(process.env.DO_BROWSER_EXECUTABLE?{executablePath:process.env.DO_BROWSER_EXECUTABLE}:{})});
function pngChunk(name,data){
 const type=Buffer.from(name);let crc=0xffffffff;
 for(const byte of Buffer.concat([type,data])){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
 const length=Buffer.alloc(4),sum=Buffer.alloc(4);length.writeUInt32BE(data.length);sum.writeUInt32BE((crc^0xffffffff)>>>0);return Buffer.concat([length,type,data,sum]);
}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(16,0);ihdr.writeUInt32BE(16,4);ihdr[8]=8;ihdr[9]=6;
const pixels=Buffer.alloc(16*(1+16*4));for(let y=0;y<16;y++){for(let x=0;x<16;x++){const i=y*65+1+x*4;pixels[i]=234;pixels[i+1]=200;pixels[i+2]=223;pixels[i+3]=255;}}
const fictionalPNG=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),pngChunk('IHDR',ihdr),pngChunk('IDAT',deflateSync(pixels)),pngChunk('IEND',Buffer.alloc(0))]);
const checks=[],errors=[];
const A='10000000-0000-4000-8000-000000000001',B='10000000-0000-4000-8000-000000000002';
async function fixture({url='https://www.assembl.co.nz/do/widget?nativeReview=1',expectReceiver=true}={}){
 const context=await browser.newContext({viewport:{width:375,height:1000}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().resourceType()==='document'?r.fulfill({contentType:'text/html',body:'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div>'}):r.abort());
 await page.addInitScript(({owner})=>{
  window.__owner=owner;window.__offline=false;window.__lookups=[];window.__providers=0;window.__storage=[];window.__reveals=0;window.__defer=false;window.__preparations=[];window.__allowPreparation=false;window.__abortedPreparation=0;
  localStorage.setItem('assembl:do:drafts:v1','fictional old browser copy — leave untouched');
  const get=Storage.prototype.getItem,set=Storage.prototype.setItem;
  window.__legacyValue=()=>get.call(localStorage,'assembl:do:drafts:v1');
  Storage.prototype.getItem=function(k){window.__storage.push(['get',k]);return get.call(this,k)};
  Storage.prototype.setItem=function(k,v){window.__storage.push(['set',k]);return set.call(this,k,v)};
  window.fetch=async(url,opts={})=>{
   if(url==='/api/do/native-recipient'){
    window.__lookups.push({url,method:opts.method,body:opts.body??null});
    if(window.__defer){window.__defer=false;return new Promise((resolve,reject)=>{window.__resolveOld=resolve;window.__rejectOld=reject;});}
    if(window.__offline)throw Error('fictional offline');
    return new Response(JSON.stringify(window.__owner?{version:1,owner:window.__owner,scope:'Personal',label:window.__owner.endsWith('1')?'alex@example.invalid':'taylor@example.invalid'}:{error:'sign_in_required'}),{status:window.__owner?200:401,headers:{'Content-Type':'application/json'}});
   }
   if(url==='/api/do/personal')return new Response(JSON.stringify({workspaceKey:window.__owner||'guest'}),{status:window.__owner?200:401,headers:{'Content-Type':'application/json'}});
   if(url==='/api/do/runtime')return new Response(JSON.stringify({signedIn:true,availability:{preparation:'unavailable',note:'Fictional test; provider disabled'}}),{headers:{'Content-Type':'application/json'}});
   if(url==='/api/do/prepare'&&window.__allowPreparation){window.__preparations.push(JSON.parse(opts.body));if(window.__returnDraft)return new Response(JSON.stringify({draft:{id:'fictional-draft',task:'extract',title:'Fictional draft',text:'Fictional prepared text',version:1,createdAt:'2026-10-02T00:00:00Z',status:'draft',evidence:{method:'exact-extraction',model:null,sourceTitle:'Fictional source',sourceUrl:'',sourceCharacters:26,sourceHash:'fictional',instructionHash:'fictional',outputHash:'fictional',consentAt:'2026-10-02T00:00:00Z',boundary:'Fictional transport; no external actions'}}}),{headers:{'Content-Type':'application/json'}});return new Promise((_resolve,reject)=>{opts.signal.addEventListener('abort',()=>{window.__abortedPreparation++;reject(new DOMException('fictional aborted','AbortError'));});});}
   window.__providers++;throw Error('real work forbidden');
  };
 },{owner:A});
 await page.goto(url);await page.addScriptTag({content:script});if(expectReceiver)await page.waitForFunction(()=>typeof window.assemblDoNativeReview==='function');else await page.locator('#do-source').waitFor();return {page,context};
}
async function binding(page,revision=1){return page.evaluate(async revision=>{const m=await window.assemblDoNativeReview({version:1,action:'lookup'});if(m.status!=='recipient')throw Error(JSON.stringify(m));return {version:1,documentId:m.documentId,owner:m.owner,scope:m.scope,generation:m.generation,editorRevision:m.editorRevision,navigationGeneration:0,reviewRevision:revision,offerId:crypto.randomUUID()};},revision)}
const request=(page,value)=>page.evaluate(async value=>{const receipt=await window.assemblDoNativeReview(value);if(value.action==='commit'&&receipt.status==='accepted'&&document.querySelector('#do-source').value!==value.text)throw Error('receipt preceded actual editor commit');return receipt;},value);
async function offer(page,b,text){const lease=await request(page,{...b,action:'reserve'});assert.equal(lease.status,'reserved');return {...b,action:'commit',reservation:lease.reservation,text};}
async function clean(page){const d=await page.evaluate(()=>({storage:window.__storage,providers:window.__providers,lookups:window.__lookups,consent:document.querySelector('.do-consent input').checked}));assert.deepEqual(d.storage,[]);assert.equal(d.providers,0);assert.equal(d.consent,false);assert.equal(await page.evaluate(()=>window.__legacyValue()),'fictional old browser copy — leave untouched');assert(d.lookups.every(x=>x.method==='GET'&&x.body===null&&x.url==='/api/do/native-recipient'));}
try{
 {
  const {page,context}=await fixture(),b=await binding(page),c=await offer(page,b,'Fictional school notice 😆');
  const r=await request(page,c);assert.equal(r.status,'accepted');assert.equal(await page.locator('#do-source').inputValue(),c.text);assert.equal(r.committedEditorRevision,b.editorRevision+1);
  assert.deepEqual(await request(page,{...b,action:'receipt'}),r);assert.deepEqual(await request(page,c),r);assert.equal((await request(page,{...c,text:'Changed'})).status,'rejected');
  assert.equal(await page.evaluate(()=>window.__reveals),1);assert.equal(await page.getByText('Save in this browser',{exact:true}).count(),0);await clean(page);
  await page.screenshot({path:resolve(out,'actual-receiver-375.png')});checks.push('actual committed textarea precedes accepted receipt; duplicate/lost receipt recovery; transient storage');await context.close();
 }
 {
  const {page,context}=await fixture(),b=await binding(page),c=await offer(page,b,'Accepted fictional unsent work');
  const accepted=await request(page,c);assert.equal(accepted.status,'accepted');
  const count=await page.evaluate(()=>window.__lookups.length);await page.evaluate(()=>window.__offline=true);
  assert.deepEqual(await request(page,{...b,action:'cancel'}),accepted);assert.equal(await page.evaluate(()=>window.__lookups.length),count);
  assert.equal((await request(page,{version:1,action:'lookup'})).status,'rejected');assert.equal(await page.locator('#do-source').inputValue(),c.text);
  await page.evaluate(()=>window.__offline=false);await page.evaluate(owner=>window.__owner=owner,B);
  await request(page,{version:1,action:'lookup'});assert.equal(await page.locator('#do-source').inputValue(),'');await clean(page);
  checks.push('accepted close returns receipt offline; uncertain lookup retains unsent work; confirmed owner change clears it');await context.close();
 }
 {
  const {page,context}=await fixture();await page.locator('#do-source').fill('Fictional directly pasted work');
  await page.evaluate(owner=>window.__auth('SIGNED_IN',{user:{id:owner}}),A);
  assert.equal(await page.locator('#do-source').inputValue(),'Fictional directly pasted work');
  await page.evaluate(()=>window.__allowPreparation=true);await page.getByLabel('Task',{exact:true}).selectOption('extract');await page.locator('.do-consent input').check();
  await page.locator('button[type=submit]').click();await page.waitForFunction(()=>window.__preparations.length===1);
  const prep=await page.evaluate(()=>window.__preparations[0]);assert.equal(prep.nativeExpectedOwner,A);assert.equal(prep.source,'Fictional directly pasted work');assert.equal(prep.consent,true);
  await page.evaluate(()=>window.__auth('SIGNED_OUT',null));await page.waitForFunction(()=>window.__abortedPreparation===1);await clean(page);
  checks.push('same-owner SIGNED_IN retains pasted work; metadata-only binding enables consented direct preparation');await context.close();
 }
 {
  const {page,context}=await fixture();await page.locator('#do-source').fill('Fictional original-owner direct work');
  await page.evaluate(owner=>{window.__allowPreparation=true;window.__owner=owner},B);await page.getByLabel('Task',{exact:true}).selectOption('extract');await page.locator('.do-consent input').check();await page.locator('button[type=submit]').click();
  await page.waitForFunction(()=>document.querySelector('#do-source').value==='');assert.deepEqual(await page.evaluate(()=>window.__preparations),[]);await clean(page);
  checks.push('direct preparation rejects differing page/session and server recipient without transporting text');await context.close();
 }
 {
  const {page,context}=await fixture();await page.locator('#do-source').fill('Fictional hash-race source');
  await page.evaluate(()=>{window.__allowPreparation=true;window.__returnDraft=true;});await page.getByLabel('Task',{exact:true}).selectOption('extract');await page.locator('.do-consent input').check();await page.locator('button[type=submit]').click();await page.locator('#do-result').waitFor();
  await page.locator('#do-reviewer').fill('Fictional reviewer');await page.evaluate(()=>{crypto.subtle.digest=()=>new Promise(resolve=>{window.__resolveDigest=resolve});});
  await page.getByRole('button',{name:'Mark as reviewed'}).click();await page.waitForFunction(()=>typeof window.__resolveDigest==='function');
  await page.evaluate(()=>window.__auth('SIGNED_OUT',null));await page.waitForFunction(()=>!document.querySelector('#do-result'));
  await page.evaluate(()=>window.__resolveDigest(new Uint8Array(32).buffer));await page.waitForTimeout(50);
  assert.equal(await page.locator('#do-result').count(),0);assert.equal(await page.locator('#do-source').inputValue(),'');await clean(page);
  checks.push('logout during deferred review digest cannot resurrect prior-owner draft');await context.close();
 }
 for(const phase of ['before-reserve','before-commit','after-commit']){
  const {page,context}=await fixture(),b=await binding(page);
  let c;if(phase!=='before-reserve')c=await offer(page,b,'Fictional owner-A context');
  if(phase==='after-commit')assert.equal((await request(page,c)).status,'accepted');
  await page.evaluate(owner=>{window.__owner=owner;window.__auth('SIGNED_IN',{user:{id:owner}})},B);
  assert.equal((await request(page,phase==='before-reserve'?{...b,action:'reserve'}:phase==='after-commit'?{...b,action:'receipt'}:c)).status,'rejected');assert.equal(await page.locator('#do-source').inputValue(),'');await clean(page);checks.push(`actual owner switch ${phase} clears prior context`);await context.close();
 }
 {
  const {page,context}=await fixture(),b=await binding(page),c=await offer(page,b,'Fictional offer');await page.locator('#do-source').fill('Existing edited work');
  assert.equal((await request(page,c)).status,'rejected');assert.equal(await page.locator('#do-source').inputValue(),'Existing edited work');
  await page.evaluate(()=>window.postMessage({type:'assembl-do:context',text:'Unbound legacy'},location.origin));assert.equal(await page.locator('#do-source').inputValue(),'Existing edited work');await clean(page);checks.push('actual edited editor rejects stale and legacy offers');await context.close();
 }
 {
  const {page,context}=await fixture(),b=await binding(page),c=await offer(page,b,'Fictional');assert.equal((await request(page,{...b,action:'cancel'})).status,'cancelled');assert.equal((await request(page,c)).status,'rejected');
  await page.evaluate(()=>window.__offline=true);assert.equal((await request(page,{version:1,action:'lookup'})).status,'rejected');assert.equal(await page.locator('#do-source').inputValue(),'');await clean(page);checks.push('actual cancellation/offline cannot commit');await context.close();
 }
 {
  const {page,context}=await fixture(),b=await binding(page),c=await offer(page,b,'😆'.repeat(6000));assert.equal((await request(page,c)).status,'accepted');assert.equal((await page.locator('#do-source').inputValue()).length,12000);
  await page.evaluate(()=>window.dispatchEvent(new Event('assembl:do-native-scope-changed')));assert.equal(await page.locator('#do-source').inputValue(),'');
  const b2=await binding(page,2),c2=await offer(page,b2,'😆'.repeat(6001));assert.equal((await request(page,c2)).status,'rejected');await clean(page);checks.push('actual Unicode bounds/scope reset');await context.close();
 }
 {
  const {page,context}=await fixture();await page.evaluate(()=>{window.__defer=true;window.__old=window.assemblDoNativeReview({version:1,action:'lookup'});});
  await page.waitForFunction(()=>typeof window.__rejectOld==='function');const b=await binding(page),c=await offer(page,b,'Newer fictional editor work');assert.equal((await request(page,c)).status,'accepted');
  await page.evaluate(async()=>{window.__rejectOld(Error('stale offline'));await window.__old;});assert.equal(await page.locator('#do-source').inputValue(),c.text);await clean(page);checks.push('actual stale async identity failure leaves newer committed text');await context.close();
 }
 {
  const {page,context}=await fixture();await page.evaluate(()=>{window.__defer=true;window.__old=window.assemblDoNativeReview({version:1,action:'lookup'});});await page.waitForFunction(()=>typeof window.__resolveOld==='function');
  await page.evaluate(owner=>{window.__owner=owner;window.__auth('SIGNED_IN',{user:{id:owner}})},B);await page.locator('#do-source').fill('Fresh fictional owner-B work');
  await page.evaluate(async owner=>{window.__resolveOld(new Response(JSON.stringify({version:1,owner,scope:'Personal',label:'alex@example.invalid'}),{headers:{'Content-Type':'application/json'}}));await window.__old;},A);
  assert.equal(await page.locator('#do-source').inputValue(),'Fresh fictional owner-B work');await clean(page);
  checks.push('delayed prior-owner recipient response cannot clear fresh work after authenticated owner switch');await context.close();
 }
 {
  const {page,context}=await fixture();await page.evaluate(()=>window.__root.unmount());assert.equal(await page.evaluate(()=>typeof window.assemblDoNativeReview),'undefined');checks.push('actual unmount removes receiver');await context.close();
 }

 {
  const {page,context}=await fixture(),old=await binding(page),c=await offer(page,old,'Fictional reload context');assert.equal((await request(page,c)).status,'accepted');
  await page.reload();await page.addScriptTag({content:script});await page.waitForFunction(()=>typeof window.assemblDoNativeReview==='function');
  assert.equal(await page.locator('#do-source').inputValue(),'');assert.equal((await request(page,{...old,action:'receipt'})).status,'rejected');await clean(page);checks.push('actual reload creates new document and restores no native context');await context.close();
 }
 for(const url of ['https://www.assembl.co.nz:444/do/widget?nativeReview=1','http://www.assembl.co.nz/do/widget?nativeReview=1','https://elsewhere.example/do/widget?nativeReview=1','https://www.assembl.co.nz/do/personal?nativeReview=1']){
  const {page,context}=await fixture({url,expectReceiver:false});assert.equal(await page.evaluate(()=>typeof window.assemblDoNativeReview),'undefined');await clean(page);checks.push(`actual receiver absent on wrong destination ${url}`);await context.close();
 }
 {
  const {page,context}=await fixture();await page.evaluate(()=>{const f=document.createElement('iframe');f.src='https://www.assembl.co.nz/do/widget?nativeReview=1';document.body.append(f)});
  await page.waitForFunction(()=>document.querySelector('iframe')?.contentDocument?.querySelector('#root'));
  const frame=page.frames().find(f=>f!==page.mainFrame());await frame.addScriptTag({content:script});await frame.locator('#do-source').waitFor();
  assert.equal(await frame.evaluate(()=>typeof window.assemblDoNativeReview),'undefined');assert.deepEqual(await frame.evaluate(()=>window.__storage),[]);checks.push('actual child-frame receiver absent and native transient store untouched');await context.close();
 }

 {
  const {page,context}=await fixture(),b=await binding(page),c=await offer(page,b,'Fictional exact-extraction preparation');assert.equal((await request(page,c)).status,'accepted');
  await page.evaluate(()=>window.__allowPreparation=true);await page.getByLabel('Task',{exact:true}).selectOption('extract');await page.locator('.do-consent input').check();
  await page.locator('button[type=submit]').click();await page.waitForFunction(()=>window.__preparations.length===1);
  const prep=await page.evaluate(()=>window.__preparations[0]);assert.equal(prep.nativeExpectedOwner,A);assert.equal(prep.consent,true);
  await page.evaluate(owner=>{window.__owner=owner;window.__auth('SIGNED_IN',{user:{id:owner}})},B);await page.waitForFunction(()=>window.__abortedPreparation===1);await page.waitForFunction(()=>document.querySelector('#do-source').value==='');
  assert.equal(await page.locator('#do-source').inputValue(),'');await clean(page);checks.push('actual native preparation binds expected owner; owner change aborts pending preparation and resets consent');await context.close();
 }

 {
  // Actual production widget identity boundary + Focus + Vision surfaces; only unused live/build tools and Next runtime are stubbed.
  // Next normally replaces process.env in next/image; this standalone browser bundle must do the same.
  const focusStubs={...stubs,
   'next/link':`import React from 'react';export default function Link({children,...props}){return React.createElement('a',props,children)}`,
   'next/dynamic':`export default function dynamic(){return ()=>null}`,
   '@/app/do/DoGeminiLive':`export function DoGeminiLive(){return null}`,
   '@/app/do/DoWorkspace':`export function DoWorkspace(){return null}`,
  };delete focusStubs['@/components/do/DoShareButton'];
  const focused=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {DoWidgetPrivacyBoundary} from './components/do/DoWidgetPrivacyBoundary';import './app/do/do.css';window.__root=createRoot(document.getElementById('root'));window.__root.render(React.createElement(DoWidgetPrivacyBoundary,{initialTask:'reply'}));`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,outdir:resolve(out,'focus-bundle'),platform:'browser',format:'iife',define:{'process.env.NODE_ENV':'"production"','process.env':'{}'},plugins:[{name:'fictional-focus',setup(b){b.onResolve({filter:/.*/},a=>focusStubs[a.path]?{path:a.path,namespace:'fixture'}:undefined);b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:focusStubs[a.path],loader:'js',resolveDir:process.cwd()}));}}]});
  const {page,context}=await fixture();await page.evaluate(()=>window.__root.unmount());
  for(const file of focused.outputFiles){if(file.path.endsWith('.js'))await page.addScriptTag({content:file.text});if(file.path.endsWith('.css'))await page.addStyleTag({content:file.text});}
  await page.waitForFunction(()=>typeof window.assemblDoNativeReview==='function');await page.setViewportSize({width:820,height:850});
  await page.screenshot({path:resolve(out,'actual-focus-820.png')});
  await page.evaluate(()=>window.dispatchEvent(new Event('assembl:do-focus-image')));await page.locator('#do-vision-context').waitFor();
  await page.locator('#do-vision-context > summary').click();
  await page.getByLabel('Choose an image for DO',{exact:true}).setInputFiles({name:'fictional-pixel.png',mimeType:'image/png',buffer:fictionalPNG});
  await page.getByAltText('The image you chose for DO to inspect').waitFor();
  assert.equal(await page.getByRole('button',{name:'Ask DO to look · 1 task'}).isDisabled(),true);await page.getByAltText('The image you chose for DO to inspect').scrollIntoViewIfNeeded();await page.screenshot({path:resolve(out,'actual-image-review-820.png')});
  await page.evaluate(owner=>{const fetch=window.fetch;window.fetch=(url,options)=>url==='/api/do/personal'?new Promise(resolve=>{window.__resolveWidgetIdentity=()=>resolve(new Response(JSON.stringify({workspaceKey:owner}),{headers:{'Content-Type':'application/json'}}));}):fetch(url,options);window.__owner=owner;window.__auth('SIGNED_IN',{user:{id:owner}})},B);
  await page.waitForFunction(()=>!document.querySelector('#do-vision-context'));
  assert.equal(await page.getByAltText('The image you chose for DO to inspect').count(),0);
  await page.evaluate(()=>window.__resolveWidgetIdentity());
  await page.waitForFunction(()=>typeof window.assemblDoNativeReview==='function');assert.equal(await page.locator('#do-source').inputValue(),'');await clean(page);
  checks.push('actual Focus links screenshot/photo to local Vision preview; image analysis consent off; auth change unmounts image and clears context');await context.close();
 }
 assert.deepEqual(errors,[]);await writeFile(resolve(out,'results.json'),JSON.stringify({checks,passed:checks.length,errors,actualReactReceiver:true,fictionalAuth:true,providerCalls:0,legacyDraftReads:0,legacyDraftWrites:0,privateCapture:false},null,2)+'\n');console.log(JSON.stringify({passed:checks.length,errors,output:out}));
}finally{await browser.close();}
