import {hubSchema,type Hub,type HubRecord} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import {validateStudioSaveAcknowledgement} from './section-controls';

export type SaveAttempt={workspaceKey:string;startedEpoch:number;id?:string;revision:number;payload:Hub};
export const ownerRevisionMax=2147483647;
function freezeSnapshot<T>(value:T):T{if(value&&typeof value==='object'){for(const item of Object.values(value))freezeSnapshot(item);Object.freeze(value);}return value;}
/** A timed-out client wait does not prove the server stopped; late completion is never adopted. */
export async function awaitOwnerSaveResponse<T>(response:Promise<T>,waitMs=20000):Promise<T>{
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{return await Promise.race([response,new Promise<never>((_resolve,reject)=>{timer=setTimeout(()=>reject(Error('Save response timed out; outcome is uncertain.')),waitMs);})]);}
 finally{if(timer!==undefined)clearTimeout(timer);}
}
/** Tab-scoped dispatch ledger; never account storage or an authentication grant. */
export class OwnerSaveFlow {
 private attempts=new Map<string,{attempt:SaveAttempt;state:'saving'|'uncertain'}>();
 begin(workspaceKey:string,id:string|undefined,revision:number,payload:Hub,startedEpoch=0):SaveAttempt {
  if(!Number.isInteger(revision)||revision<0||revision>=ownerRevisionMax)throw Error('Saved revision is invalid or exhausted. Export your retained edits; no save was sent.');
  if(this.attempts.has(workspaceKey))throw Error('A save is pending or uncertain. Reconcile through saved projects before saving again.');
  const attempt=freezeSnapshot({workspaceKey,startedEpoch,id,revision,payload:hubSchema.parse(structuredClone(payload))});
  this.attempts.set(workspaceKey,{attempt,state:'saving'});return attempt;
 }
 uncertain(attempt:SaveAttempt){if(this.attempts.get(attempt.workspaceKey)?.attempt===attempt)this.attempts.set(attempt.workspaceKey,{attempt,state:'uncertain'});}
 rejected(attempt:SaveAttempt){if(this.attempts.get(attempt.workspaceKey)?.attempt===attempt)this.attempts.delete(attempt.workspaceKey);}
 pending(workspaceKey:string){return this.attempts.get(workspaceKey);}
 /** User-invoked only: stable create identity and immutable original payload, never current editor state. */
 retryCapturedCreate(workspaceKey:string):SaveAttempt{
  const pending=this.attempts.get(workspaceKey);
  if(!pending||pending.state!=='uncertain'||pending.attempt.revision!==0||!pending.attempt.id||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(pending.attempt.id))throw Error('No captured stable create is available for an explicit retry. Read/reopen or export your current work.');
  this.attempts.set(workspaceKey,{attempt:pending.attempt,state:'saving'});return pending.attempt;
 }
 acknowledge(attempt:SaveAttempt,item:HubRecord){
  if(this.attempts.get(attempt.workspaceKey)?.attempt!==attempt)throw Error('Save attempt is no longer current.');
  if(item.revision>ownerRevisionMax)throw Error('Save acknowledgement revision exceeds the owner storage bound.');
  validateStudioSaveAcknowledgement(item,attempt.payload,attempt.id,attempt.revision);
  this.attempts.delete(attempt.workspaceKey);return item;
 }
 /** Explicit owned GET only; exact revision/payload match, never fuzzy company matching. */
 reconcile(workspaceKey:string,item:HubRecord){
  const pending=this.attempts.get(workspaceKey);
  if(!pending||pending.state!=='uncertain')throw Error('No uncertain save to reconcile.');
  return this.acknowledge(pending.attempt,item);
 }
}
