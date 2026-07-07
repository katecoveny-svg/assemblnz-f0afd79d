-- Schedule the refresh-provider-prices Edge Function.
--
-- Guarded + self-healing: does NOTHING unless pg_cron + pg_net are installed AND
-- a vault secret `bills_price_refresh_url` (the function's invoke URL, which can
-- embed the service-role bearer as a query token or be paired with a vault key)
-- exists. This keeps the migration safe to apply on any environment — it never
-- errors, it just no-ops with a NOTICE until the function is deployed and the
-- secret is set. Cadence: weekly, Monday 04:00 NZT (Sunday 16:00 UTC).
--
-- To activate after `supabase functions deploy refresh-provider-prices`:
--   select vault.create_secret('https://<ref>.functions.supabase.co/refresh-provider-prices', 'bills_price_refresh_url');
--   -- then re-run this migration (or call cron.schedule manually).

DO $$
DECLARE
  has_cron boolean;
  has_net  boolean;
  fn_url   text;
BEGIN
  SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') INTO has_cron;
  SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net')  INTO has_net;

  IF NOT has_cron OR NOT has_net THEN
    RAISE NOTICE 'refresh-provider-prices cron skipped: pg_cron/pg_net not installed.';
    RETURN;
  END IF;

  BEGIN
    SELECT decrypted_secret INTO fn_url FROM vault.decrypted_secrets WHERE name = 'bills_price_refresh_url';
  EXCEPTION WHEN OTHERS THEN
    fn_url := NULL;
  END;

  IF fn_url IS NULL THEN
    RAISE NOTICE 'refresh-provider-prices cron skipped: vault secret bills_price_refresh_url not set.';
    RETURN;
  END IF;

  PERFORM cron.unschedule('assembl-bills-price-refresh')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'assembl-bills-price-refresh');

  PERFORM cron.schedule(
    'assembl-bills-price-refresh',
    '0 16 * * 0',  -- Sunday 16:00 UTC = Monday 04:00 NZST
    format($f$ select net.http_post(url => %L, headers => '{"Content-Type":"application/json"}'::jsonb) $f$, fn_url)
  );
  RAISE NOTICE 'refresh-provider-prices cron scheduled (weekly Mon 04:00 NZT).';
END $$;
