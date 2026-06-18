import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dash } from './index';

const ENDPOINT = 'https://test.local/api/dash';

const AD = {
  id: 'camp-1',
  text: 'Air New Zealand Business — fly the main centres for less.',
  ctaUrl: 'https://airnewzealand.co.nz/',
  impressionId: 'imp-1',
};

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response;
}

describe('@assembl/dash-sdk', () => {
  beforeEach(() => {
    dash.init({ publisherId: 'assembl-hapai', endpoint: ENDPOINT });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requires publisherId on init', () => {
    expect(() => dash.init({ publisherId: '' })).toThrow();
  });

  it('show() returns a fully-formed ad', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(AD)));
    const ad = await dash.show({ surface: 'spinner', context: { tool: 'manaaki' } });
    expect(ad).toEqual(AD);
  });

  it('TRUST CONTRACT: show() sends ONLY publisherId, surface and context', async () => {
    const fetchMock = vi.fn((_input: string, _init?: RequestInit) => Promise.resolve(jsonResponse(AD)));
    vi.stubGlobal('fetch', fetchMock);
    await dash.show({ surface: 'spinner', context: { tool: 'manaaki' } });

    const init = fetchMock.mock.calls[0]![1];
    const sent = JSON.parse(String(init?.body));
    expect(Object.keys(sent).sort()).toEqual(['context', 'publisherId', 'surface']);
    expect(sent).toEqual({
      publisherId: 'assembl-hapai',
      surface: 'spinner',
      context: { tool: 'manaaki' },
    });
  });

  it('show() returns null on an empty auction (non-ok response)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(null, false, 204)));
    expect(await dash.show({ surface: 'spinner' })).toBeNull();
  });

  it('show() returns null on a malformed ad', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ text: 'no ids here' })));
    expect(await dash.show({ surface: 'spinner' })).toBeNull();
  });

  it('show() never throws — network error resolves to null', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    expect(await dash.show({ surface: 'spinner' })).toBeNull();
  });

  it('show() throws before init', async () => {
    // Re-import a fresh module so config is unset.
    vi.resetModules();
    const { dash: fresh } = await import('./index');
    await expect(fresh.show({ surface: 'spinner' })).rejects.toThrow();
  });

  it('click() navigates to the tracking redirect', () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { assign });
    dash.click('imp-1');
    expect(assign).toHaveBeenCalledWith(`${ENDPOINT}/click?i=imp-1`);
  });

  it('dismiss() sends a beacon', () => {
    const sendBeacon = vi.fn(() => true);
    vi.stubGlobal('navigator', { sendBeacon });
    dash.dismiss('imp-1');
    expect(sendBeacon).toHaveBeenCalledWith(`${ENDPOINT}/dismiss`, JSON.stringify({ impressionId: 'imp-1' }));
  });
});
