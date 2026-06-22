-- ----------------------------------------------------------------------------
-- Health monitoring — health_check_logs + 5-minute cron
--
-- The `health-check-cron` edge function probes the full delivery pipeline every
-- 5 minutes (Supabase DB, Brevo API, Stripe API, the Vercel /api/ping endpoint,
-- and a round-trip test write to developer_waitlist) and writes one row here per
-- run. The /admin/health dashboard reads the last 24h from this table.
--
-- The table is service-role only: RLS is ON with NO public policies, so the
-- anon/authenticated keys can neither read nor write it. The edge function
-- (service role) and the server-rendered dashboard (service role) bypass RLS.
-- ----------------------------------------------------------------------------

begin;

create table if not exists public.health_check_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- 'ok' (all green) | 'degraded' (non-critical failures) | 'down' (critical failure)
  overall_status text not null default 'ok'
    check (overall_status in ('ok', 'degraded', 'down')),
  -- jsonb array: [{ name, status, response_time_ms, error_message, category }]
  checks jsonb not null default '[]'::jsonb,
  failures integer not null default 0,
  -- the Brevo IP-allowlist trap: true when Brevo rejected us because our
  -- sending IP is not on the account's authorised-IP list.
  brevo_ip_blocked boolean not null default false,
  alerted boolean not null default false,
  webhook_delivered boolean not null default false,
  email_delivered boolean not null default false,
  duration_ms integer,
  run_source text not null default 'cron'
);

alter table public.health_check_logs enable row level security;

-- No policies on purpose: only service_role (which bypasses RLS) may touch this.

create index if not exists health_check_logs_created_at_idx
  on public.health_check_logs (created_at desc);

comment on table public.health_check_logs is
  'One row per health-check-cron run. Service-role only (RLS on, no policies). Read by /admin/health.';

commit;

-- ----------------------------------------------------------------------------
-- Schedule the probe every 5 minutes via pg_cron, reusing the vault-backed
-- public.invoke_edge_function() helper (migration 20260516120200) so the URL +
-- service-role key stay encrypted at rest and the cron is a silent no-op until
-- the vault secrets (supabase_url, service_role_key) exist.
-- ----------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('health-check-cron-5min')
      where exists (select 1 from cron.job where jobname = 'health-check-cron-5min');

    perform cron.schedule(
      'health-check-cron-5min',
      '*/5 * * * *',
      $cmd$ select public.invoke_edge_function('health-check-cron', '{"scheduled":true}'::jsonb); $cmd$
    );

    raise notice 'health-check-cron scheduled every 5 minutes';
  else
    raise notice 'pg_cron not enabled - schedule /health-check-cron every 5 min via the dashboard';
  end if;
exception when others then
  raise notice 'health-check-cron schedule skip: %', sqlerrm;
end;
$$;
