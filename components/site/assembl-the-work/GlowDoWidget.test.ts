import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GlowDoWidget } from './GlowDoWidget';

vi.mock('next/dynamic', () => ({ default: () => () => null }));

afterEach(() => vi.unstubAllGlobals());

describe('DO companion hydration', () => {
  it('has the same first render on the server and a first-visit browser', () => {
    const server = renderToStaticMarkup(createElement(GlowDoWidget));
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', { getItem: () => null });
    const browser = renderToStaticMarkup(createElement(GlowDoWidget));
    expect(browser).toBe(server);
  });
});
