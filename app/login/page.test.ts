import { beforeEach, expect, it, vi } from 'vitest';
const fixture = vi.hoisted(() => ({ user: null as null | { id: string; is_anonymous?: boolean }, error: null as null | object }));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({auth:{getUser:async()=>({data:{user:fixture.user},error:fixture.error})}}) }));
vi.mock('next/navigation', () => ({ redirect: (path:string) => { throw new Error(`redirect:${path}`); } }));
vi.mock('@/lib/auth/providers', () => ({getReadyAuthProviders:async()=>({google:false,apple:false})}));
import LoginPage from './page';
beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://fictional.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','fictional-key');
  fixture.user = {id:'fictional-owner'}; fixture.error=null;
});
it.each(['reload', 'reopen with retained cookie'])('%s skips repeat DO sign-in after server validation', async () => {
  await expect(LoginPage({searchParams:Promise.resolve({redirect:'/do/widget'})})).rejects.toThrow('redirect:/do/widget');
});
it.each(['revoked', 'anonymous', 'missing'])('does not bypass login for %s sessions', async (state) => {
  if(state==='revoked') fixture.error={message:'fictional-revocation'};
  if(state==='anonymous') fixture.user={id:'fictional-anon',is_anonymous:true};
  if(state==='missing') fixture.user=null;
  expect(await LoginPage({searchParams:Promise.resolve({redirect:'/do/widget'})})).toBeTruthy();
});
