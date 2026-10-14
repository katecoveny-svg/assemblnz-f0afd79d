import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ create: vi.fn(), set: vi.fn(), preference: '1' }));
vi.mock('@supabase/ssr', () => ({ createServerClient: mocks.create }));
vi.mock('next/headers', () => ({ cookies: async () => ({ getAll: () => [], get: () => ({ value: mocks.preference }), set: mocks.set }) }));
import { createClient } from './server';
import { BROWSER_REMEMBER_COOKIE, REMEMBER_MAX_AGE, SESSION_MAX_AGE } from './session-policy';
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://synthetic.example.test');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'synthetic-public-key');
  mocks.create.mockImplementation((_url, _key, options) => options);
});
afterEach(() => vi.unstubAllEnvs());
it.each([['1', REMEMBER_MAX_AGE], ['0', SESSION_MAX_AGE]])('mirrors server-issued %s preference and secures auth writes', async (preference, maxAge) => {
  mocks.preference = preference;
  const options = await createClient() as any;
  options.cookies.setAll([{ name: 'sb-project-auth-token.0', value: 'synthetic-session-data', options: { maxAge: 400 * 86400, path: '/' } }]);
  expect(mocks.set).toHaveBeenCalledWith(BROWSER_REMEMBER_COOKIE, preference, expect.objectContaining({ maxAge, httpOnly: false, secure: true }));
  expect(mocks.set).toHaveBeenCalledWith('sb-project-auth-token.0', 'synthetic-session-data', expect.objectContaining({ maxAge, secure: true }));
});
it('secures server deletion without resurrecting it', async () => {
  const options = await createClient() as any;
  options.cookies.setAll([{ name: 'sb-project-auth-token.1', value: '', options: { maxAge: 0, path: '/' } }]);
  expect(mocks.set).toHaveBeenCalledWith('sb-project-auth-token.1', '', expect.objectContaining({ maxAge: 0, secure: true }));
});
