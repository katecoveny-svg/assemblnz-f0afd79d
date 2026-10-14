import {z} from 'zod';
import {hubSchema,type Hub} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import {selectedPublicUrl} from '@/lib/private-showpiece/public-url';
import {hubReviewContext} from './archive-review-guard';
import {creativePrefix,readCreativeReferences,type CreativeReference} from './creative-references';

const id=z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
const record=z.object({id,brandId:z.enum(['brand_assembl','brand_winger']),revision:z.number().int().positive(),title:z.string().min(1).max(200),referenceIds:z.array(id).max(80).optional(),purpose:z.string().max(1800).optional(),observation:z.object({sourceUrl:z.string().max(1500),copy:z.string().max(1500).optional(),headline:z.string().max(1500).optional(),platform:z.string().max(40).optional(),dates:z.object({retrievedAt:z.string().max(40).optional()}).passthrough().optional()}).passthrough().optional()}).passthrough();
const envelope=z.object({type:z.enum(['creative_reference','creative_board']),record,history:z.array(z.unknown()).max(1000).optional()}).passthrough();
const archiveSchema=z.object({format:z.literal('agency-research-local-archive-v1'),label:z.string().min(1).max(200),brandId:z.enum(['brand_assembl','brand_winger']),records:z.array(envelope).max(80)}).strict();
export type ResearchArchive=z.infer<typeof archiveSchema>;
export function parseResearchArchive(raw:string):ResearchArchive{
 if(new TextEncoder().encode(raw).byteLength>250000)throw Error('Keep this selected archive below 250KB. Retain the complete export separately.');
 const archive=archiveSchema.parse(JSON.parse(raw)),ids=new Set<string>();
 for(const item of archive.records){if(item.record.brandId!==archive.brandId||ids.has(item.record.id))throw Error('Archive brand or record IDs do not match.');ids.add(item.record.id);}
 for(const item of archive.records.filter(x=>x.type==='creative_board')){const refs=item.record.referenceIds;if(!refs||new Set(refs).size!==refs.length||refs.some(ref=>!archive.records.some(x=>x.type==='creative_reference'&&x.record.id===ref)))throw Error('Include every reference used by each selected board.');}
 return archive;
}
export function createArchiveTransport(archive:ResearchArchive){
 return async(path:string,brand:string)=>{
  if(brand!==archive.brandId)throw Error('Archive brand mismatch.');
  if(path==='state')return {brand:{id:brand,profile:{}},records:archive.records.map(x=>({sourceId:x.record.id,type:x.type,title:x.record.title,revision:x.record.revision})),summaries:Object.fromEntries(archive.records.filter(x=>x.type==='creative_reference').map(x=>[x.record.id,{platform:x.record.observation?.platform,copyPreview:x.record.observation?.copy?.slice(0,240),observedAt:x.record.observation?.dates?.retrievedAt}])),reads:[],connection:{configured:false,status:'not_configured',authenticated:false},filters:{platforms:[],formats:[]},publication:false};
  const u=new URL(path,'https://archive.invalid/');if(u.pathname!=='/record'||[...u.searchParams.keys()].some(k=>!['type','id'].includes(k)))throw Error('Only local archive state and records are available.');
  const item=archive.records.find(x=>x.type===u.searchParams.get('type')&&x.record.id===u.searchParams.get('id'));if(!item)throw Error('Record not in this archive.');
  const r=item.record,annotation=(value:unknown,max:number)=>typeof value==='string'?value.slice(0,max):'';
  const publicLink=(value:string)=>{try{return selectedPublicUrl(value);}catch{return '';}};
  const presentation={id:r.id,brandId:r.brandId,revision:r.revision,title:r.title,...(item.type==='creative_board'?{purpose:r.purpose||'',referenceIds:[...(r.referenceIds||[])]}:{observation:r.observation?{sourceUrl:publicLink(r.observation.sourceUrl),copy:r.observation.copy||r.observation.headline||'',platform:r.observation.platform||'',dates:{retrievedAt:r.observation.dates?.retrievedAt||''}}:undefined,notes:annotation(r.notes,1800),advertiserAnnotation:annotation(r.advertiserAnnotation,200)})};
  return {type:item.type,record:presentation,history:structuredClone(item.history??[]),originalEnvelope:structuredClone(item),verification:{status:'imported_unverified',fixture:false}};
 };
}
export function applyArchiveSelection(hub:Hub,archive:ResearchArchive,boardId:string,selected:string[],review:{reviewed:boolean;archiveSha256:string;contextKey:string}):Hub{
 if(!review.reviewed||review.contextKey!==hubReviewContext(hub))throw Error('Review source provenance again for the current Hub.');
 if(!/^[a-f0-9]{64}$/.test(review.archiveSha256))throw Error('Archive fingerprint required.');
 const previous=readCreativeReferences(hub);if(previous.length+selected.length>6)throw Error('At most six bound creative references per Hub.');
 const bindings:CreativeReference[]=[];
 if(!selected.length||selected.length>6||new Set(selected).size!==selected.length)throw Error('Choose one to six distinct board references.');
 const board=archive.records.find(x=>x.type==='creative_board'&&x.record.id===boardId)?.record;if(!board)throw Error('Choose an exported board.');
 const sources=selected.map(ref=>{
  if(!board.referenceIds?.includes(ref))throw Error('Reference is outside the selected board.');
  const item=archive.records.find(x=>x.type==='creative_reference'&&x.record.id===ref)?.record,o=item?.observation;if(!item||!o)throw Error('A reference needs its original observation.');
  const copy=(o.copy||o.headline||'').trim();if(!copy||copy.length>760)throw Error('Supply a selected excerpt of at most 760 characters; retain the original export separately.');
  const sourceId=`agency_${ref}`;if(sourceId.length>100||hub.sources.some(x=>x.id===sourceId))throw Error('Reference already added or ID exceeds the Hub bound.');
  const title=`Creative reference · ${item.title}`.slice(0,180),url=selectedPublicUrl(o.sourceUrl),observedAt=o.dates?.retrievedAt||'';
  bindings.push({sourceId,archiveSha256:review.archiveSha256,brandId:archive.brandId,boardId,boardRevision:board.revision,referenceId:ref,referenceRevision:item.revision,title,url,excerpt:copy,observedAt,provenance:'owner-selected imported archive; unverified',purpose:'creative inspiration only; never cited evidence'});
  return {id:sourceId,title,url,claim:creativePrefix+copy,status:'concept' as const,checked:observedAt,include:true};
 });
 const packet=JSON.parse(hub.engine?.researchPacket||'{}');
 return hubSchema.parse({...hub,sources:[...hub.sources,...sources],engine:{...hub.engine!,researchPacket:JSON.stringify({...packet,agencyCreativeReferences:[...previous,...bindings]})}});
}

export async function fingerprintArchive(archive:ResearchArchive){const bytes=new TextEncoder().encode(JSON.stringify(archive));const digest=await crypto.subtle.digest("SHA-256",bytes);return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");}
