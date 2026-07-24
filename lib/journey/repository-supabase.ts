/**
 * assembl — Supabase-backed journey repository
 * --------------------------------------------
 * Persists `JourneyRun` state to the `journey_runs` table via the service-role
 * client (RLS deny-all; reachable only from trusted server code). Journeys
 * themselves are code-defined configuration, so journey reads use the same code
 * seed as the in-memory repository — only runs are persisted.
 *
 * Degrades safely: when the table or the Supabase keys are unavailable, every
 * operation falls back to an in-process map and the surface keeps working
 * (mirrors the `getGenomeFactsFor` fallback pattern). Tenant isolation is
 * enforced here exactly as in the in-memory repository — cross-tenant access
 * throws `JourneyAccessError`.
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getServiceClient } from '@/lib/supabase/service';
import type { CustomerJourney, JourneyRun } from './types';
import { everydayAssembledJourney } from './journeys/everyday-assembled';
import { JourneyAccessError, type JourneyRepository } from './repository';

const SEED_JOURNEYS: CustomerJourney[] = [everydayAssembledJourney];
const TABLE = 'journey_runs';

export type JourneyRunRow = {
  id: string;
  tenant: string;
  journey_id: string;
  session_id: string;
  status: string;
  current_stage_id: string;
  data: JourneyRun;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
};

/** Pure mapper: run → storable row. */
export function runToRow(run: JourneyRun, now: string): JourneyRunRow {
  return {
    id: run.id,
    tenant: run.tenantId,
    journey_id: run.journeyId,
    session_id: run.sessionId,
    status: run.status,
    current_stage_id: run.currentStageId,
    data: run,
    started_at: run.startedAt,
    completed_at: run.completedAt ?? null,
    updated_at: now,
  };
}

/** Pure mapper: row → run (the full run lives in `data`). */
export function rowToRun(row: Pick<JourneyRunRow, 'data'>): JourneyRun {
  return row.data;
}

export class SupabaseJourneyRepository implements JourneyRepository {
  private journeys = new Map<string, CustomerJourney>();
  /** In-process fallback used whenever the DB is unreachable. */
  private fallbackRuns = new Map<string, JourneyRun>();
  private clientFactory: () => SupabaseClient;

  constructor(opts?: { seed?: CustomerJourney[]; clientFactory?: () => SupabaseClient }) {
    for (const j of opts?.seed ?? SEED_JOURNEYS) this.journeys.set(j.id, j);
    this.clientFactory = opts?.clientFactory ?? getServiceClient;
  }

  async listJourneys(tenantId: string): Promise<CustomerJourney[]> {
    return [...this.journeys.values()].filter((j) => j.tenantId === tenantId);
  }

  async getJourney(tenantId: string, journeyId: string): Promise<CustomerJourney | null> {
    const journey = this.journeys.get(journeyId);
    if (!journey) return null;
    if (journey.tenantId !== tenantId) {
      throw new JourneyAccessError(
        `Tenant "${tenantId}" may not access journey "${journeyId}" (owned by "${journey.tenantId}").`,
      );
    }
    return journey;
  }

  async findJourneyPublic(journeyId: string): Promise<CustomerJourney | null> {
    return this.journeys.get(journeyId) ?? null;
  }

  async saveRun(run: JourneyRun): Promise<JourneyRun> {
    // Same ownership guard as the in-memory repo.
    const journey = this.journeys.get(run.journeyId);
    if (journey && journey.tenantId !== run.tenantId) {
      throw new JourneyAccessError(
        `Run "${run.id}" tenant "${run.tenantId}" does not match journey owner "${journey.tenantId}".`,
      );
    }
    const row = runToRow(run, new Date().toISOString());
    try {
      const supabase = this.clientFactory();
      const { error } = await supabase.from(TABLE).upsert(row, { onConflict: 'id' });
      if (error) throw error;
    } catch {
      // DB unavailable — keep the run in the in-process fallback so the session
      // still functions.
      this.fallbackRuns.set(run.id, run);
    }
    return run;
  }

  async getRun(tenantId: string, runId: string): Promise<JourneyRun | null> {
    try {
      const supabase = this.clientFactory();
      const { data, error } = await supabase.from(TABLE).select('*').eq('id', runId).maybeSingle();
      if (error) throw error;
      if (!data) return this.getFallbackRun(tenantId, runId);
      if (data.tenant !== tenantId) {
        throw new JourneyAccessError(
          `Tenant "${tenantId}" may not access run "${runId}" (owned by "${data.tenant}").`,
        );
      }
      return rowToRun(data as JourneyRunRow);
    } catch (err) {
      if (err instanceof JourneyAccessError) throw err;
      return this.getFallbackRun(tenantId, runId);
    }
  }

  async listRuns(tenantId: string): Promise<JourneyRun[]> {
    try {
      const supabase = this.clientFactory();
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('tenant', tenantId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => rowToRun(r as JourneyRunRow));
    } catch {
      return [...this.fallbackRuns.values()].filter((r) => r.tenantId === tenantId);
    }
  }

  private getFallbackRun(tenantId: string, runId: string): JourneyRun | null {
    const run = this.fallbackRuns.get(runId);
    if (!run) return null;
    if (run.tenantId !== tenantId) {
      throw new JourneyAccessError(
        `Tenant "${tenantId}" may not access run "${runId}" (owned by "${run.tenantId}").`,
      );
    }
    return run;
  }
}
