import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { NzServiceError, type NzPrincipal } from './auth';

const id = z.string().uuid();
const citation = z.object({ sourceId: id, version: z.string().min(1).max(80), page: z.number().int().min(1).max(10000) }).strict();
const text = z.string().min(1).max(1000);
const source = z.object({ id, ownerId: text, tenantId: text, version: z.string().min(1).max(80),
  fictional: z.literal(true), consent: z.literal('fixture-only'),
  observedAt: z.string().datetime(), freshUntil: z.string().datetime() }).strict();
export const documentSchema = source.extend({ requirements: z.array(z.object({
  id, text, citation, unclear: z.boolean(),
}).strict()).min(1).max(50) }).strict();
export const evidenceSchema = source.extend({ claims: z.array(z.object({
  // Explicit supplied associations; text similarity is never a match.
  documentId: id, documentVersion: z.string().min(1).max(80), requirementId: id, text, citation,
}).strict()).max(50) }).strict();
export const mapInput = z.object({ documentId: id, evidenceIds: z.array(id).max(20)
  .refine(ids => new Set(ids).size === ids.length), requestId: id }).strict();
export const getInput = z.object({ reviewId: id }).strict();
type Document = z.infer<typeof documentSchema>;
type Evidence = z.infer<typeof evidenceSchema>;
type Citation = z.infer<typeof citation>;
export type EvidenceReview = {
  reviewId: string; mode: 'fictional-fixture'; status: 'prepared'; observedAt: string;
  freshUntil: string; freshness: 'fresh' | 'stale';
  document: { sourceId: string; version: string }; evidenceVersions: { sourceId: string; version: string }[];
  requirements: { requirementId: string; citation: Citation; state: 'matched' | 'missing' | 'unclear';
    matchedEvidence: Citation[]; reviewerQuestion: string }[];
  limitation: string;
};
const injection = /ignore\s+(all\s+)?(previous|prior)|system\s*prompt|reveal\s+(secrets|keys)|send\s+.*credentials/i;
const fresh = (s: { observedAt: string; freshUntil: string }, now: number) =>
  Date.parse(s.observedAt) <= now && Date.parse(s.freshUntil) > now && Date.parse(s.freshUntil) > Date.parse(s.observedAt);
function owns(p: NzPrincipal, s: { ownerId: string; tenantId: string }) {
  if (p.ownerId !== s.ownerId || p.tenantId !== s.tenantId) throw new NzServiceError('not_found');
}
function checkCitation(c: Citation, s: { id: string; version: string }) {
  if (c.sourceId !== s.id || c.version !== s.version) throw new NzServiceError('invalid_input');
}

/** Synchronous owner-scoped fixture receipts only. Not a durable or paid execution store. */
export function createFixtureReviewStore(input: { documents: Document[]; evidence: Evidence[]; now?: () => number }) {
  const documents = input.documents.map(d => documentSchema.parse(structuredClone(d)));
  const evidence = input.evidence.map(e => evidenceSchema.parse(structuredClone(e)));
  if (new Set([...documents, ...evidence].map(s => s.id)).size !== documents.length + evidence.length)
    throw new NzServiceError('invalid_input');
  for (const d of documents) {
    if (new Set(d.requirements.map(r => r.id)).size !== d.requirements.length) throw new NzServiceError('invalid_input');
    d.requirements.forEach(r => checkCitation(r.citation, d));
  }
  evidence.forEach(e => e.claims.forEach(c => checkCitation(c.citation, e)));
  const receipts = new Map<string, { ownerId: string; tenantId: string; review: EvidenceReview }>();
  const requests = new Map<string, { digest: string; reviewId: string }>();
  const now = input.now ?? Date.now;
  function get(p: NzPrincipal, raw: unknown): EvidenceReview {
    if (!p.scopes.includes('nz.evidence.read')) throw new NzServiceError('forbidden');
    const parsed = getInput.safeParse(raw);
    if (!parsed.success) throw new NzServiceError('invalid_input');
    const receipt = receipts.get(parsed.data.reviewId);
    if (!receipt) throw new NzServiceError('not_found');
    owns(p, receipt);
    const review = structuredClone(receipt.review);
    if (Date.parse(review.freshUntil) <= now()) {
      review.freshness = 'stale';
      review.requirements = review.requirements.map(r => ({ ...r, state: 'unclear', matchedEvidence: [],
        reviewerQuestion: 'Refresh the cited source versions before relying on this preparation.' }));
    }
    return review;
  }
  function map(p: NzPrincipal, raw: unknown): EvidenceReview {
    if (!p.scopes.includes('nz.evidence.prepare') || !p.scopes.includes('nz.evidence.read')) throw new NzServiceError('forbidden');
    const parsed = mapInput.safeParse(raw);
    if (!parsed.success) throw new NzServiceError('invalid_input');
    const args = parsed.data;
    const d = documents.find(d => d.id === args.documentId);
    if (!d) throw new NzServiceError('not_found');
    owns(p, d);
    const selected = args.evidenceIds.map(id => {
      const e = evidence.find(e => e.id === id);
      if (!e) throw new NzServiceError('not_found');
      owns(p, e); return e;
    }).sort((a, b) => a.id.localeCompare(b.id));
    const digest = createHash('sha256').update(JSON.stringify([d, selected])).digest('hex');
    const key = JSON.stringify([p.ownerId, p.tenantId, args.requestId]);
    const previous = requests.get(key);
    if (previous) {
      if (previous.digest !== digest) throw new NzServiceError('request_conflict');
      return get(p, { reviewId: previous.reviewId });
    }
    if (receipts.size >= 100) throw new NzServiceError('unavailable');
    const time = now();
    const allFresh = [d, ...selected].every(s => fresh(s, time));
    const review: EvidenceReview = {
      reviewId: randomUUID(), mode: 'fictional-fixture', status: 'prepared', observedAt: new Date(time).toISOString(),
      freshUntil: new Date(Math.min(...[d, ...selected].map(s => Date.parse(s.freshUntil)))).toISOString(),
      freshness: allFresh ? 'fresh' : 'stale',
      document: { sourceId: d.id, version: d.version },
      evidenceVersions: selected.map(e => ({ sourceId: e.id, version: e.version })),
      requirements: d.requirements.map(r => {
        const claims = selected.flatMap(e => e.claims.filter(c => c.documentId === d.id
          && c.documentVersion === d.version && c.requirementId === r.id));
        const unclear = !allFresh || r.unclear || injection.test(r.text) || claims.some(c => injection.test(c.text));
        return { requirementId: r.id, citation: r.citation,
          state: unclear ? 'unclear' : claims.length ? 'matched' : 'missing',
          matchedEvidence: unclear ? [] : claims.map(c => c.citation),
          reviewerQuestion: unclear ? 'Clarify the supplied requirement and refresh the cited evidence.'
            : claims.length ? 'Does the cited evidence substantiate this supplied requirement?'
              : 'Which authorised source can substantiate this supplied requirement?' };
      }),
      limitation: 'Preparation from fictional supplied associations only. Human review required; no legal interpretation, tender eligibility, H&S certification or customs submission.',
    };
    receipts.set(review.reviewId, { ownerId: p.ownerId, tenantId: p.tenantId, review });
    requests.set(key, { digest, reviewId: review.reviewId });
    return structuredClone(review);
  }
  return { map, get };
}
