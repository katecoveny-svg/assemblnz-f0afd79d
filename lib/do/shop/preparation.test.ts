import { describe, expect, it, vi } from 'vitest';
import { consolidate, prepareShop } from './preparation';
import { initialShop, meals, offers } from './fixtures';
import { beginReward, demoReward, fingerprint, receipt, settleRewards } from '../preparation/contracts';
const now = '2026-10-12T12:00:00Z';
const reviewed = () => ({ ...structuredClone(initialShop), pantryReviewed: true, pantry: initialShop.pantry.map(p => ({ ...p, reviewed: true })) });
describe('bounded grocery preparation', () => {
  it('scales servings, consolidates ingredients, deducts pantry once and rounds packs', () => {
    const p = prepareShop(reviewed(), meals, offers, now);
    expect(p.requirements.find(r => r.ingredientId === 'beans')).toMatchObject({ required: 2400, pantryUsed: 240, needed: 2160 });
    expect(p.basket.find(r => r.ingredientId === 'beans')).toMatchObject({ packs: 9, leftover: 0, estimatedMinor: 1710 });
    expect(p.basket.find(r => r.ingredientId === 'rice')).toMatchObject({ required: 900, needed: 400, packs: 1, leftover: 600 });
    expect(p.basket.find(r => r.ingredientId === 'vegetables')).toMatchObject({ required: 3400, packs: 4, leftover: 600 });
    expect(p.estimatedMinor).toBe(4330);
  });
  it('converts mass units without converting mass to volume', () => {
    expect(consolidate([{ mealId: 'rice-bowl', servings: 2, occurrences: 1 }], meals, [{ id: 'rice', name: 'Rice', quantity: { amount: .1, unit: 'kg' }, reviewed: true }])[0]).toMatchObject({ required: 150, pantryUsed: 100, needed: 50 });
    expect(() => consolidate(initialShop.choices, meals, [{ ...initialShop.pantry[0], reviewed: true, quantity: { amount: 500, unit: 'ml' } }])).toThrow('unit mismatch');
  });
  it('rejects duplicate pantry, invalid quantities and incompatible recipes', () => {
    expect(() => consolidate(initialShop.choices, meals, [initialShop.pantry[0], initialShop.pantry[0]])).toThrow('Duplicate pantry');
    expect(() => consolidate([{ mealId: 'soup', servings: NaN, occurrences: 1 }], meals, [])).toThrow();
    expect(() => consolidate(initialShop.choices, [{ ...meals[0], ingredients: [{ ...meals[0].ingredients[0], quantity: { amount: 1, unit: 'ml' } }] }, { ...meals[1], ingredients: [{ ...meals[0].ingredients[0] }] }], [])).toThrow('incompatible');
    expect(() => consolidate(initialShop.choices, meals, [{ ...initialShop.pantry[0], quantity: { amount: -1, unit: 'g' } }])).toThrow();
  });
  it('blocks unreviewed pantry and unknown or excluded allergens', () => {
    expect(prepareShop(initialShop, meals, offers, now).blockers.join()).toContain('Review the pantry');
    const input = reviewed(); input.selectedOffers.vegetables = 'veg-unknown';
    expect(prepareShop(input, meals, offers, now).blockers.join()).toContain('allergen information unknown');
    input.selectedOffers.vegetables = 'veg-1'; input.excludedAllergens = ['nuts'];
    expect(prepareShop(input, meals, offers.map(o => ({ ...o, allergens: { status: 'reviewed', contains: [], mayContain: ['nuts'] } })), now).blockers.join()).toContain('cross-contact');
  });
  it('blocks stale offers, unknown stock, currencies and budget overruns', () => {
    const input = reviewed(); input.budget.limitMinor = 100;
    expect(prepareShop(input, meals, offers.map(o => ({ ...o, expiresAt: now, currency: 'AUD', stock: 'unknown' })), now).blockers.join()).toMatch(/currency.*stock.*stale.*budget/);
    expect(() => prepareShop({ ...reviewed(), budget: { currency: 'AUD' as 'NZD', limitMinor: 5000, feeMinor: null } }, meals, offers, now)).toThrow();
  });
  it('discloses variable weight and unknown fees and recalculates substitutions', () => {
    const input = reviewed(); input.selectedOffers.vegetables = 'veg-2';
    const p = prepareShop(input, meals, offers, now);
    expect(p.totalMinor).toBeNull(); expect(p.disclosures.join()).toMatch(/variable-weight.*fees unknown/);
    expect(p.basket.find(l => l.ingredientId === 'vegetables')?.packs).toBe(7);
    input.budget.feeMinor = 800;
    expect(prepareShop(input, meals, offers, now).totalMinor).toBe(p.estimatedMinor + 800);
  });
  it('does not make external requests in fixture mode', () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('External request forbidden'));
    prepareShop(reviewed(), meals, offers, now);
    expect(fetch).not.toHaveBeenCalled(); fetch.mockRestore();
  });
});
describe('shared reviews, receipts and optional simulated rewards', () => {
  const identity = { ownerId: 'household', taskId: 'weekly-task', revision: 1 };
  it('invalidates receipt on material edits and returns stable receipt identity', () => {
    const value = { revision: 1, amount: 500 }, review = fingerprint(value);
    expect(receipt(identity, review, value, now).id).toBe(receipt(identity, review, value, now).id);
    expect(() => receipt({ ...identity, revision: 2 }, review, { revision: 2, amount: 600 }, now)).toThrow('Review');
    expect(receipt(identity, review, value, now)).toMatchObject({ status: 'prepared', externalAction: 'none' });
  });
  it('only permits optional activity during an actual wait; retries never duplicate reward', () => {
    expect(() => beginReward(identity, demoReward, demoReward.choices[0], false, [])).toThrow();
    let events = beginReward(identity, demoReward, demoReward.choices[0], true, []);
    expect(events[0].state).toBe('pending');
    events = settleRewards(events, identity, true);
    expect(events[0]).toMatchObject({ state: 'earned', simulated: true });
    expect(beginReward({ ...identity, revision: 9 }, demoReward, demoReward.choices[1], true, events)).toBe(events);
    expect(settleRewards(events, identity, true)).toEqual(events);
    expect(settleRewards([], identity, true)).toEqual([]); // Task completion never depends on engagement.
  });
  it('isolates reward owner/task and records failure without retry issuance', () => {
    const pending = beginReward(identity, demoReward, demoReward.choices[0], true, []);
    expect(settleRewards(pending, { ...identity, ownerId: 'other' }, true)[0].state).toBe('pending');
    const failed = settleRewards(pending, identity, false);
    expect(failed[0].state).toBe('failed'); expect(settleRewards(failed, identity, true)[0].state).toBe('failed');
  });
});
