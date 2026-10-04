import {z} from 'zod';
import {hubSchema,type Hub} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import {nodeIds,nodeNames} from '@/components/client-hub-migration/original/lib/creative';
import {hubArtworkPolicy} from '@/lib/client-hub-migration/visual-policy';
import {literalContentText} from './agency-content';
import {selectedPublicUrl} from './public-url';
import {sectionPatchBinding,type SectionPatchScope} from './section-patch';
export const exportAudienceSchema=z.object({role:z.enum(['CFO','CTO','GM','Hiring manager','Other']),description:z.string().min(1).max(300).refine(s=>s===s.trim(),'Describe the audience without leading or trailing whitespace.')}).strict();
export type ExportAudience=z.infer<typeof exportAudienceSchema>;
export type ReviewedExportFormat='text'|'json';
export const reviewedExportMaxBytes=60000;
export type ReviewedExportPreview={binding:Awaited<ReturnType<typeof sectionPatchBinding>>;audienceFingerprint:string;format:ReviewedExportFormat;content:string;bytes:number;bytesFingerprint:string;filename:string;mimeType:string};
async function fingerprint(value:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(b=>b.toString(16).padStart(2,'0')).join('');}
function safeSourceUrl(raw:string){
 if(/[\u0000-\u0020\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/.test(raw))throw Error('Export sources need public HTTPS URLs without control characters.');
 const url=new URL(raw);if(url.search||url.hash)throw Error('Export source URLs must not contain query strings or fragments. Review a clean public page reference.');
 return selectedPublicUrl(raw);
}
/** Presentation allowlist only. Binding/owner/private context never enters this object. */
export function exportPresentation(h:Hub,audience:ExportAudience){
 const hub=hubSchema.parse(h),selectedAudience=exportAudienceSchema.parse(audience),visual=hubArtworkPolicy(hub);
 return {format:'assembl-presentation-draft-v1' as const,status:'Draft; local byte review does not approve sending or publication.',company:hub.buyer,presentedBy:hub.seller,intendedAudience:selectedAudience,story:{...hub.design.frame.content},selectedSources:hub.sources.filter(s=>s.include&&s.status==='source').map(s=>({title:s.title,url:safeSourceUrl(s.url),claim:s.claim,status:'Selected public reference; not independently verified.'})),visual:{included:false,note:visual.label+'; artwork is not embedded in this export.'}};
}
const jsonEscaped=(value:unknown)=>JSON.stringify(value,null,2).replace(/[<>&\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/g,c=>`\\u${c.charCodeAt(0).toString(16).padStart(4,'0')}`);
function literalLines(value:string){return literalContentText(value).replace(/[\u0080-\u009f\u2028\u2029]/g,c=>`\\u${c.charCodeAt(0).toString(16).padStart(4,'0')}`).replace(/[\ud800-\udfff]/gu,c=>`\\u${c.charCodeAt(0).toString(16).padStart(4,'0')}`).split('\n').map(line=>'| '+line).join('\n');}
function textExport(p:ReturnType<typeof exportPresentation>){
 return ['assembl Studio / presentation draft',p.status,'All supplied data lines are prefixed with |. Source selection is not verification.','Company\n'+literalLines(p.company),'Presented by\n'+literalLines(p.presentedBy),'Intended audience\n'+literalLines(p.intendedAudience.role+' — '+p.intendedAudience.description),...nodeIds.map(n=>nodeNames[n]+'\n'+literalLines(p.story[n])),'Selected public sources\n'+(p.selectedSources.length?p.selectedSources.map((s,i)=>`Reference ${i+1}\nTitle\n${literalLines(s.title)}\nURL\n${literalLines(s.url)}\nClaim (supplied)\n${literalLines(s.claim)}\n${s.status}`).join('\n\n'):'None selected; evidence required.'),'Visual boundary\n'+literalLines(p.visual.note),'End draft. No recipient lookup, sending, hosted sharing or account save.'].join('\n\n')+'\n';
}
export async function previewReviewedExport(h:Hub,scope:SectionPatchScope,audience:ExportAudience,format:ReviewedExportFormat):Promise<ReviewedExportPreview>{
 if(format!=='text'&&format!=='json')throw Error('Choose plain text or JSON. Static HTML is unavailable.');
 const selectedAudience=exportAudienceSchema.parse(audience),presentation=exportPresentation(h,selectedAudience),content=format==='json'?jsonEscaped(presentation)+'\n':textExport(presentation),bytes=new TextEncoder().encode(content).length;
 if(bytes>reviewedExportMaxBytes)throw Error('Presentation export exceeds 60 KB. Reduce selected presentation sources; existing work is unchanged.');
 const [binding,audienceFingerprint,bytesFingerprint]=await Promise.all([sectionPatchBinding(h,scope),fingerprint(JSON.stringify(selectedAudience)),fingerprint(content)]);
 return {binding,audienceFingerprint,format,content,bytes,bytesFingerprint,filename:`assembl-studio-draft.${format==='json'?'json':'txt'}`,mimeType:format==='json'?'application/json;charset=utf-8':'text/plain;charset=utf-8'};
}
/** Reproduce exact current bytes before returning a download; no persistence or approval. */
export async function admitReviewedExport(h:Hub,scope:SectionPatchScope,audience:ExportAudience,format:ReviewedExportFormat,preview:ReviewedExportPreview){
 const current=await previewReviewedExport(h,scope,audience,format);
 if(JSON.stringify(current)!==JSON.stringify(preview))throw Error('The workspace, revision, audience, content or selected sources changed. Preview and review the current bytes again.');
 return current;
}
