import { z } from 'zod';
import { publicWebsite, type OutreachCampaign } from './outreach';
export const TrialInput = z.object({
  requestId:z.string().uuid(),
  company:z.string().trim().min(2).max(120),
  goal:z.string().trim().min(12).max(700),
  consent:z.literal(true),
  useTypeSafe:z.boolean().default(false),
  workflow:z.literal('website_outreach').optional(),
  sourceMode:z.literal('direct_source_brief').optional(),
}).strict().refine(input=>!input.sourceMode||(!input.workflow&&!input.useTypeSafe&&['assembl.co.nz','www.assembl.co.nz','https://www.assembl.co.nz/'].includes(input.company.toLowerCase())),{message:'Scoped research checks assembl.co.nz and one fixed official page, without outreach or TypeSafe.',path:['sourceMode']}).refine(input => !input.workflow || Boolean(publicWebsite(input.company)), {message:'Use a public HTTPS business website.',path:['company']});
export type TrialInput = z.infer<typeof TrialInput>;
export const Draft = z.object({
  company:z.string().min(2).max(120), title:z.string().min(4).max(100),
  summary:z.string().min(15).max(440),
  evidence:z.array(z.object({claim:z.string().min(10).max(280),url:z.string().url().max(1000)}).strict()).min(1).max(4),
  opportunity:z.string().min(20).max(450),
  proposedWork:z.string().min(20).max(450),
  deliverables:z.array(z.string().min(3).max(180)).min(2).max(4),
  nextSteps:z.array(z.string().min(3).max(180)).min(2).max(4),
  unknowns:z.array(z.string().min(3).max(180)).min(1).max(4),
}).strict();
export type PursuitDraft = z.infer<typeof Draft>;
export type EvidenceSource = {url:string;title:string;retrievedAt:string;expiresAt?:string;publishedAt?:null;sha256?:string;textSha256?:string;bytes?:number;textTruncated?:boolean};
export type PublicBudgetReceipt={model:string;currency:'USD';maxUsd:number;calls:number;reservedUpperUsd:number;searchAdmitted:false;assumedTaxRate:number;grossUpperUsd:number};
export type PublicResearchResult = {
  mode:'live'|'direct_source_brief';draft:PursuitDraft;
  trace:{id:string;at:string;model:string;providerCalls:number;webSearches:number;knowledgeIds:string[];sources:EvidenceSource[];inputTokens:number;outputTokens:number;budget?:PublicBudgetReceipt;typesafe:{status:'not_requested'|'unavailable'|'completed';model?:string;action?:string;confidence?:number};persisted:true};
  warning:string;
  campaign?:OutreachCampaign;
};
export function safeSourceUrl(value:string):string|null {
  try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||!u.hostname.includes('.')||/^\d+[.:]/.test(u.hostname)||u.hostname.endsWith('.local')||u.hostname==='localhost')return null;u.hash='';return u.toString();}catch{return null;}
}
export function parseGroundedDraft(value:unknown,sources:EvidenceSource[]):PursuitDraft {
  const draft=Draft.parse(value); const known=new Set(sources.map(s=>safeSourceUrl(s.url)));
  for(const [index,fact] of draft.evidence.entries()){const url=safeSourceUrl(fact.url);if(!url||!known.has(url))throw new PublicSourceError(index,url?'not_returned':'unsafe_url');fact.url=url;}
  return draft;
}
/** Safe diagnostics only: never retain the rejected URL or model content. */
export class PublicSourceError extends Error {
  readonly field='draft.evidence.url';
  constructor(readonly index:number,readonly category:'not_returned'|'unsafe_url') {super('untraced_source');this.name='PublicSourceError';}
}
export function containsCredential(value:string):boolean{return /(?:sk-[a-z0-9_-]{16,}|ts_[a-z0-9_-]{16,}|(?:api[_ -]?key|password|secret|bearer)\s*[:=]\s*\S{10,})/i.test(value);}
