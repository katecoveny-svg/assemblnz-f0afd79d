import {hubSchema,type Hub,type HubRecord} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import {validateStudioSaveAcknowledgement} from './section-controls';

export type SaveAttempt={workspaceKey:string;startedEpoch:number;id?:string;revision:number;payload:Hub};
/** Tab-scoped dispatch ledger; never account storage or an authentication grant. */
export class OwnerSaveFlow {
 private attempts=new Map<string,{attempt:SaveAttempt;state:'saving'|'uncertain'}>();
 begin(workspaceKey:string,id:string|undefined,revision:number,payload:Hub,startedEpoch=0):SaveAttempt {
  if(this.attempts.has(workspaceKey))throw Error('A save is pending or uncertain. Reconcile through saved projects before saving again.');
  const attempt={workspaceKey,startedEpoch,id,revision,payload:hubSchema.parse(structuredClone(payload))};
  this.attempts.set(workspaceKey,{attempt,state:'saving'});return attempt;
 }
 uncertain(attempt:SaveAttempt){if(this.attempts.get(attempt.workspaceKey)?.attempt===attempt)this.attempts.set(attempt.workspaceKey,{attempt,state:'uncertain'});}
 rejected(attempt:SaveAttempt){if(this.attempts.get(attempt.workspaceKey)?.attempt===attempt)this.attempts.delete(attempt.workspaceKey);}
 pending(workspaceKey:string){return this.attempts.get(workspaceKey);}
 acknowledge(attempt:SaveAttempt,item:HubRecord){
  if(this.attempts.get(attempt.workspaceKey)?.attempt!==attempt)throw Error('Save attempt is no longer current.');
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
