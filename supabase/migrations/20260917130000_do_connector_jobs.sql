-- Narrow, server-authoritative connected Calendar jobs on the existing DO spine.
-- NOT applied to production by writing this file. Requires the three DO migrations.
BEGIN;

ALTER TABLE public.do_agents ADD COLUMN IF NOT EXISTS runtime_kind text NOT NULL DEFAULT 'legacy'
  CHECK (runtime_kind IN ('legacy', 'connector'));
ALTER TABLE public.do_agents ADD COLUMN IF NOT EXISTS revision bigint NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS do_agents_identity_owner_workspace ON public.do_agents(id, owner_id, workspace_id);
ALTER TABLE public.do_action_runs ADD COLUMN IF NOT EXISTS do_agent_id uuid;
ALTER TABLE public.do_action_runs ADD COLUMN IF NOT EXISTS workspace_id uuid;
ALTER TABLE public.do_action_runs ADD COLUMN IF NOT EXISTS review_generation bigint;
ALTER TABLE public.do_action_runs ADD COLUMN IF NOT EXISTS claim_id uuid;
ALTER TABLE public.do_action_runs ADD COLUMN IF NOT EXISTS claimed_at timestamptz;
ALTER TABLE public.do_action_runs ADD COLUMN IF NOT EXISTS request_hash text;
ALTER TABLE public.do_action_runs ADD CONSTRAINT do_connector_run_parent
  FOREIGN KEY (do_agent_id, owner_id, workspace_id) REFERENCES public.do_agents(id, owner_id, workspace_id);
ALTER TABLE public.do_action_runs ADD CONSTRAINT do_connector_run_shape CHECK (
  namespace <> 'connector' OR (owner_id IS NOT NULL AND do_agent_id IS NOT NULL
    AND workspace_id IS NOT NULL AND review_generation = 1 AND request_hash ~ '^sha256:[0-9a-f]{64}$'
    AND action_name = 'list_calendar_events'));
CREATE UNIQUE INDEX IF NOT EXISTS do_connector_run_job ON public.do_action_runs(do_agent_id) WHERE namespace='connector';
CREATE UNIQUE INDEX IF NOT EXISTS do_connector_run_identity ON public.do_action_runs(action_id, prep_id, owner_id, do_agent_id);
ALTER TABLE public.do_permits ADD COLUMN IF NOT EXISTS connector_job_id uuid;
ALTER TABLE public.do_permits ADD COLUMN IF NOT EXISTS decision text NOT NULL DEFAULT 'pending' CHECK (decision IN ('pending','approved','rejected'));
ALTER TABLE public.do_permits ADD COLUMN IF NOT EXISTS decided_at timestamptz;
ALTER TABLE public.do_permits ADD COLUMN IF NOT EXISTS reviewed_by uuid;
ALTER TABLE public.do_permits ADD CONSTRAINT do_connector_permit_parent
  FOREIGN KEY (action_id, prep_id, owner_id, connector_job_id)
  REFERENCES public.do_action_runs(action_id, prep_id, owner_id, do_agent_id);
ALTER TABLE public.do_action_receipts ADD COLUMN IF NOT EXISTS connector_job_id uuid;
ALTER TABLE public.do_action_receipts ADD COLUMN IF NOT EXISTS connector_prep_id text;
ALTER TABLE public.do_action_receipts ADD CONSTRAINT do_connector_receipt_parent
  FOREIGN KEY (action_id, connector_prep_id, owner_id, connector_job_id)
  REFERENCES public.do_action_runs(action_id, prep_id, owner_id, do_agent_id);

-- Owner-readable via existing RLS, but only service-owned transitions create proof.
-- SECURITY DEFINER lets the trigger check parents even if RLS hides them.
-- Authority uses the actual SET ROLE/session identity, never JWT user metadata.
CREATE OR REPLACE FUNCTION public.guard_do_connector_write() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE old_row jsonb := '{}'::jsonb; new_row jsonb := '{}'::jsonb; protected boolean := false;
DECLARE caller_role text := current_setting('role', true);
BEGIN
  IF caller_role = 'service_role' OR (coalesce(caller_role, 'none') IN ('none','') AND session_user = 'postgres') THEN
    IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;
  IF TG_OP<>'INSERT' THEN old_row := to_jsonb(OLD); END IF;
  IF TG_OP<>'DELETE' THEN new_row := to_jsonb(NEW); END IF;
  IF TG_TABLE_NAME='do_agents' THEN
    protected := old_row->>'runtime_kind'='connector' OR new_row->>'runtime_kind'='connector';
  ELSIF TG_TABLE_NAME='do_action_runs' THEN
    protected := old_row->>'namespace'='connector' OR new_row->>'namespace'='connector'
      OR old_row->>'do_agent_id' IS NOT NULL OR new_row->>'do_agent_id' IS NOT NULL;
  ELSIF TG_TABLE_NAME IN ('do_permits','do_action_receipts') THEN
    protected := old_row->>'connector_job_id' IS NOT NULL OR new_row->>'connector_job_id' IS NOT NULL
      OR EXISTS (SELECT 1 FROM public.do_action_runs r WHERE r.namespace='connector'
        AND (r.action_id IN (old_row->>'action_id',new_row->>'action_id') OR r.prep_id IN (old_row->>'prep_id',new_row->>'prep_id')));
  ELSIF TG_TABLE_NAME IN ('do_receipts','do_job_events','do_workspaces') THEN
    protected := EXISTS (SELECT 1 FROM public.do_agents a WHERE a.runtime_kind='connector' AND
      CASE WHEN TG_TABLE_NAME='do_workspaces' THEN a.workspace_id::text IN (old_row->>'id',new_row->>'id')
        ELSE a.id::text IN (old_row->>'do_agent_id',new_row->>'do_agent_id') END);
  END IF;
  IF coalesce(protected,false) THEN RAISE EXCEPTION 'Connector state is server-managed' USING ERRCODE='42501'; END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END $$;
REVOKE ALL ON FUNCTION public.guard_do_connector_write() FROM PUBLIC, anon, authenticated;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['do_agents','do_action_runs','do_permits','do_action_receipts','do_receipts','do_job_events','do_workspaces'] LOOP
    EXECUTE format('CREATE TRIGGER protect_connector_state BEFORE INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.guard_do_connector_write()',t);
  END LOOP;
END $$;

-- Internal view helper is service-only; no caller can choose an arbitrary owner.
CREATE FUNCTION public.get_owner_connector_job(p_owner uuid, p_job uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog, public AS $$
 SELECT jsonb_build_object('job_id',a.id,'owner_id',a.owner_id,'workspace_id',a.workspace_id,
   'state',r.status,'generation',r.review_generation,'action_id',r.action_id,'prep_id',r.prep_id,
   'permit_id',p.permit_id,'args_hash',r.args_hash,'request_hash',r.request_hash,'snapshot',r.args,
   'decision',p.decision,'expires_at',p.expires_at,'claim_id',r.claim_id,'result',r.result,
   'verify',r.verify,'receipt_id',r.receipt_id,'created_at',a.created_at)
 FROM public.do_agents a JOIN public.do_action_runs r ON r.do_agent_id=a.id AND r.owner_id=a.owner_id
 JOIN public.do_permits p ON p.permit_id=r.permit_id AND p.owner_id=r.owner_id AND p.prep_id=r.prep_id
 WHERE a.id=p_job AND a.owner_id=p_owner AND a.runtime_kind='connector' AND r.namespace='connector'
$$;
REVOKE ALL ON FUNCTION public.get_owner_connector_job(uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_owner_connector_job(uuid,uuid) TO service_role;

CREATE FUNCTION public.prepare_owner_connector_job(p_owner uuid, p_key text, p_hash text, p_snapshot jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public AS $$
DECLARE existing public.do_action_runs; workspace uuid; job uuid := gen_random_uuid();
DECLARE action text := 'act_'||replace(gen_random_uuid()::text,'-',''); prep text := 'prep_'||replace(gen_random_uuid()::text,'-','');
DECLARE permit text := 'prm_'||replace(gen_random_uuid()::text,'-',''); at_time timestamptz := now();
BEGIN
 IF p_owner IS NULL OR p_key IS NULL OR length(p_key) NOT BETWEEN 8 AND 100
   OR p_hash IS NULL OR p_hash !~ '^sha256:[0-9a-f]{64}$'
   OR p_snapshot IS NULL OR jsonb_typeof(p_snapshot)<>'object'
   OR p_snapshot#>>'{task,action}' IS DISTINCT FROM 'list_calendar_events'
   OR p_snapshot#>>'{task,app}' IS DISTINCT FROM 'google_calendar'
   OR coalesce(p_snapshot#>>'{agentSpec,name}','')='' THEN
   RAISE EXCEPTION 'Invalid connector preparation' USING ERRCODE='22023';
 END IF;
 -- Serialises this owner's workspace selection and idempotent preparation.
 PERFORM pg_advisory_xact_lock(hashtextextended('do-connector:'||p_owner::text,0));
 SELECT * INTO existing FROM public.do_action_runs WHERE tenant_id='do:user:'||p_owner::text AND idempotency_key=p_key;
 IF FOUND THEN
   IF existing.namespace<>'connector' OR existing.request_hash<>p_hash OR existing.args IS DISTINCT FROM p_snapshot THEN
     RAISE EXCEPTION 'Preparation content changed' USING ERRCODE='40001';
   END IF;
   RETURN public.get_owner_connector_job(p_owner,existing.do_agent_id);
 END IF;
 SELECT id INTO workspace FROM public.do_workspaces WHERE owner_id=p_owner AND kind='personal' ORDER BY created_at,id LIMIT 1;
 IF workspace IS NULL THEN
   INSERT INTO public.do_workspaces(owner_id,name,kind) VALUES(p_owner,'My DOs','personal') RETURNING id INTO workspace;
 END IF;
 INSERT INTO public.do_agents(id,owner_id,workspace_id,name,primitive,status,spec,runtime_kind,revision)
 VALUES(job,p_owner,workspace,left(p_snapshot#>>'{agentSpec,name}',120),'prepare','needs_you',
   jsonb_build_object('kind','portable_job','schemaVersion',1,'snapshot',p_snapshot),'connector',1);
 INSERT INTO public.do_action_runs(action_id,prep_id,action_name,namespace,tenant_id,owner_id,
   do_agent_id,workspace_id,review_generation,args,args_hash,request_hash,idempotency_key,stage,status,risk_class,permit_id,stage_log)
 VALUES(action,prep,'list_calendar_events','connector','do:user:'||p_owner::text,p_owner,job,workspace,1,
   p_snapshot,p_hash,p_hash,p_key,'prepare','awaiting_approval','low',permit,
   jsonb_build_array(jsonb_build_object('stage','prepare','at',at_time,'ok',true)));
 INSERT INTO public.do_permits(permit_id,prep_id,action_id,tenant_id,owner_id,connector_job_id,scopes,args_hash,max_uses,expires_at)
 VALUES(permit,prep,action,'do:user:'||p_owner::text,p_owner,job,ARRAY['calendar:read'],p_hash,1,at_time+interval '15 minutes');
 INSERT INTO public.do_receipts(owner_id,workspace_id,do_agent_id,title,summary,kind,idempotency_key,evidence)
 VALUES(p_owner,workspace,job,'Calendar brief prepared','Inputs saved. No calendar has been read.','job_accepted','accepted:'||job::text,
   jsonb_build_object('action_id',action,'args_hash',p_hash,'status','awaiting_approval'));
 RETURN public.get_owner_connector_job(p_owner,job);
END $$;
REVOKE ALL ON FUNCTION public.prepare_owner_connector_job(uuid,text,text,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prepare_owner_connector_job(uuid,text,text,jsonb) TO service_role;
CREATE FUNCTION public.lock_owner_connector_review(p_owner uuid,p_job uuid,p_expected jsonb) RETURNS public.do_action_runs
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
DECLARE r public.do_action_runs;
BEGIN
 SELECT * INTO r FROM public.do_action_runs WHERE do_agent_id=p_job AND owner_id=p_owner AND namespace='connector' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Job not found' USING ERRCODE='P0002'; END IF;
 IF p_expected IS NULL OR jsonb_typeof(p_expected)<>'object'
   OR p_expected->'generation' IS DISTINCT FROM to_jsonb(r.review_generation)
   OR p_expected->>'prep_id' IS DISTINCT FROM r.prep_id
   OR p_expected->>'permit_id' IS DISTINCT FROM r.permit_id
   OR p_expected->>'args_hash' IS DISTINCT FROM r.args_hash THEN
   RAISE EXCEPTION 'Review changed' USING ERRCODE='40001';
 END IF;
 RETURN r;
END $$;
REVOKE ALL ON FUNCTION public.lock_owner_connector_review(uuid,uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.lock_owner_connector_review(uuid,uuid,jsonb) TO service_role;

CREATE FUNCTION public.decide_owner_connector_job(p_owner uuid,p_job uuid,p_expected jsonb,p_decision text) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
DECLARE r public.do_action_runs; p public.do_permits;
BEGIN
 IF p_decision IS NULL OR p_decision NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Invalid decision' USING ERRCODE='22023'; END IF;
 r := public.lock_owner_connector_review(p_owner,p_job,p_expected);
 SELECT * INTO p FROM public.do_permits WHERE permit_id=r.permit_id AND owner_id=p_owner AND connector_job_id=p_job FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Permit not found' USING ERRCODE='P0002'; END IF;
 IF p.decision=p_decision THEN RETURN public.get_owner_connector_job(p_owner,p_job); END IF;
 IF r.status<>'awaiting_approval' OR p.decision<>'pending' OR p.expires_at<=now() OR p.revoked_at IS NOT NULL THEN
   RAISE EXCEPTION 'Review is no longer pending' USING ERRCODE='40001';
 END IF;
 UPDATE public.do_permits SET decision=p_decision,reviewed_by=p_owner,decided_at=now() WHERE permit_id=p.permit_id;
 UPDATE public.do_action_runs SET status=p_decision,stage='permit',updated_at=now(),
   stage_log=stage_log||jsonb_build_array(jsonb_build_object('stage','permit','decision',p_decision,'at',now(),'reviewer',p_owner)) WHERE action_id=r.action_id;
 RETURN public.get_owner_connector_job(p_owner,p_job);
END $$;
REVOKE ALL ON FUNCTION public.decide_owner_connector_job(uuid,uuid,jsonb,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.decide_owner_connector_job(uuid,uuid,jsonb,text) TO service_role;

CREATE FUNCTION public.claim_owner_connector_action(p_owner uuid,p_job uuid,p_expected jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
DECLARE r public.do_action_runs; p public.do_permits;
BEGIN
 r := public.lock_owner_connector_review(p_owner,p_job,p_expected);
 IF r.status IN ('running','succeeded','failed','indeterminate') THEN
   RETURN jsonb_build_object('claimed',false,'job',public.get_owner_connector_job(p_owner,p_job));
 END IF;
 SELECT * INTO p FROM public.do_permits WHERE permit_id=r.permit_id AND owner_id=p_owner AND connector_job_id=p_job FOR UPDATE;
 IF NOT FOUND OR r.status<>'approved' OR p.decision<>'approved' OR p.reviewed_by IS DISTINCT FROM p_owner
   OR p.args_hash IS DISTINCT FROM r.args_hash OR p.prep_id IS DISTINCT FROM r.prep_id
   OR p.expires_at<=now() OR p.revoked_at IS NOT NULL OR p.uses<>0 OR p.max_uses<>1 THEN
   RAISE EXCEPTION 'No current approval to execute' USING ERRCODE='42501';
 END IF;
 UPDATE public.do_permits SET uses=1 WHERE permit_id=p.permit_id;
 UPDATE public.do_action_runs SET status='running',stage='execute',claim_id=gen_random_uuid(),claimed_at=now(),updated_at=now(),reached_execute=true,
   stage_log=stage_log||jsonb_build_array(jsonb_build_object('stage','claimed','at',now())) WHERE action_id=r.action_id;
 UPDATE public.do_agents SET status='working',updated_at=now() WHERE id=p_job AND owner_id=p_owner;
 RETURN jsonb_build_object('claimed',true,'job',public.get_owner_connector_job(p_owner,p_job));
END $$;
REVOKE ALL ON FUNCTION public.claim_owner_connector_action(uuid,uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_owner_connector_action(uuid,uuid,jsonb) TO service_role;
CREATE FUNCTION public.finalize_owner_connector_action(p_owner uuid,p_job uuid,p_expected jsonb,p_claim uuid,p_result jsonb,p_digest text,p_verify jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
DECLARE r public.do_action_runs; receipt text := 'rcpt_'||replace(gen_random_uuid()::text,'-',''); existing public.do_action_receipts;
BEGIN
 r := public.lock_owner_connector_review(p_owner,p_job,p_expected);
 IF p_claim IS NULL OR r.claim_id IS DISTINCT FROM p_claim THEN RAISE EXCEPTION 'Execution claim changed' USING ERRCODE='40001'; END IF;
 IF p_result IS NULL OR jsonb_typeof(p_result)<>'object' OR p_digest IS NULL OR p_digest !~ '^sha256:[0-9a-f]{64}$'
   OR p_verify IS NULL OR p_verify->'passed' IS DISTINCT FROM 'true'::jsonb
   OR p_verify->>'method' IS DISTINCT FROM 'provider-schema'
   OR jsonb_typeof(p_result->'events') IS DISTINCT FROM 'array'
   OR jsonb_array_length(p_result->'events')>50 OR coalesce(p_result->>'draft','')='' THEN
   RAISE EXCEPTION 'Unverified connector outcome' USING ERRCODE='22023';
 END IF;
 IF r.status='succeeded' THEN
   SELECT * INTO existing FROM public.do_action_receipts WHERE action_id=r.action_id AND owner_id=p_owner;
   IF NOT FOUND OR existing.result_digest<>p_digest OR r.result IS DISTINCT FROM p_result OR r.verify IS DISTINCT FROM p_verify THEN
     RAISE EXCEPTION 'Completed outcome changed' USING ERRCODE='40001';
   END IF;
   RETURN public.get_owner_connector_job(p_owner,p_job);
 END IF;
 IF r.status<>'running' THEN RAISE EXCEPTION 'No running execution' USING ERRCODE='40001'; END IF;
 UPDATE public.do_action_runs SET result=p_result,verify=p_verify,status='succeeded',stage='receipt',receipt_id=receipt,executed_at=now(),updated_at=now(),
   stage_log=stage_log||jsonb_build_array(jsonb_build_object('stage','verify','at',now(),'ok',true)) WHERE action_id=r.action_id RETURNING * INTO r;
 INSERT INTO public.do_action_receipts(receipt_id,action_id,permit_id,tenant_id,owner_id,connector_job_id,connector_prep_id,args_hash,result_digest,stage_log,actor,payload)
 VALUES(receipt,r.action_id,r.permit_id,r.tenant_id,p_owner,p_job,r.prep_id,r.args_hash,p_digest,r.stage_log,
   jsonb_build_object('owner_id',p_owner,'claim_id',p_claim),jsonb_build_object('verification',p_verify,'boundary','Calendar read only. No message, event, invitation or other external write.'));
 INSERT INTO public.do_receipts(owner_id,workspace_id,do_agent_id,title,summary,kind,idempotency_key,evidence)
 VALUES(p_owner,r.workspace_id,p_job,'Calendar brief completed','Read result and brief retained with a receipt. No external write.','event','outcome:'||r.action_id,
   jsonb_build_object('receipt_id',receipt,'action_id',r.action_id,'args_hash',r.args_hash,'result_digest',p_digest));
 INSERT INTO public.do_job_events(owner_id,workspace_id,do_agent_id,event_id,kind,detail)
 VALUES(p_owner,r.workspace_id,p_job,'completed:'||r.action_id,'connector_completed',jsonb_build_object('receipt_id',receipt));
 UPDATE public.do_agents SET status='done',updated_at=now() WHERE id=p_job AND owner_id=p_owner;
 RETURN public.get_owner_connector_job(p_owner,p_job);
END $$;
REVOKE ALL ON FUNCTION public.finalize_owner_connector_action(uuid,uuid,jsonb,uuid,jsonb,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_owner_connector_action(uuid,uuid,jsonb,uuid,jsonb,text,jsonb) TO service_role;
COMMIT;
