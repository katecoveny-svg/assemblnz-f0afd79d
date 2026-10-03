-- REVIEW ONLY. Unapplied, outside migrations. No grants or production-ready guarantee.
ALTER TABLE public.kb_sources ADD COLUMN ingestion_version bigint NOT NULL DEFAULT 0 CHECK (ingestion_version>=0);
ALTER TABLE public.kb_source_runs ADD COLUMN attempt_version bigint;
ALTER TABLE public.kb_source_runs ADD COLUMN start_key uuid;
ALTER TABLE public.kb_source_runs ADD COLUMN final_payload jsonb;
ALTER TABLE public.kb_source_runs ADD COLUMN final_receipt jsonb;
CREATE UNIQUE INDEX kb_run_start_key_proposal ON public.kb_source_runs(source_id,start_key);
CREATE UNIQUE INDEX kb_run_version_proposal ON public.kb_source_runs(source_id,attempt_version);
CREATE FUNCTION public.kb_start_ingestion_proposal(p_source uuid,p_key uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE s public.kb_sources%rowtype; actual_s public.kb_sources%rowtype; r public.kb_source_runs%rowtype;
 actual_r public.kb_source_runs%rowtype; expected_s jsonb; v bigint; t timestamptz; n bigint;
BEGIN
 IF p_source IS NULL OR p_key IS NULL THEN RAISE EXCEPTION USING ERRCODE='P7100',MESSAGE='invalid start arguments'; END IF;
 SELECT * INTO s FROM public.kb_sources WHERE id=p_source FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='P7101',MESSAGE='source not found'; END IF;
 SELECT * INTO r FROM public.kb_source_runs WHERE source_id=p_source AND start_key=p_key;
 IF FOUND THEN
  IF r.attempt_version IS NULL OR r.attempt_version<=0 THEN RAISE EXCEPTION USING ERRCODE='P7105',MESSAGE='start write contract violated'; END IF;
  RETURN jsonb_build_object('source_id',p_source,'run_id',r.id,'attempt_version',r.attempt_version,'start_key',p_key);
 END IF;
 IF s.active IS NOT TRUE THEN RAISE EXCEPTION USING ERRCODE='P7106',MESSAGE='source inactive'; END IF;
 IF s.ingestion_version IS NULL OR s.ingestion_version<0 OR s.ingestion_version=9223372036854775807 THEN RAISE EXCEPTION USING ERRCODE='P7105',MESSAGE='start write contract violated'; END IF;
 v:=s.ingestion_version+1; t:=greatest(clock_timestamp(),s.last_checked_at);
 expected_s:=to_jsonb(s)||jsonb_build_object('ingestion_version',v,'last_checked_at',t,'status','running');
 UPDATE public.kb_sources SET ingestion_version=v,last_checked_at=t,status='running' WHERE id=p_source RETURNING * INTO actual_s;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 OR to_jsonb(actual_s) IS DISTINCT FROM expected_s THEN RAISE EXCEPTION USING ERRCODE='P7105',MESSAGE='start write contract violated'; END IF;
 INSERT INTO public.kb_source_runs(source_id,status,started_at,attempt_version,start_key) VALUES(p_source,'running',t,v,p_key) RETURNING * INTO r;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 OR r.id IS NULL THEN RAISE EXCEPTION USING ERRCODE='P7105',MESSAGE='start write contract violated'; END IF;
 SELECT * INTO actual_r FROM public.kb_source_runs WHERE id=r.id;
 IF NOT FOUND OR to_jsonb(actual_r) IS DISTINCT FROM to_jsonb(r) OR r.source_id IS DISTINCT FROM p_source OR r.status IS DISTINCT FROM 'running'
 OR r.started_at IS DISTINCT FROM t OR r.attempt_version IS DISTINCT FROM v OR r.start_key IS DISTINCT FROM p_key
 OR r.finished_at IS NOT NULL OR r.final_payload IS NOT NULL OR r.final_receipt IS NOT NULL OR r.error IS NOT NULL
 OR r.new_docs IS DISTINCT FROM 0 OR r.updated_docs IS DISTINCT FROM 0 THEN RAISE EXCEPTION USING ERRCODE='P7105',MESSAGE='start write contract violated'; END IF;
 -- Catch AFTER-trigger source rewrites and insertion side effects too.
 SELECT * INTO actual_s FROM public.kb_sources WHERE id=p_source;
 IF NOT FOUND OR to_jsonb(actual_s) IS DISTINCT FROM expected_s THEN RAISE EXCEPTION USING ERRCODE='P7105',MESSAGE='start write contract violated'; END IF;
 RETURN jsonb_build_object('source_id',p_source,'run_id',actual_r.id,'attempt_version',actual_r.attempt_version,'start_key',actual_r.start_key);
END $$;
CREATE FUNCTION public.kb_finalize_ingestion_proposal(p_source uuid,p_run bigint,p_version bigint,p_outcome text,p_added integer,p_updated integer,p_error jsonb DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE s public.kb_sources%rowtype; actual_s public.kb_sources%rowtype; r public.kb_source_runs%rowtype;
 actual_r public.kb_source_runs%rowtype; payload jsonb; receipt jsonb; expected_s jsonb; expected_r jsonb;
 t timestamptz; state text; n bigint;
BEGIN
 IF p_source IS NULL OR p_run IS NULL OR p_version IS NULL OR p_version<=0 OR p_outcome IS NULL OR p_outcome NOT IN ('ok','error')
 OR p_added IS NULL OR p_updated IS NULL OR p_added<0 OR p_updated<0 OR (p_outcome='ok' AND p_error IS NOT NULL)
 THEN RAISE EXCEPTION USING ERRCODE='P7100',MESSAGE='invalid finalization arguments'; END IF;
 payload:=jsonb_build_object('source_id',p_source,'run_id',p_run,'attempt_version',p_version,'outcome',p_outcome,'added',p_added,'updated',p_updated,'error',p_error);
 -- Every mutating entrypoint locks SOURCE THEN RUN.
 SELECT * INTO s FROM public.kb_sources WHERE id=p_source FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='P7101',MESSAGE='source not found'; END IF;
 SELECT * INTO r FROM public.kb_source_runs WHERE id=p_run AND source_id=p_source FOR UPDATE;
 IF NOT FOUND OR r.attempt_version IS DISTINCT FROM p_version THEN RAISE EXCEPTION USING ERRCODE='P7102',MESSAGE='attempt mismatch'; END IF;
 IF r.final_receipt IS NOT NULL THEN
  IF r.final_payload IS DISTINCT FROM payload THEN RAISE EXCEPTION USING ERRCODE='P7103',MESSAGE='conflicting finalization retry'; END IF;
  IF r.final_receipt->'payload' IS DISTINCT FROM payload OR r.finished_at IS NULL OR r.status IS NULL
  THEN RAISE EXCEPTION USING ERRCODE='P7105',MESSAGE='finalization write contract violated'; END IF;
  RETURN r.final_receipt;
 END IF;
 IF r.status IS DISTINCT FROM 'running' OR r.finished_at IS NOT NULL OR r.final_payload IS NOT NULL OR s.ingestion_version IS NULL
 OR (s.ingestion_version=p_version AND (s.status IS DISTINCT FROM 'running' OR s.active IS NOT TRUE))
 THEN RAISE EXCEPTION USING ERRCODE='P7104',MESSAGE='invalid run state'; END IF;
 t:=greatest(clock_timestamp(),s.last_checked_at,s.last_successful_fetch,s.last_updated_at);
 state:=CASE WHEN s.ingestion_version=p_version THEN 'committed' ELSE 'superseded' END;
 expected_s:=to_jsonb(s);
 IF state='committed' THEN
  IF s.consecutive_failures IS NULL OR (p_outcome='error' AND s.consecutive_failures=2147483647)
  THEN RAISE EXCEPTION USING ERRCODE='P7105',MESSAGE='finalization write contract violated'; END IF;
  expected_s:=expected_s||jsonb_build_object('status',p_outcome,'last_checked_at',t,
   'last_successful_fetch',CASE WHEN p_outcome='ok' THEN t ELSE s.last_successful_fetch END,
   'last_updated_at',CASE WHEN p_outcome='ok' AND (p_added>0 OR p_updated>0) THEN t ELSE s.last_updated_at END,
   'consecutive_failures',CASE WHEN p_outcome='ok' THEN 0 ELSE s.consecutive_failures+1 END);
  UPDATE public.kb_sources SET status=p_outcome,last_checked_at=t,
   last_successful_fetch=CASE WHEN p_outcome='ok' THEN t ELSE s.last_successful_fetch END,
   last_updated_at=CASE WHEN p_outcome='ok' AND (p_added>0 OR p_updated>0) THEN t ELSE s.last_updated_at END,
   consecutive_failures=CASE WHEN p_outcome='ok' THEN 0 ELSE s.consecutive_failures+1 END WHERE id=p_source RETURNING * INTO actual_s;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 OR to_jsonb(actual_s) IS DISTINCT FROM expected_s THEN RAISE EXCEPTION USING ERRCODE='P7105',MESSAGE='finalization write contract violated'; END IF;
 END IF;
 SELECT * INTO actual_s FROM public.kb_sources WHERE id=p_source;
 IF NOT FOUND OR to_jsonb(actual_s) IS DISTINCT FROM expected_s THEN RAISE EXCEPTION USING ERRCODE='P7105',MESSAGE='finalization write contract violated'; END IF;
 receipt:=jsonb_build_object('state',state,'payload',payload,'finished_at',t,'source_attempt_version',actual_s.ingestion_version,
 'source_status',actual_s.status,'last_successful_fetch',actual_s.last_successful_fetch,'last_updated_at',actual_s.last_updated_at);
 expected_r:=to_jsonb(r)||jsonb_build_object('status',CASE WHEN state='superseded' THEN 'error' ELSE p_outcome END,'finished_at',t,'new_docs',p_added,'updated_docs',p_updated,
 'error',CASE WHEN state='superseded' THEN jsonb_build_object('completion_state','superseded','requested_error',p_error) ELSE p_error END,'final_payload',payload,'final_receipt',receipt);
 UPDATE public.kb_source_runs SET status=CASE WHEN state='superseded' THEN 'error' ELSE p_outcome END,finished_at=t,new_docs=p_added,updated_docs=p_updated,
 error=CASE WHEN state='superseded' THEN jsonb_build_object('completion_state','superseded','requested_error',p_error) ELSE p_error END,final_payload=payload,final_receipt=receipt WHERE id=p_run RETURNING * INTO actual_r;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 OR to_jsonb(actual_r) IS DISTINCT FROM expected_r THEN RAISE EXCEPTION USING ERRCODE='P7105',MESSAGE='finalization write contract violated'; END IF;
 -- RETURNING sees BEFORE changes; rereads also detect AFTER-trigger rewrites/deletion.
 SELECT * INTO actual_r FROM public.kb_source_runs WHERE id=p_run;
 IF NOT FOUND OR to_jsonb(actual_r) IS DISTINCT FROM expected_r THEN RAISE EXCEPTION USING ERRCODE='P7105',MESSAGE='finalization write contract violated'; END IF;
 SELECT * INTO actual_s FROM public.kb_sources WHERE id=p_source;
 IF NOT FOUND OR to_jsonb(actual_s) IS DISTINCT FROM expected_s THEN RAISE EXCEPTION USING ERRCODE='P7105',MESSAGE='finalization write contract violated'; END IF;
 RETURN actual_r.final_receipt; -- verified stored receipt, not a fabricated local value
END $$;
CREATE FUNCTION public.kb_ingestion_receipt_proposal(p_source uuid,p_run bigint,p_version bigint)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
 SELECT CASE WHEN final_receipt IS NULL THEN jsonb_build_object('state','pending') ELSE final_receipt END FROM public.kb_source_runs WHERE id=p_run AND source_id=p_source AND attempt_version=p_version;
$$;
-- Proposed removal of legacy freshness/reliability writer; separate policy still required.
CREATE FUNCTION public.kb_run_completion_fence_proposal() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
 IF TG_OP='UPDATE' THEN
  IF OLD.final_receipt IS NOT NULL AND NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION USING ERRCODE='P7107',MESSAGE='immutable finished run'; END IF;
 END IF;
 IF NEW.finished_at IS NOT NULL AND (NEW.final_receipt IS NULL OR NEW.final_payload IS NULL OR NEW.attempt_version IS NULL)
 THEN RAISE EXCEPTION USING ERRCODE='P7108',MESSAGE='completion requires receipt'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_kb_source_runs_reliability ON public.kb_source_runs;
CREATE TRIGGER kb_run_completion_fence_proposal BEFORE INSERT OR UPDATE ON public.kb_source_runs FOR EACH ROW EXECUTE FUNCTION public.kb_run_completion_fence_proposal();
-- UNRESOLVED: grants/RLS/direct writers/default function exposure, DELETE/TRUNCATE/key reuse,
-- retention/restore epochs, legacy reliability, durable caller keys, earlier document writes.
