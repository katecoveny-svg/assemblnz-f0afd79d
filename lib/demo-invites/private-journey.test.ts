import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';

vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn(async () => NextResponse.next()),
}));
vi.mock('@/lib/demo-invites/crypto', () => ({
  INVITE_COOKIE: 'assembl-demo-invite',
  getInviteSecret: () => undefined,
  verifyInviteCookieValue: vi.fn(),
  verifyInviteSlug: vi.fn(),
  buildInviteCookieValue: vi.fn(),
}));

import { middleware, config } from '@/middleware';

const request = (path: string, host = 'www.assembl.co.nz', authorization?: string) =>
  new NextRequest(`https://${host}${path}`, {
    headers: { host, ...(authorization ? { authorization } : {}) },
  });
const privatePaths = [
  '/journeys/one-nz',
  '/journeys/one-nz/',
  '/journeys/one-nz?preview=1&_rsc=sample',
  '/journeys/one-nz/evidence',
  '/journeys/one-nz/opengraph-image.png',
  '/journeys/%6fne-nz',
  '/worlds/onenz',
  '/worlds/onenz/proof',
  '/worlds/one-nz',
] as const;

beforeEach(() => {
  vi.stubEnv('DEMO_BASIC_AUTH_USER', 'test-reviewer');
  vi.stubEnv('DEMO_BASIC_AUTH_PASSWORD', 'test-password-only');
});
afterEach(() => vi.unstubAllEnvs());

describe('One NZ private demo access', () => {
  for (const host of ['assembl.co.nz', 'www.assembl.co.nz', 'preview.vercel.app', 'localhost:8770']) {
    it.each(privatePaths)(`denies an anonymous request on ${host}: %s`, async (path) => {
      const response = await middleware(request(path, host));
      expect(response.status).toBe(401);
      expect(response.headers.get('cache-control')).toContain('no-store');
      expect(response.headers.get('x-robots-tag')).toContain('noindex');
      expect(await response.text()).not.toContain('Phone Dollars');
    });
  }

  it.each(privatePaths)('runs middleware for the private path %s', (path) => {
    expect(unstable_doesMiddlewareMatch({
      config, nextConfig: {}, url: `https://www.assembl.co.nz${path}`,
    })).toBe(true);
  });

  it('fails closed when demo credentials have not been configured', async () => {
    vi.stubEnv('DEMO_BASIC_AUTH_USER', '');
    vi.stubEnv('DEMO_BASIC_AUTH_PASSWORD', '');
    expect((await middleware(request('/journeys/one-nz'))).status).toBe(401);
  });

  it.each(['Basic broken', `Basic ${btoa('test-reviewer:incorrect')}`, 'Bearer sample'])(
    'rejects an invalid authorization header %s', async (authorization) => {
      expect((await middleware(request('/journeys/one-nz', undefined, authorization))).status).toBe(401);
    },
  );

  it('permits existing private-demo credentials without caching the response', async () => {
    const authorization = `Basic ${btoa('test-reviewer:test-password-only')}`;
    const response = await middleware(request('/journeys/one-nz', undefined, authorization));
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('cache-control')).toContain('private, no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
  });

  it.each(['/', '/about', '/journeys', '/journeys/evidence-receipt'])(
    'keeps the existing public page accessible: %s', async (path) => {
      expect((await middleware(request(path))).status).toBe(200);
    },
  );
});
