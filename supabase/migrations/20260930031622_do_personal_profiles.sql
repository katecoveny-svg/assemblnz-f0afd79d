-- Personal DO communication preferences. No responsibilities, schedules,
-- external-action permissions or users are created by this migration.
create table public.do_personal_profiles (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'DO'
    check (char_length(btrim(display_name)) between 1 and 32 and display_name !~ '[[:cntrl:]]'),
  avatar text not null default 'bloom' check (avatar in ('bloom','orbit','pebble','spark')),
  tone text not null default 'warm' check (tone in ('warm','direct','thoughtful')),
  response_length text not null default 'balanced' check (response_length in ('brief','balanced','detailed')),
  initiative text not null default 'gentle' check (initiative in ('on_request','gentle','proactive')),
  preferences text not null default '' check (char_length(preferences) <= 1200),
  voice_name text not null default 'Kore' check (voice_name in ('Kore','Aoede','Puck','Charon')),
  onboarding_completed boolean not null default false,
  consented_at timestamptz not null,
  consent_version integer not null check (consent_version = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.do_personal_profiles enable row level security;
revoke all on public.do_personal_profiles from public, anon, authenticated;
grant select on public.do_personal_profiles to authenticated;
grant all on public.do_personal_profiles to service_role;

-- Match Personal DO's verified-owner read model. All mutations remain behind
-- doOwner(), same-origin HTTP validation and explicit preference-use consent.
create policy personal_profile_owner on public.do_personal_profiles
  for select to authenticated
  using (
    (select auth.uid()) = owner_id
    and coalesce((select auth.jwt()->>'is_anonymous'),'false') = 'false'
  );

comment on table public.do_personal_profiles is
  'Owner-scoped communication preferences. Initiative is response style only, never authority to act, schedule or monitor.';
