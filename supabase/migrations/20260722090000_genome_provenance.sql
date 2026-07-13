-- Genome provenance (Agentic OS Phase 1 — docs/AGENTIC-OS-ARCHITECTURE.md).
--
-- Every important genome fact gains provenance: where it came from, how
-- sure we are, and whether a human confirmed it. Agents must never treat a
-- weak inference as a confirmed business fact — this is the schema that
-- makes that distinction representable.
--
-- Additive only; defaults keep every existing row valid (existing facts
-- were seeded by migrations or written by owners, so they are 'confirmed').
-- RLS stays deny-all; access only via lib/supabase/service.ts.

alter table public.living_site_genome
  add column if not exists source text not null default 'seed',
  add column if not exists source_ref text,
  add column if not exists confidence numeric(3, 2),
  add column if not exists verification text not null default 'confirmed',
  add column if not exists discovered_at timestamptz not null default now(),
  add column if not exists verified_at timestamptz;

do $$ begin
  alter table public.living_site_genome
    add constraint living_site_genome_verification_check
    check (verification in ('confirmed', 'inferred', 'suggested', 'stale', 'conflicting'));
exception
  when duplicate_object then null;
end $$;

do $$ begin
  alter table public.living_site_genome
    add constraint living_site_genome_confidence_check
    check (confidence is null or (confidence >= 0 and confidence <= 1));
exception
  when duplicate_object then null;
end $$;

-- Append-only edit history: one row per change to a fact's value or
-- verification. Written by the same server code that performs the change.
create table if not exists public.living_site_genome_history (
  id uuid primary key default gen_random_uuid(),
  tenant text not null,
  fact_id text not null,
  old_value text,
  new_value text not null,
  old_verification text,
  new_verification text,
  source text not null default 'owner-edit',
  actor text,
  changed_at timestamptz not null default now()
);

alter table public.living_site_genome_history enable row level security;

create index if not exists living_site_genome_history_fact_idx
  on public.living_site_genome_history (tenant, fact_id, changed_at desc);
