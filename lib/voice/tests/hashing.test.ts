import { describe, it, expect } from 'vitest';
import { sha256Hex, hashPayload, chainHash, verifyChain, GENESIS_PREV_HASH } from '@/lib/voice/hashing';

describe('hashing — canonical JSON stability', () => {
  it('produces a stable hash regardless of key insertion order', () => {
    const a = { b: 1, a: 2, c: { y: 1, x: 2 } };
    const b = { c: { x: 2, y: 1 }, a: 2, b: 1 };
    expect(hashPayload(a)).toBe(hashPayload(b));
  });

  it('changes the hash when any value changes', () => {
    const base = { name: 'Aroha', party: 4 };
    const changed = { name: 'Aroha', party: 5 };
    expect(hashPayload(base)).not.toBe(hashPayload(changed));
  });

  it('sha256Hex is bare lowercase hex of length 64', () => {
    const h = sha256Hex('kia ora');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it('chainHash folds prev_hash and payload hash', () => {
    const ph = hashPayload({ x: 1 });
    expect(chainHash(GENESIS_PREV_HASH, ph)).toBe(sha256Hex(GENESIS_PREV_HASH + ph));
  });
});

describe('verifyChain', () => {
  it('returns -1 for an intact chain', () => {
    let prev = GENESIS_PREV_HASH;
    const receipts = Array.from({ length: 5 }, (_, i) => {
      const payload = { n: i };
      const sha = hashPayload(payload);
      const ch = chainHash(prev, sha);
      const r = { payload, sha256: sha, prev_hash: prev, chain_hash: ch };
      prev = ch;
      return r;
    });
    expect(verifyChain(receipts)).toBe(-1);
  });
});
