import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TaskDoMakerClient } from './TaskDoMakerClient';
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
afterEach(() => vi.useRealTimers());
describe('Task DO Maker hydration', () => {
  it('renders the same initial draft from the server seed at different render times', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-17T00:00:00Z'));
    const props = { initialIdentity: { id: 'dc507bd9-a6d5-494a-8a2e-82c9b911c8d0', createdAt: '2026-09-17T00:00:00Z' } };
    const server = renderToStaticMarkup(createElement(TaskDoMakerClient, props));
    vi.setSystemTime(new Date('2026-09-17T00:00:03Z'));
    expect(renderToStaticMarkup(createElement(TaskDoMakerClient, props))).toBe(server);
  });
});
