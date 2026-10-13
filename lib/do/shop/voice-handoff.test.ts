import { expect, it } from 'vitest';
import { reviewShoppingHandoff } from './voice-handoff';
it('accepts a reviewed shopping brief without a worker, quota or carried permission', () => {
  expect(reviewShoppingHandoff('owner-a', 'owner-a', null, '  Dinners for 2  ')).toEqual({ owner: 'owner-a', text: 'Dinners for 2' });
});
it('rejects replacement, account boundaries and oversized or empty drafts', () => {
  const draft = reviewShoppingHandoff('a', 'a', null, 'dinners')!;
  expect(reviewShoppingHandoff('a', 'a', draft, 'replacement')).toBeNull();
  expect(reviewShoppingHandoff('a', 'b', null, 'private')).toBeNull();
  expect(reviewShoppingHandoff(null, null, null, 'private')).toBeNull();
  expect(reviewShoppingHandoff('a', 'a', null, 'x'.repeat(6001))).toBeNull();
  expect(reviewShoppingHandoff('a', 'a', null, '   ')).toBeNull();
  expect(reviewShoppingHandoff('a', 'a', null, 'after explicit discard')).not.toBeNull();
});
