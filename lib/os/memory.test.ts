import { describe, expect, it } from 'vitest';
import { suggestionFactId } from './memory';

describe('suggestionFactId', () => {
  it('is deterministic and collapses whitespace/case variants', () => {
    const a = suggestionFactId('Do you do weekend   sessions?');
    const b = suggestionFactId('do you do weekend sessions?');
    expect(a).toBe(b);
    expect(a).toMatch(/^g-sug-[a-z0-9]+$/);
  });

  it('distinguishes different questions', () => {
    expect(suggestionFactId('Do you do weekends?')).not.toBe(
      suggestionFactId('Do you take puppies under 12 weeks?'),
    );
  });
});
