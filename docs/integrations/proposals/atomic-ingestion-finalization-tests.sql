-- UNEXECUTED disposable-only acceptance fixture. Never run against production.
-- Reviewer must first approve the proposal and install it into the named disposable DB.
begin;
do $$
declare
  sid uuid; rid bigint; before_success timestamptz := '2026-09-13T22:50:03Z';
  checked timestamptz := '2026-10-03T01:00:00Z'; receipt jsonb;
  result_source public.kb_sources%rowtype; result_run public.kb_source_runs%rowtype;
begin
  if current_database() <> 'assembl_ingestion_fixture' then
    raise exception 'fixture refuses a database that is not explicitly disposable';
  end if;
  insert into public.kb_sources(name,type,url,category,active,status,last_checked_at,last_successful_fetch,last_updated_at)
    values('Atomic fixture','rss','https://example.org/fixture','fixture',false,'running',checked,before_success,before_success) returning id into sid;
  insert into public.kb_source_runs(source_id,status) values(sid,'running') returning id into rid;
  receipt := public.kb_finalize_ingestion_proposal(sid,rid,checked,'ok',1,0,null);
  select * into result_source from public.kb_sources where id=sid;
  select * into result_run from public.kb_source_runs where id=rid;
  assert result_source.status='ok' and result_run.status='ok';
  assert result_source.last_successful_fetch=result_run.finished_at;
  assert result_source.last_updated_at=result_run.finished_at;
  receipt := public.kb_finalize_ingestion_proposal(sid,rid,checked,'ok',1,0,null);
  assert receipt->>'state'='already_finished';
  -- A stale attempt must never update the source or turn its run into ok.
  insert into public.kb_source_runs(source_id,status) values(sid,'running') returning id into rid;
  begin
    perform public.kb_finalize_ingestion_proposal(sid,rid,checked,'ok',0,0,null);
    raise exception 'fixture expected stale attempt rejection';
  exception when others then
    if sqlerrm='fixture expected stale attempt rejection' then raise; end if;
  end;
  select * into result_run from public.kb_source_runs where id=rid;
  assert result_run.status='running' and result_run.finished_at is null;
  -- Confirmed error finalization retains both successful-fetch and content-change timestamps.
  checked := result_source.last_checked_at;
  perform public.kb_finalize_ingestion_proposal(sid,rid,checked,'error',0,0,'{"completion_state":"failed"}');
  select * into result_source from public.kb_sources where id=sid;
  assert result_source.last_successful_fetch = (receipt->>'finished_at')::timestamptz;
  assert result_source.last_updated_at = (receipt->>'finished_at')::timestamptz;
end $$;
rollback;
-- Additional required tests before approval: force the run update/trigger to raise after
-- the source update and prove transaction rollback; exercise two-session stale races;
-- lose the ACK after commit and reconcile via existing run ID without any compensation;
-- confirm public/anon/authenticated cannot invoke. These are NOT yet executed/proved.
