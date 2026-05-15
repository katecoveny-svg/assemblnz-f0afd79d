-- Ambient kete live-data contract.
--
-- Makes the standing-thought loop and operator briefing drafts tenant-scoped,
-- adds all-kete action metadata, and permits held inbox drafts created by the
-- ambient briefing runner. Every generated item still lands as
-- status='pending_approval'.

begin;

alter table public.tenant_intake
  add column if not exists timezone text not null default 'Pacific/Auckland';

alter table public.agent_thoughts
  add column if not exists tenant_id uuid references public.tenants(id) on delete cascade,
  add column if not exists kete text,
  add column if not exists action text not null default 'ambient-thought',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.agent_thoughts
  drop constraint if exists agent_thoughts_kete_check,
  drop constraint if exists agent_thoughts_action_check;

alter table public.agent_thoughts
  add constraint agent_thoughts_kete_check
  check (
    kete is null
    or kete in ('waihanga','manaaki','pikau','arataki','auaha','ako','matauranga','hoko','toro')
  ),
  add constraint agent_thoughts_action_check
  check (action in ('morning-briefing','ambient-thought','draft','evidence-pack','escalate','send'));

create index if not exists agent_thoughts_tenant_due_idx
  on public.agent_thoughts(tenant_id, next_due_at)
  where enabled;

create index if not exists agent_thoughts_kete_action_idx
  on public.agent_thoughts(kete, action)
  where enabled;

alter table public.agent_thought_runs
  add column if not exists tenant_id uuid references public.tenants(id) on delete cascade,
  add column if not exists kete text,
  add column if not exists action text,
  add column if not exists output_metadata jsonb not null default '{}'::jsonb;

alter table public.agent_thought_runs
  drop constraint if exists agent_thought_runs_kete_check,
  drop constraint if exists agent_thought_runs_action_check;

alter table public.agent_thought_runs
  add constraint agent_thought_runs_kete_check
  check (
    kete is null
    or kete in ('waihanga','manaaki','pikau','arataki','auaha','ako','matauranga','hoko','toro')
  ),
  add constraint agent_thought_runs_action_check
  check (
    action is null
    or action in ('morning-briefing','ambient-thought','draft','evidence-pack','escalate','send')
  );

create index if not exists agent_thought_runs_tenant_created_idx
  on public.agent_thought_runs(tenant_id, created_at desc);

alter table public.toro_drafts
  add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;

alter table public.toro_drafts
  drop constraint if exists toro_drafts_source_check,
  drop constraint if exists toro_drafts_source_invariants;

alter table public.toro_drafts
  add constraint toro_drafts_source_check
  check (source in ('chatwoot', 'agentmail', 'ambient')),
  add constraint toro_drafts_source_invariants
  check (
    (source = 'chatwoot'
      and chatwoot_account_id      is not null
      and chatwoot_inbox_id        is not null
      and chatwoot_conversation_id is not null)
    or
    (source = 'agentmail'
      and source_metadata ? 'whanau_id'
      and source_metadata ? 'agentmail_message_id')
    or
    (source = 'ambient'
      and tenant_id is not null
      and source_metadata ? 'action'
      and source_metadata ? 'agent'
      and source_metadata ? 'kete')
  );

create index if not exists idx_toro_drafts_tenant_created
  on public.toro_drafts(tenant_id, created_at desc);

create table if not exists public.morning_briefing_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  briefing_date date not null,
  timezone text not null default 'Pacific/Auckland',
  status text not null default 'running' check (status in ('running','success','error','skipped')),
  drafts_created integer not null default 0,
  summary jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (tenant_id, briefing_date)
);

alter table public.morning_briefing_runs enable row level security;

drop policy if exists "morning_briefing_runs_tenant_select" on public.morning_briefing_runs;
create policy "morning_briefing_runs_tenant_select"
  on public.morning_briefing_runs
  for select to authenticated
  using (public.is_tenant_member(tenant_id));

drop policy if exists "morning_briefing_runs_service_manage" on public.morning_briefing_runs;
create policy "morning_briefing_runs_service_manage"
  on public.morning_briefing_runs
  for all to service_role
  using (true)
  with check (true);

create index if not exists morning_briefing_runs_tenant_started_idx
  on public.morning_briefing_runs(tenant_id, started_at desc);

comment on column public.toro_drafts.source is
  'Where this draft was created from: chatwoot, agentmail, or ambient. Ambient rows are operator-held briefing drafts.';

create or replace function public.pick_due_thoughts(_limit integer default 5)
returns table (
  id uuid,
  user_id uuid,
  tenant_id uuid,
  agent_id text,
  kete text,
  action text,
  title text,
  prompt text,
  metadata jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    with picked as (
      select t.id
      from public.agent_thoughts t
      where t.enabled
        and t.next_due_at <= now()
      order by t.next_due_at
      limit greatest(_limit, 1)
      for update skip locked
    )
    update public.agent_thoughts t
       set last_run_at = now(),
           updated_at = now()
      from picked
     where t.id = picked.id
   returning t.id, t.user_id, t.tenant_id, t.agent_id, t.kete, t.action, t.title, t.prompt, t.metadata;
end;
$$;

revoke all on function public.pick_due_thoughts(integer) from public, anon, authenticated;
grant execute on function public.pick_due_thoughts(integer) to service_role;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('morning-briefing-hourly-gate')
      where exists (select 1 from cron.job where jobname = 'morning-briefing-hourly-gate');
    perform cron.schedule(
      'morning-briefing-hourly-gate',
      '5 * * * *',
      $cmd$
        select net.http_post(
          url := current_setting('app.settings.supabase_url', true) || '/functions/v1/morning-briefing',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
          ),
          body := jsonb_build_object('scheduled', true)
        );
      $cmd$
    );
    raise notice 'morning-briefing hourly gate scheduled';
  else
    raise notice 'pg_cron not enabled - schedule /morning-briefing hourly via the dashboard';
  end if;
exception when others then
  raise notice 'morning-briefing cron skip: %', sqlerrm;
end;
$$;

commit;
