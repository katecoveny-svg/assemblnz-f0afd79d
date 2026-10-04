import {hubSchema,type Hub} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import {newIdeaBoard} from '@/components/client-hub-migration/original/lib/idea-board';
import {validateResult,type RunRequest,type RunResult} from './contract';
export function applyShowpieceResult(hub:Hub,request:RunRequest,input:RunResult,actionFingerprint?:string):Hub{
 const result=validateResult(request,input);let ownerRun;try{ownerRun=JSON.parse(hub.engine?.researchPacket||'{}').ownerRun;}catch{}
 const agencyCreativeReferences=JSON.parse(hub.engine?.researchPacket||'{}').agencyCreativeReferences;
 const packet=JSON.stringify({ownerRun,agencyCreativeReferences,ownerActionInputFingerprint:actionFingerprint,mode:result.mode,context:result.packet,brandReferences:result.brandReferences});
 const next={...hub,sources:hub.sources,engine:{...hub.engine!,researchPacket:packet}};
 if(request.action==='ideas')return hubSchema.parse({...next,engine:{...next.engine,concepts:result.concepts!,selected:'',board:newIdeaBoard(result.concepts![0].id,[])}});
 const c=result.concept!;
 return hubSchema.parse({...next,name:c.title.slice(0,140),offer:c.promise.slice(0,1200),engine:{...next.engine,selected:c.id,concepts:next.engine.concepts.map(x=>x.id===c.id?c:x)},journey:{...next.journey,before:c.journey.before.slice(0,900),trigger:c.journey.wait.slice(0,500),fit:'validate',wait:c.journey.wait.slice(0,600),reason:c.why.slice(0,800),action:c.agent.slice(0,900),review:c.journey.reviewer.slice(0,600),after:c.journey.after.slice(0,900),choices:c.journey.options.map(o=>({label:o.label.slice(0,70),output:o.detail.slice(0,300)}))},design:{...next.design,buyer:next.buyer,client:next.seller,brief:next.engine.brief,frame:{...next.design.frame,content:{headline:c.title.slice(0,160),intro:c.promise.slice(0,500),problem:c.why.slice(0,650),solution:c.agent.slice(0,650),proof:c.gaps.join('; ').slice(0,900),next:c.pilot.slice(0,400)}}}});
}
export function resultFromHub(hub:Hub,request:RunRequest):RunResult{
 const packet=JSON.parse(hub.engine?.researchPacket||'{}');if(packet.mode!=='live')throw Error('Stored result provenance unavailable.');
 return validateResult(request,{mode:'live',packet:packet.context,brandReferences:packet.brandReferences,sources:hub.sources.filter(s=>s.include&&s.status==='source'),concepts:request.action==='ideas'?hub.engine?.concepts:undefined,concept:request.action==='build'?hub.engine?.concepts.find(c=>c.id===request.conceptId):undefined,ownerResultHub:hub});
}

/** Completed duplicates are historical full-Hub snapshots. The current Hub has
 * already been saved by prepareRunForDispatch; always detach historical output
 * from its saved identity before displaying it. Never overwrite that draft. */
export function resolveStudioResult(hub:Hub,request:RunRequest,result:RunResult){
 if(result.recovered){if(!result.ownerResultHub)throw Error('Verified recovered Hub required.');return {hub:hubSchema.parse(result.ownerResultHub),openAsNewDraft:true as const};}
 return {hub:result.ownerResultHub||applyShowpieceResult(hub,request,result),openAsNewDraft:false as const};
}
