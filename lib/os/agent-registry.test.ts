import { describe, expect, it } from 'vitest';
import {
  SEED_RELEASES,
  contentHash,
  provenanceStamp,
  semverCompare,
  stableStringify,
  verifyRelease,
} from './agent-registry';

describe('stableStringify', () => {
  it('is key-order independent', () => {
    expect(stableStringify({ b: 1, a: 2 })).toBe(stableStringify({ a: 2, b: 1 }));
  });
  it('preserves array order (order is meaning)', () => {
    expect(stableStringify([1, 2])).not.toBe(stableStringify([2, 1]));
  });
});

describe('contentHash / verifyRelease', () => {
  it('is deterministic per definition', () => {
    const h1 = contentHash(SEED_RELEASES[0]);
    const h2 = contentHash({ ...SEED_RELEASES[0] });
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[a-f0-9]{64}$/);
  });
  it('changes when any governed field changes (tamper-evident)', () => {
    const base = SEED_RELEASES[0];
    const tampered = { ...base, promptVersion: '999' };
    expect(contentHash(tampered)).not.toBe(contentHash(base));
  });
  it('verifyRelease matches the seed hashes baked into the migration', () => {
    const expected: Record<string, string> = {
      desk: '6d3ee29ce7753da4505baefc496bedc92c8df6803b62787cf9d12735fdc0f6ef',
      operations: '9e39bcea098b4529bdd8ae0e3f8602b9516fef7047e45809baf777b106e04b69',
      knowledge: 'a476b2dbc71c48b4adaeb74c40fdf546c2c8d000ca3b730ab87f246ca5194b23',
    };
    for (const rel of SEED_RELEASES) {
      expect(verifyRelease(rel, expected[rel.agentId])).toBe(true);
    }
  });
});

describe('semverCompare', () => {
  it('orders versions', () => {
    expect(semverCompare('2.0.0', '1.9.9')).toBeGreaterThan(0);
    expect(semverCompare('1.0.0', '1.0.1')).toBeLessThan(0);
    expect(semverCompare('1.2.3', '1.2.3')).toBe(0);
  });
});

describe('provenanceStamp', () => {
  it('records the full provider-neutral recipe', () => {
    const stamp = provenanceStamp(SEED_RELEASES[0], 'claude-sonnet-5');
    expect(stamp).toMatchObject({
      agentId: 'desk',
      agentVersion: '1.0.0',
      promptVersion: '1',
      genomeSchemaVersion: '2',
      modelPolicyVersion: '1',
      model: 'claude-sonnet-5',
    });
  });
});

describe('seed integrity', () => {
  it('every seed is a production release with an owner', () => {
    for (const r of SEED_RELEASES) {
      expect(r.status).toBe('production');
      expect(r.owner.length).toBeGreaterThan(0);
      expect(r.capabilities.length).toBeGreaterThan(0);
    }
  });
});
