import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock('@supabase/ssr', async (original) => ({ ...await original<typeof import('@supabase/ssr')>(), createBrowserClient: mocks.create }));
import { createClient } from './client';
import { BROWSER_REMEMBER_COOKIE, REMEMBER_MAX_AGE, SESSION_MAX_AGE } from './session-policy';
type CookieAdapter = { cookies: {
  getAll: () => Array<{ name: string; value: string }>;
  setAll: (writes: Array<{ name: string; value: string; options: { path?: string; maxAge: number; sameSite?: 'lax' } }>) => void;
} };
function adapter() { return createClient() as unknown as CookieAdapter; }
const DEFAULT_SSR_AGE = 400 * 86400;
let writes: string[];
let readable: string;
function installDocument() {
  vi.stubGlobal('document', Object.defineProperty({}, 'cookie', {
    get: () => readable,
    set: (value: string) => { writes.push(value); },
  }));
}
beforeEach(() => {
  writes = []; readable = '';
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://synthetic.example.test');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'synthetic-public-key');
  vi.stubEnv('NODE_ENV', 'production');
  installDocument();
  mocks.create.mockImplementation((_url, _key, options) => options);
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
function refresh(options: CookieAdapter) {
  options.cookies.setAll([{ name: 'sb-project-auth-token.0', value: 'synthetic-session-data', options: { path: '/', maxAge: DEFAULT_SSR_AGE, sameSite: 'lax' } }]);
}
describe('browser refresh uses the existing server retention policy', () => {
  it.each([['1', REMEMBER_MAX_AGE], ['0', SESSION_MAX_AGE], ['', SESSION_MAX_AGE]])('applies %s preference without the SSR 400-day default', (preference, age) => {
    readable = preference ? `${BROWSER_REMEMBER_COOKIE}=${preference}` : '';
    refresh(adapter());
    expect(writes[0]).toContain(`Max-Age=${age}`);
    expect(writes[0]).toContain('; Secure');
    expect(writes[0]).not.toContain('HttpOnly');
    expect(writes[0]).not.toContain(`Max-Age=${DEFAULT_SSR_AGE}`);
  });
  it('re-reads changed preference on every browser refresh', () => {
    const options = adapter();
    readable = `${BROWSER_REMEMBER_COOKIE}=1`; refresh(options);
    readable = `${BROWSER_REMEMBER_COOKIE}=0`; refresh(options);
    expect(writes[0]).toContain(`Max-Age=${REMEMBER_MAX_AGE}`);
    expect(writes[1]).toContain(`Max-Age=${SESSION_MAX_AGE}`);
  });
  it('reads restored browser cookies after synthetic restart', () => {
    readable = `${BROWSER_REMEMBER_COOKIE}=1; sb-project-auth-token.0=synthetic-session-data`;
    installDocument();
    const restarted = adapter();
    expect(restarted.cookies.getAll()).toContainEqual({ name: 'sb-project-auth-token.0', value: 'synthetic-session-data' });
    refresh(restarted);
    expect(writes[0]).toContain(`Max-Age=${REMEMBER_MAX_AGE}`);
  });
  it('preserves secure chunk deletions and local development support', () => {
    const options = adapter();
    options.cookies.setAll([{ name: 'sb-project-auth-token.1', value: '', options: { maxAge: 0, path: '/' } }]);
    expect(writes[0]).toContain('Max-Age=0'); expect(writes[0]).toContain('; Secure');
    vi.stubEnv('NODE_ENV', 'development'); refresh(options);
    expect(writes[1]).not.toContain('; Secure');
  });
});
it('does not retain a previous synthetic owner or preference after a cookie switch', () => {
  const options = adapter();
  readable = `${BROWSER_REMEMBER_COOKIE}=1; sb-project-auth-token.0=owner-a-fictional`;
  expect(options.cookies.getAll()).toContainEqual({ name: 'sb-project-auth-token.0', value: 'owner-a-fictional' });
  readable = `${BROWSER_REMEMBER_COOKIE}=0; sb-project-auth-token.0=owner-b-fictional`;
  expect(options.cookies.getAll()).toContainEqual({ name: 'sb-project-auth-token.0', value: 'owner-b-fictional' });
  expect(JSON.stringify(options.cookies.getAll())).not.toContain('owner-a-fictional');
  refresh(options); expect(writes[0]).toContain(`Max-Age=${SESSION_MAX_AGE}`);
});
