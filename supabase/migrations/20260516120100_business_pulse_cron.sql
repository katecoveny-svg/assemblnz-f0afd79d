-- Business Pulse weekly cron.
--
-- Pattern follows morning-briefing (20260515101000_morning_briefing_cron.sql):
-- hourly trigger, per-tenant local-time gating handled inside the edge
-- function against tenant_intake.timezone. This way one cron schedule
-- serves NZ, AU, and any other timezones an operator might be on.
--
-- The edge function /functions/v1/business-pulse fires the weekly run
-- only when (a) the local day is Monday and (b) the local hour is 7.

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('business-pulse-hourly')
      where exists (select 1 from cron.job where jobname = 'business-pulse-hourly');

    perform cron.schedule(
      'business-pulse-hourly',
      '0 * * * *',
      $cmd$
        select net.http_post(
          url := current_setting('app.settings.supabase_url', true) || '/functions/v1/business-pulse',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
          ),
          body := '{"force":false}'::jsonb
        );
      $cmd$
    );

    raise notice 'business-pulse cron scheduled (hourly, local-Monday-07:00 gated)';
  else
    raise notice 'pg_cron not enabled - schedule /business-pulse hourly via the dashboard';
  end if;
exception when others then
  raise notice 'business-pulse cron skip: %', sqlerrm;
end;
$$;
