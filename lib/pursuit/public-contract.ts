import { z } from 'zod';
export const TrialInput = z.object({
  requestId:z.string().uuid(),
  company:z.string().trim().min(2).max(120),
  goal:z.string().trim().min(12).max(700),
  consent:z.literal(true),
  useTypeSafe:z.boolean().default(false),
}).strict();
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
export type EvidenceSource = {url:string;title:string;retrievedAt:string};
export type PublicResearchResult = {
  mode:'live';draft:PursuitDraft;
  trace:{id:string;at:string;model:string;providerCalls:number;webSearches:number;knowledgeIds:string[];sources:EvidenceSource[];inputTokens:number;outputTokens:number;typesafe:{status:'not_requested'|'unavailable'|'completed';model?:string;action?:string;confidence?:number};persisted:true};
  warning:string;
};
export function safeSourceUrl(value:string):string|null {
  try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||!u.hostname.includes('.')||/^\d+[.:]/.test(u.hostname)||u.hostname.endsWith('.local')||u.hostname==='localhost')return null;u.hash='';return u.toString();}catch{return null;}
}
export function parseGroundedDraft(value:unknown,sources:EvidenceSource[]):PursuitDraft {
  const draft=Draft.parse(value); const known=new Set(sources.map(s=>safeSourceUrl(s.url)));
  for(const fact of draft.evidence){const url=safeSourceUrl(fact.url);if(!url||!known.has(url))throw new Error('untraced_source');fact.url=url;}
  return draft;
}
export function containsCredential(value:string):boolean{return /(?:sk-[a-z0-9_-]{16,}|ts_[a-z0-9_-]{16,}|(?:api[_ -]?key|password|secret|bearer)\s*[:=]\s*\S{10,})/i.test(value);}
