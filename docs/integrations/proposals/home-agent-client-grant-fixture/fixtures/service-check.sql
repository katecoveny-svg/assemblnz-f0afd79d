\set ON_ERROR_STOP on
-- DISPOSABLE FIXTURE ONLY. Test actual SQL, not HTTP status.
BEGIN;
SET LOCAL ROLE service_role;
DO $test$
DECLARE a bigint; b bigint; n bigint; before_count bigint;
BEGIN
 SELECT count(*) INTO before_count FROM public.home_agent_log WHERE session_id='fixture-service';
 INSERT INTO public.home_agent_log(session_id,role,message)
 VALUES('fixture-service','user','fixture') RETURNING id INTO a;
 INSERT INTO public.home_agent_log(session_id,role,message)
 VALUES('fixture-service','assistant','fixture') RETURNING id INTO b;
 IF a IS NULL OR b IS NULL OR a=b OR a<1 OR b<1 THEN
  RAISE EXCEPTION 'Generated IDs failed'; END IF;
 SELECT count(*) INTO n FROM public.home_agent_log WHERE session_id='fixture-service';
 IF n<>before_count+2 THEN RAISE EXCEPTION 'Actual service COUNT/INSERT failed'; END IF;
END;
$test$;
COMMIT;

