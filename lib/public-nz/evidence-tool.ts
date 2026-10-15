import 'server-only';
import { retrieveVerifiedPublicNzKnowledge } from './server';
import { publicNzEvidenceContext, type VerifiedBill } from './parliament';

/** Selection only: private queries are never forwarded to a source. This is not topical search. */
export async function readPublicNzEvidence(topic: 'parliament', relevant = true) {
  const checkedAt = new Date().toISOString();
  const empty = { status: 'not_relevant' as const, checkedAt, freshness: 'unavailable' as const,
    sources: [] as VerifiedBill[], context: 'No relevant public evidence requested.',
    scope: 'Recent Parliament bill records only; not topical search, enacted law, weather or general news.' };
  if (!relevant) return empty;
  try {
    const result = await retrieveVerifiedPublicNzKnowledge({ query: topic, limit: 4 });
    const context = publicNzEvidenceContext(result);
    const sources = (JSON.parse(context.slice(context.indexOf('\n') + 1)) as { verifiedEvidence: VerifiedBill[] }).verifiedEvidence;
    return { ...empty, status: sources.length ? 'available' as const : 'unavailable' as const,
      freshness: sources.length ? 'fresh' as const : 'unavailable' as const, context, sources };
  } catch {
    return { ...empty, status: 'unavailable' as const, context: 'Official Parliament evidence could not be checked. Do not invent current facts or citations.' };
  }
}
export function relevantPublicNzTopic(message: string): boolean {
  return /\b(parliament|parliamentary|legislation|legislative)\b/i.test(message);
}
