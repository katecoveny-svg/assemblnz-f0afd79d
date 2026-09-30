import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NzCareNavigation } from './NzCareNavigation';

describe('NZ care navigation presentation', () => {
  it('renders emergency and Healthline links for guests before any disclosure or checklist', () => {
    const html = renderToStaticMarkup(createElement(NzCareNavigation));
    expect(html).toContain('href="tel:111"');
    expect(html).toContain('href="tel:0800611116"');
    expect(html.indexOf('href="tel:111"')).toBeLessThan(html.indexOf('<details'));
    expect(html.indexOf('href="tel:0800611116"')).toBeLessThan(html.indexOf('<select'));
    expect(html).toContain('DO does not monitor emergencies or place calls');
    expect(html).not.toContain('Sign in');
  });
  it('has an accessible topic selector, checkboxes, text sizing and sourced preparation', () => {
    const html = renderToStaticMarkup(createElement(NzCareNavigation, { storageScope: 'owner-a' }));
    expect(html.match(/<option /g)).toHaveLength(8);
    expect(html.match(/type="checkbox"/g)).toHaveLength(4);
    expect(html).toContain('Larger text');
    expect(html).toContain('One step at a time');
    expect(html).toContain('Questions to ask');
    expect(html).toContain('Documents to keep privately');
    expect(html).toContain('Guidance checked 30 September 2026');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('role="status"');
    expect(html).not.toMatch(/<textarea|type="text"|type="file"/);
  });
  it('does not persist topic/health data or request providers and remounts on scope change', () => {
    const source = readFileSync('app/do/personal/NzCareNavigation.tsx', 'utf8');
    expect(source).toContain('<NzCareWorkspace key={storageScope} />');
    expect(source).not.toMatch(/\bfetch\s*\(|localStorage|sessionStorage|sendBeacon|XMLHttpRequest/);
    expect(source).toContain('nzCareChecklistText(guide, checked)');
    expect(source).toContain('setTimeout(() => URL.revokeObjectURL(url)');
    expect(source).toContain('Any future use of sensitive details');
    expect(source).toContain('requires registration before it will work');
  });
});
