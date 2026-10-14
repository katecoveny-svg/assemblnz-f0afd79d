import { expect, it } from 'vitest';
import { tuneAuthCookieOptions, REMEMBER_MAX_AGE, SESSION_MAX_AGE } from './session-policy';
it('preserves session deletion on sign-out and removal of old token chunks', () => {
  for (const remember of [true, false]) for (const name of ['sb-project-auth-token', 'sb-project-auth-token.0']) {
    expect(tuneAuthCookieOptions(name, { maxAge: 0, path: '/' }, remember)).toEqual({ maxAge: 0, path: '/' });
  }
});
it('retains the chosen lifetime for live tokens and leaves PKCE untouched', () => {
  expect(tuneAuthCookieOptions('sb-project-auth-token.1', { maxAge: undefined as number | undefined }, true).maxAge).toBe(REMEMBER_MAX_AGE);
  expect(tuneAuthCookieOptions('sb-project-auth-token', { maxAge: undefined as number | undefined }, false).maxAge).toBe(SESSION_MAX_AGE);
  expect(tuneAuthCookieOptions('sb-project-auth-token-code-verifier', { maxAge: 300 }, true).maxAge).toBe(300);
});
