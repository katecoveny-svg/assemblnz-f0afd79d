import { describe, expect, it } from 'vitest';
import { reviewBrowserHandoff } from './voice-handoff';
const owner = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
describe('reviewed voice or typed browser handoff', () => {
  it('accepts only the edited brief, without acquiring execution or voice authority', () => {
    const value = reviewBrowserHandoff(owner, owner, null, '  Two packs of oats  ');
    expect(value).toEqual({owner, text:'Two packs of oats', id:expect.any(String)});
  });
  it.each([null, 'guest', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'])('rejects absent or changed verified owner %s', verified => {
    expect(reviewBrowserHandoff(owner, verified, null, 'Oats')).toBeNull();
  });
  it('rejects a duplicate event rather than replacing pending work', () => {
    const first = reviewBrowserHandoff(owner, owner, null, 'Oats');
    expect(reviewBrowserHandoff(owner, owner, first, 'Milk')).toBeNull();
    expect(first?.text).toBe('Oats');
  });
  it('rejects empty and overlong notes, and accepts the exact boundary', () => {
    expect(reviewBrowserHandoff(owner, owner, null, ' ')).toBeNull();
    expect(reviewBrowserHandoff(owner, owner, null, 'x'.repeat(6001))).toBeNull();
    expect(reviewBrowserHandoff(owner, owner, null, 'x'.repeat(6000))?.text).toHaveLength(6000);
  });
});
