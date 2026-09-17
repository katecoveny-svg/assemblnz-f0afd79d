import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ProductLanding } from './assembl-the-work/ProductLanding';
import AboutPage from '@/app/about/page';
import { metadata as contactMetadata } from '@/app/contact/page';
import { ContactForm } from './contact-form';
import { PublicWatchFrame } from './watch/PublicWatchFrame';
const state = vi.hoisted(() => ({ path: '/contact' }));
vi.mock('next/navigation', () => ({ usePathname: () => state.path }));
vi.mock('next/dynamic', () => ({ default: () => () => null }));
vi.mock('./watch/WatchScene', () => ({ WatchScene: () => createElement('div', null, 'WATCH SCENE') }));
vi.mock('./cinematic/CinematicSubpage', () => ({ CinematicSubpage: ({ spec }: { spec: unknown }) => createElement('div', null, JSON.stringify(spec)) }));

describe('current public company surfaces', () => {
  it('gives Studio visual work visitors can actually open', () => {
    const html = renderToStaticMarkup(createElement(ProductLanding, { product: 'studio' }));
    expect(html).toContain('See the work');
    expect(html).toContain('/preview/do-world');
    expect(html).toContain('/do/meetings');
    expect(html).not.toContain('/studio/do-maker');
    expect(html).not.toContain('/do/office');
    expect(html).not.toContain('/cinematic-nature/ocean-assembly.webp');
    expect(html).toContain('href="/pursuit"');
    expect(html).toContain('href="/creative-studio"');
  });

  it('gives Pursuit the shared atelier door (not birds) and hub link-out', () => {
    const html = renderToStaticMarkup(createElement(ProductLanding, { product: 'pursuit' }));
    expect(html).toContain('Find the opening.');
    expect(html).toContain('Build the possibility.');
    expect(html).toContain('/do/world/atelier-poster.png');
    expect(html).toContain('https://assembl-pursuit.katecoveny.chatgpt.site');
    expect(html).toContain('/llms.txt');
    expect(html).toContain('href="/do"');
    expect(html).toContain('href="/creative-studio"');
    expect(html).not.toContain('/pursuit/playground');
    expect(html).not.toContain('/cinematic-nature/');
    expect(html).not.toContain('ocean-assembly');
    expect(html).not.toContain('/studio/do-maker');
  });
  it('does not turn company contact and about into an ornamental watch', () => {
    for (const path of ['/contact', '/about']) {
      state.path = path;
      expect(renderToStaticMarkup(createElement(PublicWatchFrame, null, 'Company content'))).not.toContain('WATCH SCENE');
    }
  });
  it('explains the current products without unverified hosting or compliance claims', () => {
    const html = renderToStaticMarkup(createElement(AboutPage));
    for (const product of ['Pursuit', 'DO', 'Studio', 'Factory']) expect(html).toContain(product);
    expect(html).not.toContain('NZ agency');
    expect(html).not.toContain('NZ Privacy Act compliant');
    expect(html).not.toContain('NZ-hosted');
  });
  it('keeps contact canonical and about the job rather than mandatory waiting', () => {
    expect(contactMetadata.alternates?.canonical).toBe('/contact');
    const html = renderToStaticMarkup(createElement(ContactForm));
    expect(html).not.toContain('The wait you want to make useful');
    expect(html).toContain('you press Send');
  });
});
