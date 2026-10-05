import {z} from 'zod';
import {serializeOwnerRunBody} from './request-body';
import {selectedPublicUrl} from './public-url';
import {clientBrandSchema,customClientBrand,resolveClientBrand,contrast} from '@/components/client-hub-migration/original/lib/client-brand';
import {hubSchema,type Hub} from '@/components/client-hub-migration/original/lib/pursuit-hub';
const url=z.string().max(1500).refine(v=>{try{return selectedPublicUrl(v)===v;}catch{return false;}});
export const brandCandidateSchema=z.object({kind:z.enum(['logo','colour','font','stylesheet']),value:z.string().max(1500),status:z.enum(['observed','suggested']),sourceUrl:url,evidence:z.string().max(180)}).strict().superRefine((c,ctx)=>{const valid=c.kind==='colour'?/^#[a-f0-9]{6}$/i.test(c.value):c.kind==='font'?/^[\w \-]{1,100}$/.test(c.value):url.safeParse(c.value).success;if(!valid)ctx.addIssue({code:'custom',path:['value'],message:'Invalid inert brand reference.'});});
export const brandReviewSchema=z.object({sourceUrl:url,sha256:z.string().regex(/^[a-f0-9]{64}$/),inputKind:z.enum(['page','css','manual-paste']),candidates:z.array(brandCandidateSchema).max(32),documents:z.array(z.object({sourceUrl:url,sha256:z.string().regex(/^[a-f0-9]{64}$/),inputKind:z.enum(['page','css','manual-paste'])}).strict()).min(1).max(2),reviewed:z.literal(false)}).strict();
export type BrandReview= z.infer<typeof brandReviewSchema>;
export type BrandCandidate=z.infer<typeof brandCandidateSchema>;
const attrs=(tag:string)=>Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map(m=>[m[1].toLowerCase(),m[2]??m[3]??m[4]]));
/** Parse inert declarations, not computed styles or verified corporate identity. */
export function inspectBrandMarkup(text:string,sourceUrl:string,inputKind:'page'|'css'|'manual-paste',sha256:string):BrandReview{
 const source=selectedPublicUrl(sourceUrl);if(new TextEncoder().encode(text).length>128000)throw Error('Brand markup exceeds review bound.');
 const candidates:BrandCandidate[]=[];const add=(c:BrandCandidate)=>{if(candidates.length<32&&!candidates.some(x=>x.kind===c.kind&&x.value===c.value&&x.sourceUrl===c.sourceUrl))candidates.push(c);};
 const link=(value:string)=>{if(!value.trim())return undefined;try{return selectedPublicUrl(new URL(value.replace(/&amp;/g,'&'),source).href);}catch{return undefined;}};
 const html=inputKind==='page'||inputKind==='manual-paste'&&/<[a-z]/i.test(text);let css=html?'':text;
 if(html){
  const inert=text.replace(/<(script|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
  for(const match of inert.matchAll(/<(img|link|meta)\b[^>]{0,5000}>/gi)){
   const a=attrs(match[0]),tag=match[1].toLowerCase(),value=link(a.src||a.href||a.content||'');
   if(tag==='img'&&/logo/i.test([a.alt,a.id,a.class,a.src].join(' '))&&value)add({kind:'logo',value,status:'observed',sourceUrl:source,evidence:'Image marked as logo in page markup; identity/rights unverified.'});
   if(tag==='link'&&/stylesheet/i.test(a.rel||'')&&value&&new URL(value).origin===new URL(source).origin)add({kind:'stylesheet',value,status:'observed',sourceUrl:source,evidence:'Same-origin stylesheet reference; collect explicitly, no imports.'});
   if(tag==='link'&&/icon/i.test(a.rel||'')&&value)add({kind:'logo',value,status:'suggested',sourceUrl:source,evidence:'Site icon candidate; not evidence of the corporate logo.'});
   if(tag==='meta'&&/^og:image$/i.test(a.property||'')&&value)add({kind:'logo',value,status:'suggested',sourceUrl:source,evidence:'Social image candidate; not evidence of the corporate logo.'});
   if(tag==='meta'&&/^theme-color$/i.test(a.name||'')&&/^#[a-f0-9]{6}$/i.test(a.content||''))add({kind:'colour',value:a.content.toLowerCase(),status:'observed',sourceUrl:source,evidence:'Browser theme-color metadata; not an official palette.'});
  }
  css=[...inert.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m=>m[1]).join('\n')+'\n'+[...inert.matchAll(/\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].map(m=>m[1]??m[2]).join('\n');
 }
 // Comments/URLs/imports are never executed or treated as palette declarations.
 css=css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/url\([^)]*\)/gi,'').replace(/@import[^;]*;/gi,'');
 for(const m of css.matchAll(/(?:^|[;{])\s*([\w-]+)\s*:\s*([^;}]{1,500})/g)){
  const property=m[1].toLowerCase(),value=m[2];
  if(/color|background|fill|stroke|^--/.test(property))for(const c of value.matchAll(/#([a-f0-9]{6}|[a-f0-9]{3})(?![a-f0-9])/gi)){const hex=c[1].length===3?c[1].split('').map(x=>x+x).join(''):c[1];add({kind:'colour',value:'#'+hex.toLowerCase(),status:'observed',sourceUrl:source,evidence:`Declaration ${property}: ${c[0]}`});}
  if(property==='font-family')for(const raw of value.split(',').slice(0,8)){const family=raw.trim().replace(/^['"]|['"]$/g,'');if(/^[\w \-]{1,100}$/.test(family))add({kind:'font',value:family,status:'observed',sourceUrl:source,evidence:`Declared font-family: ${family}; loading/licence unverified.`});}
 }
 return brandReviewSchema.parse({sourceUrl:source,sha256,inputKind,candidates,documents:[{sourceUrl:source,sha256,inputKind}],reviewed:false});
}
export const brandRasterSchema=z.object({data:z.string().max(180000).regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/),sourceUrl:url,sha256:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
export const brandApplySchema=z.object({reviewed:z.literal(true),review:brandReviewSchema,primary:z.string().regex(/^#[a-f0-9]{6}$/i).optional(),accent:z.string().regex(/^#[a-f0-9]{6}$/i).optional(),paper:z.string().regex(/^#[a-f0-9]{6}$/i).optional(),ink:z.string().regex(/^#[a-f0-9]{6}$/i).optional(),manualLogoUrl:url.optional(),logo:brandRasterSchema.optional()}).strict();
export function brandContextFingerprint(hub:Hub){return JSON.stringify({buyer:hub.buyer,brief:hub.engine?.brief,brand:hub.clientBrand,font:hub.design.frame.tokens.font});}
export function applyReviewedBrand(hub:Hub,input:unknown,expectedContext?:string):Hub{
 if(expectedContext!==undefined&&brandContextFingerprint(hub)!==expectedContext)throw Error('Company, current brand or selected source changed. Review again.');
 const v=brandApplySchema.parse(input);if(hub.sources.length>=40)throw Error('Source register is full.');
 const resolved=resolveClientBrand(hub),changed=Boolean(v.primary||v.accent||v.paper||v.ink||v.logo),old=resolved||customClientBrand(hub.buyer),primary=v.primary||old.primary,onPrimary=contrast(primary,old.onPrimary)>=4.5?old.onPrimary:contrast(primary,'#ffffff')>=4.5?'#ffffff':'#000000';
 const brand=clientBrandSchema.parse({...old,primary,onPrimary,accent:v.accent||old.accent,paper:v.paper||old.paper,ink:v.ink||old.ink,...(v.logo?{logo:v.logo.data}:{}),sourceUrl:changed?v.review.sourceUrl:old.sourceUrl,checked:changed?new Date().toISOString().slice(0,10):old.checked});
 const fonts=v.review.candidates.filter(c=>c.kind==='font').map(c=>c.value).join(', ');
 const claim=`Owner-reviewed declarations, not a complete corporate identity. Observed font families: ${fonts||'none found'}. Typography is evidence only; original seller typography is unchanged. Palette choices are manual mappings. Markup SHA256 ${v.review.sha256}.${v.logo?` Raster logo URL ${v.logo.sourceUrl}; SHA256 ${v.logo.sha256}.`:''}`.slice(0,900);
 const metadata=JSON.stringify({review:v.review,manualMappings:{primary:v.primary,accent:v.accent,paper:v.paper,ink:v.ink},typography:'evidence-only; original experience uses seller typography',manualLogoReference:v.manualLogoUrl,logoReference:v.logo?{sourceUrl:v.logo.sourceUrl,sha256:v.logo.sha256}:undefined});
 const next=hubSchema.parse({...hub,research:hub.research+'\n[PRIVATE_BRAND_REVIEW_V1]\n'+metadata,clientBrand:resolved||changed?brand:hub.clientBrand,sources:[...hub.sources,{id:crypto.randomUUID(),title:'brand: Owner-reviewed observed declarations and manual choices',url:v.review.sourceUrl,claim,status:'source',checked:new Date().toISOString().slice(0,10),include:false}]});
 // Exact current ideas envelope only; preparation and later edits are checked
 // independently by the same serializer before dispatch. No fixed headroom.
 serializeOwnerRunBody({action:'ideas',hub:next,runId:'00000000-0000-4000-8000-000000000000',actionId:'00000000-0000-4000-8000-000000000000'});
 return next;
}

/** Undo only this import's fields; never restore an old whole-Hub snapshot. */
export function undoReviewedBrand(current:Hub,before:Hub,applied:Hub):Hub{
 if(JSON.stringify(current.clientBrand)!==JSON.stringify(applied.clientBrand)||current.research!==applied.research)throw Error('Brand review changed after import. Undo would replace newer edits.');
 const originalIds=new Set(before.sources.map(s=>s.id)),additions=applied.sources.filter(s=>!originalIds.has(s.id)),addedIds=new Set(additions.map(s=>s.id));
 for(const added of additions){const now=current.sources.find(s=>s.id===added.id);if(now&&JSON.stringify(now)!==JSON.stringify(added))throw Error('An imported source was edited after Apply. Undo would remove owner work; the source and branding were preserved.');}
 return hubSchema.parse({...current,clientBrand:before.clientBrand,research:before.research,sources:current.sources.filter(s=>!addedIds.has(s.id))});
}
