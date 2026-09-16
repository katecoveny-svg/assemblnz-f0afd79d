import { ToolHttpError } from './errors';
import type { ToolKeyRecord, ToolSpendDay } from './types';
import type { ToolStore } from './store';

export function utcDay(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export async function assertUnderDailyCap(
  store: ToolStore,
  key: ToolKeyRecord,
  now = new Date(),
): Promise<ToolSpendDay> {
  const day = utcDay(now);
  const spend = await store.getSpend(key.id, day);
  if (spend.spentCents + key.unitCostCents > key.dailyCapCents) {
    throw new ToolHttpError({
      status: 429,
      code: 'daily_cap_exceeded',
      message: `Daily spend cap reached (${spend.spentCents}/${key.dailyCapCents} cents UTC day ${day}).`,
      fix: `Wait until the next UTC day, raise the key's daily_cap_cents, or use a different key. Remaining today: ${Math.max(0, key.dailyCapCents - spend.spentCents)} cents.`,
      details: {
        day,
        spent_cents: spend.spentCents,
        daily_cap_cents: key.dailyCapCents,
        unit_cost_cents: key.unitCostCents,
        call_count: spend.callCount,
      },
    });
  }
  return spend;
}

export async function recordSuccessfulSpend(
  store: ToolStore,
  key: ToolKeyRecord,
  now = new Date(),
): Promise<ToolSpendDay> {
  return store.addSpend(key.id, utcDay(now), key.unitCostCents);
}
