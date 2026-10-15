import { z } from 'zod';
import { createHash } from 'node:crypto';
import { doOwner, sameDoOrigin, privateDoHeaders } from '@/apps/do/services/owner';
import { readDoJson, admitDoRequest } from '@/apps/do/shared/http';
import { chatClientIp } from '@/lib/agents/chat-rate-limit';
import { companionHandoff } from '@/apps/do/shared/companion-handoff';
import { clearHeuristics } from '@/apps/do/shared/clear';
import { getOwnerBuilderJob, saveOwnerBuilderJob, recordOwnerJobEvent, recordOwnerReceipt } from '@/apps/do/services/office-jobs';
const inputSchema=z.object({taskId:z.uuid(),brief:z.string().trim().min(8).max(2000),context:z.string().max(1500),masterReference:z.string().max(500),consent:z.literal(true)}).strict();
export const runtime='nodejs';
export const dynamic='force-dynamic';
/** One real in-process specialist, backed by existing Office records. No model or connector. */
export async function POST(request:Request){
  const json=(body:unknown,status=200)=>Response.json(body,{status,headers:privateDoHeaders});
  if(!sameDoOrigin(request))return json({error:'origin_required'},403);
  const owner=await doOwner();if(!owner)return json({error:'sign_in_required'},401);
  const parsed=inputSchema.safeParse(await readDoJson(request).catch(()=>null));if(!parsed.success)return json({error:'review_required'},400);
  if(!admitDoRequest(chatClientIp(request.headers)))return json({error:'wait_before_retry'},429);
  const input=parsed.data,source=input.context.trim()||input.brief;
  const hash=createHash('sha256').update(source).digest('hex');
  try{
    if(request.signal.aborted)return json({error:'cancelled'},499);
    const payload=companionHandoff(input.brief,input.context,input.taskId,new Date().toISOString(),input.masterReference);
    payload.job.scope.push('Specialist: clear-local.v1');
    payload.executionBoundary='DO Clear local writing checks only. No model calls, publishing or external actions.';
    let detail=await getOwnerBuilderJob(owner.id,input.taskId);
    if(detail&&(detail.record.job.objective!==payload.job.objective||!detail.record.job.scope.includes('Specialist: clear-local.v1')))return json({error:'task_conflict'},409);
    if(!detail)detail=await saveOwnerBuilderJob({ownerId:owner.id,...payload});
    if(detail.record.storage!=='database')return json({error:'durable_storage_required'},503);
    const existing=detail.receipts.find(r=>r.evidence?.worker==='clear-local.v1'&&r.evidence?.sourceHash===hash&&r.evidence?.state==='completed');
    const reply=(receipt:unknown)=>json({job:detail!.record.job,durable:true,storage:'database',receipt});
    if(existing)return reply(existing);
    const binding={ownerId:owner.id,workspaceId:detail.record.workspaceId,jobId:input.taskId};
    await recordOwnerJobEvent({...binding,eventId:`clear:${input.taskId}:accepted`,kind:'specialist_accepted',detail:{worker:'clear-local.v1',sourceHash:hash}});
    if(request.signal.aborted)return json({error:'cancelled',taskId:input.taskId},499);
    await recordOwnerJobEvent({...binding,eventId:`clear:${input.taskId}:running`,kind:'specialist_running',detail:{worker:'clear-local.v1'}});
    const result=clearHeuristics(source);
    const receipt=await recordOwnerReceipt({...binding,kind:'note',title:'DO Clear local writing check completed',summary:result.rewritten,jobStatus:'planned',idempotencyKey:`clear:${input.taskId}:result`,evidence:{worker:'clear-local.v1',state:'completed',sourceHash:hash,result,provider:'none',scope:'deterministic writing checks only'}});
    await recordOwnerJobEvent({...binding,eventId:`clear:${input.taskId}:completed`,kind:'specialist_completed',detail:{worker:'clear-local.v1',receiptId:receipt.id}});
    return reply(receipt);
  }catch{return json({error:'specialist_or_storage_unavailable',taskId:input.taskId,message:'No completion confirmed. Check the task receipts before retrying.'},503);}
}
