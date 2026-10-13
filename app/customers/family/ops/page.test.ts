import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { FAMILY_DEMO } from '@/lib/family/demo';
import FamilyOpsPage from './page';

// Any accidental return to cookie-selected fixtures or live storage fails before a read.
vi.mock('next/headers', () => ({ cookies: vi.fn(() => { throw new Error('Demo must not read identity/presentation cookies'); }) }));
vi.mock('@/lib/family/store', () => ({ listFamily: vi.fn(() => { throw new Error('Demo must not load stored family data'); }) }));
vi.mock('@/lib/customers/auckland-dog-trainer/genome-store', () => ({ getGenomeFactsFor: vi.fn(() => { throw new Error('Demo must not load stored genome data'); }) }));
vi.mock('@/lib/family/profiles', () => { throw new Error('Personal fixture module must not enter demo runtime'); });
vi.mock('@/lib/customers/family/genome', () => { throw new Error('Legacy family genome must not enter demo runtime'); });

describe('synthetic-only family demo', () => {
  it.each([undefined, '', '0', '1', 'false', 'true', 'arbitrary'])('cookie value %s cannot select personal profiles', async cookie => {
    vi.stubGlobal('document', { cookie: `family_demo_mode=${cookie ?? ''}` });
    const page = await FamilyOpsPage({ searchParams: Promise.resolve({ tab: 'week' }) });
    const html = renderToStaticMarkup(page);
    for (const person of FAMILY_DEMO.people) expect(html).toContain(person.name);
    expect(html).toContain('read-only demonstration');
    expect(html).not.toContain('<form');
    vi.unstubAllGlobals();
  });
  it.each(['week', 'rides', 'kitchen', 'money', 'inbox', 'genome', 'private', '__proto__'])('tab %s has no data or action capability', async tab => {
    const html = renderToStaticMarkup(await FamilyOpsPage({ searchParams: Promise.resolve({ tab }) }));
    expect(html).toContain('Every profile and example on this page is synthetic');
    expect(html).not.toContain('<form');
    expect(html).not.toContain('type="submit"');
  });
  it('keeps every synthetic section reachable in the shell navigation', () => {
    const source = readFileSync(new URL('./layout.tsx', import.meta.url), 'utf8');
    const tabs = [...source.matchAll(/\['[^']+', '\?tab=([^']+)'\]/g)].map(match => match[1]);
    expect(tabs).toEqual(Object.keys(FAMILY_DEMO.sections));
  });
  it('keeps the page dependency boundary limited to navigation and synthetic data', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
    const imports = [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(match => match[1]);
    expect(imports).toEqual(['next/link', '@/lib/family/demo']);
    const fixtures = readFileSync(new URL('../../../../lib/family/demo.ts', import.meta.url), 'utf8');
    expect(fixtures).not.toMatch(/\bimport\b|cookies\(|fetch\(/);
  });
});
