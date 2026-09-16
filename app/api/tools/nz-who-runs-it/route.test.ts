import { beforeEach, describe, expect, it } from 'vitest';

import { GET, POST } from '@/app/api/tools/nz-who-runs-it/route';
import { GET as getReceipts } from '@/app/api/tools/keys/[id]/receipts/route';
import { _resetToolStoreForTests } from '@/lib/tools/store';

describe('POST /api/tools/nz-who-runs-it', () => {
  beforeEach(() => {
    _resetToolStoreForTests();
  });

  it('sandbox success with test_ key', async () => {
    const res = await POST(
      new Request('http://localhost/api/tools/nz-who-runs-it', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test_route_success',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ company: 'assembl' }),
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      ok: boolean;
      data: { status: string; nzbn: string | null; sandbox: boolean };
      meta: { keyId: string; receiptId: string; environment: string };
    };
    expect(json.ok).toBe(true);
    expect(json.data.status).toBe('ok');
    expect(json.data.nzbn).toBe('9429053514950');
    expect(json.data.sandbox).toBe(true);
    expect(json.meta.environment).toBe('sandbox');
    expect(json.meta.receiptId).toMatch(/^rct_/);

    const receipts = await getReceipts(
      new Request(`http://localhost/api/tools/keys/${json.meta.keyId}/receipts?format=json`),
      { params: Promise.resolve({ id: json.meta.keyId }) },
    );
    expect(receipts.status).toBe(200);
    const body = (await receipts.json()) as { receipts: unknown[] };
    expect(body.receipts.length).toBe(1);
  });

  it('401 without key', async () => {
    const res = await POST(
      new Request('http://localhost/api/tools/nz-who-runs-it', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ company: 'assembl' }),
      }),
    );
    expect(res.status).toBe(401);
    const json = (await res.json()) as { error: { code: string; fix: string } };
    expect(json.error.code).toBe('missing_api_key');
    expect(json.error.fix.length).toBeGreaterThan(10);
  });

  it('400 without company', async () => {
    const res = await POST(
      new Request('http://localhost/api/tools/nz-who-runs-it', {
        method: 'POST',
        headers: {
          'x-assembl-tool-key': 'test_validation',
          'content-type': 'application/json',
        },
        body: JSON.stringify({}),
      }),
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: { code: string } };
    expect(json.error.code).toBe('validation_error');
  });

  it('503 on live key path when NZBN unset and key is registered', async () => {
    // Register a live key via seed-shaped upsert through open path is blocked;
    // use store directly.
    const { getToolStore } = await import('@/lib/tools/store');
    const { hashToolKey } = await import('@/lib/tools/keys');
    const store = getToolStore();
    const raw = 'live_registered_for_503_test';
    await store.upsertKey({
      id: 'atk_live503test',
      keyHash: hashToolKey(raw),
      keyPrefix: 'live_reg…test',
      label: 'live-test',
      environment: 'live',
      dailyCapCents: 100,
      unitCostCents: 1,
      createdAt: new Date().toISOString(),
      revokedAt: null,
    });

    const prev = process.env.NZBN_API_KEY;
    const prevToken = process.env.NZBN_API_TOKEN;
    delete process.env.NZBN_API_KEY;
    delete process.env.NZBN_API_TOKEN;

    const res = await POST(
      new Request('http://localhost/api/tools/nz-who-runs-it', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${raw}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ company: 'assembl' }),
      }),
    );
    expect(res.status).toBe(503);
    const json = (await res.json()) as { error: { code: string } };
    expect(json.error.code).toBe('upstream_unconfigured');

    if (prev !== undefined) process.env.NZBN_API_KEY = prev;
    if (prevToken !== undefined) process.env.NZBN_API_TOKEN = prevToken;
  });
});

describe('GET /api/tools/nz-who-runs-it', () => {
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
    };
    expect(json.ok).toBe(true);
    expect(json.tool).toBe('nz-who-runs-it');
    expect(json.docs).toBe('/tools/nz-who-runs-it');
    expect(json.auth.demo_test_key.startsWith('test_')).toBe(true);
  });
});
