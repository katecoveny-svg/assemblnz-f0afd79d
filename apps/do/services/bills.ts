import { z } from 'zod';
export const billInput = z.object({
  category: z.enum(['electricity', 'broadband', 'mobile']),
  region: z.enum(['Auckland', 'Northland', 'Waikato', 'Bay of Plenty', 'Gisborne', 'Hawkes Bay', 'Taranaki', 'Manawatu-Whanganui', 'Wellington', 'Tasman', 'Nelson', 'Marlborough', 'West Coast', 'Canterbury', 'Otago', 'Southland']),
  monthlyCost: z.number().min(1).max(10000),
  usage: z.number().min(0).max(100000),
  exitFee: z.number().min(0).max(10000).nullable(),
  consent: z.literal(true),
}).strict();
export type BillInput = z.infer<typeof billInput>;
export function annualComparison(current: number, alternative: number, joiningFee: number, exitFee: number) {
  return { currentAnnual: Math.round(current * 1200) / 100, alternativeFirstYear: Math.round((alternative * 12 + joiningFee + exitFee) * 100) / 100, firstYearSaving: Math.round((current * 12 - alternative * 12 - joiningFee - exitFee) * 100) / 100 };
}
export type GroundedBillResult = { text: string; sources: { title: string; url: string }[]; checkedAt: string; searchHtml?: string };
export function readGroundedBillResult(data: unknown): GroundedBillResult {
  const schema = z.object({ candidates: z.array(z.object({ content: z.object({ parts: z.array(z.object({ text: z.string().optional() })) }), groundingMetadata: z.object({ groundingChunks: z.array(z.object({ web: z.object({ uri: z.string(), title: z.string().optional() }).optional() })).optional(), webSearchQueries: z.array(z.string()).optional(), searchEntryPoint: z.object({ renderedContent: z.string().optional() }).optional() }).optional() })).min(1) });
  const candidate = schema.parse(data).candidates[0];
  const text = candidate.content.parts.map(p => p.text || '').join('').trim();
  const metadata = candidate.groundingMetadata;
  const sources = (metadata?.groundingChunks || []).flatMap(chunk => {
    if (!chunk.web) return [];
    try { const url = new URL(chunk.web.uri); return url.protocol === 'https:' ? [{ title: chunk.web.title || url.hostname, url: url.toString() }] : []; } catch { return []; }
  });
  if (!text || !sources.length || !metadata?.webSearchQueries?.length) throw new Error('Live source evidence unavailable');
  return { text, sources: sources.slice(0, 20), checkedAt: new Date().toISOString(), searchHtml: metadata.searchEntryPoint?.renderedContent };
}
