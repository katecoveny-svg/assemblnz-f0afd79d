import { describe, expect, it, vi } from 'vitest';
import { createReviewTransport } from './review-adapter';
import { canReadRecipientSnapshot, isLocalReviewEnabled } from './recipient-policy';
import { starterCompanyHub } from '@/components/client-hub-migration/original/lib/company-hub';
import { buyerHtml } from '@/components/client-hub-migration/original/lib/pursuit-hub';
import { GET } from '@/app/api/client-hub-migration/recipient/[id]/route';
import { hubArtworkPolicy } from './visual-policy';

describe('migration isolation and real component contracts', () => {
  it('roundtrips an original hub and prevents stale writes', async () => {
    const fetch = createReviewTransport();
    const payload = starterCompanyHub('custom', 'assembl');
    const saved = await (await fetch('/api/hub', { method: 'POST', body: JSON.stringify({ payload }) })).json();
    const read = await (await fetch(`/api/hub?id=${saved.item.id}`)).json();
    expect(read.item.payload).toEqual(payload);
    const stale = await fetch('/api/hub', { method: 'POST', body: JSON.stringify({ id: saved.item.id, revision: 0, payload }) });
    expect(stale.status).toBe(409);
    expect((await (await createReviewTransport()('/api/hub')).json()).items).toEqual([]);
  });
  it('has no native network fallback for unknown, provider, media or sharing calls', async () => {
    const native = vi.spyOn(globalThis, 'fetch');
    const fetch = createReviewTransport();
    for (const path of ['/api/hub/share', '/api/studios', '/api/media/generate', '/api/radar/research', '/api/brand/decks', '/unknown', 'https://example.com/api/hub']) {
      expect((await fetch(path, { method: 'POST' })).ok).toBe(false);
    }
    expect(native).not.toHaveBeenCalled();
    native.mockRestore();
  });
  it('exercises the original interactive renderer without private notes in the result', () => {
    const payload = starterCompanyHub('custom', 'assembl');
    payload.engine!.selected = payload.engine!.concepts[0].id;
    payload.privateNotes = 'PRIVATE-REVIEW-SENTINEL';
    payload.research = 'PRIVATE-RESEARCH-SENTINEL';
    const html = buyerHtml(payload);
    expect(html).toContain('<script');
    expect(html).toContain(payload.engine!.concepts[0].title);
    expect(html).not.toContain('PRIVATE-REVIEW-SENTINEL');
    expect(html).not.toContain('PRIVATE-RESEARCH-SENTINEL');
  });
});

describe('contextual visual selection', () => {
  it('does not borrow a landscape, boat scene or another client image for a custom brief', () => {
    const hub = starterCompanyHub('custom', 'assembl');
    expect(hub.design.frame.artwork).toBeUndefined();
    for (const src of ['/cinematic/nadir-coast.jpg', '/cinematic/assembl-plum-aerial.jpg', '/cinematic/nadir-travel.jpg']) {
      hub.design.frame.artwork = { src, alt: 'Legacy default illustration' };
      expect(hubArtworkPolicy(hub)).toMatchObject({ src: '', provenance: 'prompt' });
    }
    hub.buyer = 'A different client';
    hub.engine!.selected = hub.engine!.concepts[0].id;
    const html = buyerHtml(hub);
    expect(html).not.toContain('<img class="cinema-static"');
    expect(html).not.toContain('/cinematic/nadir-coast.jpg');
    expect(html).not.toContain('/cinematic/assembl-plum-aerial.jpg');
    expect(html).toContain('data-choice="0"');
  });
  it('labels matched scenario illustrations and rejects a mismatched sector visual', () => {
    const hub = starterCompanyHub('travel', 'assembl');
    expect(hubArtworkPolicy(hub)).toMatchObject({ provenance: 'scenario', src: '/cinematic/nadir-travel.jpg' });
    hub.design.frame.artwork = { src: '/cinematic/nadir-trade.jpg', alt: 'Trade example' };
    expect(hubArtworkPolicy(hub).src).toBe('');
  });
  it('keeps explicit media selection distinct from relevance approval and media access', () => {
    const hub = starterCompanyHub('custom', 'assembl');
    hub.design.frame.artwork = { src: '/api/media?id=10000000-0000-4000-8000-000000000001', alt: 'Chosen owner visual' };
    expect(hubArtworkPolicy(hub)).toMatchObject({ provenance: 'selected', label: 'Selected visual · review for this brief' });
  });
});

describe('recipient server boundary', () => {
  const snapshotId = '10000000-0000-4000-8000-000000000001';
  const userId = '10000000-0000-4000-8000-000000000002';
  const grant = { id: '10000000-0000-4000-8000-000000000003', ownerUserId: '10000000-0000-4000-8000-000000000004', recipientUserId: userId, snapshotId, revision: 1, status: 'active', expiresAt: '2030-01-01T00:00:00Z' };
  it('requires identity, scope, active status and unexpired grant', () => {
    expect(canReadRecipientSnapshot(grant, userId, snapshotId)).toBe(true);
    expect(canReadRecipientSnapshot(grant, null, snapshotId)).toBe(false);
    expect(canReadRecipientSnapshot(grant, grant.ownerUserId, snapshotId)).toBe(false);
    expect(canReadRecipientSnapshot(grant, userId, grant.id)).toBe(false);
    expect(canReadRecipientSnapshot({ ...grant, status: 'revoked' }, userId, snapshotId)).toBe(false);
    expect(canReadRecipientSnapshot(grant, userId, snapshotId, Date.parse('2031-01-01'))).toBe(false);
    expect(canReadRecipientSnapshot({ ...grant, recipientUserId: '' }, userId, snapshotId)).toBe(false);
  });
  it('keeps unconnected route unavailable and uncached', async () => {
    const response = await GET();
    expect(response.status).toBe(404);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('never opens review on production, public hosts or a missing flag', () => {
    expect(isLocalReviewEnabled('development', '1', 'localhost:3187')).toBe(true);
    expect(isLocalReviewEnabled('production', '1', 'localhost')).toBe(false);
    expect(isLocalReviewEnabled('development', '1', 'assembl.co.nz')).toBe(false);
    expect(isLocalReviewEnabled('development', undefined, 'localhost')).toBe(false);
    expect(isLocalReviewEnabled('development', '1', 'localhost.evil.test')).toBe(false);
  });
});
