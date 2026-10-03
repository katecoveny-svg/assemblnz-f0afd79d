-- REVIEW PROPOSAL ONLY. Not a migration, not installed, not called by any adapter.
-- Requires schema/security review and separately approved disposable-DB validation.
-- All source+run finalization writes and the existing success trigger share one transaction.
create or replace function public.kb_finalize_ingestion_proposal(
  p_source uuid, p_run bigint, p_expected_checked timestamptz,
  p_outcome text, p_added integer, p_updated integer, p_error jsonb default null
) returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  s public.kb_sources%rowtype;
  r public.kb_source_runs%rowtype;
  completed timestamptz := clock_timestamp();
begin
  if p_outcome is null or p_added is null or p_updated is null or p_outcome not in ('ok','error') or p_added < 0 or p_updated < 0 then
    raise exception 'invalid finalization outcome/count';
  end if;
  select * into s from public.kb_sources where id=p_source for update;
  if not found then raise exception 'source not found'; end if;
  select * into r from public.kb_source_runs where id=p_run and source_id=p_source for update;
  if not found then raise exception 'run not found'; end if;
  if r.finished_at is not null then
    -- Read-only idempotent receipt; never alter a newer source success.
    return jsonb_build_object('state','already_finished','status',r.status,'finished_at',r.finished_at);
  end if;
  if s.last_checked_at is distinct from p_expected_checked or r.status <> 'running' then
    raise exception 'stale finalization attempt';
  end if;
  update public.kb_sources set
    status=p_outcome, last_checked_at=completed,
    last_updated_at=case when p_outcome='ok' and p_added+p_updated>0 then completed else s.last_updated_at end,
    consecutive_failures=case when p_outcome='ok' then 0 else consecutive_failures end
    where id=p_source;
  update public.kb_source_runs set status=p_outcome, finished_at=completed,
    new_docs=p_added, updated_docs=p_updated, error=p_error where id=p_run;
  -- Existing kb_update_source_reliability advances last_successful_fetch only for ok.
  return jsonb_build_object('state','finished','status',p_outcome,'finished_at',completed);
end $$;
revoke all on function public.kb_finalize_ingestion_proposal(uuid,bigint,timestamptz,text,integer,integer,jsonb) from public, anon, authenticated;
grant execute on function public.kb_finalize_ingestion_proposal(uuid,bigint,timestamptz,text,integer,integer,jsonb) to service_role;
