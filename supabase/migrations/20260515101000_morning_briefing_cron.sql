-- Industry Pack 6am operator briefing runner.
-- Runs hourly; the edge function gates each tenant to 06:00 in
-- tenant_intake.timezone so NZ and non-NZ operators can share one schedule.

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('morning-briefing-hourly')
      where exists (select 1 from cron.job where jobname = 'morning-briefing-hourly');

    perform cron.schedule(
      'morning-briefing-hourly',
      '0 * * * *',
      $cmd$
        select net.http_post(
          url := current_setting('app.settings.supabase_url', true) || '/functions/v1/morning-briefing',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
          ),
          body := '{"force":false}'::jsonb
        );
      $cmd$
    );

    raise notice 'morning-briefing cron scheduled (hourly, local-time gated)';
  else
    raise notice 'pg_cron not enabled - schedule /morning-briefing hourly via the dashboard';
  end if;
exception when others then
  raise notice 'morning-briefing cron skip: %', sqlerrm;
end;
$$;
