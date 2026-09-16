import { beforeEach, describe, expect, it } from 'vitest';

import { GET, POST } from '@/app/api/tools/nz-compliance-ping/route';
import { _resetToolStoreForTests } from '@/lib/tools/store';

describe('POST /api/tools/nz-compliance-ping', () => {
  beforeEach(() => {
    _resetToolStoreForTests();
  });

  it('sandbox success with test_ key', async () => {
    const res = await POST(
      new Request('http://localhost/api/tools/nz-compliance-ping', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test_compliance_ping_ok',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ company: 'assembl' }),
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      ok: boolean;
      data: {
        status: string;
        nzbn: string | null;
        flags: unknown[];
        sandbox: boolean;
        disclaimer: string;
      };
      meta: { environment: string; receiptId: string };
    };
    expect(json.ok).toBe(true);
    expect(json.data.status).toBe('ok');
    expect(json.data.sandbox).toBe(true);
    expect(json.data.nzbn).toBeTruthy();
    expect(json.data.flags.length).toBeGreaterThan(0);
    expect(json.data.disclaimer.toLowerCase()).toMatch(/not legal/);
    expect(json.meta.environment).toBe('sandbox');
    expect(json.meta.receiptId).toMatch(/^rct_/);
  });

  it('401 without key', async () => {
    const res = await POST(
      new Request('http://localhost/api/tools/nz-compliance-ping', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ company: 'assembl' }),
      }),
    );
    expect(res.status).toBe(401);
  });

  it('400 without company', async () => {
    const res = await POST(
      new Request('http://localhost/api/tools/nz-compliance-ping', {
        method: 'POST',
        headers: {
          'x-assembl-tool-key': 'test_compliance_validation',
          'content-type': 'application/json',
        },
        body: JSON.stringify({}),
      }),
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: { code: string } };
    expect(json.error.code).toBe('validation_error');
  });

  it('503 on live key when NZBN unset', async () => {
    const { getToolStore } = await import('@/lib/tools/store');
    const { hashToolKey } = await import('@/lib/tools/keys');
    const store = getToolStore();
    const raw = 'live_compliance_ping_503';
    await store.upsertKey({
      id: 'atk_livecomp503',
      keyHash: hashToolKey(raw),
      keyPrefix: 'live_com…503',
      label: 'live-compliance-test',
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
      new Request('http://localhost/api/tools/nz-compliance-ping', {
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

describe('GET /api/tools/nz-compliance-ping', () => {
  beforeEach(() => {
    _resetToolStoreForTests();
  });

  it('returns health + demo key', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      ok: boolean;
      tool: string;
      auth: { demo_test_key: string };
    };
    expect(json.ok).toBe(true);
    expect(json.tool).toBe('nz-compliance-ping');
    expect(json.auth.demo_test_key.startsWith('test_')).toBe(true);
  });
});
