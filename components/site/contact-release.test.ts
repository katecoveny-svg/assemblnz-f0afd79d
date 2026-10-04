import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { GlobalNav, GlobalFooter } from './GlobalChrome';
import ContactPage, { metadata as contactMetadata } from '../../app/contact/page';
import { metadata as pricingMetadata } from '../../app/pricing/page';
import sitemap from '../../app/sitemap';

const state = vi.hoisted(() => ({ path: '/contact' }));
vi.mock('next/navigation', () => ({ usePathname: () => state.path }));
vi.mock('@/components/v2/V2Chrome', () => ({ V2Nav: () => createElement('nav', null, 'LEGACY NAV') }));
vi.mock('@/components/v2/V2Footer', () => ({ V2Footer: () => createElement('footer', null, 'LEGACY FOOTER') }));
vi.mock('@/components/site/cinematic/CinematicPricing', () => ({ CinematicPricing: () => null }));

describe('public contact and pricing search boundaries', () => {
  it('uses the locked glass company mark and public product doors on contact', () => {
    state.path = '/contact';
    const html = renderToStaticMarkup(createElement(GlobalNav));
    expect(html).toContain('data-glass-identity="assembl"');
    expect(html).toContain('/brand/assembl-assembled-plum.webp?v=glass07');
    for (const href of ['/pursuit', '/do', '/creative-studio']) expect(html).toContain(`href="${href}"`);
    expect(html).not.toContain('LEGACY NAV');
    expect(html).not.toContain('find it');
    expect(html).not.toContain('client-hub');
    expect(renderToStaticMarkup(createElement(GlobalFooter))).not.toContain('LEGACY FOOTER');
  });
  it('keeps standalone and private product chrome suppressed', () => {
    for (const path of ['/', '/do', '/do/widget', '/admin', '/echo', '/login', '/auth/callback', '/customers/acme', '/for/acme', '/creative-studio']) {
      state.path = path;
      expect(renderToStaticMarkup(createElement(GlobalNav))).toBe('');
      expect(renderToStaticMarkup(createElement(GlobalFooter))).toBe('');
    }
  });
  it('uses current company chrome on about without changing other routes', () => {
    state.path = '/about';
    expect(renderToStaticMarkup(createElement(GlobalNav))).not.toContain('LEGACY NAV');
    state.path = '/faq';
    expect(renderToStaticMarkup(createElement(GlobalNav))).toContain('LEGACY NAV');
    expect(renderToStaticMarkup(createElement(GlobalFooter))).toContain('LEGACY FOOTER');
  });
  it('preserves the valid project query and email draft consent', async () => {
    const html = renderToStaticMarkup(await ContactPage({ searchParams: Promise.resolve({ product: 'system' }) }));
    expect(html).toContain('What would you');
    expect(html).toContain('like to make?');
    expect(html).toContain('value="system" selected');
    expect(html).toContain('you press Send');
    expect(html).not.toContain('No hard sell');
    expect(contactMetadata.alternates?.canonical).toBe('/contact');
  });
  it('excludes pricing from search without blocking link discovery or access', () => {
    expect(pricingMetadata.robots).toEqual({ index: false, follow: true });
    expect(pricingMetadata.alternates?.canonical).toBe('/pricing');
    const urls = sitemap().map(item => item.url);
    expect(urls).not.toContain('https://www.assembl.co.nz/pricing');
    expect(urls).toContain('https://www.assembl.co.nz/contact');
  });
});
