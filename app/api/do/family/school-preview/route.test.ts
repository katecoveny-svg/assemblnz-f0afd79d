import { describe, expect, it, vi } from 'vitest';
import { POST } from './route';
vi.mock('@/apps/do/services/owner', () => ({ privateDoHeaders: { 'Cache-Control': 'private, no-store' }, sameDoOrigin: (req: Request) => req.headers.get('origin') === new URL(req.url).origin }));
const body = { senders: ['office@harbour.example'], days: 14, scenario: 'revised', confirmed: true };
function request(value: unknown = body, origin = 'https://example.com') { return new Request('https://example.com/api/do/family/school-preview', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(value) }); }
describe('fictional school preview API', () => {
  it('runs actual local PDF extraction and returns only synthetic review data', async () => {
    const response = await POST(request()); expect(response.status).toBe(200); expect(response.headers.get('Cache-Control')).toBe('private, no-store'); const data = await response.json(); expect(data).toMatchObject({ synthetic: true, stored: false, externalActions: false }); expect(data.brief.cards[0].after.date).toBe('22/10/2026');
  });
  it('extracts both historical PDF versions for a baseline-only conflict', async () => {
    const response = await POST(request({ ...body, scenario: 'baseline-conflict' }));
    expect(response.status).toBe(200);
    const card = (await response.json()).brief.cards[0];
    expect(card.change).toBe('conflict'); expect(card.before).toBeUndefined();
    expect(card.priorEvidence.map((e: { date: string }) => e.date)).toEqual(['20/10/2026', '21/10/2026']);
    expect(card.alternatives).toHaveLength(1); expect(card.blockers.join()).toContain('Conflicting');
  });
  it('rejects real sender input, private text, owner IDs and arbitrary paths', async () => {
    for (const value of [{ ...body, senders: ['person@example.org'] }, { ...body, text: 'private' }, { ...body, ownerId: 'other' }, { ...body, url: '/etc/passwd' }]) expect((await POST(request(value))).status).toBe(400);
  });
  it('rejects cross-origin requests', async () => { expect((await POST(request(body, 'https://other.example'))).status).toBe(403); });
});
