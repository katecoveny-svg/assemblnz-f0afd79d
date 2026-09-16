import { beforeEach, describe, expect, it } from 'vitest';

import { GET as catalogue } from '@/app/api/do/action/route';
import { POST as prepare } from '@/app/api/do/action/prepare/route';
import { POST as permit } from '@/app/api/do/action/permit/route';
import { POST as execute } from '@/app/api/do/action/execute/route';
import { POST as verify } from '@/app/api/do/action/verify/route';
import { POST as receipt, GET as getReceipt } from '@/app/api/do/action/receipt/route';
import { POST as waitPost } from '@/app/api/do/action/wait/route';
import { _resetActionCloudStoreForTests } from '@/lib/do/action-cloud/store';
import { validateUniversalResponse } from '@/lib/do/action-contract';

async function json(res: Response) {
  return res.json() as Promise<Record<string, unknown>>;
}

describe('POST /api/do/action/*', () => {
  beforeEach(() => {
    _resetActionCloudStoreForTests();
  });

  it('catalogue lists demo.echo', async () => {
    const res = await catalogue();
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.live_production).toBe(false);
    expect(body.phase).toBe(1);
  });

  it('full happy path via HTTP', async () => {
    const prepRes = await prepare(
      new Request('http://localhost/api/do/action/prepare', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action_name: 'echo',
          namespace: 'demo',
          args: { message: 'route-ok' },
          idempotency_key: 'idem_http_happy_01',
          tenant_id: 'ten_http',
        }),
      }),
    );
    const prep = await json(prepRes);
    expect(prep.ok).toBe(true);
    expect(validateUniversalResponse(prep).ok).toBe(true);

    const permitRes = await permit(
      new Request('http://localhost/api/do/action/permit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prep_id: prep.prep_id }),
      }),
    );
    const prm = await json(permitRes);
    expect(prm.ok).toBe(true);

    const execRes = await execute(
      new Request('http://localhost/api/do/action/execute', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          prep_id: prep.prep_id,
          permit_id: prm.permit_id,
          idempotency_key: 'idem_http_happy_01',
        }),
      }),
    );
    const exec = await json(execRes);
    expect(exec.ok).toBe(true);
    expect((exec.result as { echo: string }).echo).toBe('route-ok');

    const verifyRes = await verify(
      new Request('http://localhost/api/do/action/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action_id: prep.action_id, checks: ['result_present'] }),
      }),
    );
    expect((await json(verifyRes)).ok).toBe(true);

    const receiptRes = await receipt(
      new Request('http://localhost/api/do/action/receipt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action_id: prep.action_id }),
      }),
    );
    const rcp = await json(receiptRes);
    expect(rcp.ok).toBe(true);
    expect(rcp.receipt_id).toMatch(/^rcp_/);

    const getRes = await getReceipt(
      new Request(`http://localhost/api/do/action/receipt?action_id=${prep.action_id}`),
    );
    expect((await json(getRes)).receipt_id).toBe(rcp.receipt_id);
  });

  it('HTTP rejects hash mismatch and receipt-before-execute', async () => {
    const prepRes = await prepare(
      new Request('http://localhost/api/do/action/prepare', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action_name: 'echo',
          namespace: 'demo',
          args: { message: 'lock-me' },
          tenant_id: 'ten_http',
        }),
      }),
    );
    const prep = await json(prepRes);

    const earlyReceipt = await receipt(
      new Request('http://localhost/api/do/action/receipt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action_id: prep.action_id }),
      }),
    );
    const earlyBody = await json(earlyReceipt);
    expect(earlyBody.ok).toBe(false);
    expect((earlyBody.errors as { code: string }[])[0]?.code).toBe('receipt_before_execute');

    const permitRes = await permit(
      new Request('http://localhost/api/do/action/permit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prep_id: prep.prep_id }),
      }),
    );
    const prm = await json(permitRes);

    const badExec = await execute(
      new Request('http://localhost/api/do/action/execute', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          prep_id: prep.prep_id,
          permit_id: prm.permit_id,
          args: { message: 'nope' },
        }),
      }),
    );
    const badBody = await json(badExec);
    expect(badBody.ok).toBe(false);
    expect((badBody.errors as { code: string }[])[0]?.code).toBe('args_hash_mismatch');
    expect(badExec.status).toBe(403);
  });

  it('wait register via HTTP', async () => {
    const prep = await json(
      await prepare(
        new Request('http://localhost/api/do/action/prepare', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            action_name: 'echo',
            namespace: 'demo',
            args: { message: 'wait' },
            tenant_id: 'ten_http',
          }),
        }),
      ),
    );
    const prm = await json(
      await permit(
        new Request('http://localhost/api/do/action/permit', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ prep_id: prep.prep_id }),
        }),
      ),
    );
    await execute(
      new Request('http://localhost/api/do/action/execute', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prep_id: prep.prep_id, permit_id: prm.permit_id }),
      }),
    );

    const waitRes = await waitPost(
      new Request('http://localhost/api/do/action/wait', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action_id: prep.action_id, kind: 'external_confirmation' }),
      }),
    );
    const waitBody = await json(waitRes);
    expect(waitBody.ok).toBe(true);
    expect(waitBody.status).toBe('waiting');
  });
});
