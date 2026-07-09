import { describe, expect, it } from 'vitest';
import {
  GENOME_FACTS,
  RIPPLE_SCENARIOS,
  genomeFactsWith,
} from './genome';

describe('genomeFactsWith', () => {
  it('returns the base genome untouched when nothing is applied', () => {
    expect(genomeFactsWith([])).toEqual(GENOME_FACTS);
  });

  it('rewrites an existing fact when its scenario is applied', () => {
    const facts = genomeFactsWith(['price']);
    const reactivity = facts.find((f) => f.id === 'g-reactivity');
    expect(reactivity?.value).toBe('$2,400 + GST · 6 weeks');
    // and does not mutate the module-level genome
    expect(GENOME_FACTS.find((f) => f.id === 'g-reactivity')?.value).toContain('$2,200');
  });

  it('appends a new fact for an adds scenario, without duplicates', () => {
    const facts = genomeFactsWith(['faq', 'faq']);
    const muzzle = facts.filter((f) => f.id === 'g-faq-muzzle');
    expect(muzzle).toHaveLength(1);
    expect(muzzle[0].section).toBe('knowledge');
    expect(facts).toHaveLength(GENOME_FACTS.length + 1);
  });

  it('every scenario resolves to an existing fact or declares adds', () => {
    const known = new Set(GENOME_FACTS.map((f) => f.id));
    for (const s of RIPPLE_SCENARIOS) {
      expect(known.has(s.applies.factId) || s.applies.adds !== undefined).toBe(true);
    }
  });
});
