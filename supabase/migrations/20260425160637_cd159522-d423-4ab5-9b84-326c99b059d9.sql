-- Private settings table for cron-time secrets.
-- No RLS policies = no row access for anon/authenticated even if RLS is enabled.
create table if not exists public._ambient_loop_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public._ambient_loop_settings enable row level security;

revoke all on table public._ambient_loop_settings from public, anon, authenticated;

-- Seed / upsert the cron secret.
insert into public._ambient_loop_settings (key, value)
values ('cron_secret', 'fe9dc65504ed3b00734082505efa6990045bbb0867d740abc64870febf443f7d')
on conflict (key) do update set value = excluded.value, updated_at = now();

-- Security-definer helper that returns the secret. Only callable by service role
-- and the postgres role (which is what pg_cron's worker runs as).
create or replace function public._ambient_loop_get_secret()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select value from public._ambient_loop_settings where key = 'cron_secret';
$$;

revoke all on function public._ambient_loop_get_secret() from public, anon, authenticated;

-- Reschedule the cron job to fetch the secret at call-time instead of having it
-- baked into the cron command body.
select cron.unschedule(jobid)
from cron.job
where jobname = 'ambient-agent-loop-15min';

select cron.schedule(
  'ambient-agent-loop-15min',
  '*/15 * * * *',
  $cron$
    select net.http_post(
      url := 'https://ssaxxdkxzrvkdjsanhei.supabase.co/functions/v1/ambient-agent-loop',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', public._ambient_loop_get_secret()
      ),
      body := jsonb_build_object('triggered_by','cron')
    ) as request_id;
  $cron$
);

-- Admin-readable status helper for the ambient loop schedule.
create or replace function public.ambient_loop_cron_status()
returns table(
  jobname text,
  schedule text,
  active boolean,
  last_run_status text,
  last_run_at timestamptz
)
language sql
stable
security definer
set search_path = public, cron
as $$
  select
    j.jobname::text,
    j.schedule::text,
    j.active,
    (select r.status::text from cron.job_run_details r where r.jobid = j.jobid order by r.start_time desc limit 1),
    (select r.start_time   from cron.job_run_details r where r.jobid = j.jobid order by r.start_time desc limit 1)
  from cron.job j
  where j.jobname = 'ambient-agent-loop-15min';
$$;

revoke all on function public.ambient_loop_cron_status() from public, anon, authenticated;
grant execute on function public.ambient_loop_cron_status() to authenticated;