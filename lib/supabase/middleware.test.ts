import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { REMEMBER_MAX_AGE, SESSION_MAX_AGE } from './session-policy';
const fixture = vi.hoisted(() => ({ user: null as object | null, writes: [] as {name:string;value:string;options:{maxAge:number;path:string}}[] }));
vi.mock('@supabase/ssr', () => ({ createServerClient: vi.fn((_url, _key, options) => ({ auth: { getUser: async () => {
  options.cookies.setAll(fixture.writes, { 'Cache-Control': 'private, no-store', Pragma: 'no-cache', Expires: '0' });
  return { data: { user: fixture.user } };
} } })) }));
import { updateSession } from './middleware';
beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://fictional.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'fictional-public-key');
  fixture.user = { id: 'fictional-user' };
  fixture.writes = [{ name: 'sb-fictional-auth-token.0', value: 'fictional-cookie', options: { maxAge: 100, path: '/' } }];
});
it.each([['1', REMEMBER_MAX_AGE], ['0', SESSION_MAX_AGE]])('refresh and reload retain preference %s and prevent response caching', async (preference, lifetime) => {
  const response = await updateSession(new NextRequest('https://www.assembl.co.nz/do/widget', {headers: {cookie: `assembl-remember=${preference}`}}));
  expect(response.cookies.get('sb-fictional-auth-token.0')?.maxAge).toBe(lifetime);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
});
it('expired/revoked sessions redirect while retaining deletion cookies', async () => {
  fixture.user = null;
  fixture.writes[0].value = '';
  fixture.writes[0].options.maxAge = 0;
  const response = await updateSession(new NextRequest('https://www.assembl.co.nz/account', {headers: {cookie:'assembl-remember=1'}}));
  expect(response.headers.get('location')).toContain('/login?redirect=%2Faccount');
  expect(response.cookies.get('sb-fictional-auth-token.0')?.maxAge).toBe(0);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
});
