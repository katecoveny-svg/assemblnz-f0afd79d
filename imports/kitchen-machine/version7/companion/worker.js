import {SITE,RETAILER,ORIGINS,allowedRetailer,isSite,normalisePlan,validSnapshot,compareApproval,publicState,productURL} from './core.js';
const get=async()=> (await chrome.storage.session.get('session')).session||{enabled:false,records:[]};
const put=s=>chrome.storage.session.set({session:s});
let queue=Promise.resolve();
const serial=fn=>{const p=queue.then(fn,fn);queue=p.catch(()=>{});return p;};
async function panel(){const url=chrome.runtime.getURL('panel.html');const tabs=await chrome.tabs.query({url});if(tabs[0])await chrome.tabs.update(tabs[0].id,{active:true});else await chrome.tabs.create({url});}
chrome.action.onClicked.addListener(()=>panel());
async function injectExisting(){
 const tabs=await chrome.tabs.query({url:ORIGINS});
 for(const tab of tabs){const files=isSite(tab.url)?['bridge.js']:allowedRetailer(tab.url)?['dom.js','retailer.js']:null;if(files)try{await chrome.scripting.executeScript({target:{tabId:tab.id},files});}catch{/* Closed or loading tab; the registered script handles its next load. */}}
}
async function enable(){
 if(!await chrome.permissions.contains({origins:ORIGINS}))throw new Error('Approve the two website permissions first.');
 await chrome.scripting.unregisterContentScripts();
 await chrome.scripting.registerContentScripts([
 {id:'kitchen-bridge',matches:[SITE+'/*'],js:['bridge.js'],runAt:'document_idle',persistAcrossSessions:false},
 {id:'new-world-shopping',matches:[RETAILER+'/',RETAILER+'/shop/*'],excludeMatches:[RETAILER+'/shop/my-account/*',RETAILER+'/shop/checkout*',RETAILER+'/shop/shopping-cart*',RETAILER+'/shop/fulfillment*'],js:['dom.js','retailer.js'],runAt:'document_idle',persistAcrossSessions:false}
 ]);
 const s=await get();s.enabled=true;await put(s);await injectExisting();return publicState(s);
}
async function disconnect(){
 await chrome.scripting.unregisterContentScripts();
 await chrome.storage.session.clear();
 await chrome.permissions.remove({origins:ORIGINS});
 return {linked:false,records:[]};
}
async function send(tabId,m){const r=await chrome.tabs.sendMessage(tabId,m);if(!r?.ok)throw new Error(r?.error||'Reload New World and try again.');return r.data;}
async function retailerTab(s){
 if(s.retailerTabId){try{const t=await chrome.tabs.get(s.retailerTabId);if(allowedRetailer(t.url))return t;}catch{}}
 const t=await chrome.tabs.create({url:RETAILER+'/',active:true});s.retailerTabId=t.id;await put(s);return t;
}
async function trusted(action,m){
 if(action==='enable')return enable();if(action==='disconnect')return disconnect();
 let s=await get();if(action==='status')return {...publicState(s),pendingPlan:s.pending||null};
 if(!s.enabled)throw new Error('Enable the browser connection first.');
 if(s.busy&&action!=='verify-human'&&action!=='show-trolley')throw new Error('An addition is already underway. Check the trolley before continuing.');
 if(action==='accept-plan'){
   if(!s.pending)throw new Error('Return to Kitchen Machine and send one shop.');
   if(s.records.some(x=>['attempting','uncertain'].includes(x.status)))throw new Error('Resolve the outstanding trolley check before starting another shop.');
   s.plan=s.pending;s.pending=null;s.planId=crypto.randomUUID();s.quote=null;s.activeId=null;await put(s);return publicState(s);
 }
 if(action==='open-retailer'){const t=await retailerTab(s);await chrome.tabs.update(t.id,{active:true});return {opened:true};}
 if(action==='search'){
   const item=s.plan?.items.find(i=>i.id===m.id);if(!item)throw new Error('Choose an item from the accepted plan.');
   if(s.records.some(r=>r.planId===s.planId&&r.itemId===item.id&&r.status!=='cancelled'))throw new Error('This line has already been attempted. Review its record.');
   const t=await retailerTab(s);s.activeId=item.id;s.quote=null;await put(s);
   await chrome.tabs.update(t.id,{url:RETAILER+'/shop/search?pg=1&q='+encodeURIComponent(item.name)+'&sf=products',active:true});return {opened:true};
 }
 if(action==='read-product'){
   if(!s.activeId)throw new Error('Choose a plan item and open its search first.');
   const t=await retailerTab(s);if(!allowedRetailer(t.url))throw new Error('Return to a New World product page.');
   const quote=await send(t.id,{type:'read-product'});validSnapshot(quote);
   if(s.store&&s.store!==quote.store&&s.records.some(x=>x.planId===s.planId))throw new Error('The store changed during this shop. Finish reviewing the existing trolley first.');
   s.quote={...quote,tabId:t.id,itemId:s.activeId};await put(s);return publicState(s);
 }
 if(action==='approve-add'){
   if(m.approved!==true)throw new Error('Approval is required.');
   if(!s.quote||s.quote.itemId!==s.activeId)throw new Error('Read your chosen product first.');
   validSnapshot(s.quote);
   if(s.records.some(r=>r.planId===s.planId&&r.itemId===s.activeId&&r.status!=='cancelled'))throw new Error('This line already has a trolley action. No repeat was sent.');
   const t=await chrome.tabs.get(s.quote.tabId);if(productURL(t.url)!==s.quote.url)throw new Error('The product tab changed. Read it again.');
   const fresh=await send(t.id,{type:'read-product'});compareApproval(s.quote,fresh);
   const attempt=crypto.randomUUID(),record={attempt,planId:s.planId,itemId:s.activeId,quote:s.quote,status:'attempting',approvedAt:Date.now()};
   s.records.push(record);s.store=s.quote.store;s.busy=attempt;await put(s);
   // Persist the intent BEFORE the click. A lost response is never automatically replayed.
   try{const result=await send(t.id,{type:'approved-add',quote:s.quote,attempt});record.status=result.status;record.result=result;}
   catch(e){record.status='uncertain';record.result={message:e.message};}
   s.busy=null;s.quote=null;await put(s);return publicState(s);
 }
 if(action==='verify-human'){
   const r=s.records.find(x=>x.attempt===m.attempt);if(!r||!['uncertain','attempting'].includes(r.status))throw new Error('No pending result to review.');
   if(m.confirmation!=='I checked the exact product, quantity and store in the New World trolley'||!['present','absent'].includes(m.outcome))throw new Error('Check the exact trolley line first.');
   r.status=m.outcome==='present'?'customer-confirmed':'cancelled';r.confirmedAt=Date.now();s.busy=null;await put(s);return publicState(s);
 }
 if(action==='show-trolley'){const t=await retailerTab(s);await chrome.tabs.update(t.id,{active:true});await send(t.id,{type:'show-trolley'});return {opened:true};}
 throw new Error('Unsupported action.');
}
chrome.runtime.onMessage.addListener((m,sender,respond)=>{
 const fromPanel=sender.id===chrome.runtime.id&&sender.url===chrome.runtime.getURL('panel.html');
 const fromSite=sender.id===chrome.runtime.id&&sender.frameId===0&&isSite(sender.url)&&m?.from==='kitchen-site';
 if(!fromPanel&&!fromSite){respond({ok:false,error:'Untrusted caller.'});return false;}
 const run=async()=>{
  if(fromPanel)return trusted(m.action,m);
  const s=await get();if(m.action==='status')return publicState(s);
  if(m.action==='disconnect')return disconnect();
  if(!s.enabled)throw new Error('Open the companion to enable access.');
  if(m.action==='open'){await panel();return publicState(s);}
  if(m.action==='prepare'){if(s.busy)throw new Error('A trolley addition is underway.');s.pending=normalisePlan(m.plan);await put(s);await panel();return publicState(s);}
  throw new Error('This website cannot perform trolley actions.');
 };
 const task=m.action==='status'?run():serial(run);
 task.then(data=>respond({ok:true,data})).catch(e=>respond({ok:false,error:e.message}));return true;
});
