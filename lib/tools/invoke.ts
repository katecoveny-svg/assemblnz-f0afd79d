import { extractToolApiKey } from './auth';
import { assertUnderDailyCap, recordSuccessfulSpend } from './cap';
import { ToolHttpError, toolErrorResponse } from './errors';
import { writeToolReceipt } from './receipts';
import { getToolStore, resolveToolKey } from './store';
import type { ToolEnvironment, ToolKeyRecord, ToolReceipt } from './types';

export type ToolInvokeSuccess<T> = {
  ok: true;
  data: T;
  meta: {
    keyId: string;
    environment: ToolEnvironment;
    receiptId: string;
    unitCostCents: number;
    spentCentsToday: number;
    dailyCapCents: number;
  };
};

/**
 * Shared gate for agent-paid tool POST handlers:
 * extract key → resolve → revoke check → daily cap → run → receipt + spend.
 * Failures that throw ToolHttpError become structured JSON errors.
 */
export async function invokePaidTool<TInput, TResult extends { status: string }>(opts: {
  request: Request;
  toolSlug: string;
  parseInput: (body: unknown) => TInput;
  run: (input: TInput, ctx: { key: ToolKeyRecord; environment: ToolEnvironment }) => Promise<TResult>;
  summarizeRequest: (input: TInput) => Record<string, unknown>;
  summarizeResponse: (result: TResult) => Record<string, unknown>;
  /** Charge + receipt only when status is one of these (default: ok|partial|not_found). */
  billableStatuses?: string[];
}): Promise<Response> {
  try {
    if (opts.request.method !== 'POST') {
      throw new ToolHttpError({
        status: 405,
        code: 'method_not_allowed',
        message: `Use POST for ${opts.toolSlug}.`,
        fix: `POST JSON to this URL. GET returns health + docs pointer.`,
      });
    }

    const rawKey = extractToolApiKey(opts.request.headers);
    const key = await resolveToolKey(rawKey);
    if (key.revokedAt) {
      throw new ToolHttpError({
        status: 401,
        code: 'key_revoked',
        message: 'API key has been revoked.',
        fix: 'Issue a new key. Revoked keys cannot call tools.',
      });
    }

    const store = getToolStore();
    await assertUnderDailyCap(store, key);

    let body: unknown;
    try {
      body = await opts.request.json();
    } catch {
      throw new ToolHttpError({
        status: 400,
        code: 'invalid_json',
        message: 'Request body must be JSON.',
        fix: 'Send Content-Type: application/json with a JSON object body.',
      });
    }

    const input = opts.parseInput(body);
    const result = await opts.run(input, {
      key,
      environment: key.environment,
    });

    const billable = opts.billableStatuses ?? ['ok', 'partial', 'not_found'];
    let receipt: ToolReceipt | null = null;
    let spendCents = (await store.getSpend(key.id, new Date().toISOString().slice(0, 10)))
      .spentCents;

    if (billable.includes(result.status)) {
      const spend = await recordSuccessfulSpend(store, key);
      spendCents = spend.spentCents;
      receipt = await writeToolReceipt(store, {
        keyId: key.id,
        toolSlug: opts.toolSlug,
        environment: key.environment,
        status: result.status as ToolReceipt['status'],
        unitCostCents: key.unitCostCents,
        requestSummary: opts.summarizeRequest(input),
        responseSummary: opts.summarizeResponse(result),
      });
    }

    const payload: ToolInvokeSuccess<TResult> = {
      ok: true,
      data: result,
      meta: {
        keyId: key.id,
        environment: key.environment,
        receiptId: receipt?.id ?? '',
        unitCostCents: key.unitCostCents,
        spentCentsToday: spendCents,
        dailyCapCents: key.dailyCapCents,
      },
    };

    return Response.json(payload, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'X-Assembl-Tool-Environment': key.environment,
        'X-Assembl-Receipt-Id': receipt?.id ?? '',
        'X-Assembl-Key-Id': key.id,
      },
    });
  } catch (err) {
    if (err instanceof ToolHttpError) return toolErrorResponse(err);
    console.error(`[tools/${opts.toolSlug}]`, err);
    return toolErrorResponse(
      new ToolHttpError({
        status: 502,
        code: 'upstream_failure',
        message: err instanceof Error ? err.message : 'Unexpected tool failure.',
        fix: 'Retry once. If it persists, check upstream status and assembl tool health GET.',
      }),
    );
  }
}
