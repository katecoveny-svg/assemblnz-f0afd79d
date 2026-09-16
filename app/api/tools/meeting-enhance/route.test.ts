import { beforeEach, describe, expect, it } from 'vitest';

import { GET, POST } from '@/app/api/tools/meeting-enhance/route';
import { _resetToolStoreForTests } from '@/lib/tools/store';

const SAMPLE =
  'Alex will ship the checklist by Friday. We agreed to launch next week. Budget is still open and needs a human confirm.';

describe('POST /api/tools/meeting-enhance', () => {
  beforeEach(() => {
    _resetToolStoreForTests();
  });

  it('sandbox success with test_ key', async () => {
    const res = await POST(
      new Request('http://localhost/api/tools/meeting-enhance', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test_meeting_enhance_ok',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Sprint sync', transcript: SAMPLE }),
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      ok: boolean;
      data: {
        status: string;
        actions: unknown[];
        decisions: unknown[];
        sandbox: boolean;
        draftsOnly: boolean;
      };
      meta: { environment: string; receiptId: string };
    };
    expect(json.ok).toBe(true);
    expect(json.data.status).toBe('ok');
    expect(json.data.sandbox).toBe(true);
    expect(json.data.draftsOnly).toBe(true);
    expect(json.data.actions.length).toBeGreaterThan(0);
    expect(json.data.decisions.length).toBeGreaterThan(0);
    expect(json.meta.environment).toBe('sandbox');
    expect(json.meta.receiptId).toMatch(/^rct_/);
  });

  it('401 without key', async () => {
    const res = await POST(
      new Request('http://localhost/api/tools/meeting-enhance', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ transcript: SAMPLE }),
      }),
    );
    expect(res.status).toBe(401);
  });

  it('400 without transcript', async () => {
    const res = await POST(
      new Request('http://localhost/api/tools/meeting-enhance', {
        method: 'POST',
        headers: {
          'x-assembl-tool-key': 'test_meeting_validation',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Empty' }),
      }),
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: { code: string } };
    expect(json.error.code).toBe('validation_error');
  });
});

describe('GET /api/tools/meeting-enhance', () => {
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
    expect(json.tool).toBe('meeting-enhance');
    expect(json.auth.demo_test_key.startsWith('test_')).toBe(true);
  });
});
