import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CommandPalette, PUBLIC_COMMAND_PAGES } from './CommandPalette';
import nextConfig from '../../next.config';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
// Render the closed portal contents to inspect the public choices in a node test.
vi.mock('@radix-ui/react-dialog', () => {
  const wrap = ({ children }: { children?: import('react').ReactNode }) => createElement('div', null, children);
  return { Root: wrap, Portal: wrap, Overlay: () => null, Content: wrap, Title: wrap,
    Close: (props: { children?: import('react').ReactNode; 'aria-label'?: string }) => createElement('button', { 'aria-label': props['aria-label'] }, props.children) };
});
vi.mock('cmdk', () => {
  const wrap = ({ children }: { children?: import('react').ReactNode }) => createElement('div', null, children);
  return { Command: Object.assign(wrap, { List: wrap, Group: wrap, Item: wrap, Empty: wrap,
    Input: (props: { 'aria-label'?: string; placeholder?: string }) => createElement('input', { 'aria-label': props['aria-label'], placeholder: props.placeholder }) }) };
});

describe('public command destinations', () => {
  it('offers only the current public doors, without registry destinations', () => {
    expect(PUBLIC_COMMAND_PAGES.map(page => page.href)).toEqual(['/', '/pursuit', '/do', '/creative-studio', '/contact']);
    const html = renderToStaticMarkup(createElement(CommandPalette));
    for (const page of PUBLIC_COMMAND_PAGES) expect(html).toContain(page.label);
    for (const retired of ['Kete packs', 'Specialist agents', 'SPARK', 'Founder', 'Pricing', 'Evidence pack', 'Arataki', 'Help and FAQs', '<img']) expect(html).not.toContain(retired);
    expect(html).toContain('aria-label="Search assembl"');
    expect(html).toContain('aria-label="Close command palette"');
  });
  it('redirects only the exact retired evidence overview to the homepage', async () => {
    const redirects = await nextConfig.redirects!();
    expect(redirects.filter(route => route.source.startsWith('/evidence-pack'))).toEqual([
      { source: '/evidence-pack', destination: '/', permanent: true },
    ]);
  });
});
