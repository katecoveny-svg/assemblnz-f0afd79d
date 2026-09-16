import { beforeEach, describe, expect, it } from 'vitest';

import { GET, POST } from '@/app/api/tools/nz-trade-finder/route';
import { _resetToolStoreForTests } from '@/lib/tools/store';

describe('POST /api/tools/nz-trade-finder', () => {
  beforeEach(() => {
    _resetToolStoreForTests();
  });

  it('sandbox success with test_ key', async () => {
    const res = await POST(
      new Request('http://localhost/api/tools/nz-trade-finder', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test_trade_finder_ok',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ city: 'Wellington', trade: 'plumber', limit: 5 }),
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      ok: boolean;
      data: {
        status: string;
        results: Array<{ tradingName: string }>;
        sandbox: boolean;
        gaps: string[];
      };
      meta: { environment: string; receiptId: string };
    };
    expect(json.ok).toBe(true);
    expect(json.data.status).toBe('ok');
    expect(json.data.sandbox).toBe(true);
    expect(json.data.results.length).toBeGreaterThan(0);
    expect(json.data.gaps.some((g) => /sandbox/i.test(g))).toBe(true);
    expect(json.meta.environment).toBe('sandbox');
    expect(json.meta.receiptId).toMatch(/^rct_/);
  });

  it('401 without key', async () => {
    const res = await POST(
      new Request('http://localhost/api/tools/nz-trade-finder', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ city: 'Wellington', trade: 'plumber' }),
      }),
    );
    expect(res.status).toBe(401);
    const json = (await res.json()) as { error: { code: string; fix: string } };
    expect(json.error.code).toBe('missing_api_key');
    expect(json.error.fix.length).toBeGreaterThan(10);
  });

  it('400 without city/trade', async () => {
    const res = await POST(
      new Request('http://localhost/api/tools/nz-trade-finder', {
        method: 'POST',
        headers: {
          'x-assembl-tool-key': 'test_trade_validation',
          'content-type': 'application/json',
        },
        body: JSON.stringify({}),
      }),
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: { code: string } };
    expect(json.error.code).toBe('validation_error');
  });

  it('503 on live key when live search is stubbed', async () => {
    const { getToolStore } = await import('@/lib/tools/store');
    const { hashToolKey } = await import('@/lib/tools/keys');
    const store = getToolStore();
    const raw = 'live_trade_finder_503';
    await store.upsertKey({
      id: 'atk_livetrade503',
      keyHash: hashToolKey(raw),
      keyPrefix: 'live_tra…503',
      label: 'live-trade-test',
      environment: 'live',
      dailyCapCents: 100,
      unitCostCents: 1,
      createdAt: new Date().toISOString(),
      revokedAt: null,
    });

    const res = await POST(
      new Request('http://localhost/api/tools/nz-trade-finder', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${raw}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ city: 'Wellington', trade: 'plumber' }),
      }),
    );
    expect(res.status).toBe(503);
    const json = (await res.json()) as { error: { code: string; fix: string } };
    expect(json.error.code).toBe('upstream_unconfigured');
    expect(json.error.fix.toLowerCase()).toMatch(/test_|sandbox|nzbn/);
  });
});

describe('GET /api/tools/nz-trade-finder', () => {
  beforeEach(() => {
    _resetToolStoreForTests();
  });

  it('returns health + demo key', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      ok: boolean;
      tool: string;
      docs: string;
      auth: { demo_test_key: string };
      upstream: { live_status: string };
    };
    expect(json.ok).toBe(true);
    expect(json.tool).toBe('nz-trade-finder');
    expect(json.docs).toBe('/tools/nz-trade-finder');
    expect(json.auth.demo_test_key.startsWith('test_')).toBe(true);
    expect(json.upstream.live_status).toMatch(/stub/i);
  });
});
