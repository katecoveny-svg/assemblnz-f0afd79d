import { describe, expect, it } from 'vitest';
import { prepareBillsWatch, readWatchRequest } from './bills-watch';
import type { PublicOffer } from '@/apps/do/finance/offers';

const now = new Date('2026-10-14T02:00:00Z');
const offer = (patch: Partial<PublicOffer> = {}): PublicOffer => ({
  id: 'o1', category: 'electricity', provider: 'Cheaper Co', planName: 'Flat', monthlyCost: 190, features: [], eligibilityNotes: 'Supply-address quote required.',
  sourceUrl: 'https://cheaper.example/plans', sourceHost: 'cheaper.example', lastVerified: '2026-10-11T16:00:02+00:00', trustTier: 'A', ...patch,
});

describe('watching a bill on wake-ups', () => {
  it('reads the watch request the Bills page writes, and nothing else', () => {
    expect(readWatchRequest('Watch my electricity with Contact Energy. I pay about NZD 224.50 a month, last paid 2026-09-05. Each month, check …')).toEqual({ category: 'electricity', provider: 'Contact Energy', monthlyCents: 22450, lastPaidOn: '2026-09-05' });
    expect(readWatchRequest('Watch my broadband with Spark. I pay about NZD 89.00 a month. Do not switch.')).toMatchObject({ category: 'broadband', monthlyCents: 8900, lastPaidOn: null });
    expect(readWatchRequest('Watch my council rates with Auckland Council. I pay about NZD 300.00 a month')).toBeNull();
    expect(readWatchRequest('Remind me to call the plumber')).toBeNull();
    expect(readWatchRequest('Watch my electricity with X. I pay about NZD 0 a month')).toBeNull();
  });
  it('writes a dated note with cheaper offers, sources, stale flags and no promise', () => {
    const request = readWatchRequest('Watch my electricity with Example Power. I pay about NZD 224.50 a month, last paid 2026-09-05.')!;
    const note = prepareBillsWatch(request, { live: true, lastVerified: '2026-10-11T16:00:02+00:00', offers: [offer(), offer({ id: 'o2', provider: 'Old Co', monthlyCost: 200, lastVerified: '2026-07-05T00:00:00+00:00' }), offer({ id: 'o3', provider: 'Dear Co', monthlyCost: 260 })] }, now);
    expect(note).toContain('Watching your electricity with Example Power');
    expect(note).toContain('no model called');
    expect(note).toContain('2 cheaper advertised offers:');
    expect(note.indexOf('Cheaper Co')).toBeLessThan(note.indexOf('Old Co'));
    expect(note).toContain('source cheaper.example, verified 12 Oct 2026');
    expect(note).toContain('older than 45 days, check before acting');
    expect(note).not.toContain('Dear Co');
    expect(note).toContain('supply-address quote');
    expect(note).toContain('Nothing was switched, cancelled or sent.');
    expect(note).not.toMatch(/guaranteed|will save/i);
  });
  it('says plainly when nothing is cheaper or the book is empty', () => {
    const request = readWatchRequest('Watch my broadband with Spark. I pay about NZD 60.00 a month.')!;
    expect(prepareBillsWatch(request, { live: true, lastVerified: null, offers: [offer({ category: 'broadband', monthlyCost: 79 })] }, now)).toContain('No advertised offer is cheaper by that much.');
    expect(prepareBillsWatch(request, { live: false, lastVerified: null, offers: [] }, now)).toContain('nothing was compared');
  });
});
