import { describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { getURLFromRedirectError } from 'next/dist/client/components/redirect';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn(async () => NextResponse.next()),
}));

import { middleware } from '@/middleware';
import PartnerDoMakerAliasPage from '@/app/do/maker/partner/[partnerSlug]/page';
import { V2Nav } from '@/components/v2/V2Chrome';
import sitemap from '@/app/sitemap';

const request = (path: string, host = 'www.assembl.co.nz') =>
  new NextRequest(`https://${host}${path}`, { headers: { host } });
const publicHosts = ['assembl.co.nz', 'www.assembl.co.nz', 'preview.vercel.app'];

describe('public install discovery', () => {
  it('lists canonical indexable product entries without private, preview or redirect URLs', async () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);
    const products = [
      '/pursuit',
      '/do',
      '/do/meetings',
      '/do/household',
      '/creative-studio',
      '/do/install',
    ];
    for (const product of products) {
      expect(entries.find((entry) => entry.url === `https://www.assembl.co.nz${product}`), product).toMatchObject({
        priority: 0.9,
      });
      for (const host of publicHosts) await expectPublicEntry(product, host);
    }
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) {
      expect(new URL(url).origin).toBe('https://www.assembl.co.nz');
      expect(new URL(url).search).toBe('');
      expect(new URL(url).pathname).not.toMatch(
        /^\/(?:admin|auth|login|api|customers|journeys\/one-nz|worlds\/(?:onenz|one-nz)|preview|studio|pursuit\/playground|do\/(?:browser|sponsored|tasks|widget|maker))(?:\/|$)/,
      );
      expect(['/insurance', '/toro']).not.toContain(new URL(url).pathname);
    }
  });

  it('uses the current plum/paper identity and working product shortcuts', async () => {
    const manifest = JSON.parse(
      readFileSync(path.join(process.cwd(), 'public/manifest.webmanifest'), 'utf8'),
    );
    expect(manifest.theme_color).toBe('#240B21');
    expect(manifest.background_color).toBe('#FFFDFB');
    expect(manifest.description).toContain('Pursuit');
    expect(manifest.description).toContain('DO');
    expect(manifest.description).toContain('Studio');
    expect(
      manifest.shortcuts.map((shortcut: { short_name: string; url: string }) => [
        shortcut.short_name,
        shortcut.url,
      ]),
    ).toEqual([
      ['Meeting', '/do/meetings'],
      ['Household', '/do/household'],
      ['Studio', '/creative-studio'],
    ]);
    for (const shortcut of manifest.shortcuts) {
      for (const host of publicHosts) await expectPublicEntry(shortcut.url, host);
    }
  });
});

describe('shared public sign-in entry', () => {
  it('renders a Meeting-scoped sign-in link that survives the live-host gate', async () => {
    const html = renderToStaticMarkup(createElement(V2Nav));
    const href = html.match(/<a[^>]*href="([^"]+)"[^>]*>\s*sign in\s*<\/a>/)?.[1];
    expect(href).toBe('/login?redirect=%2Fdo%2Fmeetings');
    for (const host of publicHosts) await expectPublicEntry(href!, host);
  });
});

async function expectPublicEntry(path: string, host: string) {
  const req = request(path, host);
  const originalUrl = req.url;
  const response = await middleware(req);
  expect(response.headers.get('location'), originalUrl).toBeNull();
  expect(response.headers.get('x-middleware-rewrite'), originalUrl).toBeNull();
  expect(response.headers.get('x-middleware-next'), originalUrl).toBe('1');
  expect(req.url).toBe(originalUrl);
}

describe('retired public Pursuit maker / partner doors', () => {
  it.each(publicHosts)('keeps lean /pursuit public and redirects playground on %s', async (host) => {
    for (const path of ['/pursuit', '/pursuit/']) {
      await expectPublicEntry(path, host);
    }
    for (const path of ['/pursuit/playground', '/pursuit/playground/']) {
      const response = await middleware(request(path, host));
      expect(response.status, path).toBe(308);
      expect(response.headers.get('location'), path).toMatch(
        /^https:\/\/assembl-pursuit\.katecoveny\.chatgpt\.site\/?$/,
      );
    }
  });

  it.each(publicHosts)('redirects Task DO Maker, /studio and partner aliases to Studio on %s', async (host) => {
    for (const path of [
      '/studio',
      '/studio/',
      '/studio/do-maker',
      '/studio/do-maker/',
      '/studio/do-maker?mode=partner&partner=bp',
      '/do/maker/partner',
      '/do/maker/partner/bp',
    ]) {
      const response = await middleware(request(path, host));
      expect(response.status, path).toBe(308);
      expect(response.headers.get('location'), path).toContain('/creative-studio');
    }
  });

  it.each(publicHosts)('redirects forbidden public DO shelves to /do on %s', async (host) => {
    for (const path of [
      '/do/office',
      '/do/office/',
      '/do/tasks',
      '/do/family',
      '/do/builder',
      '/do/connections',
      '/do/sponsored',
      '/do/browser',
      '/do/linda',
      '/do?task=plan',
      '/do?task=reply&open=1',
      '/do?task=rewrite',
    ]) {
      const response = await middleware(request(path, host));
      expect(response.status, path).toBe(308);
      const location = response.headers.get('location') ?? '';
      expect(location, path).toMatch(/\/do\/?$/);
    }
  });

  it('partner page component redirects to Studio', async () => {
    let destination: string | null = null;
    try {
      await PartnerDoMakerAliasPage();
    } catch (error) {
      if (!isRedirectError(error)) throw error;
      destination = getURLFromRedirectError(error);
    }
    expect(destination).toBe('/creative-studio');
  });

  it.each(['assembl.co.nz', 'www.assembl.co.nz'])(
    'does not open the workbench or segment lookalikes on %s',
    async (host) => {
      for (const path of ['/studio/other', '/studio/do-maker-private', '/studio/do-makerish']) {
        const response = await middleware(request(path, host));
        expect(response.headers.get('x-middleware-rewrite'), path).toBe(`https://${host}/`);
      }
    },
  );

  it.each(publicHosts)('keeps private client entries gated on %s', async (host) => {
    for (const path of ['/customers/happy-tails', '/journeys/one-nz', '/worlds/onenz']) {
      expect((await middleware(request(path, host))).status, path).toBe(401);
    }
  });
});
