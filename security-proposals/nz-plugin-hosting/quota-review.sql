-- UNAPPLIED REVIEW PROPOSAL ONLY. No migration, role, grant or setting was executed.
-- Freight only. Dedicated runtime credential/login and actual DB proof need owner approval.
-- Invoking clients must bound the whole transaction to500ms; lock waits are capped100ms.
BEGIN;
CREATE ROLE nz_freight_quota_owner NOLOGIN NOBYPASSRLS;
CREATE ROLE nz_freight_quota NOLOGIN NOBYPASSRLS;
CREATE SCHEMA nz_freight_quota AUTHORIZATION nz_freight_quota_owner;
REVOKE ALL ON SCHEMA nz_freight_quota FROM PUBLIC, anon, authenticated;
CREATE TABLE nz_freight_quota.control (
 id pg_catalog.int4 PRIMARY KEY CHECK(id=1), enabled pg_catalog.bool NOT NULL DEFAULT false,
 policy pg_catalog.text NOT NULL DEFAULT 'nz-public-hosting-v1' CHECK(policy='nz-public-hosting-v1'),
 next_fence pg_catalog.int8 NOT NULL DEFAULT 0 CHECK(next_fence>=0)
);
INSERT INTO nz_freight_quota.control(id) VALUES(1); -- live backend gate remains OFF
CREATE TABLE nz_freight_quota.windows (
 kind pg_catalog.text PRIMARY KEY CHECK(kind IN('attempt_minute','mcp_minute','mcp_day','source_day','log_minute')),
 start_at pg_catalog.timestamptz NOT NULL, used pg_catalog.int4 NOT NULL CHECK(used BETWEEN 0 AND 2001)
);
CREATE TABLE nz_freight_quota.leases (
 invocation pg_catalog.uuid PRIMARY KEY, id pg_catalog.uuid NOT NULL UNIQUE, fence pg_catalog.int8 NOT NULL UNIQUE,
 kind pg_catalog.text NOT NULL CHECK(kind IN('mcp','source_load')), parent pg_catalog.uuid REFERENCES nz_freight_quota.leases(id),
 issued_at pg_catalog.timestamptz NOT NULL, expires_at pg_catalog.timestamptz NOT NULL, released pg_catalog.bool NOT NULL DEFAULT false,
 CHECK(expires_at>issued_at AND expires_at<=issued_at+interval '20 seconds'),
 CHECK((kind='mcp' AND parent IS NULL) OR (kind='source_load' AND parent IS NOT NULL))
);
ALTER TABLE nz_freight_quota.control OWNER TO nz_freight_quota_owner;
ALTER TABLE nz_freight_quota.windows OWNER TO nz_freight_quota_owner;
ALTER TABLE nz_freight_quota.leases OWNER TO nz_freight_quota_owner;
ALTER TABLE nz_freight_quota.control ENABLE ROW LEVEL SECURITY;
ALTER TABLE nz_freight_quota.windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE nz_freight_quota.leases ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA nz_freight_quota FROM PUBLIC, anon, authenticated, nz_freight_quota;
-- Limited NOLOGIN owner owns only quota objects. No arbitrary SQL, names, clocks, caps or body fields.
CREATE FUNCTION nz_freight_quota.take_backend_attempt()
RETURNS pg_catalog.bool LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE minute_at pg_catalog.timestamptz; n pg_catalog.int4;
BEGIN
 -- Only called while the common control row is locked; no external EXECUTE grant.
 minute_at:=pg_catalog.date_trunc('minute',pg_catalog.clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';
 INSERT INTO nz_freight_quota.windows(kind,start_at,used) VALUES('attempt_minute',minute_at,1)
 ON CONFLICT(kind) DO UPDATE SET start_at=EXCLUDED.start_at,
 used=CASE WHEN nz_freight_quota.windows.start_at=EXCLUDED.start_at THEN least(nz_freight_quota.windows.used+1,481) ELSE 1 END RETURNING used INTO n;
 RETURN n<=480;
END $$;
CREATE FUNCTION nz_freight_quota.claim(p_invocation pg_catalog.uuid,p_kind pg_catalog.text,p_parent pg_catalog.uuid DEFAULT NULL)
RETURNS pg_catalog.jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp SET lock_timeout='100ms' AS $$
DECLARE t pg_catalog.timestamptz; ctl nz_freight_quota.control; parent_lease nz_freight_quota.leases; child_expiry pg_catalog.timestamptz; lease_id pg_catalog.uuid; fence_value pg_catalog.int8;
 minute_at pg_catalog.timestamptz; day_at pg_catalog.timestamptz; attempts pg_catalog.int4; current_count pg_catalog.int4;
 live_count pg_catalog.int4; limited pg_catalog.bool:=false; issue_ms pg_catalog.int8; expiry_ms pg_catalog.int8; db_ms pg_catalog.int8;
BEGIN
 SELECT * INTO STRICT ctl FROM nz_freight_quota.control WHERE id=1 FOR UPDATE;
 t:=pg_catalog.clock_timestamp(); -- AFTER lock; transaction-start now() is insufficient here
 minute_at:=pg_catalog.date_trunc('minute',t AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';
 day_at:=pg_catalog.date_trunc('day',t AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';
 IF NOT nz_freight_quota.take_backend_attempt() THEN RETURN pg_catalog.jsonb_build_object('state','denied','reason','limit','retryAfterSeconds',60); END IF;
 IF NOT ctl.enabled THEN RETURN pg_catalog.jsonb_build_object('state','denied','reason','closed','retryAfterSeconds',60); END IF;
 IF p_invocation IS NULL OR p_kind IS NULL OR p_kind NOT IN('mcp','source_load') OR (p_kind='mcp' AND p_parent IS NOT NULL) OR (p_kind='source_load' AND p_parent IS NULL) THEN
 RETURN pg_catalog.jsonb_build_object('state','denied','reason','unavailable','retryAfterSeconds',60); END IF;
 IF EXISTS(SELECT 1 FROM nz_freight_quota.leases WHERE invocation=p_invocation) THEN
 RETURN pg_catalog.jsonb_build_object('state','denied','reason','duplicate','retryAfterSeconds',60); END IF;
 IF p_kind='source_load' THEN
 SELECT * INTO parent_lease FROM nz_freight_quota.leases WHERE id=p_parent AND kind='mcp' FOR UPDATE;
 t:=pg_catalog.clock_timestamp(); -- resample AFTER parent lock, never use pre-lock time
 IF NOT FOUND OR parent_lease.released OR parent_lease.expires_at<t+interval '15 seconds' THEN
 RETURN pg_catalog.jsonb_build_object('state','denied','reason','unavailable','retryAfterSeconds',60); END IF;
 END IF;
 SELECT pg_catalog.count(*) INTO live_count FROM nz_freight_quota.leases WHERE kind=p_kind AND NOT released AND expires_at>t;
 IF live_count>=CASE WHEN p_kind='mcp' THEN 4 ELSE 2 END THEN limited:=true; END IF;
 IF p_kind='mcp' THEN
 INSERT INTO nz_freight_quota.windows(kind,start_at,used) VALUES('mcp_minute',minute_at,0),('mcp_day',day_at,0)
 ON CONFLICT(kind) DO UPDATE SET start_at=EXCLUDED.start_at,used=CASE WHEN nz_freight_quota.windows.start_at=EXCLUDED.start_at THEN nz_freight_quota.windows.used ELSE 0 END;
 IF EXISTS(SELECT 1 FROM nz_freight_quota.windows WHERE (kind='mcp_minute' AND used>=120) OR (kind='mcp_day' AND used>=2000)) THEN limited:=true; END IF;
 ELSE
 INSERT INTO nz_freight_quota.windows(kind,start_at,used) VALUES('source_day',day_at,0)
 ON CONFLICT(kind) DO UPDATE SET start_at=EXCLUDED.start_at,used=CASE WHEN nz_freight_quota.windows.start_at=EXCLUDED.start_at THEN nz_freight_quota.windows.used ELSE 0 END;
 IF EXISTS(SELECT 1 FROM nz_freight_quota.windows WHERE kind='source_day' AND used>=200) THEN limited:=true; END IF;
 END IF;
 -- Prune child before parent under the same control lock. Apply48hour cutoff only on this successful claim path. NOT an idle/disabled deletion guarantee. Independent bounded cleanup/monitor proof is an activation gate.
 DELETE FROM nz_freight_quota.leases WHERE kind='source_load' AND issued_at<t-interval '48 hours';
 DELETE FROM nz_freight_quota.leases l WHERE kind='mcp' AND issued_at<t-interval '48 hours' AND NOT EXISTS(SELECT 1 FROM nz_freight_quota.leases s WHERE s.parent=l.id);
 IF (SELECT pg_catalog.count(*) FROM nz_freight_quota.leases)>=7000 THEN limited:=true; END IF;
 IF limited THEN RETURN pg_catalog.jsonb_build_object('state','denied','reason','limit','retryAfterSeconds',60); END IF;
 UPDATE nz_freight_quota.windows SET used=used+1 WHERE kind=CASE WHEN p_kind='mcp' THEN 'mcp_minute' ELSE 'source_day' END;
 IF p_kind='mcp' THEN UPDATE nz_freight_quota.windows SET used=used+1 WHERE kind='mcp_day'; END IF;
 UPDATE nz_freight_quota.control SET next_fence=next_fence+1 WHERE id=1 RETURNING next_fence INTO fence_value;
 t:=pg_catalog.clock_timestamp(); -- fresh lease interval immediately after work under lock
 child_expiry:=t+interval '20 seconds';
 IF p_kind='source_load' THEN
 -- Parent row remains locked; fresh issuance cannot extend its lifetime.
 child_expiry:=least(child_expiry,parent_lease.expires_at);
 IF parent_lease.released OR child_expiry<t+interval '15 seconds' THEN
 RETURN pg_catalog.jsonb_build_object('state','denied','reason','unavailable','retryAfterSeconds',60); END IF;
 END IF;
 lease_id:=pg_catalog.gen_random_uuid();
 INSERT INTO nz_freight_quota.leases(invocation,id,fence,kind,parent,issued_at,expires_at) VALUES(p_invocation,lease_id,fence_value,p_kind,p_parent,t,child_expiry);
 issue_ms:=pg_catalog.floor(extract(epoch FROM t)*1000); expiry_ms:=pg_catalog.floor(extract(epoch FROM child_expiry)*1000);
 db_ms:=pg_catalog.floor(extract(epoch FROM pg_catalog.clock_timestamp())*1000); -- final fresh DB observation, consumer subtracts full RPC elapsed
 RETURN pg_catalog.jsonb_build_object('state','admitted','databaseNowMs',db_ms,'lease',pg_catalog.jsonb_build_object('id',lease_id,'issuedAtMs',issue_ms,'expiresAtMs',expiry_ms,'fence',fence_value));
END $$;
CREATE FUNCTION nz_freight_quota.release(p_id pg_catalog.uuid,p_fence pg_catalog.int8)
RETURNS pg_catalog.bool LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp SET lock_timeout='100ms' AS $$
BEGIN
 PERFORM 1 FROM nz_freight_quota.control WHERE id=1 FOR UPDATE;
 IF NOT nz_freight_quota.take_backend_attempt() THEN RETURN false; END IF;
 UPDATE nz_freight_quota.leases SET released=true WHERE id=p_id AND fence=p_fence;
 RETURN FOUND; -- exact fence, idempotent, no refund of attempt/minute/day counters
END $$;
CREATE FUNCTION nz_freight_quota.claim_log_slot()
RETURNS pg_catalog.bool LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp SET lock_timeout='100ms' AS $$
DECLARE t pg_catalog.timestamptz; enabled_value pg_catalog.bool; n pg_catalog.int4; minute_at pg_catalog.timestamptz;
BEGIN
 SELECT enabled INTO STRICT enabled_value FROM nz_freight_quota.control WHERE id=1 FOR UPDATE;
 IF NOT nz_freight_quota.take_backend_attempt() OR NOT enabled_value THEN RETURN false; END IF;
 t:=pg_catalog.clock_timestamp(); minute_at:=pg_catalog.date_trunc('minute',t AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';
 INSERT INTO nz_freight_quota.windows(kind,start_at,used) VALUES('log_minute',minute_at,1)
 ON CONFLICT(kind) DO UPDATE SET start_at=EXCLUDED.start_at,
 used=CASE WHEN nz_freight_quota.windows.start_at=EXCLUDED.start_at THEN least(nz_freight_quota.windows.used+1,11) ELSE 1 END RETURNING used INTO n;
 RETURN n<=10; -- globally bounded summary emission, never body/error/individual rejection log
END $$;
ALTER FUNCTION nz_freight_quota.take_backend_attempt() OWNER TO nz_freight_quota_owner;
ALTER FUNCTION nz_freight_quota.claim(pg_catalog.uuid,pg_catalog.text,pg_catalog.uuid) OWNER TO nz_freight_quota_owner;
ALTER FUNCTION nz_freight_quota.release(pg_catalog.uuid,pg_catalog.int8) OWNER TO nz_freight_quota_owner;
ALTER FUNCTION nz_freight_quota.claim_log_slot() OWNER TO nz_freight_quota_owner;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA nz_freight_quota FROM PUBLIC,anon,authenticated;
GRANT USAGE ON SCHEMA nz_freight_quota TO nz_freight_quota;
GRANT EXECUTE ON FUNCTION nz_freight_quota.claim(pg_catalog.uuid,pg_catalog.text,pg_catalog.uuid),nz_freight_quota.release(pg_catalog.uuid,pg_catalog.int8),nz_freight_quota.claim_log_slot() TO nz_freight_quota;
COMMIT;
-- Does not create LOGIN credentials, expose a Data API schema, enroll a user or enable control.
-- Independent real transaction/clock/cross-replica/cleanup/privilege proof is still REQUIRED.

-- Before any runtime grant: adversarial temp relations/types/functions/operators must fail to shadow
-- qualified objects. Test parent lock waits, expiry during claim, actual returned child interval,
-- released/absent parent, and owner/role escalation on an authorised disposable database.
