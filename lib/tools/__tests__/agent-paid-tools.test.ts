import { describe, expect, it, beforeEach } from 'vitest';

import { extractToolApiKey } from '@/lib/tools/auth';
import { assertUnderDailyCap, utcDay } from '@/lib/tools/cap';
import { ToolHttpError } from '@/lib/tools/errors';
import { hashToolKey, issueToolKey } from '@/lib/tools/keys';
import { isSandboxKey, detectEnvironment } from '@/lib/tools/sandbox';
import { _resetToolStoreForTests, getToolStore, resolveToolKey } from '@/lib/tools/store';
import { parseWhoRunsItInput, runWhoRunsIt } from '@/lib/tools/nz-who-runs-it/lookup';
import { sandboxWhoRunsIt } from '@/lib/tools/nz-who-runs-it/fixtures';
import { NzbnClient } from '@/lib/tools/nz-who-runs-it/nzbn-client';

describe('sandbox detector', () => {
  it('treats test_ prefix as sandbox', () => {
    expect(isSandboxKey('test_abc')).toBe(true);
    expect(isSandboxKey('TEST_abc')).toBe(true);
    expect(isSandboxKey('live_abc')).toBe(false);
    expect(detectEnvironment('test_x')).toBe('sandbox');
    expect(detectEnvironment('live_x')).toBe('live');
  });
});

describe('auth header extraction', () => {
  it('reads Bearer and X-Assembl-Tool-Key', () => {
    expect(
      extractToolApiKey(new Headers({ authorization: 'Bearer test_one' })),
    ).toBe('test_one');
    expect(
      extractToolApiKey(new Headers({ 'x-assembl-tool-key': 'test_two' })),
    ).toBe('test_two');
  });

  it('errors clearly when missing', () => {
    expect(() => extractToolApiKey(new Headers())).toThrow(ToolHttpError);
  });
});

describe('nz-who-runs-it sandbox fixtures', () => {
  it('returns assembl fixture', () => {
    const r = sandboxWhoRunsIt('assembl');
    expect(r.status).toBe('ok');
    expect(r.nzbn).toBe('9429053514950');
    expect(r.sandbox).toBe(true);
    expect(r.sourceLinks.length).toBeGreaterThan(0);
  });

  it('returns not_found for unknown sandbox query', () => {
    const r = sandboxWhoRunsIt('definitely-not-a-fixture-zz');
    expect(r.status).toBe('not_found');
    expect(r.sandbox).toBe(true);
  });
});

describe('parseWhoRunsItInput', () => {
  it('requires company', () => {
    expect(() => parseWhoRunsItInput({})).toThrow(ToolHttpError);
    expect(parseWhoRunsItInput({ company: '  assembl  ' }).company).toBe('assembl');
  });
});

describe('runWhoRunsIt live without key', () => {
  it('returns honest 503-shaped ToolHttpError', async () => {
    const client = new NzbnClient({ apiKey: '' });
    await expect(
      runWhoRunsIt({ company: 'assembl' }, { sandbox: false, client }),
    ).rejects.toMatchObject({ code: 'upstream_unconfigured', status: 503 });
  });
});

describe('runWhoRunsIt live with mock fetch', () => {
  it('maps NZBN entity without inventing directors', async () => {
    const fetchImpl = async () =>
      new Response(
        JSON.stringify({
          nzbn: '9429053514950',
          entityName: 'assembl NZ Limited',
          entityStatusDescription: 'Registered',
          entityTypeDescription: 'NZ Limited Company',
          roles: [],
          addresses: [],
        }),
        { status: 200 },
      );
    const client = new NzbnClient({ apiKey: 'fake', fetchImpl: fetchImpl as typeof fetch });
    const result = await runWhoRunsIt(
      { company: '9429053514950' },
      { sandbox: false, client },
    );
    expect(result.status).toBe('partial');
    expect(result.legalName).toBe('assembl NZ Limited');
    expect(result.directors).toEqual([]);
    expect(result.sandbox).toBe(false);
    expect(result.gaps.length).toBeGreaterThan(0);
  });
});

describe('keys + daily cap + receipts store', () => {
  beforeEach(() => {
    _resetToolStoreForTests();
  });

  it('resolves open test keys and enforces cap', async () => {
    const key = await resolveToolKey('test_cap_me_please');
    expect(key.environment).toBe('sandbox');
    expect(key.keyHash).toBe(hashToolKey('test_cap_me_please'));

    const store = getToolStore();
    key.dailyCapCents = 2;
    key.unitCostCents = 1;
    await store.upsertKey(key);

    await assertUnderDailyCap(store, key);
    await store.addSpend(key.id, utcDay(), 1);
    await assertUnderDailyCap(store, key);
    await store.addSpend(key.id, utcDay(), 1);
    await expect(assertUnderDailyCap(store, key)).rejects.toMatchObject({
      code: 'daily_cap_exceeded',
      status: 429,
    });
  });

  it('rejects unknown live keys', async () => {
    await expect(resolveToolKey('live_unknown_secret')).rejects.toMatchObject({
      code: 'invalid_api_key',
    });
  });

  it('issues hashed keys without storing raw secret on record', () => {
    const { rawKey, record } = issueToolKey({ environment: 'sandbox' });
    expect(rawKey.startsWith('test_')).toBe(true);
    expect(record.keyHash).toBe(hashToolKey(rawKey));
    expect(JSON.stringify(record)).not.toContain(rawKey);
  });
});
