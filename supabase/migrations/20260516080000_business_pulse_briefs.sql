-- Business Pulse briefs — Monday 07:00 NZT cross-kete weekly synthesis.
--
-- Owned by the ARATAKI plugin's `business-pulse` skill. One row per
-- organisation per brief_date (the unique constraint enforces this).
-- The brief itself is read-only; any suggested action surfaces as a
-- staged draft, never auto-executes — see
-- docs/handover/claude-for-small-business-2026-05-16.md Part 3.

create table if not exists public.business_pulse_briefs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  brief_date date not null,
  drive_path text,
  slack_message_ts text,
  three_things jsonb not null,
  cash_position jsonb,
  pipeline_movement jsonb,
  weekly_commitments jsonb,
  pilot_health jsonb,
  tikanga_check_passed boolean not null default true,
  privacy_check_passed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (org_id, brief_date)
);

create index if not exists idx_business_pulse_org_date
  on public.business_pulse_briefs (org_id, brief_date desc);

alter table public.business_pulse_briefs enable row level security;

drop policy if exists "Users can view their org's briefs"
  on public.business_pulse_briefs;

create policy "Users can view their org's briefs"
  on public.business_pulse_briefs
  for select
  using (
    org_id in (
      select org_id from public.org_members where user_id = auth.uid()
    )
  );

comment on table public.business_pulse_briefs is
  'Monday 07:00 NZT cross-kete brief produced by ARATAKI/business-pulse. Read-only synthesis; staged actions live elsewhere.';

comment on column public.business_pulse_briefs.three_things is
  'Array of max 3 priority items from pulse-synthesis skill. Schema: { source, headline, recommended_action, staged_action }.';

comment on column public.business_pulse_briefs.tikanga_check_passed is
  'False if assembl-core/tikanga-compliance flagged the brief and the rewrite still failed; brief delivered with redacted three_things section.';

comment on column public.business_pulse_briefs.privacy_check_passed is
  'False if assembl-core/nz-privacy-act-2020 flagged third-party PII without consent flag and the rewrite still failed.';
