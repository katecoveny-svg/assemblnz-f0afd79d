import {z} from 'zod';
import {hubSchema,type Hub} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import {nodeIds,type NodeId} from '@/components/client-hub-migration/original/lib/creative';
import {editStudioSection,retainStudioCheckpoint,sectionLimits,type StudioCheckpoint} from './section-controls';
const digest=z.string().regex(/^[0-9a-f]{64}$/);
const bindingSchema=z.object({workspaceKey:z.string().min(1).max(200),epoch:z.number().int().nonnegative(),revision:z.number().int().nonnegative(),hubFingerprint:digest,sourceFingerprint:digest,briefFingerprint:digest,designFingerprint:digest,contentFingerprint:digest}).strict();
const changesSchema=z.object(Object.fromEntries(nodeIds.map(n=>[n,z.string().max(sectionLimits[n]).optional()])) as Record<NodeId,z.ZodOptional<z.ZodString>>).strict();
const proposalSchema=z.object({schemaVersion:z.literal(1),binding:bindingSchema,changes:changesSchema}).strict();
export type SectionPatchScope={workspaceKey:string;epoch:number;revision:number};
export type SectionPatchProposal=z.infer<typeof proposalSchema>;
export type SectionPatchReview={proposal:SectionPatchProposal;changes:{field:NodeId;before:string;after:string}[]};
export const sectionPatchMaxBytes=16000;
async function fingerprint(value:unknown){const bytes=new TextEncoder().encode(JSON.stringify(value));return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');}
/** Revision assertions are local admission bindings, never owner/source grants. */
export async function sectionPatchBinding(h:Hub,scope:SectionPatchScope){
 const hub=hubSchema.parse(h);
 const [hubFingerprint,sourceFingerprint,briefFingerprint,designFingerprint,contentFingerprint]=await Promise.all([fingerprint(hub),fingerprint(hub.sources),fingerprint({buyer:hub.buyer,buyerRole:hub.buyerRole,offer:hub.offer,brief:hub.engine?.brief}),fingerprint(hub.design),fingerprint(hub.design.frame.content)]);
 return bindingSchema.parse({...scope,hubFingerprint,sourceFingerprint,briefFingerprint,designFingerprint,contentFingerprint});
}
function allowOwnKeys(input:unknown,allowed:readonly string[],label:string){if(!input||typeof input!=='object'||Array.isArray(input))throw Error(`The ${label} must be an object.`);for(const key of Object.keys(input))if(!allowed.includes(key))throw Error(`Unknown ${label} field: ${key}. Existing work is unchanged.`);}
function boundedParse(input:string){
 if(new TextEncoder().encode(input).length>sectionPatchMaxBytes)throw Error('Section patch exceeds 16 KB. Existing work is unchanged.');
 const raw=JSON.parse(input);allowOwnKeys(raw,['schemaVersion','binding','changes'],'patch');
 allowOwnKeys(raw.binding,['workspaceKey','epoch','revision','hubFingerprint','sourceFingerprint','briefFingerprint','designFingerprint','contentFingerprint'],'binding');
 allowOwnKeys(raw.changes,nodeIds,'section');
 return proposalSchema.parse(raw);
}
function equivalent(a:unknown,b:unknown){return JSON.stringify(a)===JSON.stringify(b);}
export async function reviewSectionPatch(h:Hub,scope:SectionPatchScope,input:string):Promise<SectionPatchReview>{
 const proposal=boundedParse(input),binding=await sectionPatchBinding(h,scope);
 if(!equivalent(proposal.binding,binding))throw Error('The workspace or source, brief, design or content revision changed. Stage a patch for the current draft.');
 const changes=nodeIds.filter(n=>proposal.changes[n]!==undefined&&proposal.changes[n]!==h.design.frame.content[n]).map(field=>({field,before:h.design.frame.content[field],after:proposal.changes[field]!}));
 if(!changes.length)throw Error('The patch contains no section changes.');
 if(proposal.changes.headline!==undefined&&(!proposal.changes.headline.trim()||proposal.changes.headline!==proposal.changes.headline.trim()))throw Error('The headline must be nonempty with no leading or trailing whitespace. Edit the proposal; no text was changed.');
 let prospective=h;for(const change of changes)prospective=editStudioSection(prospective,change.field,change.after);
 if(changes.some(change=>prospective.design.frame.content[change.field]!==change.after))throw Error('The section text would change during validation. Edit the proposal; no text was changed.');
 return {proposal,changes};
}
/** Re-parse and re-admit at apply time; atomic returned state, no writes or approval. */
export async function applySectionPatch(h:Hub,history:StudioCheckpoint[],scope:SectionPatchScope,proposal:SectionPatchProposal){
 const review=await reviewSectionPatch(h,scope,JSON.stringify(proposal));
 let hub=h;for(const change of review.changes)hub=editStudioSection(hub,change.field,change.after);
 const retained=retainStudioCheckpoint(history,h,scope.workspaceKey,'Before applying section patch');
 return {hub,history:retained};
}
