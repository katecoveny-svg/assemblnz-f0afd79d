-- UNAPPLIED. Separate approval after quota-review.sql; no scheduler/grant executed in production.
-- Independent of enabled state and inbound claims. Fixed200 deletion budget/100ms lock wait.
BEGIN;
CREATE ROLE nz_freight_cleanup NOLOGIN NOBYPASSRLS;
CREATE TABLE nz_freight_quota.cleanup_status(id pg_catalog.int4 PRIMARY KEY CHECK(id=1),last_success pg_catalog.timestamptz,overdue pg_catalog.bool NOT NULL DEFAULT true);
INSERT INTO nz_freight_quota.cleanup_status(id) VALUES(1);
ALTER TABLE nz_freight_quota.cleanup_status OWNER TO nz_freight_quota_owner;
ALTER TABLE nz_freight_quota.cleanup_status ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON nz_freight_quota.cleanup_status FROM PUBLIC,anon,authenticated,nz_freight_quota,nz_freight_cleanup;
CREATE FUNCTION nz_freight_quota.cleanup_expired()
RETURNS pg_catalog.jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,pg_temp SET lock_timeout='100ms' SET statement_timeout='500ms' AS $$
DECLARE t pg_catalog.timestamptz; children pg_catalog.int4; parents pg_catalog.int4; overdue_value pg_catalog.bool;
BEGIN
 PERFORM 1 FROM nz_freight_quota.control WHERE id=1 FOR UPDATE;
 t:=pg_catalog.clock_timestamp();
 DELETE FROM nz_freight_quota.leases WHERE id IN (
   SELECT id FROM nz_freight_quota.leases WHERE kind='source_load' AND issued_at<t-interval '48 hours' ORDER BY issued_at,id LIMIT 100);
 GET DIAGNOSTICS children=ROW_COUNT;
 DELETE FROM nz_freight_quota.leases WHERE id IN (
   SELECT p.id FROM nz_freight_quota.leases p WHERE p.kind='mcp' AND p.issued_at<t-interval '48 hours'
   AND NOT EXISTS(SELECT 1 FROM nz_freight_quota.leases c WHERE c.parent=p.id) ORDER BY p.issued_at,p.id LIMIT 100);
 GET DIAGNOSTICS parents=ROW_COUNT;
 overdue_value:=EXISTS(SELECT 1 FROM nz_freight_quota.leases WHERE issued_at<t-interval '49 hours');
 UPDATE nz_freight_quota.cleanup_status SET last_success=pg_catalog.clock_timestamp(),overdue=overdue_value WHERE id=1;
 IF overdue_value THEN UPDATE nz_freight_quota.control SET enabled=false WHERE id=1; END IF;
 RETURN pg_catalog.jsonb_build_object('deleted',children+parents,'overdue',overdue_value,'observedAtMs',pg_catalog.floor(extract(epoch FROM t)*1000));
END $$;
ALTER FUNCTION nz_freight_quota.cleanup_expired() OWNER TO nz_freight_quota_owner;
REVOKE ALL ON FUNCTION nz_freight_quota.cleanup_expired() FROM PUBLIC,anon,authenticated,nz_freight_quota;
GRANT USAGE ON SCHEMA nz_freight_quota TO nz_freight_cleanup;
GRANT EXECUTE ON FUNCTION nz_freight_quota.cleanup_expired() TO nz_freight_cleanup;
CREATE FUNCTION nz_freight_quota.cleanup_health()
RETURNS pg_catalog.jsonb LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
 SELECT pg_catalog.jsonb_build_object('healthy',last_success IS NOT NULL AND NOT overdue AND last_success<=pg_catalog.clock_timestamp() AND last_success>pg_catalog.clock_timestamp()-interval '30 minutes') FROM nz_freight_quota.cleanup_status WHERE id=1
$$;
ALTER FUNCTION nz_freight_quota.cleanup_health() OWNER TO nz_freight_quota_owner;
REVOKE ALL ON FUNCTION nz_freight_quota.cleanup_health() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION nz_freight_quota.cleanup_health() TO nz_freight_quota,nz_freight_cleanup;
COMMIT;
-- Proposed independent Supabase Cron: every15minutes, SET LOCAL ROLE nz_freight_cleanup;
-- SELECT nz_freight_quota.cleanup_expired(); RESET ROLE; (scheduler approval not included).
-- Cron invocations need external SET LOCAL statement_timeout=500ms BEFORE calling function;
-- function SET alone is not guaranteed to time an already running statement.
-- Monitor fixed overdue/missed-run counts; overdue or scheduler silence keeps pilot OFF.
--48h is cutoff target, not a hard deletion promise; bounded draining can span multiple runs.
