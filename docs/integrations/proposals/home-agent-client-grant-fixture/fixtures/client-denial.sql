\set ON_ERROR_STOP on
-- DISPOSABLE FIXTURE ONLY; catches SQL privilege failures.
BEGIN;
SET LOCAL ROLE anon;
DO $test$
BEGIN
 BEGIN PERFORM count(*) FROM public.home_agent_log;
  RAISE EXCEPTION 'Unexpected anon SELECT'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN INSERT INTO public.home_agent_log(session_id,role,message) VALUES('denied','user','fixture');
  RAISE EXCEPTION 'Unexpected anon INSERT'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN TRUNCATE public.home_agent_log;
  RAISE EXCEPTION 'Unexpected anon TRUNCATE'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM nextval('public.home_agent_log_id_seq');
  RAISE EXCEPTION 'Unexpected anon nextval'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM setval('public.home_agent_log_id_seq',500);
  RAISE EXCEPTION 'Unexpected anon setval'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;
$test$;
ROLLBACK;
BEGIN;
SET LOCAL ROLE authenticated;
DO $test$
BEGIN
 IF has_table_privilege(current_user,'public.home_agent_log','SELECT')
 OR has_table_privilege(current_user,'public.home_agent_log','TRUNCATE')
 OR has_sequence_privilege(current_user,'public.home_agent_log_id_seq','USAGE')
 OR has_sequence_privilege(current_user,'public.home_agent_log_id_seq','UPDATE')
 THEN RAISE EXCEPTION 'Unexpected authenticated effective privileges'; END IF;
 BEGIN TRUNCATE public.home_agent_log;
  RAISE EXCEPTION 'Unexpected authenticated TRUNCATE'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN INSERT INTO public.home_agent_log(session_id,role,message) VALUES('denied','user','fixture');
  RAISE EXCEPTION 'Unexpected authenticated INSERT'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;
$test$;
ROLLBACK;

