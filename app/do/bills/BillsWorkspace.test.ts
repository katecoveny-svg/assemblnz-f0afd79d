import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { BillsWorkspace } from './BillsWorkspace';

vi.mock('next/navigation', () => ({ usePathname: () => '/do/bills' }));

describe('Bills entry and connection honesty', () => {
  it('renders a fictional household with separate checked dates, estimates and no connected claim', () => {
    const html = renderToStaticMarkup(createElement(BillsWorkspace));
    expect(html).toContain('FICTIONAL HOUSEHOLD');
    expect(html).toContain('No bank connected');
    expect(html).toContain('NZD');
    expect(html).toContain('733.50');
    expect(html).toContain('This is not an invoice due date.');
    expect(html).toContain('Checked due date');
    expect(html).toContain('Start with my own bills');
    expect(html).toContain('Prepare a charge enquiry');
    expect(html).toContain('Prepare renewal questions');
    expect(html).toContain('type="file"');
    expect(html).toContain('href="/do/bills/compare"');
    expect(html).toContain('aria-label="DO home"');
    expect(html).not.toMatch(/<button[^>]*>(?:Connect bank|Pay now|Switch now|Send)/);
  });
});
