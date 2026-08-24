-- Parliament Bills API is live. Closes out the staging in
-- 20260824210000_regulatory_horizon_parliament_staged.sql.
--
-- That migration parked the Bills API source inactive because adapter-parliament
-- could not be deployed: the Supabase project was at its edge-function limit and
-- the deploy returned PaymentRequiredException. The project has since moved to
-- Pro, the adapter deployed, and the first run ingested 150 bills in 18.6s with
-- status ok.
--
-- The staged migration guards on `status = 'ok'` for the parliament adapter, so
-- it will not re-park this source. This migration makes the repo agree with
-- production declaratively rather than relying on that guard alone.

update public.kb_sources
set active = true,
    status = case when status = 'paused' then 'idle' else status end,
    consecutive_failures = 0,
    config = config - 'blocked_reason',
    updated_at = now()
where name = 'NZ Parliament — Bills API';

comment on function public.dispatch_due_kb_sources(integer) is
  'Dispatches Knowledge Brain sources. Parliament Bills API runs on adapter-parliament (live); Proposed Members Bills runs on adapter-html as the pre-introduction signal.';
