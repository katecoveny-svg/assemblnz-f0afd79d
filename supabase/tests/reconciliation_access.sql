BEGIN;
DO $$
DECLARE t text; r text; p text;
BEGIN
  FOREACH t IN ARRAY ARRAY['auaha_generations','auaha_demo_assets','family_inbox_tokens'] LOOP
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid=('public.'||t)::regclass) THEN RAISE EXCEPTION 'RLS missing: %',t; END IF;
    FOREACH r IN ARRAY ARRAY['anon','authenticated'] LOOP
      FOREACH p IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'] LOOP
        IF has_table_privilege(r,'public.'||t,p) THEN RAISE EXCEPTION 'Unexpected % % on %',r,p,t; END IF;
      END LOOP;
    END LOOP;
    FOREACH p IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE'] LOOP
      IF NOT has_table_privilege('service_role','public.'||t,p) THEN RAISE EXCEPTION 'Service missing % on %',p,t; END IF;
    END LOOP;
  END LOOP;
  IF EXISTS (SELECT FROM pg_policies WHERE tablename IN ('auaha_generations','auaha_demo_assets') AND policyname='service_full_access' AND roles <> ARRAY['service_role']::name[]) THEN RAISE EXCEPTION 'Policy role scope wrong'; END IF;
END $$;
SET ROLE service_role;
INSERT INTO public.auaha_generations(rate_key,kind) VALUES ('synthetic-test','copy');
UPDATE public.auaha_generations SET model='synthetic' WHERE rate_key='synthetic-test';
SELECT count(*) FROM public.auaha_generations WHERE rate_key='synthetic-test';
DELETE FROM public.auaha_generations WHERE rate_key='synthetic-test';
INSERT INTO public.auaha_demo_assets(agent,kind) VALUES ('synthetic-test','copy');
UPDATE public.auaha_demo_assets SET model='synthetic' WHERE agent='synthetic-test';
DELETE FROM public.auaha_demo_assets WHERE agent='synthetic-test';
INSERT INTO public.family_inbox_tokens(hub,provider,refresh_token) VALUES ('synthetic-test','gmail','fake-test-value');
UPDATE public.family_inbox_tokens SET email='test.invalid' WHERE hub='synthetic-test';
DELETE FROM public.family_inbox_tokens WHERE hub='synthetic-test';
RESET ROLE;
ROLLBACK;
