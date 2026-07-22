-- Agentic customer journey — durable run state.
--
-- Persists `JourneyRun` records for the reusable journey system
-- (lib/journey). Journeys themselves are code-defined configuration
-- (lib/journey/journeys/*), so only RUNS are stored here — the live state of a
-- customer moving through a journey.
--
-- Follows the repo's living_site_genome pattern: RLS is ENABLED with NO
-- anon/authenticated policies, so the table is deny-all to the public API and
-- is reachable only through the service-role client (lib/supabase/service.ts)
-- in trusted server code (SupabaseJourneyRepository). The app degrades safely
-- to the in-memory seed repository when this table or the keys are absent, so
-- applying this migration is not required for the surface to work.
--
-- The full run is stored as jsonb `data` (source of truth); id/tenant/journey_id
-- /status are mirrored as columns for indexing and cheap listing. Idempotent.

begin;

create table if not exists public.journey_runs (
  id text primary key,
  tenant text not null,
  journey_id text not null,
  session_id text not null,
  status text not null,
  current_stage_id text not null,
  -- Full JourneyRun payload (timeline, proposed actions, evidence, metrics…).
  data jsonb not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Deny-all: RLS on, no anon/authenticated policies. Service role bypasses RLS.
alter table public.journey_runs enable row level security;

-- List a tenant's runs newest-first; never crosses tenant boundaries.
create index if not exists journey_runs_tenant_updated_idx
  on public.journey_runs (tenant, updated_at desc);

create index if not exists journey_runs_journey_idx
  on public.journey_runs (journey_id);

commit;
