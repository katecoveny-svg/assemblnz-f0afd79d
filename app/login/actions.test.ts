import { beforeEach, expect, it, vi } from 'vitest';
const { signInWithOtp, signInWithOAuth, cookieSet, providers } = vi.hoisted(() => ({ signInWithOtp: vi.fn(), signInWithOAuth: vi.fn(), cookieSet: vi.fn(), providers: {google:false,apple:false} }));
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ set: cookieSet })),
  headers: vi.fn(async () => new Headers({ host: 'www.assembl.co.nz', 'x-forwarded-proto': 'https' })),
}));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn(async () => ({ auth: { signInWithOtp, signInWithOAuth } })) }));
vi.mock('@/lib/auth/providers', () => ({getReadyAuthProviders:async()=>providers}));
import { sendMagicLinkAction, socialSignInAction } from './actions';
const form = () => {
  const data = new FormData();
  data.set('email', 'USER@EXAMPLE.NZ');
  data.set('redirectTo', '/do/widget');
  data.set('remember', '1');
  return data;
};
beforeEach(() => vi.clearAllMocks());
it('reports Supabase send throttling with a resend delay', async () => {
  signInWithOtp.mockResolvedValue({ error: { status: 429, message: 'Email rate limit exceeded' } });
  expect(await sendMagicLinkAction(null, form())).toEqual({ ok: false, error: expect.stringContaining('Wait a minute'), retryAfter: 60 });
  expect(signInWithOtp).toHaveBeenCalledTimes(1);
});
it('keeps DO email confirmation and return on the same canonical host', async () => {
  signInWithOtp.mockResolvedValue({ error: null });
  expect(await sendMagicLinkAction(null, form())).toEqual({ ok: true });
  expect(signInWithOtp).toHaveBeenCalledWith({
    email: 'user@example.nz',
    options: { emailRedirectTo: 'https://www.assembl.co.nz/auth/confirm?next=%2Fdo%2Fwidget&remember=1' },
  });
});

it('does not start an unverified/unconfigured provider', async () => {
  providers.google=false;
  const data=form(); data.set('provider','google');
  expect(await socialSignInAction(data)).toMatchObject({ok:false});
  expect(signInWithOAuth).not.toHaveBeenCalled();
});
it.each(['google','apple'])('starts verified %s with server PKCE and chosen same-host return',async(provider)=>{
  providers.google=true;providers.apple=true;
  signInWithOAuth.mockResolvedValue({data:{url:'https://fictional.supabase.co/auth/v1/authorize'},error:null});
  const data=form(); data.set('provider',provider);
  expect(await socialSignInAction(data)).toMatchObject({ok:true});
  expect(signInWithOAuth).toHaveBeenCalledWith({provider,options:{redirectTo:'https://www.assembl.co.nz/auth/callback?next=%2Fdo%2Fwidget&remember=1',skipBrowserRedirect:true}});
});
it('does not launch OAuth inside the native companion',async()=>{
  providers.google=true;
  const data=form();data.set('provider','google');data.set('redirectTo','/do/widget?nativeReview=1');
  expect(await socialSignInAction(data)).toMatchObject({ok:false});
  expect(signInWithOAuth).not.toHaveBeenCalled();
});
