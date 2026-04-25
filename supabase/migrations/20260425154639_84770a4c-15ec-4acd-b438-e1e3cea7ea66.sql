-- Schedule the ambient-agent-loop to run every 15 minutes.
-- pg_cron commands require elevated privileges, so they run inside the migration.

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
        'x-cron-secret', 'fe9dc65504ed3b00734082505efa6990045bbb0867d740abc64870febf443f7d'
      ),
      body := jsonb_build_object('triggered_by','cron')
    ) as request_id;
  $cron$
);
