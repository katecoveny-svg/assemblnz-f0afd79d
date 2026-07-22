import { afterEach, describe, expect, it } from 'vitest';
import {
  checkRateLimit,
  _resetRateLimit,
  validateIntentInput,
  validateRunId,
  withinBytes,
  RATE_MAX,
  INTENT_MAX_CHARS,
} from './guards';

afterEach(() => _resetRateLimit());

describe('rate limiting', () => {
  it('permits requests up to the cap, then rejects', () => {
    const ip = '203.0.113.7';
    for (let i = 0; i < RATE_MAX; i++) {
      expect(checkRateLimit(ip, 'intent').allowed).toBe(true);
    }
    const over = checkRateLimit(ip, 'intent');
    expect(over.allowed).toBe(false);
    expect(over.retryAfterSec).toBeGreaterThan(0);
  });

  it('isolates buckets and IPs', () => {
    const ip = '203.0.113.9';
    for (let i = 0; i < RATE_MAX; i++) checkRateLimit(ip, 'intent');
    // Different bucket and different IP are unaffected.
    expect(checkRateLimit(ip, 'persist').allowed).toBe(true);
    expect(checkRateLimit('203.0.113.10', 'intent').allowed).toBe(true);
  });
});

describe('intent input validation', () => {
  it('rejects empty / non-string', () => {
    expect(validateIntentInput('').ok).toBe(false);
    expect(validateIntentInput('   ').ok).toBe(false);
    expect(validateIntentInput(null).ok).toBe(false);
    expect(validateIntentInput(42).ok).toBe(false);
  });

  it('rejects oversized input before any model call', () => {
    const big = 'a'.repeat(INTENT_MAX_CHARS + 1);
    const v = validateIntentInput(big);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.reason).toBe('too_large');
  });

  it('accepts and trims a normal request', () => {
    const v = validateIntentInput('  Dinners for four this week  ');
    expect(v.ok).toBe(true);
    if (v.ok) expect(v.value).toBe('Dinners for four this week');
  });
});

describe('run id + payload validation', () => {
  it('accepts safe ids and rejects unsafe ones', () => {
    expect(validateRunId('run-web-everyday-assembled')).toBe(true);
    expect(validateRunId('run_123')).toBe(true);
    expect(validateRunId('../etc/passwd')).toBe(false);
    expect(validateRunId('run id with spaces')).toBe(false);
    expect(validateRunId('x'.repeat(200))).toBe(false);
    expect(validateRunId(123 as unknown)).toBe(false);
  });

  it('enforces payload byte caps', () => {
    expect(withinBytes({ a: 'small' }, 1000)).toBe(true);
    expect(withinBytes({ a: 'x'.repeat(5000) }, 1000)).toBe(false);
  });
});
