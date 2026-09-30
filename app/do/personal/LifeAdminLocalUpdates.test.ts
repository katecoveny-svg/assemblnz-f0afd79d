import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LifeAdminLocalUpdates } from './LifeAdminLocalUpdates';

describe('public information client boundary', () => {
  it('retains same-origin deployment access without permitting cross-origin credentialed fetches', () => {
    const source = readFileSync('app/do/personal/LifeAdminLocalUpdates.tsx', 'utf8');
    expect(source).toContain("credentials: 'same-origin'");
    expect(source).toContain("mode: 'same-origin'");
    expect(source).not.toContain("credentials: 'omit'");
    expect(source).not.toContain("credentials: 'include'");
    expect(source).toContain('/api/do/nz-local-updates?source=weather&place=');
    expect(source).toContain('/api/do/nz-local-updates?source=geonet-news');
    const traffic = readFileSync('app/do/personal/LifeAdminTraffic.tsx', 'utf8');
    expect(traffic).not.toContain("credentials: 'omit'");
  });
  it('requires an explicit city check and keeps emergency destinations visible without provider data', () => {
    const html = renderToStaticMarkup(createElement(LifeAdminLocalUpdates));
    expect(html).toContain('Choose a city or town');
    expect(html).toContain('Check city forecast');
    expect(html).toContain('disabled=""');
    expect(html).toContain('The city choice is not saved');
    expect(html).toContain('href="tel:111"');
    expect(html).toContain('DO does not monitor emergencies');
    expect(html).not.toContain('Retrieved from source');
  });
});
