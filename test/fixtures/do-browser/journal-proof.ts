import { LocalMutationJournal, withLocalJournal } from '../../../apps/do/browser/journal/local';
import { executeReviewedCart, proposalDigest } from '../../../apps/do/browser/executor';
import type { CartProposal, CartObservation } from '../../../apps/do/browser/contract';
const owner='fictional-owner', epoch=crypto.randomUUID();
const proposal=():CartProposal=>({protocol:'do.cart.v1',actionId:crypto.randomUUID(),revision:1,scope:{connectionId:crypto.randomUUID(),tabId:4,documentId:'fixture',origin:'http://127.0.0.1:4198',navigationRevision:0},retailerContext:{retailer:'woolworths_nz',accountBinding:'a'.repeat(64),storeId:'fictional-store',cartId:'fictional-cart',complete:true},observedRevision:'r1',expiresAt:5000,items:[{productId:'fictional-oats',name:'Not persisted product name',quantity:0,targetQuantity:1,unitPriceCents:300,available:true}]});
async function rejects(fn:()=>Promise<unknown>) {try{await fn();return false;}catch{return true;}}
export async function runJournalProofs() {
 const results:Record<string,boolean>={};
 const setup=async()=>{const name='fictional-journal-'+crypto.randomUUID();await LocalMutationJournal.initialize(indexedDB,name,epoch);return{name,journal:await LocalMutationJournal.start(indexedDB,name,epoch)};};
 let {name,journal}=await setup();const p=proposal();
 results['resume cannot silently initialize']=await rejects(()=>LocalMutationJournal.resume(indexedDB,'absent-'+crypto.randomUUID()));
 results['missing journal cannot silently initialize']=await rejects(()=>LocalMutationJournal.start(indexedDB,'absent-'+crypto.randomUUID(),epoch));
 results['existing journal cannot reset']=await rejects(()=>LocalMutationJournal.initialize(indexedDB,name,epoch));
 results['wrong installation cannot resume']=await rejects(()=>LocalMutationJournal.start(indexedDB,name,crypto.randomUUID()));
 const concurrent=await Promise.all([journal.claim(owner,p,()=>1000),journal.claim(owner,p,()=>1000)]);
 results['concurrent duplicate claims have one winner']=concurrent.filter(Boolean).length===1;
 results['new action ID cannot bypass uncertain cart lock']=!await journal.claim(owner,proposal(),()=>1000);
 results['expired lease never releases uncertain lock']=!await journal.claim(owner,{...proposal(),expiresAt:10000},()=>6000);
 const old=journal;journal=await LocalMutationJournal.start(indexedDB,name,epoch);
 results['restart fences previous worker']=await rejects(()=>old.current());old.close();
 results['crash before effect remains claimed']=!await journal.claim(owner,p,()=>1000);
 const pending=await journal.pending(owner);
 results['recovery stores bounded intent without names or price']=!!pending && pending.items[0].sku==='fictional-oats' && !JSON.stringify(pending).includes('Not persisted') && !JSON.stringify(pending).includes('unitPrice');
 results['wrong owner cannot inspect pending']=await rejects(()=>journal.pending('other'));
 results['recovery requires explicit acknowledgement']=await rejects(()=>journal.reconcileAfterRestart(owner,pending!.key,p.retailerContext!,'b'.repeat(64),async()=>false));
 results['recovery rejects changed account']=await rejects(()=>journal.reconcileAfterRestart(owner,pending!.key,{...p.retailerContext!,accountBinding:'c'.repeat(64)},'b'.repeat(64),async()=>true));
 await journal.reconcileAfterRestart(owner,pending!.key,p.retailerContext!,'b'.repeat(64),async()=>true);
 results['reconciliation does not authorize replay']=!await journal.claim(owner,p,()=>1000);
 results['new review after reconciliation may claim']=await journal.claim(owner,proposal(),()=>1000);
 journal.close();
 const run=async(crash:boolean)=>{
  const x=await setup(),review=proposal();let quantity=0,effects=0;const id=crypto.randomUUID(),digest=await proposalDigest(review);
  const authority={getApproval:async()=>({id,ownerId:owner,actionId:review.actionId,revision:1,digest,scope:review.scope,expiresAt:5000,revoked:false}),isConnected:async()=>true};
  const store=withLocalJournal(x.journal,authority,owner,review,()=>1000);
  const observe=async():Promise<CartObservation>=>({scope:review.scope,retailerContext:review.retailerContext,revision:quantity?'r2':'r1',currency:'NZD',observedAt:1000,items:[{...review.items[0],targetQuantity:undefined,quantity}].map(({targetQuantity:_t,...item})=>item)});
  const adapter={mode:'controlled_fixture' as const,observe,setQuantity:async()=>{effects++;quantity=1;if(crash)x.journal.close();}};
  const outcome=await executeReviewedCart({ownerId:owner,approvalId:id,proposal:review},store,adapter,()=>1000).catch(()=>null);
  if(crash){const resumed=await LocalMutationJournal.start(indexedDB,x.name,epoch);results['crash after effect before receipt retains lock']=effects===1 && outcome===null && !await resumed.claim(owner,proposal(),()=>1000);resumed.close();}
  else {results['existing executor commits verified receipt']=outcome?.status==='verified' && effects===1 && await x.journal.pending(owner)===null;results['verified action cannot replay']=!await x.journal.claim(owner,review,()=>1000);x.journal.close();}
 };
 await run(false);await run(true);
 ({name,journal}=await setup());
 results['expired proposal fails before claim']=await rejects(()=>journal.claim(owner,proposal(),()=>5001));
 await journal.claim(owner,p,()=>1000);
 const row=await journal.pending(owner);
 results['same-worker recovery cannot release running claim']=await rejects(()=>journal.reconcileAfterRestart(owner,row!.key,p.retailerContext!,'b'.repeat(64),async()=>true));
 await journal.finish(owner,p,{actionId:p.actionId,revision:p.revision,digest:await proposalDigest(p),scope:p.scope,retailerContext:p.retailerContext,finishedAt:1000,mode:'controlled_fixture',retailerExecuted:false,status:'stopped',items:[{productId:p.items[0].productId,requestedQuantity:1,beforeQuantity:0,observedQuantity:null,beforeRevision:'r1',afterRevision:null,status:'uncertain'}]});
 await journal.reconcileAfterRestart(owner,row!.key,p.retailerContext!,'b'.repeat(64),async()=>true);
 results['same-worker settled uncertain action can acknowledge without replay']=await journal.pending(owner)===null&&!await journal.claim(owner,p,()=>1000);
 journal.close();
 return results;
}

export async function preparePageRestartProof() {
 const name='fictional-restart-'+crypto.randomUUID(),p=proposal();
 await LocalMutationJournal.initialize(indexedDB,name,epoch);
 const journal=await LocalMutationJournal.start(indexedDB,name,epoch);
 await journal.claim(owner,p,()=>1000);
 // Deliberately leave it claimed; browser page destruction drops all JS state.
 return {name,epoch};
}
export async function resumePageRestartProof(input:{name:string;epoch:string}) {
 const journal=await LocalMutationJournal.start(indexedDB,input.name,input.epoch);
 const pending=await journal.pending(owner);
 const blocked=!await journal.claim(owner,proposal(),()=>1000);
 journal.close();return pending?.state==='claimed' && blocked;
}
export async function runStorageFailureProof() {
 const name='fictional-failure-'+crypto.randomUUID();await LocalMutationJournal.initialize(indexedDB,name,epoch);
 const journal=await LocalMutationJournal.start(indexedDB,name,epoch);
 const original=IDBObjectStore.prototype.add;
 IDBObjectStore.prototype.add=function(value,key){if(this.name==='claims')throw new DOMException('Synthetic quota failure','QuotaExceededError');return original.call(this,value,key);};
 let failed=false;
 try{failed=await rejects(()=>journal.claim(owner,proposal(),()=>1000));}finally{IDBObjectStore.prototype.add=original;}
 const empty=await journal.pending(owner)===null;
 journal.close();return failed && empty;
}

export async function runCapacityProof() {
 const name='fictional-capacity-'+crypto.randomUUID(),p=proposal();
 await LocalMutationJournal.initialize(indexedDB,name,epoch);
 const journal=await LocalMutationJournal.start(indexedDB,name,epoch);
 await journal.claim(owner,p,()=>1000);const sample=await journal.pending(owner);journal.close();
 await new Promise<void>((resolve,reject)=>{const r=indexedDB.open(name);r.onsuccess=()=>{const db=r.result,tx=db.transaction(['claims','state'],'readwrite');tx.objectStore('claims').clear();tx.objectStore('state').delete('lock');for(let i=0;i<256;i++)tx.objectStore('claims').put({...sample,key:i.toString(16).padStart(64,'0'),state:'verified'});tx.oncomplete=()=>{db.close();resolve();};tx.onabort=()=>reject(new Error('Fixture seed failed'));};});
 const resumed=await LocalMutationJournal.start(indexedDB,name,epoch);
 const blocked=await rejects(()=>resumed.claim(owner,proposal(),()=>1000));resumed.close();return blocked;
}

/** Actual broker + actual IndexedDB; synthetic cart transport, not MV3 activeTab. */
export async function runBrokerRecoveryProof() {
 const {ConnectionBroker}=await import('../../../apps/do/browser/connection/broker');
 const name='broker-journal-'+crypto.randomUUID(),installation=crypto.randomUUID();
 await LocalMutationJournal.initialize(indexedDB,name,installation);
 let journal=await LocalMutationJournal.resume(indexedDB,name),quantity=0,effects=0,failReadback=false;
 const ownerId='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 const target={tabId:4,documentId:'fixture',url:'http://127.0.0.1:4198/cart-fixture.html'},workspace={tabId:8,documentId:'workspace',url:'http://localhost:3000/do/personal'};
 const host={owner:async()=>ownerId,current:async()=>true,journal:async()=>journal,adapter:(_tab:unknown,scope:CartProposal['scope'])=>({mode:'controlled_fixture' as const,observe:async()=>{if(failReadback)throw new Error('Lost readback');return{scope,revision:String(quantity),observedAt:Date.now(),currency:'NZD' as const,items:[{productId:'oats',name:'Fictional oats',quantity,unitPriceCents:350,available:true}]};},setQuantity:async()=>{effects++;quantity=1;failReadback=true;}})};
 let broker=new ConnectionBroker(host);
 const connect=async()=>{const s=await broker.connect(target,workspace);if(!s.connected)throw new Error('Fixture connection');return s.connectionId;};
 const prepare=async(id:string)=>{await broker.allowReadInCompanion(id);await broker.command(workspace,{action:'observe',connectionId:id});const p=await broker.command(workspace,{action:'prepare',connectionId:id,brief:'Fictional review',quantities:[{productId:'oats',quantity:2}]});if(!p.connected||!p.digest)throw new Error('Fixture proposal');return p.digest;};
 let id=await connect(),digest=await prepare(id);
 await broker.approveInCompanion(id,digest);
 const result:Record<string,boolean>={};
 result['broker uncertain receipt retains durable lock']=(await journal.pending(ownerId))?.state==='uncertain'&&effects===1;
 broker.revoke();failReadback=false;id=await connect();digest=await prepare(id);
 result['broker reconnect new action cannot bypass lock']=await rejects(()=>broker.approveInCompanion(id,digest))&&effects===1;
 journal.close();journal=await LocalMutationJournal.resume(indexedDB,name);broker=new ConnectionBroker(host);
 result['broker restart restores no connection']=!broker.snapshot().connected;
 id=await connect();result['broker restart requires fresh read consent']=await rejects(()=>broker.recoverInCompanion(id));
 await broker.allowReadInCompanion(id);
 const read=await broker.recoverInCompanion(id);if(!read.connected||!read.recovery)throw new Error('Recovery missing');
 result['broker recovery displays before target current']=JSON.stringify(read.recovery.items)==='[{"sku":"oats","before":0,"target":2,"current":1}]';
 result['broker recovery wrong digest rejected']=await rejects(()=>broker.recoverInCompanion(id,'b'.repeat(64)));
 quantity=3;result['broker recovery changed cart rejected']=await rejects(()=>broker.recoverInCompanion(id,read.recovery!.digest));
 const fresh=await broker.recoverInCompanion(id);if(!fresh.connected||!fresh.recovery)throw new Error('Fresh recovery missing');
 await broker.recoverInCompanion(id,fresh.recovery.digest);
 result['broker acknowledgement clears lock without retry']=await journal.pending(ownerId)===null&&effects===1&&quantity===3;
 result['broker acknowledgement cannot replay']=await rejects(()=>broker.recoverInCompanion(id,fresh.recovery!.digest));
 journal.close();return result;
}
