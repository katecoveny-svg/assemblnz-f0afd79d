import { describe, expect, it } from 'vitest';
import {
  chooseLane,
  planTools,
  diffSnapshots,
  getWatchFixture,
  snapshotFromText,
  compileAgent,
  needsMajorChain,
  buildMajorApproval,
} from './index';

describe('DO runtime routing', () => {
  it('routes simple price watch to local', () => {
    expect(chooseLane('watch', 'did this power price change?')).toBe('local');
    const plan = planTools('watch', { brief: 'tell me if this changes' });
    expect(plan.lane).toBe('local');
    expect(plan.tools).toContain('watch.diff');
  });

  it('routes compare / multi-source to astra', () => {
    expect(chooseLane('compare', 'compare these quotes')).toBe('astra');
    expect(chooseLane('watch', 'compare across sites')).toBe('astra');
  });
});

describe('DO Watch engine', () => {
  it('detects fixture power-price change v1 → v2', () => {
    const v1 = getWatchFixture('v1');
    const v2 = getWatchFixture('v2');
    const a = snapshotFromText(v1.key, v1.body, { label: v1.label, url: v1.url });
    const b = snapshotFromText(v2.key, v2.body, { label: v2.label, url: v2.url });
    expect(a.contentHash).not.toBe(b.contentHash);
    const diff = diffSnapshots(a, b);
    expect(diff.changed).toBe(true);
  });

  it('compiles power-price Watch DEMO on local lane', () => {
    const { spec } = compileAgent({ brief: '', templateId: 'power-price-watch' });
    expect(spec.primitive).toBe('watch');
    expect(spec.lane).toBe('local');
    expect(spec.watches[0]).toContain('power-price');
  });
});

describe('DO major approval chain', () => {
  it('builds specialist→skeptic→decision→human only for major verbs', () => {
    expect(needsMajorChain('send a draft')).toBe(false);
    expect(needsMajorChain('pay the deposit')).toBe(true);
    const chain = buildMajorApproval('pay the deposit');
    expect(chain.chain?.map((s) => s.stage)).toEqual([
      'specialist',
      'skeptic',
      'decision',
      'human',
    ]);
  });
});
