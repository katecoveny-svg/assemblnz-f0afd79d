import { describe, expect, it } from 'vitest';
import { DEMO_AUTH_ORIGIN, isAdminRedirect, resolveAuthOrigin } from '@/lib/auth/origin';

describe('resolveAuthOrigin', () => {
  it('forces demo for admin redirects regardless of request host', () => {
    expect(
      resolveAuthOrigin({
        host: 'localhost:3000',
        proto: 'http',
        redirectTo: '/admin',
      }),
    ).toBe(DEMO_AUTH_ORIGIN);
    expect(
      resolveAuthOrigin({
        host: 'preview-abc.vercel.app',
        proto: 'https',
        redirectTo: '/admin/login',
      }),
    ).toBe(DEMO_AUTH_ORIGIN);
  });

  it('forces demo when the request is already on www or apex', () => {
    expect(resolveAuthOrigin({ host: 'www.assembl.co.nz', redirectTo: '/app' })).toBe(
      DEMO_AUTH_ORIGIN,
    );
    expect(resolveAuthOrigin({ host: 'assembl.co.nz', redirectTo: '/app' })).toBe(DEMO_AUTH_ORIGIN);
  });

  it('keeps demo host as demo', () => {
    expect(
      resolveAuthOrigin({ host: 'demo.assembl.co.nz', redirectTo: '/admin' }),
    ).toBe(DEMO_AUTH_ORIGIN);
  });

  it('preserves local / preview hosts for non-admin redirects', () => {
    expect(
      resolveAuthOrigin({ host: 'localhost:3000', proto: 'http', redirectTo: '/app' }),
    ).toBe('http://localhost:3000');
  });

  it('falls back to demo when host is missing', () => {
    expect(resolveAuthOrigin({ host: null, redirectTo: '/app' })).toBe(DEMO_AUTH_ORIGIN);
  });
});

describe('isAdminRedirect', () => {
  it('detects admin paths', () => {
    expect(isAdminRedirect('/admin')).toBe(true);
    expect(isAdminRedirect('/admin/login')).toBe(true);
    expect(isAdminRedirect('/app')).toBe(false);
  });
});
