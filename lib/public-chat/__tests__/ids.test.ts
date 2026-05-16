import { describe, it, expect } from 'vitest';
import { isUuid, uuidOrNew } from '../ids';

const REAL_UUID = 'd8776d9e-d6a3-4656-a420-094b61b804c1';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('isUuid', () => {
  it('accepts a canonical v4 UUID', () => {
    expect(isUuid(REAL_UUID)).toBe(true);
  });

  it('accepts upper-case hex', () => {
    expect(isUuid(REAL_UUID.toUpperCase())).toBe(true);
  });

  it('rejects undefined / non-string', () => {
    expect(isUuid(undefined)).toBe(false);
    expect(isUuid(null)).toBe(false);
    expect(isUuid(42)).toBe(false);
    expect(isUuid({})).toBe(false);
  });

  it('rejects strings that resemble but are not UUIDs', () => {
    expect(isUuid('')).toBe(false);
    expect(isUuid('smoke-' + REAL_UUID)).toBe(false);
    expect(isUuid(REAL_UUID + 'x')).toBe(false);
    expect(isUuid(REAL_UUID.replace(/-/g, ''))).toBe(false);
    expect(isUuid('not-a-uuid')).toBe(false);
  });
});

describe('uuidOrNew', () => {
  it('returns the input when it is already a UUID', () => {
    expect(uuidOrNew(REAL_UUID)).toBe(REAL_UUID);
  });

  it('trims surrounding whitespace before validating', () => {
    expect(uuidOrNew(`  ${REAL_UUID}  `)).toBe(REAL_UUID);
  });

  it('replaces non-UUID strings with a fresh UUID', () => {
    // The original silent-fail bug: any non-UUID id from a widget caller
    // caused assembl_agent_analytics + agent_cost_log inserts to fail.
    const out = uuidOrNew('smoke-' + REAL_UUID);
    expect(out).not.toBe('smoke-' + REAL_UUID);
    expect(UUID_RE.test(out)).toBe(true);
  });

  it('replaces undefined / empty with a fresh UUID', () => {
    expect(UUID_RE.test(uuidOrNew(undefined))).toBe(true);
    expect(UUID_RE.test(uuidOrNew(''))).toBe(true);
    expect(UUID_RE.test(uuidOrNew('   '))).toBe(true);
  });

  it('returns a different UUID on each fallback call', () => {
    const a = uuidOrNew(undefined);
    const b = uuidOrNew(undefined);
    expect(a).not.toBe(b);
  });
});
