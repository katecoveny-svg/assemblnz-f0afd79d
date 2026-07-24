/**
 * assembl — journey repository
 * ----------------------------
 * A typed repository abstraction over journeys and runs. Persistence is not yet
 * safe to add (the Supabase surface is RLS-heavy and journeys carry no owner
 * model yet), so the default implementation is in-memory and seed-backed. The
 * interface is the seam: a Supabase-backed `JourneyRepository` can drop in later
 * without touching the runtime or UI.
 *
 * Tenant isolation is enforced here: every read/write is scoped to a tenantId,
 * and cross-tenant access throws `JourneyAccessError`. No caller can reach
 * another tenant's journey or run through this repository.
 */

import type { CustomerJourney, JourneyRun } from './types';
import { everydayAssembledJourney } from './journeys/everyday-assembled';

export class JourneyAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JourneyAccessError';
  }
}

export interface JourneyRepository {
  listJourneys(tenantId: string): Promise<CustomerJourney[]>;
  getJourney(tenantId: string, journeyId: string): Promise<CustomerJourney | null>;
  /** Read a journey by id across tenants — used only to *discover* its tenant
   *  for a public demo surface; never returns another tenant's runs. */
  findJourneyPublic(journeyId: string): Promise<CustomerJourney | null>;
  saveRun(run: JourneyRun): Promise<JourneyRun>;
  getRun(tenantId: string, runId: string): Promise<JourneyRun | null>;
  listRuns(tenantId: string): Promise<JourneyRun[]>;
}

const SEED_JOURNEYS: CustomerJourney[] = [everydayAssembledJourney];

export class InMemoryJourneyRepository implements JourneyRepository {
  private journeys = new Map<string, CustomerJourney>();
  private runs = new Map<string, JourneyRun>();

  constructor(seed: CustomerJourney[] = SEED_JOURNEYS) {
    for (const j of seed) this.journeys.set(j.id, j);
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
    // Guard against saving a run under a tenant that does not own the journey.
    const journey = this.journeys.get(run.journeyId);
    if (journey && journey.tenantId !== run.tenantId) {
      throw new JourneyAccessError(
        `Run "${run.id}" tenant "${run.tenantId}" does not match journey owner "${journey.tenantId}".`,
      );
    }
    this.runs.set(run.id, run);
    return run;
  }

  async getRun(tenantId: string, runId: string): Promise<JourneyRun | null> {
    const run = this.runs.get(runId);
    if (!run) return null;
    if (run.tenantId !== tenantId) {
      throw new JourneyAccessError(
        `Tenant "${tenantId}" may not access run "${runId}" (owned by "${run.tenantId}").`,
      );
    }
    return run;
  }

  async listRuns(tenantId: string): Promise<JourneyRun[]> {
    return [...this.runs.values()].filter((r) => r.tenantId === tenantId);
  }
}

/** Process-wide default repository (seed data). Swap for a DB impl later. */
export const journeyRepository: JourneyRepository = new InMemoryJourneyRepository();
