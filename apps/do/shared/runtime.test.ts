import { describe, expect, it } from 'vitest';
import { clearHeuristics } from './clear';

describe('DO Clear heuristics', () => {
  it('flags “in order to” and rewrites to “to”', () => {
    const result = clearHeuristics('We act in order to win the bid.');
    expect(result.marks.some((m) => m.suggestion === 'to')).toBe(true);
    expect(result.rewritten.toLowerCase()).toContain('to win');
    expect(result.rewritten.toLowerCase()).not.toContain('in order to');
  });

  it('seeds a clarity mark when no pattern hits', () => {
    const result = clearHeuristics('Watch this page for price changes.');
    expect(result.marks.length).toBeGreaterThan(0);
  });
});
