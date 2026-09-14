/**
 * DO Evidence — ArchiveBox-inspired (preserve what was seen when an agent acts).
 * Not a clone; a minimal receipt of sources + why, shown on outcome cards.
 */

import { randomUUID } from 'node:crypto';
import type { DoEvidence, DoEvidenceSource } from './pipeline';
import type { WatchSnapshot } from './watch';

export function evidenceFromSnapshots(
  agentId: string,
  snapshots: WatchSnapshot[],
  why: string,
  summary: string,
): DoEvidence {
  const sources: DoEvidenceSource[] = snapshots.map((s) => ({
    id: randomUUID(),
    kind: s.key.startsWith('fixture:') ? 'fixture' : 'snapshot',
    label: s.label,
    url: s.url,
    excerpt: s.excerpt,
    contentHash: s.contentHash,
    capturedAt: s.capturedAt,
  }));
  return {
    id: randomUUID(),
    agentId,
    summary,
    sources,
    why,
    createdAt: new Date().toISOString(),
  };
}

export function evidenceFromSources(
  agentId: string,
  sources: Omit<DoEvidenceSource, 'id'>[],
  why: string,
  summary: string,
): DoEvidence {
  return {
    id: randomUUID(),
    agentId,
    summary,
    sources: sources.map((s) => ({ ...s, id: randomUUID() })),
    why,
    createdAt: new Date().toISOString(),
  };
}
