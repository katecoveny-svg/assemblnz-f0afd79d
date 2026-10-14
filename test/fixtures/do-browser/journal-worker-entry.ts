/** Synthetic host only: messages below never form a production/native transport. */
import { JournalFixtureWorker } from '../../../apps/do/browser/journal/fixture-worker';
import { LocalMutationJournal } from '../../../apps/do/browser/journal/local';
import type { BrowserScope } from '../../../apps/do/browser/contract';
let controller:JournalFixtureWorker;
let serial=0;
const pending=new Map<number,(value:unknown)=>void>();
function hostCall(method:string,args?:unknown):Promise<unknown>{const id=++serial;postMessage({host:id,method,args});return new Promise(resolve=>pending.set(id,resolve));}
self.onmessage=async(event:MessageEvent)=>{
 const m=event.data;
 if(m.hostReply){pending.get(m.hostReply)?.(m.value);pending.delete(m.hostReply);return;}
 try{
  if(m.action==='boot'){
   if(m.initialize)await LocalMutationJournal.initialize(indexedDB,m.name,m.epoch);
   const journal=await LocalMutationJournal.start(indexedDB,m.name,m.epoch);
   controller=new JournalFixtureWorker(journal,{companion:sender=>sender==='fixture-companion',owner:async()=>await hostCall('owner') as string,current:async(scope)=>await hostCall('current',scope) as boolean,adapter:{mode:'controlled_fixture',observe:async()=>await hostCall('observe') as never,setQuantity:async(scope,revision,sku,quantity)=>{await hostCall('effect',{scope,revision,sku,quantity});}}});
   postMessage({id:m.id,ok:true,value:{ready:true}});return;
  }
  const value=await controller.dispatch(m.sender,m.command);postMessage({id:m.id,ok:true,value});
 }catch(error){postMessage({id:m.id,ok:false,error:String(error)});}
};
export type FixtureScope=BrowserScope;
