import {hubSchema,type Hub} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import {directions,frameSchema,type Frame,type NodeId} from '@/components/client-hub-migration/original/lib/creative';
export const sectionLimits:Record<NodeId,number>={headline:150,intro:500,problem:650,solution:650,proof:900,next:400};
export type StudioCheckpoint={id:string;workspaceKey:string;label:string;hub:Hub};
export type StudioDirection={id:string;name:string;frame:Frame};
export type StudioComparison={workspaceKey:string;epoch:number;base:string;directions:StudioDirection[]};
export const studioBase=(h:Hub)=>JSON.stringify(h);
export function editStudioSection(h:Hub,node:NodeId,value:string):Hub{
 if(value.length>sectionLimits[node])throw Error('This section exceeds its shared site/deck limit.');
 const frame=frameSchema.parse({...h.design.frame,content:{...h.design.frame.content,[node]:value}});
 const keys={headline:'title',intro:'promise',problem:'why',solution:'agent',next:'pilot'} as const;
 const key=node==='proof'?undefined:keys[node];
 // Update the chosen idea without rebuilding its journey or resetting the other five sections.
 const engine=h.engine?{...h.engine,concepts:h.engine.concepts.map(c=>c.id===h.engine!.selected?{...c,...(key?{[key]:value}:{gaps:value?[value]:[]})}:c)}:undefined;
 return hubSchema.parse({...h,engine,design:{...h.design,frame,approved:null,evidenceState:h.design.evidenceState==='reviewed'?'supplied':h.design.evidenceState}});
}
export function compareStudioDirections(h:Hub,workspaceKey:string,epoch:number):StudioComparison{
 const frame=frameSchema.parse(h.design.frame);
 // Preserve the supplied typeface; archival Jost/Georgia/Arial overrides are not company canon.
 return {workspaceKey,epoch,base:studioBase(h),directions:directions(frame).map(d=>({...d,frame:{...d.frame,tokens:{...d.frame.tokens,font:frame.tokens.font}}}))};
}
export function retainStudioCheckpoint(history:StudioCheckpoint[],h:Hub,workspaceKey:string,label='Working checkpoint'){
 if(history.length>=6)throw Error('Six checkpoints are retained. Export or explicitly remove one before adding another.');
 const hub=hubSchema.parse(structuredClone(h));
 const next=[...history,{id:crypto.randomUUID(),workspaceKey,label:label.slice(0,100),hub}];
 if(new TextEncoder().encode(JSON.stringify(next)).length>1800000)throw Error('Checkpoints exceed 1.8 MB. Existing work is unchanged.');
 return next;
}
function asDraft(h:Hub):Hub{return hubSchema.parse({...structuredClone(h),design:{...h.design,approved:null,evidenceState:h.design.evidenceState==='reviewed'?'supplied':h.design.evidenceState},engine:h.engine?{...h.engine,requirements:h.engine.requirements.map(r=>({...r,status:r.status==='reviewed draft'?'agent draft':r.status})),evidence:h.engine.evidence.map(e=>({...e,approved:false}))}:undefined});}
export function restoreStudioCheckpoint(h:Hub,history:StudioCheckpoint[],id:string,workspaceKey:string){
 const index=history.findIndex(c=>c.id===id),saved=history[index];
 if(!saved)throw Error('Checkpoint unavailable.');
 if(saved.workspaceKey!==workspaceKey)throw Error('This checkpoint belongs to another workspace. Restore it in its original workspace.');
 const next=asDraft(saved.hub),retained=history.map((c,i)=>i===index?{id:crypto.randomUUID(),workspaceKey,label:'Before restoring checkpoint',hub:hubSchema.parse(structuredClone(h))}:c);
 if(new TextEncoder().encode(JSON.stringify(retained)).length>1800000)throw Error('Checkpoints exceed 1.8 MB. Existing work is unchanged.');
 return {hub:next,history:retained};
}
export function applyStudioDirection(h:Hub,comparison:StudioComparison,id:string,workspaceKey:string,epoch:number){
 if(comparison.workspaceKey!==workspaceKey||comparison.epoch!==epoch||comparison.base!==studioBase(h))throw Error('The workspace or draft changed. Compare the current directions again.');
 const chosen=comparison.directions.find(d=>d.id===id);if(!chosen)throw Error('Direction unavailable.');
 const frame=frameSchema.parse(chosen.frame);
 return hubSchema.parse({...h,design:{...h.design,frame,approved:null}});
}

export type StudioFirstSaveEvidence={fromWorkspaceKey:string;currentWorkspaceKey:string;startedEpoch:number;currentEpoch:number;existingId?:string;acknowledgedId:string;acknowledgedRevision:number;submittedHub:Hub;acknowledgedHub:Hub};
/** Only a confirmed first save of this still-selected fresh workspace changes checkpoint binding. */
export function promoteStudioCheckpoints(history:StudioCheckpoint[],e:StudioFirstSaveEvidence):StudioCheckpoint[]{
 if(e.existingId||!e.fromWorkspaceKey.startsWith('fresh:')||e.currentWorkspaceKey!==e.fromWorkspaceKey||e.acknowledgedRevision!==1||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(e.acknowledgedId))return history;
 const acknowledged=hubSchema.safeParse(e.acknowledgedHub);if(!acknowledged.success||studioBase(acknowledged.data)!==studioBase(e.submittedHub))return history;
 return history.map(c=>c.workspaceKey===e.fromWorkspaceKey?{...c,workspaceKey:`hub:${e.acknowledgedId}`}:c);
}
export function studioHasUnsavedWork(hubDirty:boolean,contentDirty:boolean,checkpoints:StudioCheckpoint[]){return hubDirty||contentDirty||checkpoints.length>0;}

/** Validate save acknowledgement before the parent adopts any saved identity or reports success. */
export function validateStudioSaveAcknowledgement(input:{id:string;revision:number;payload:unknown},submitted:Hub,existingId:string|undefined,previousRevision:number){
 const payload=hubSchema.safeParse(input.payload);
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.id)||!Number.isInteger(input.revision)||input.revision!==previousRevision+1||(existingId!==undefined&&input.id!==existingId)||!payload.success||studioBase(payload.data)!==studioBase(submitted))throw Error('Save acknowledgement does not match the submitted Hub. Workspace identity and checkpoints are unchanged.');
 return input;
}
