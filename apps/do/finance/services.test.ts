import { describe, expect, it } from 'vitest';
import { DEMO_FINANCIAL_SNAPSHOT } from './demo';
import { householdServices, identifyService, monthlyEquivalentCents, yearlyServiceTotals } from './services';
import { canHunt, canResearch, compareOffers, offerIsStale, researchHref, watchAsk, watchHref, type OfferBook } from './offers';

const snapshot = () => structuredClone(DEMO_FINANCIAL_SNAPSHOT);

describe('what a household pays', () => {
  it('names public NZ providers from statement text and falls back to category words', () => {
    expect(identifyService('CONTACT ENERGY LTD 0123')).toEqual({ provider: 'Contact Energy', category: 'electricity', confidence: 'named-provider' });
    expect(identifyService('Spark NZ Trading')).toMatchObject({ provider: 'Spark', category: 'broadband' });
    expect(identifyService('2DEGREES MOBILE')).toMatchObject({ provider: '2degrees' });
    expect(identifyService('Example Power')).toEqual({ provider: null, category: 'electricity', confidence: 'category-words' });
    expect(identifyService('Example Fibre')).toMatchObject({ category: 'broadband' });
    expect(identifyService('Countdown Ponsonby')).toBeNull();
    expect(identifyService('   ')).toBeNull();
  });
  it('turns recurring candidates into services with monthly equivalents, never a monthly figure from irregular timing', () => {
    const services = householdServices(snapshot());
    expect(services.map(service => [service.category, service.provider, service.monthlyEquivalent?.amount])).toEqual([
      ['electricity', 'Example Power', 22450], ['broadband', 'Example Fibre', 8900], ['mobile', 'Example Mobile', 3900],
    ]);
    expect(services[0]).toMatchObject({ confidence: 'category-words', cadence: 'monthly', lastPaidOn: '2026-09-05', increase: { percent: 25 } });
    expect(monthlyEquivalentCents(1000, 'weekly')).toBe(4333);
    expect(monthlyEquivalentCents(1000, 'fortnightly')).toBe(2167);
    expect(monthlyEquivalentCents(1000, 'uncertain')).toBeNull();
    const irregular = snapshot();
    irregular.transactions[1].date = '2026-08-20';
    expect(householdServices(irregular).find(service => service.category === 'electricity')).toMatchObject({ cadence: 'uncertain', monthlyEquivalent: null });
  });
  it('totals the year per currency and counts uncertain services separately', () => {
    const services = householdServices(snapshot());
    expect(yearlyServiceTotals(services)).toEqual({ totals: [{ currency: 'NZD', amount: (22450 + 8900 + 3900) * 12 }], uncertain: 0 });
    services[0].monthlyEquivalent = null;
    expect(yearlyServiceTotals(services)).toEqual({ totals: [{ currency: 'NZD', amount: (8900 + 3900) * 12 }], uncertain: 1 });
  });
});

const offer = (patch: Record<string, unknown> = {}) => ({
  id: 'o1', category: 'electricity' as const, provider: 'Cheaper Co', planName: 'Flat', monthlyCost: 190, features: [], eligibilityNotes: null,
  sourceUrl: 'https://cheaper.example/plans', sourceHost: 'cheaper.example', lastVerified: '2026-10-11T16:00:02.229+00:00', trustTier: 'A' as const, ...patch,
});
const now = new Date('2026-10-14T00:00:00Z');

describe('deal hunting with dated evidence', () => {
  const power = () => householdServices(snapshot())[0];
  it('lists cheaper advertised offers by possible yearly saving, above the person’s own threshold', () => {
    const book: OfferBook = { category: 'electricity', live: true, lastVerified: offer().lastVerified, offers: [
      offer(), offer({ id: 'o2', provider: 'Dearer Co', monthlyCost: 240 }), offer({ id: 'o3', provider: 'Tiny Co', monthlyCost: 222 }),
      offer({ id: 'o4', provider: 'Unknown Co', monthlyCost: null }), offer({ id: 'o5', provider: 'Best Co', monthlyCost: 150 }),
    ] };
    const rows = compareOffers(power(), book, 500, now);
    expect(rows.map(row => [row.offer.provider, row.monthlyDifference, row.possibleYearlySaving, row.stale])).toEqual([
      ['Best Co', 7450, 89400, false], ['Cheaper Co', 3450, 41400, false],
    ]);
    expect(compareOffers(power(), book, 4000, now).map(row => row.offer.provider)).toEqual(['Best Co']);
  });
  it('never compares the household’s own provider, another category, another currency or an uncertain cadence', () => {
    const book: OfferBook = { category: 'electricity', live: true, lastVerified: null, offers: [offer({ provider: 'Example  POWER' })] };
    expect(compareOffers(power(), book, 0, now)).toEqual([]);
    expect(compareOffers(power(), { ...book, category: 'broadband' }, 0, now)).toEqual([]);
    const aud = power(); aud.monthlyEquivalent = { amount: 22450, currency: 'AUD' };
    expect(compareOffers(aud, { ...book, offers: [offer()] }, 0, now)).toEqual([]);
    const uncertain = power(); uncertain.monthlyEquivalent = null;
    expect(compareOffers(uncertain, { ...book, offers: [offer()] }, 0, now)).toEqual([]);
    expect(canHunt(uncertain)).toBe(false);
  });
  it('marks offers verified more than 45 days ago as needing a fresh check', () => {
    expect(offerIsStale(offer({ lastVerified: '2026-07-05T00:00:00+00:00' }), now)).toBe(true);
    expect(offerIsStale(offer(), now)).toBe(false);
    const book: OfferBook = { category: 'electricity', live: true, lastVerified: null, offers: [offer({ lastVerified: '2026-07-05T00:00:00+00:00' })] };
    expect(compareOffers(power(), book, 0, now)[0].stale).toBe(true);
  });
  it('hands only the category and a rounded monthly figure to sourced research, and reviewed words to Ask DO', () => {
    const service = power();
    expect(canResearch(service)).toBe(true);
    expect(researchHref(service)).toBe('/do/bills/compare?category=electricity&monthly=224.50');
    const streaming = householdServices(snapshot())[0]; streaming.category = 'streaming';
    expect(researchHref(streaming)).toBeNull();
    const ask = watchAsk(service);
    expect(ask).toContain('Watch my electricity with Example Power');
    expect(ask).toMatch(/about NZD\s224\.50 a month/);
    expect(ask).toContain('Do not switch, cancel or contact anyone.');
    expect(ask).not.toMatch(/account|address/i);
    const href = watchHref(service);
    expect(href.startsWith('/do/ask?q=')).toBe(true);
    expect(new URLSearchParams(href.slice(href.indexOf('?'))).get('title')).toBe('Watch my electricity');
  });
});
