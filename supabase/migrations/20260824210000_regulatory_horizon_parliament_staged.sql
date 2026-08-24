-- Supersedes 20260824221500_regulatory_horizon_parliament.sql in production.
--
-- That migration activates a "NZ Parliament — Bills API" source whose config
-- routes to adapter-parliament. That edge function is NOT deployed: the Supabase
-- project is at its edge-function limit and deploying returns
--   PaymentRequiredException: Max number of functions reached for project
--
-- Dispatching an active source to a missing function marks it status='error'
-- every cycle until consecutive_failures hits 5, which is a silent dead feed —
-- the exact failure this whole horizon effort exists to remove. So the Bills API
-- source is staged INACTIVE with the reason recorded on the row.
--
-- Verified 2026-08-24 via pg_net from this database: the Parliament endpoint
-- returns HTTP 200 with live bills, so adapter-parliament will work unchanged
-- as soon as a function slot is free. Re-enabling is then:
--   update public.kb_sources
--      set active = true, status = 'idle', last_checked_at = null
--    where name = 'NZ Parliament — Bills API';

update public.kb_sources
set active = false,
    status = 'paused',
    config = config || jsonb_build_object(
      'blocked_reason', 'adapter-parliament not deployed: project at edge function limit'
    ),
    updated_at = now()
where name = 'NZ Parliament — Bills API'
  and not exists (
    -- Belt and braces: if a future deploy adds the adapter, leave this alone.
    select 1 from public.kb_sources where config->>'adapter' = 'parliament' and status = 'ok'
  );

-- The pre-introduction watch runs on adapter-html, which IS deployed, so
-- Members' Bills sitting in the ballot are tracked from today.
update public.kb_sources
set active = true,
    status = 'idle'
where name = 'NZ Parliament — Proposed Members Bills'
  and status = 'paused';
