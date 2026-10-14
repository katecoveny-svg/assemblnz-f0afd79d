import {it,expect,vi} from 'vitest';
import {JournalFixtureWorker} from './fixture-worker';
import type {LocalMutationJournal} from './local';
import type {CartObservation} from '../contract';
const scope={connectionId:'11111111-1111-4111-8111-111111111111',tabId:8,documentId:'fixture',origin:'http://127.0.0.1:4198' as const,navigationRevision:0};
function deferred<T>(){let resolve!:(v:T)=>void;const promise=new Promise<T>(r=>{resolve=r;});return{promise,resolve};}
function fixture(){
 let tick=1000,owner='owner';
 const state:CartObservation={scope,observedAt:tick,revision:'r1',currency:'NZD',items:[{productId:'oats',name:'Oats',unitPriceCents:350,available:true,quantity:0}]};
 const journal={current:vi.fn(async()=>true),pending:vi.fn(async()=>({key:'a'.repeat(64),items:[{sku:'oats',before:0,target:2}]})),claim:vi.fn(async()=>true),finish:vi.fn(async()=>{}),reconcileAfterRestart:vi.fn(async()=>{})};
 const host={companion:()=>true,owner:vi.fn(async()=>owner),current:vi.fn(async()=>true),adapter:{mode:'controlled_fixture' as const,observe:vi.fn(async()=>structuredClone(state)),setQuantity:vi.fn(async()=>{state.items[0].quantity=2;state.revision='r2';})}};
 const worker=new JournalFixtureWorker(journal as unknown as LocalMutationJournal,host,()=>tick);
 const dispatch=(action:string,extra={})=>worker.dispatch(null,{action,...extra});
 return{journal,host,dispatch,expire:()=>{tick+=120001;},switchOwner:()=>{owner='other';},connect:()=>dispatch('connect',{scope})};
}
for(const stage of ['owner','tab','journal','final-owner'] as const){
 it(`cancel during connect ${stage} cannot resurrect authority`,async()=>{
  const f=fixture(),gate=deferred<boolean>(),entered=deferred<void>();
  const pause=async()=>{entered.resolve();await gate.promise;return true;};
  if(stage==='owner')f.host.owner.mockImplementationOnce(async()=>{await pause();return 'owner';});
  if(stage==='final-owner')f.host.owner.mockResolvedValueOnce('owner').mockImplementationOnce(async()=>{await pause();return 'owner';});
  if(stage==='tab')f.host.current.mockImplementationOnce(pause);
  if(stage==='journal')f.journal.current.mockImplementationOnce(pause);
  const result=f.connect();const rejected=expect(result).rejects.toThrow();await entered.promise;
  await f.dispatch('cancel');gate.resolve(true);await rejected;
  await expect(f.dispatch('allow-read')).rejects.toThrow('Connect explicitly');expect(f.host.adapter.observe).not.toHaveBeenCalled();
 });
 for(const interruption of ['cancel','expiry','owner-switch','reconnect'] as const){
  it(`${interruption} during guard ${stage} prevents the product read`,async()=>{
   const f=fixture();await f.connect();await f.dispatch('allow-read');
   const gate=deferred<boolean>(),entered=deferred<void>();const pause=async()=>{entered.resolve();await gate.promise;return true;};
   if(stage==='owner')f.host.owner.mockImplementationOnce(async()=>{await pause();return 'owner';});
   if(stage==='final-owner')f.host.owner.mockResolvedValueOnce('owner').mockImplementationOnce(async()=>{await pause();return interruption==='owner-switch'?'other':'owner';});
   if(stage==='tab')f.host.current.mockImplementationOnce(pause);
   if(stage==='journal')f.journal.current.mockImplementationOnce(pause);
   const result=f.dispatch('observe');const rejected=expect(result).rejects.toThrow();await entered.promise;
   if(interruption==='cancel')await f.dispatch('cancel');
   if(interruption==='expiry')f.expire();
   if(interruption==='owner-switch')f.switchOwner();
   if(interruption==='reconnect')await expect(f.connect()).rejects.toThrow('in progress');
   gate.resolve(true);await rejected;expect(f.host.adapter.observe).not.toHaveBeenCalled();
  });
 }
}
it('holds busy through execution settlement while cancel remains immediate',async()=>{
 const f=fixture();await f.connect();await f.dispatch('allow-read');await f.dispatch('observe');
 const review=await f.dispatch('prepare',{quantities:[{productId:'oats',targetQuantity:2}]}) as {digest:string};
 const gate=deferred<void>(),entered=deferred<void>();f.host.adapter.setQuantity.mockImplementationOnce(async()=>{entered.resolve();await gate.promise;});
 const executing=f.dispatch('approve',{digest:review.digest});await entered.promise;
 for(const action of ['observe','prepare','approve'])await expect(f.dispatch(action,{digest:review.digest})).rejects.toThrow('in progress');
 expect(await f.dispatch('cancel')).toEqual({connected:false});
 gate.resolve();expect(await executing).toMatchObject({status:'stopped',items:[{status:'uncertain'}]});
 expect(f.host.adapter.setQuantity).toHaveBeenCalledTimes(1);await expect(f.dispatch('observe')).rejects.toThrow('Connect explicitly');
});
for(const interruption of ['cancel','owner-switch'] as const)it(`recovery pending ${interruption} publishes no stale review`,async()=>{
 const f=fixture();await f.connect();await f.dispatch('allow-read');
 const gate=deferred<void>(),entered=deferred<void>();f.journal.pending.mockImplementationOnce(async()=>{entered.resolve();await gate.promise;return {key:'a'.repeat(64),items:[]};});
 const result=f.dispatch('recover-read');const rejected=expect(result).rejects.toThrow();await entered.promise;
 if(interruption==='cancel')await f.dispatch('cancel');else f.switchOwner();gate.resolve();await rejected;
 expect(f.journal.reconcileAfterRestart).not.toHaveBeenCalled();await expect(f.dispatch('recover-ack',{digest:'a'.repeat(64)})).rejects.toThrow();
});
for(const stage of ['observation','digest'] as const)for(const interruption of ['cancel','owner-switch','expiry'] as const)it(`recovery ${stage} ${interruption} is fenced`,async()=>{
 const f=fixture();await f.connect();await f.dispatch('allow-read');
 const gate=deferred<void>(),entered=deferred<void>();
 let restore=()=>{};
 if(stage==='observation'){
  const original=f.host.adapter.observe.getMockImplementation()!;
  f.host.adapter.observe.mockImplementationOnce(async()=>{const value=await original();entered.resolve();await gate.promise;return value;});
 }else{
  const digest=crypto.subtle.digest.bind(crypto.subtle);
  const spy=vi.spyOn(crypto.subtle,'digest').mockImplementationOnce(async(...args)=>{const value=await digest(...args);entered.resolve();await gate.promise;return value;});restore=()=>spy.mockRestore();
 }
 try{
  const result=f.dispatch('recover-read');const rejected=expect(result).rejects.toThrow();await entered.promise;
  if(interruption==='cancel')await f.dispatch('cancel');else if(interruption==='owner-switch')f.switchOwner();else f.expire();
  gate.resolve();await rejected;expect(f.journal.reconcileAfterRestart).not.toHaveBeenCalled();
 }finally{restore();}
});
for(const interruption of ['cancel','owner-switch','expiry'] as const)it(`reconciliation confirmation ${interruption} cannot acknowledge`,async()=>{
 const f=fixture();await f.connect();await f.dispatch('allow-read');
 const review=await f.dispatch('recover-read') as {digest:string};
 const gate=deferred<void>(),entered=deferred<void>();let committed=false;
 f.journal.reconcileAfterRestart.mockImplementationOnce(async(...raw:unknown[])=>{
  entered.resolve();await gate.promise;
  const confirm=raw[4] as ()=>Promise<boolean>,assertCurrent=raw[5] as ()=>void;
  await confirm();assertCurrent();committed=true;
 });
 const result=f.dispatch('recover-ack',{digest:review.digest});const rejected=expect(result).rejects.toThrow();await entered.promise;
 if(interruption==='cancel')await f.dispatch('cancel');else if(interruption==='owner-switch')f.switchOwner();else f.expire();
 gate.resolve();await rejected;expect(committed).toBe(false);
});
