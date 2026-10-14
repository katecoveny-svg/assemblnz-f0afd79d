import { z } from 'zod';
import {claimActionSchema,createRunSchema,runPolicySchema,usageSchema,costMicros,reserveMicros,type ClaimAction,type CreateRun,type RunPolicy,type RunUsage} from './owner-run-policy';

export type Owner={userId:string;verified:true;anonymous:false};
export type Claim={claimId:string;actionId:string;action:'develop'|'build';state:'reserved'|'started'|'complete'|'failed'|'usage-unverified';reservedUsdMicros:number;providerRequestId?:string;usage?:RunUsage;actualUsdMicros?:number;outputFingerprint?:string;providerEvidence?:{provider:string;model:string;accountRef:string}};
export type RunReceipt={runId:string;ownerId:string;inputFingerprint:string;policy:RunPolicy;selectedSourceReceipts:CreateRun['selectedSourceReceipts'];revision:number;reservedUsdMicros:number;claims:Claim[]};
export type ClaimResult={kind:'claimed';claimId:string;receipt:RunReceipt}|{kind:'existing';receipt:RunReceipt};
export type StartAction={runId:string;claimId:string;expectedRevision:number};
export type Outcome=StartAction & {status:'complete'|'failed'|'usage-unverified';providerRequestId?:string;usage?:RunUsage;validatedOutputFingerprint?:string;providerEvidence?:{provider:string;model:string;accountRef:string}};
export interface OwnerRunStore {
  createRun(owner:Owner,input:CreateRun):Promise<RunReceipt>;
  claimAction(owner:Owner,input:ClaimAction):Promise<ClaimResult>;
  startAction(owner:Owner,input:StartAction):Promise<{dispatch:true;receipt:RunReceipt}>;
  recordOutcome(owner:Owner,input:Outcome):Promise<RunReceipt>;
  lookupRun(owner:Owner,runId:string):Promise<RunReceipt>;
}
export const startSchema=z.object({runId:z.uuid(),claimId:z.uuid(),expectedRevision:z.number().int().safe().nonnegative()}).strict();
export const outcomeSchema=startSchema.extend({status:z.enum(['complete','failed','usage-unverified']),providerRequestId:z.string().min(1).max(200).optional(),usage:usageSchema.optional(),validatedOutputFingerprint:z.string().regex(/^[a-f0-9]{64}$/).optional(),providerEvidence:z.object({provider:z.enum(['openai','anthropic']),model:z.string().min(1).max(100),accountRef:z.string().min(1).max(100)}).strict().optional()}).strict();
function ownerId(owner:Owner){if(owner.verified!==true||owner.anonymous!==false)throw Error('run_owner_denied');return z.uuid().parse(owner.userId);}

/** Explicit LOCAL FAKE: serialized transactions, no network, no persistence.
 * Never use as a fallback if production storage is unavailable. */
export function createLocalOwnerRunStore(policies:ReadonlyMap<string,RunPolicy>,enabledOwners:ReadonlySet<string>):OwnerRunStore {
  const approved=new Map([...policies].map(([id,p])=>{const parsed=runPolicySchema.parse(p);if(id!==parsed.id)throw Error('run_policy_invalid');return [id,structuredClone(parsed)] as const;}));
  const rows=new Map<string,RunReceipt>();const policyRuns=new Map<string,string>();let tail=Promise.resolve();
  function transaction<T>(owner:Owner,fn:(key:string)=>T):Promise<T>{
    const work=tail.then(()=>{const id=ownerId(owner);if(!enabledOwners.has(id))throw Error('run_owner_denied');return fn(id);});
    tail=work.then(()=>undefined,()=>undefined);return work.then(value=>structuredClone(value));
  }
  function row(owner:string,runId:string){const r=rows.get(`${owner}:${z.uuid().parse(runId)}`);if(!r)throw Error('run_unavailable');return r;}
  function cas(r:RunReceipt,revision:number){if(r.revision!==revision)throw Error('run_revision_conflict');}
  return {
    createRun:(owner,input)=>transaction(owner,id=>{const i=createRunSchema.parse(input),key=`${id}:${i.runId}`,existing=rows.get(key);
      if(existing){if(existing.inputFingerprint!==i.inputFingerprint||existing.policy.id!==i.policyId||JSON.stringify(existing.selectedSourceReceipts)!==JSON.stringify(i.selectedSourceReceipts))throw Error('run_input_conflict');return existing;}
      const policy=approved.get(i.policyId);if(!policy||policy.ownerId!==id||Date.parse(policy.expiresAt)<=Date.now())throw Error('run_policy_denied');if(policyRuns.has(`${id}:${policy.id}`))throw Error('run_policy_already_used');if(reserveMicros(policy)>policy.maxUsdMicros)throw Error('run_budget_exceeded');
      const r:RunReceipt={runId:i.runId,inputFingerprint:i.inputFingerprint,selectedSourceReceipts:i.selectedSourceReceipts,ownerId:id,policy:structuredClone(policy),revision:0,reservedUsdMicros:0,claims:[]};rows.set(key,r);policyRuns.set(`${id}:${policy.id}`,i.runId);return r;}),
    claimAction:(owner,input)=>transaction(owner,id=>{const i=claimActionSchema.parse(input),r=row(id,i.runId);
      if(r.inputFingerprint!==i.inputFingerprint)throw Error('run_input_conflict');
      const previous=r.claims.find(c=>c.actionId===i.actionId);if(previous){if(previous.action!==i.action)throw Error('run_input_conflict');return {kind:'existing' as const,receipt:r};}
      cas(r,i.expectedRevision);if(Date.parse(r.policy.expiresAt)<=Date.now())throw Error('run_policy_expired');const reserve=reserveMicros(r.policy);
      if(r.claims.length>=r.policy.maxCalls||BigInt(r.reservedUsdMicros)+BigInt(reserve)>BigInt(r.policy.maxUsdMicros))throw Error('run_budget_exceeded');
      const claim:Claim={claimId:crypto.randomUUID(),actionId:i.actionId,action:i.action,state:'reserved',reservedUsdMicros:reserve};r.claims.push(claim);r.reservedUsdMicros+=reserve;r.revision++;return {kind:'claimed' as const,claimId:claim.claimId,receipt:r};}),
    startAction:(owner,input)=>transaction(owner,id=>{const i=startSchema.parse(input),r=row(id,i.runId);cas(r,i.expectedRevision);if(Date.parse(r.policy.expiresAt)<=Date.now())throw Error('run_policy_expired');const c=r.claims.find(c=>c.claimId===i.claimId);if(!c||c.state!=='reserved')throw Error('run_dispatch_denied');c.state='started';r.revision++;return {dispatch:true as const,receipt:r};}),
    recordOutcome:(owner,input)=>transaction(owner,id=>{const i=outcomeSchema.parse(input),r=row(id,i.runId);cas(r,i.expectedRevision);const c=r.claims.find(c=>c.claimId===i.claimId);if(!c||c.state!=='started')throw Error('run_outcome_denied');
      const bounded=i.usage&&i.usage.inputTokens<=r.policy.maxInputTokens&&i.usage.outputTokens<=r.policy.maxOutputTokens;
      const matched=i.providerEvidence?.provider===r.policy.provider&&i.providerEvidence.model===r.policy.model&&i.providerEvidence.accountRef===r.policy.accountRef;
      const complete=bounded&&matched&&Boolean(i.providerRequestId)&&Boolean(i.status!=='complete'||i.validatedOutputFingerprint);
      c.state=complete?i.status:'usage-unverified';c.providerRequestId=i.providerRequestId;c.usage=i.usage;c.providerEvidence=i.providerEvidence;
      if(i.usage)c.actualUsdMicros=costMicros(r.policy,i.usage.inputTokens,i.usage.outputTokens);
      if(c.state==='complete')c.outputFingerprint=i.validatedOutputFingerprint;
      // Initial conservative policy never refunds, including validation failures.
      r.revision++;return r;}),
    lookupRun:(owner,runId)=>transaction(owner,id=>row(id,runId)),
  };
}

export type RunRpc=(name:'studio_owner_run_command',args:{p_owner:string;p_command:string;p_input:unknown})=>Promise<{data:unknown;error:unknown}>;
/** Server-only caller must derive Owner from ownerSession, never request JSON.
 * RPC credential stays in the injected trusted server client. Off by default. */
export function createProductionOwnerRunStore(rpc:RunRpc,enabled=false):OwnerRunStore {
  async function call<T>(owner:Owner,command:string,input:unknown):Promise<T>{
    if(!enabled)throw Error('run_storage_not_activated');const id=ownerId(owner);
    const result=await rpc('studio_owner_run_command',{p_owner:id,p_command:command,p_input:input});
    if(result.error||!result.data)throw Error('run_storage_unavailable');return result.data as T;
  }
  return {createRun:(o,i)=>call(o,'create',createRunSchema.parse(i)),claimAction:(o,i)=>call(o,'claim',claimActionSchema.parse(i)),startAction:(o,i)=>call(o,'start',startSchema.parse(i)),recordOutcome:(o,i)=>call(o,'outcome',outcomeSchema.parse(i)),lookupRun:(o,id)=>call(o,'lookup',{runId:z.uuid().parse(id)})};
}
