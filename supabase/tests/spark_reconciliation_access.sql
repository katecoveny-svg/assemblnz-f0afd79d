BEGIN;
INSERT INTO public.spark_tools(slug,title,summary,prompt,html) VALUES ('synthetic-test','test','test','test','test');
DO $$
DECLARE r text; p text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon','authenticated'] LOOP
    FOREACH p IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'] LOOP
      IF has_table_privilege(r,'public.spark_tools',p) THEN RAISE EXCEPTION 'Unexpected Spark privilege'; END IF;
    END LOOP;
  END LOOP;
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid='public.spark_tools'::regclass) THEN RAISE EXCEPTION 'Spark RLS missing'; END IF;
END $$;
SET LOCAL ROLE service_role;
SELECT count(*) FROM public.spark_tools WHERE slug='synthetic-test';
UPDATE public.spark_tools SET title='updated' WHERE slug='synthetic-test';
DELETE FROM public.spark_tools WHERE slug='synthetic-test';
INSERT INTO public.spark_tools(slug,title,summary,prompt,html) VALUES ('synthetic-service','test','test','test','test');
ROLLBACK;
