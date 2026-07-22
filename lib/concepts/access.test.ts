import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mintConceptToken, verifyConceptAccess, conceptProtectionConfigured } from './access';
import { getConcept, CONCEPT_SLUGS } from './registry';

const ORIG = process.env.CONCEPT_MAGIC_SECRET;
const ORIG_DEV = process.env.CONCEPT_DEV_KEY;
afterEach(() => {
  if (ORIG === undefined) delete process.env.CONCEPT_MAGIC_SECRET;
  else process.env.CONCEPT_MAGIC_SECRET = ORIG;
  if (ORIG_DEV === undefined) delete process.env.CONCEPT_DEV_KEY;
  else process.env.CONCEPT_DEV_KEY = ORIG_DEV;
});

describe('signed magic-link access (secret configured)', () => {
  beforeEach(() => {
    process.env.CONCEPT_MAGIC_SECRET = 'test-secret-abc';
  });

  it('mints a token that verifies for the same slug', () => {
    const token = mintConceptToken('everyday-rewards', 30)!;
    expect(token).toBeTruthy();
    expect(verifyConceptAccess('everyday-rewards', token).ok).toBe(true);
    expect(conceptProtectionConfigured()).toBe(true);
  });

  it('rejects a token minted for a different concept (tenant isolation)', () => {
    const token = mintConceptToken('everyday-rewards', 30)!;
    expect(verifyConceptAccess('air-new-zealand', token).ok).toBe(false);
  });

  it('rejects an expired token', () => {
    const now = Date.now();
    const token = mintConceptToken('everyday-rewards', -1, now)!; // already expired
    const res = verifyConceptAccess('everyday-rewards', token, now);
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('expired');
  });

  it('rejects a tampered token', () => {
    const token = mintConceptToken('everyday-rewards', 30)!;
    const tampered = token.slice(0, -3) + 'zzz';
    expect(verifyConceptAccess('everyday-rewards', tampered).ok).toBe(false);
  });

  it('rejects a missing token', () => {
    expect(verifyConceptAccess('everyday-rewards', undefined).reason).toBe('missing');
  });
});

describe('dev-key boundary (no secret configured)', () => {
  beforeEach(() => {
    delete process.env.CONCEPT_MAGIC_SECRET;
    delete process.env.CONCEPT_DEV_KEY;
  });

  it('accepts the default dev key and rejects others', () => {
    expect(conceptProtectionConfigured()).toBe(false);
    expect(verifyConceptAccess('everyday-rewards', 'assembl-preview')).toEqual({ ok: true, reason: 'dev' });
    expect(verifyConceptAccess('everyday-rewards', 'wrong').ok).toBe(false);
    expect(verifyConceptAccess('everyday-rewards', undefined).ok).toBe(false);
  });

  it('mintConceptToken returns null without a secret', () => {
    expect(mintConceptToken('everyday-rewards')).toBeNull();
  });
});

describe('concept registry', () => {
  it('serves the Woolworths concept mapped to the verified journey', () => {
    const c = getConcept('everyday-rewards');
    expect(c?.org).toBe('Woolworths NZ');
    expect(c?.journeyId).toBe('everyday-assembled');
    expect(getConcept('nope')).toBeUndefined();
  });

  it('does not expose air-nz/contact yet (staged sequence)', () => {
    expect(CONCEPT_SLUGS).toEqual(['everyday-rewards']);
  });
});
