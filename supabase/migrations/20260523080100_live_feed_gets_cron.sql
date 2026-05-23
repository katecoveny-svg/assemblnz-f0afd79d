-- Schedule the GETS poll. Pattern follows business_pulse_cron — hourly
-- trigger, time-of-day gating inside the edge function (so DST is handled
-- by the function via Pacific/Auckland Intl, not by us trying to compute
-- UTC offset shifts in cron).
--
-- The function checks Pacific/Auckland local hour == 09 and fast-returns
-- on any other hour (writes a skipped_time_gate log row so we can see the
-- ping in the dashboard).

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('live-feed-gets-hourly')
      where exists (select 1 from cron.job where jobname = 'live-feed-gets-hourly');

    perform cron.schedule(
      'live-feed-gets-hourly',
      '0 * * * *',
      $cmd$
        select net.http_post(
          url := current_setting('app.settings.supabase_url', true) || '/functions/v1/live-feed-gets-poll',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
          ),
          body := '{"force":false}'::jsonb
        );
      $cmd$
    );

    raise notice 'live-feed-gets cron scheduled (hourly, local-09:00 gated inside function)';
  else
    raise notice 'pg_cron not enabled - schedule /live-feed-gets-poll hourly via the dashboard';
  end if;
exception when others then
  raise notice 'live-feed-gets cron skip: %', sqlerrm;
end;
$$;
