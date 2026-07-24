import { afterEach, describe, expect, it } from 'vitest';

import { everydayAssembledJourney, SEED_HOUSEHOLD } from './journeys/everyday-assembled';
import { startJourneyRun, applyIntentResult } from './runtime';
import { parseGroceryIntent, GroceryIntentSchema } from './services/intent';
import { anthropicIntentService } from './services/intent-live';
import { JourneyAccessError } from './repository';
import {
  SupabaseJourneyRepository,
  runToRow,
  rowToRun,
} from './repository-supabase';

const NOW = '2026-07-22T00:00:00.000Z';

/** Minimal in-memory stand-in for the Supabase query builder used by the repo. */
function fakeClientFactory(store: Map<string, Record<string, unknown>>) {
  return () =>
    ({
      from() {
        const filters: Record<string, unknown> = {};
        const api: Record<string, unknown> = {
          upsert(row: { id: string }) {
            store.set(row.id, row as Record<string, unknown>);
            return Promise.resolve({ error: null });
          },
          select() {
            return api;
          },
          eq(col: string, val: unknown) {
            filters[col] = val;
            return api;
          },
          order() {
            const rows = [...store.values()].filter(
              (r) => filters.tenant == null || r.tenant === filters.tenant,
            );
            return Promise.resolve({ data: rows, error: null });
          },
          maybeSingle() {
            const row = [...store.values()].find((r) => r.id === filters.id) ?? null;
            return Promise.resolve({ data: row, error: null });
          },
        };
        return api;
      },
    }) as never;
}

function seededRun() {
  const started = startJourneyRun({
    journey: everydayAssembledJourney,
    statedIntent: SEED_HOUSEHOLD.statedIntent,
    sessionId: 'p',
    runId: 'run-p',
    now: NOW,
  });
  return applyIntentResult(started, parseGroceryIntent(SEED_HOUSEHOLD.statedIntent), NOW);
}

describe('run row mapping round-trips', () => {
  it('runToRow → rowToRun preserves the run', () => {
    const run = seededRun();
    const row = runToRow(run, NOW);
    expect(row.id).toBe(run.id);
    expect(row.tenant).toBe(run.tenantId);
    expect(row.journey_id).toBe(run.journeyId);
    expect(rowToRun(row)).toEqual(run);
  });
});

describe('SupabaseJourneyRepository (with a fake client)', () => {
  it('persists and reads a run back', async () => {
    const store = new Map<string, Record<string, unknown>>();
    const repo = new SupabaseJourneyRepository({ clientFactory: fakeClientFactory(store) });
    const run = seededRun();
    await repo.saveRun(run);
    const read = await repo.getRun(run.tenantId, run.id);
    expect(read?.id).toBe(run.id);
    const list = await repo.listRuns(run.tenantId);
    expect(list.map((r) => r.id)).toContain(run.id);
  });

  it('enforces tenant isolation on read', async () => {
    const store = new Map<string, Record<string, unknown>>();
    const repo = new SupabaseJourneyRepository({ clientFactory: fakeClientFactory(store) });
    const run = seededRun();
    await repo.saveRun(run);
    await expect(repo.getRun('attacker', run.id)).rejects.toBeInstanceOf(JourneyAccessError);
  });

  it('refuses to save a run under a mismatched tenant', async () => {
    const store = new Map<string, Record<string, unknown>>();
    const repo = new SupabaseJourneyRepository({ clientFactory: fakeClientFactory(store) });
    const run = seededRun();
    await expect(repo.saveRun({ ...run, tenantId: 'attacker' })).rejects.toBeInstanceOf(JourneyAccessError);
  });

  it('falls back in-process when the client throws (no DB)', async () => {
    const repo = new SupabaseJourneyRepository({
      clientFactory: () => {
        throw new Error('no db');
      },
    });
    const run = seededRun();
    await repo.saveRun(run); // stored in fallback, does not throw
    const read = await repo.getRun(run.tenantId, run.id);
    expect(read?.id).toBe(run.id);
    // isolation still holds in the fallback path
    await expect(repo.getRun('attacker', run.id)).rejects.toBeInstanceOf(JourneyAccessError);
  });

  it('journey reads stay tenant-scoped', async () => {
    const repo = new SupabaseJourneyRepository();
    await expect(repo.getJourney('attacker', everydayAssembledJourney.id)).rejects.toBeInstanceOf(JourneyAccessError);
    const ok = await repo.getJourney(everydayAssembledJourney.tenantId, everydayAssembledJourney.id);
    expect(ok?.id).toBe(everydayAssembledJourney.id);
  });
});

describe('live intent service falls back safely', () => {
  const hadKey = process.env.ANTHROPIC_API_KEY;
  afterEach(() => {
    if (hadKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = hadKey;
  });

  it('returns the deterministic parse when no API key is present (no network)', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const result = await anthropicIntentService.parse(SEED_HOUSEHOLD.statedIntent);
    const deterministic = parseGroceryIntent(SEED_HOUSEHOLD.statedIntent);
    expect(result.intent).toEqual(deterministic.intent);
    expect(GroceryIntentSchema.safeParse(result.intent).success).toBe(true);
  });
});
