-- Switch the business-pulse and morning-briefing crons from the broken
-- app.settings.* GUC pattern to Supabase Vault.
--
-- The original migrations (20260515101000_morning_briefing_cron.sql and
-- 20260516120100_business_pulse_cron.sql) relied on
-- current_setting('app.settings.supabase_url', true) and
-- current_setting('app.settings.service_role_key', true) — but those
-- GUCs were never set on this project, so net.http_post() inserted
-- null URLs into net.http_request_queue and Postgres logged an error
-- every hour. The crons looked alive in cron.job but never landed
-- an HTTP request anywhere.
--
-- This migration:
--   1. Adds a small helper public.invoke_edge_function(path, body)
--      that pulls the URL + service-role key from vault.decrypted_secrets
--      by NAME, so the values are encrypted at rest and never written
--      into a migration file.
--   2. Re-registers both crons to call the helper.
--
-- The user must, in a separate manual step (Supabase Studio → Project
-- Settings → Vault), create two vault secrets:
--   - name = 'supabase_url'
--     secret = 'https://wurwcrgxjjwqdaxqceey.supabase.co'
--   - name = 'service_role_key'
--     secret = the project's service_role JWT (Project Settings → API)
-- Until both exist, the helper returns null and the cron is a no-op
-- (no Postgres error, no spurious HTTP traffic — same as if cron were
-- disabled). Once both exist, both crons resume on the next hourly tick.

create extension if not exists "supabase_vault";

create or replace function public.invoke_edge_function(
  function_path text,
  body jsonb default '{}'::jsonb
) returns bigint
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  v_url text;
  v_key text;
  v_request_id bigint;
begin
  select decrypted_secret into v_url
    from vault.decrypted_secrets
    where name = 'supabase_url'
    limit 1;

  select decrypted_secret into v_key
    from vault.decrypted_secrets
    where name = 'service_role_key'
    limit 1;

  if v_url is null or v_key is null then
    raise notice 'invoke_edge_function: vault secrets supabase_url and/or service_role_key not set; skipping %', function_path;
    return null;
  end if;

  select net.http_post(
    url := v_url || '/functions/v1/' || function_path,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body := body
  ) into v_request_id;

  return v_request_id;
end;
$$;

revoke all on function public.invoke_edge_function(text, jsonb) from public, anon, authenticated;
grant execute on function public.invoke_edge_function(text, jsonb) to service_role;

comment on function public.invoke_edge_function(text, jsonb) is
  'Wraps net.http_post for edge-function invocation from pg_cron. Reads URL + service-role key from Supabase Vault (secret names: supabase_url, service_role_key). Returns null without error if vault secrets are missing, so unconfigured projects do not flood the Postgres log.';

-- Re-register business-pulse cron to call the helper.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('business-pulse-hourly')
      where exists (select 1 from cron.job where jobname = 'business-pulse-hourly');

    perform cron.schedule(
      'business-pulse-hourly',
      '0 * * * *',
      $cmd$ select public.invoke_edge_function('business-pulse', '{"force":false}'::jsonb); $cmd$
    );

    raise notice 'business-pulse cron re-registered against invoke_edge_function helper';
  end if;
end $$;

-- Same fix for morning-briefing — the prior migration had the same bug.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('morning-briefing-hourly')
      where exists (select 1 from cron.job where jobname = 'morning-briefing-hourly');

    perform cron.schedule(
      'morning-briefing-hourly',
      '0 * * * *',
      $cmd$ select public.invoke_edge_function('morning-briefing', '{"force":false}'::jsonb); $cmd$
    );

    raise notice 'morning-briefing cron re-registered against invoke_edge_function helper';
  end if;
end $$;
