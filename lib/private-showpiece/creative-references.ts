import {z} from 'zod/v3';
import type {Hub} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import {selectedPublicUrl} from '@/lib/private-showpiece/public-url';
const id=z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
export const creativePrefix='Creative observation only; imported provenance unverified; no company fact, performance or reuse permission established. ';
export const creativeReferenceSchema=z.object({sourceId:id,archiveSha256:z.string().regex(/^[a-f0-9]{64}$/),brandId:z.enum(['brand_assembl','brand_winger']),boardId:id,boardRevision:z.number().int().positive(),referenceId:id,referenceRevision:z.number().int().positive(),title:z.string().min(1).max(180),url:z.string().max(1500),excerpt:z.string().min(1).max(760),observedAt:z.string().max(40),provenance:z.literal('owner-selected imported archive; unverified'),purpose:z.literal('creative inspiration only; never cited evidence')}).strict();
export type CreativeReference=z.infer<typeof creativeReferenceSchema>;
export function readCreativeReferences(hub:Hub):CreativeReference[]{
 let packet;try{packet=JSON.parse(hub.engine?.researchPacket||'{}');}catch{return [];}
 if(!packet||typeof packet!=='object'||Array.isArray(packet))return [];
 const refs=z.array(creativeReferenceSchema).max(6).parse(packet.agencyCreativeReferences??[]);
 if(new Set(refs.map(r=>r.sourceId)).size!==refs.length)throw Error('Duplicate creative-reference binding.');
 return refs;
}
export function projectCreativeReferences(hub:Hub){
 try{return readCreativeReferences(hub).filter(ref=>{
  const source=hub.sources.find(s=>s.id===ref.sourceId);if(!source)throw Error('Creative-reference source binding missing.');
  if(source.status!=='concept'||source.url!==selectedPublicUrl(ref.url)||source.title!==ref.title||source.claim!==creativePrefix+ref.excerpt||source.checked!==ref.observedAt)throw Error('Creative reference changed. Review and reimport the selection.');
  return source.include;
 });}catch{return [];}
}
/** Invalid bindings are preserved in the original Hub and excluded from presentation. */
export function creativeReferenceIssue(hub:Hub){try{const refs=readCreativeReferences(hub);if(refs.length&&projectCreativeReferences(hub).length!==refs.filter(ref=>hub.sources.find(source=>source.id===ref.sourceId)?.include).length)return 'Creative-reference bindings need review; none are used as evidence.';}catch{return 'Creative-reference bindings need review; none are used as evidence.';}return undefined;}


/** Selected creative provenance is never promoted into factual evidence, even when a binding needs repair. */
export function creativeReferenceSourceIds(hub:Hub):string[]{try{const packet=JSON.parse(hub.engine?.researchPacket||'{}');return Array.isArray(packet?.agencyCreativeReferences)?packet.agencyCreativeReferences.flatMap((ref:unknown)=>ref&&typeof ref==='object'&&'sourceId' in ref&&typeof ref.sourceId==='string'?[ref.sourceId]:[]):[];}catch{return [];}}
