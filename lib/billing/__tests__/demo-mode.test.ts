import { afterEach, describe, expect, it } from 'vitest';
import {
  DEMO_COOKIE,
  checkDemoQuota,
  freeMessageLimit,
  paywallPayload,
  spendDemoMessage,
} from '../demo-mode';

function reqWithCookie(value?: string): Request {
  return new Request('https://x.test/api', {
    headers: value ? { cookie: `${DEMO_COOKIE}=${value}` } : {},
  });
}

afterEach(() => {
  delete process.env.DEMO_FREE_MESSAGES;
});

describe('demo-mode metering', () => {
  it('defaults to 5 free answers and counts per agent', () => {
    expect(freeMessageLimit()).toBe(5);
    const fresh = checkDemoQuota(reqWithCookie(), 'mariner');
    expect(fresh).toMatchObject({ allowed: true, used: 0, remaining: 5 });
  });

  it('spends a message and trips the paywall at the limit', () => {
    process.env.DEMO_FREE_MESSAGES = '2';
    // simulate two spends by threading the cookie forward
    let cookie: string | null = spendDemoMessage(reqWithCookie(), 'mariner');
    expect(cookie).toContain(DEMO_COOKIE);
    const val1 = cookie!.split(';')[0].split('=').slice(1).join('=');

    cookie = spendDemoMessage(reqWithCookie(val1), 'mariner');
    const val2 = cookie!.split(';')[0].split('=').slice(1).join('=');

    const quota = checkDemoQuota(reqWithCookie(val2), 'mariner');
    expect(quota).toMatchObject({ allowed: false, used: 2, limit: 2, remaining: 0 });
    // a different agent is unaffected
    expect(checkDemoQuota(reqWithCookie(val2), 'helm').allowed).toBe(true);
  });

  it('fails open on a malformed cookie', () => {
    const quota = checkDemoQuota(reqWithCookie('not-json'), 'mariner');
    expect(quota.allowed).toBe(true);
    expect(quota.used).toBe(0);
  });

  it('disables metering when limit is 0', () => {
    process.env.DEMO_FREE_MESSAGES = '0';
    const quota = checkDemoQuota(reqWithCookie(), 'mariner');
    expect(quota).toMatchObject({ allowed: true, disabled: true });
    expect(spendDemoMessage(reqWithCookie(), 'mariner')).toBeNull();
  });

  it('builds a paywall payload', () => {
    const body = paywallPayload('Mariner', 'mariner', 5);
    expect(body).toMatchObject({ error: 'demo_limit_reached', paywall: true, agentSlug: 'mariner' });
    expect(body.message).toContain('5 free answers');
  });
});
