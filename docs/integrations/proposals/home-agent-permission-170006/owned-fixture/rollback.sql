\set ON_ERROR_STOP on
SELECT :'HOST'='/var/run/postgresql' AND :'DBNAME'='acl_fixture'
 AND current_database()='acl_fixture' AND current_user='postgres' AND session_user='postgres'
 AND current_setting('server_version_num')::integer>=170000 AS target_valid \gset
\if :target_valid
\else
DO $wrong_target$ BEGIN
 RAISE EXCEPTION USING MESSAGE='Wrong fixture target/executor/version';
END $wrong_target$;
\endif
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
LOCK TABLE public.home_agent_log IN ACCESS EXCLUSIVE MODE;

CREATE FUNCTION pg_temp.home_acl_snapshot() RETURNS jsonb LANGUAGE sql STABLE AS $snapshot$
WITH roles AS (
 SELECT oid,rolname,rolinherit,rolsuper,rolbypassrls,rolcanlogin
 FROM pg_roles WHERE rolname IN ('postgres','anon','authenticated','service_role','authenticator')
)
SELECT jsonb_build_object(
'table',(SELECT jsonb_build_object('owner',pg_get_userbyid(c.relowner),
'acl',COALESCE((SELECT jsonb_agg(x::text ORDER BY x::text) FROM unnest(c.relacl) x),'[]'::jsonb),
'rls',c.relrowsecurity,'force_rls',c.relforcerowsecurity)
FROM pg_class c WHERE c.oid='public.home_agent_log'::regclass),
'sequence',(SELECT jsonb_build_object('name',n.nspname||'.'||c.relname,'owner',pg_get_userbyid(c.relowner),
'acl',COALESCE((SELECT jsonb_agg(x::text ORDER BY x::text) FROM unnest(c.relacl) x),'[]'::jsonb),
'column',a.attname,'dependency_type',d.deptype)
FROM pg_depend d JOIN pg_class c ON c.oid=d.objid AND c.relkind='S'
JOIN pg_namespace n ON n.oid=c.relnamespace
JOIN pg_attribute a ON a.attrelid=d.refobjid AND a.attnum=d.refobjsubid
WHERE d.refobjid='public.home_agent_log'::regclass AND d.classid='pg_class'::regclass
AND d.refclassid='pg_class'::regclass AND d.deptype='a'),
'columns',(SELECT jsonb_agg(jsonb_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),
'not_null',a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid),'identity',a.attidentity) ORDER BY a.attnum)
FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
WHERE a.attrelid='public.home_agent_log'::regclass AND a.attnum>0 AND NOT a.attisdropped),
'column_acls',COALESCE((SELECT jsonb_agg(jsonb_build_object('name',a.attname,'acl',
(SELECT jsonb_agg(x::text ORDER BY x::text) FROM unnest(a.attacl) x)) ORDER BY a.attname)
FROM pg_attribute a WHERE a.attrelid='public.home_agent_log'::regclass AND a.attnum>0
AND NOT a.attisdropped AND a.attacl IS NOT NULL),'[]'::jsonb),
'constraints',COALESCE((SELECT jsonb_agg(jsonb_build_object('name',conname,'type',contype,
'definition',pg_get_constraintdef(oid),'validated',convalidated) ORDER BY conname)
FROM pg_constraint WHERE conrelid='public.home_agent_log'::regclass),'[]'::jsonb),
'roles',(SELECT jsonb_agg(jsonb_build_object('rolname',rolname,'rolsuper',rolsuper,
'rolinherit',rolinherit,'rolcanlogin',rolcanlogin,'rolbypassrls',rolbypassrls) ORDER BY rolname) FROM roles),
'memberships',COALESCE((SELECT jsonb_agg(jsonb_build_object('member',pg_get_userbyid(m.member),
'role',pg_get_userbyid(m.roleid),'admin',m.admin_option,'inherit',m.inherit_option,'set',m.set_option)
ORDER BY pg_get_userbyid(m.member),pg_get_userbyid(m.roleid))
FROM pg_auth_members m WHERE m.member IN (SELECT oid FROM roles) OR m.roleid IN (SELECT oid FROM roles)),'[]'::jsonb),
'schema',(SELECT jsonb_build_object('owner',pg_get_userbyid(nspowner),
'acl',COALESCE((SELECT jsonb_agg(x::text ORDER BY x::text) FROM unnest(nspacl) x),'[]'::jsonb))
FROM pg_namespace WHERE nspname='public'),
'default_acls',COALESCE((SELECT jsonb_agg(jsonb_build_object('owner',pg_get_userbyid(defaclrole),
'schema',CASE WHEN defaclnamespace=0 THEN '<global>' ELSE defaclnamespace::regnamespace::text END,
'object_type',defaclobjtype,'acl',(SELECT jsonb_agg(x::text ORDER BY x::text) FROM unnest(defaclacl) x))
ORDER BY pg_get_userbyid(defaclrole),CASE WHEN defaclnamespace=0 THEN '<global>' ELSE defaclnamespace::regnamespace::text END,defaclobjtype)
FROM pg_default_acl WHERE defaclrole=(SELECT oid FROM roles WHERE rolname='postgres')
AND defaclnamespace IN (0,'public'::regnamespace)),'[]'::jsonb),
'effective',(SELECT jsonb_agg(jsonb_build_object('role',rolname,
'schema_usage',has_schema_privilege(oid,'public','USAGE'),'schema_create',has_schema_privilege(oid,'public','CREATE'),
'table_select',has_table_privilege(oid,'public.home_agent_log','SELECT'),
'table_insert',has_table_privilege(oid,'public.home_agent_log','INSERT'),
'table_update',has_table_privilege(oid,'public.home_agent_log','UPDATE'),
'table_delete',has_table_privilege(oid,'public.home_agent_log','DELETE'),
'table_truncate',has_table_privilege(oid,'public.home_agent_log','TRUNCATE'),
'table_references',has_table_privilege(oid,'public.home_agent_log','REFERENCES'),
'table_trigger',has_table_privilege(oid,'public.home_agent_log','TRIGGER'),
'table_maintain',has_table_privilege(oid,'public.home_agent_log','MAINTAIN'),
'seq_usage',has_sequence_privilege(oid,'public.home_agent_log_id_seq','USAGE'),
'seq_select',has_sequence_privilege(oid,'public.home_agent_log_id_seq','SELECT'),
'seq_update',has_sequence_privilege(oid,'public.home_agent_log_id_seq','UPDATE')) ORDER BY rolname) FROM roles),
'policies',COALESCE((SELECT jsonb_agg(jsonb_build_object('name',policyname,'roles',roles,'command',cmd,
'using',qual,'check',with_check) ORDER BY policyname) FROM pg_policies
WHERE schemaname='public' AND tablename='home_agent_log'),'[]'::jsonb),
'triggers',COALESCE((SELECT jsonb_agg(jsonb_build_object('name',tgname,'internal',tgisinternal,
'function',tgfoid::regprocedure::text) ORDER BY tgname)
FROM pg_trigger WHERE tgrelid='public.home_agent_log'::regclass),'[]'::jsonb)
);
$snapshot$;

DO $assert$
BEGIN
 IF current_user<>'postgres' OR session_user<>'postgres' THEN
  RAISE EXCEPTION 'Executor changed; abort'; END IF;
 IF pg_get_serial_sequence('public.home_agent_log','id') IS DISTINCT FROM 'public.home_agent_log_id_seq'
  THEN RAISE EXCEPTION 'Sequence association drift'; END IF;
 IF pg_temp.home_acl_snapshot() IS DISTINCT FROM $expected${"table":{"acl":["postgres=arwdDxtm/postgres","service_role=arwdDxtm/postgres"],"rls":true,"owner":"postgres","force_rls":false},"sequence":{"acl":["postgres=rwU/postgres","service_role=rwU/postgres"],"name":"public.home_agent_log_id_seq","owner":"postgres","column":"id","dependency_type":"a"},"columns":[{"name":"id","type":"bigint","default":"nextval('home_agent_log_id_seq'::regclass)","identity":"","not_null":true},{"name":"session_id","type":"text","default":null,"identity":"","not_null":true},{"name":"ip_hash","type":"text","default":null,"identity":"","not_null":false},{"name":"role","type":"text","default":null,"identity":"","not_null":true},{"name":"message","type":"text","default":null,"identity":"","not_null":true},{"name":"model","type":"text","default":null,"identity":"","not_null":false},{"name":"created_at","type":"timestamp with time zone","default":"now()","identity":"","not_null":true},{"name":"agent_slug","type":"text","default":"'home-guide'::text","identity":"","not_null":true}],"column_acls":[],"constraints":[{"name":"home_agent_log_pkey","type":"p","validated":true,"definition":"PRIMARY KEY (id)"},{"name":"home_agent_log_role_check","type":"c","validated":true,"definition":"CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text])))"}],"roles":[{"rolname":"anon","rolsuper":false,"rolinherit":true,"rolcanlogin":false,"rolbypassrls":false},{"rolname":"authenticated","rolsuper":false,"rolinherit":true,"rolcanlogin":false,"rolbypassrls":false},{"rolname":"authenticator","rolsuper":false,"rolinherit":false,"rolcanlogin":true,"rolbypassrls":false},{"rolname":"postgres","rolsuper":false,"rolinherit":true,"rolcanlogin":true,"rolbypassrls":true},{"rolname":"service_role","rolsuper":false,"rolinherit":true,"rolcanlogin":false,"rolbypassrls":true}],"memberships":[{"set":true,"role":"anon","admin":false,"member":"authenticator","inherit":false},{"set":true,"role":"authenticated","admin":false,"member":"authenticator","inherit":false},{"set":true,"role":"service_role","admin":false,"member":"authenticator","inherit":false},{"set":true,"role":"postgres","admin":false,"member":"cli_login_postgres","inherit":false},{"set":true,"role":"anon","admin":true,"member":"postgres","inherit":true},{"set":true,"role":"authenticated","admin":true,"member":"postgres","inherit":true},{"set":true,"role":"authenticator","admin":true,"member":"postgres","inherit":true},{"set":true,"role":"pg_create_subscription","admin":true,"member":"postgres","inherit":true},{"set":true,"role":"pg_monitor","admin":true,"member":"postgres","inherit":true},{"set":true,"role":"pg_read_all_data","admin":true,"member":"postgres","inherit":true},{"set":true,"role":"pg_signal_backend","admin":true,"member":"postgres","inherit":true},{"set":true,"role":"service_role","admin":true,"member":"postgres","inherit":true},{"set":true,"role":"supabase_privileged_role","admin":false,"member":"postgres","inherit":true},{"set":true,"role":"authenticator","admin":false,"member":"supabase_storage_admin","inherit":false}],"schema":{"acl":["=U/pg_database_owner","anon=U/pg_database_owner","authenticated=U/pg_database_owner","pg_database_owner=UC/pg_database_owner","postgres=U/pg_database_owner","service_role=U/pg_database_owner"],"owner":"pg_database_owner"},"default_acls":[{"acl":["anon=rwU/postgres","authenticated=rwU/postgres","postgres=rwU/postgres","service_role=rwU/postgres"],"owner":"postgres","schema":"public","object_type":"S"},{"acl":["anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"],"owner":"postgres","schema":"public","object_type":"f"},{"acl":["anon=arwdDxtm/postgres","authenticated=arwdDxtm/postgres","postgres=arwdDxtm/postgres","service_role=arwdDxtm/postgres"],"owner":"postgres","schema":"public","object_type":"r"}],"effective":[{"role":"anon","seq_usage":false,"seq_select":false,"seq_update":false,"schema_usage":true,"table_delete":false,"table_insert":false,"table_select":false,"table_update":false,"schema_create":false,"table_trigger":false,"table_maintain":false,"table_truncate":false,"table_references":false},{"role":"authenticated","seq_usage":false,"seq_select":false,"seq_update":false,"schema_usage":true,"table_delete":false,"table_insert":false,"table_select":false,"table_update":false,"schema_create":false,"table_trigger":false,"table_maintain":false,"table_truncate":false,"table_references":false},{"role":"authenticator","seq_usage":false,"seq_select":false,"seq_update":false,"schema_usage":true,"table_delete":false,"table_insert":false,"table_select":false,"table_update":false,"schema_create":false,"table_trigger":false,"table_maintain":false,"table_truncate":false,"table_references":false},{"role":"postgres","seq_usage":true,"seq_select":true,"seq_update":true,"schema_usage":true,"table_delete":true,"table_insert":true,"table_select":true,"table_update":true,"schema_create":true,"table_trigger":true,"table_maintain":true,"table_truncate":true,"table_references":true},{"role":"service_role","seq_usage":true,"seq_select":true,"seq_update":true,"schema_usage":true,"table_delete":true,"table_insert":true,"table_select":true,"table_update":true,"schema_create":false,"table_trigger":true,"table_maintain":true,"table_truncate":true,"table_references":true}],"policies":[],"triggers":[]}$expected$::jsonb
  THEN RAISE EXCEPTION 'Pre-action metadata/effective-privilege drift; abort'; END IF;
END;
$assert$;
-- Separate approval required: restores captured visitor privileges and risk.
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
 ON TABLE public.home_agent_log TO anon, authenticated;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.home_agent_log_id_seq TO anon, authenticated;
-- No PUBLIC entry existed. No service_role, owner, defaults or history changes.

DO $assert$
BEGIN
 IF current_user<>'postgres' OR session_user<>'postgres' THEN
  RAISE EXCEPTION 'Executor changed; abort'; END IF;
 IF pg_get_serial_sequence('public.home_agent_log','id') IS DISTINCT FROM 'public.home_agent_log_id_seq'
  THEN RAISE EXCEPTION 'Sequence association drift'; END IF;
 IF pg_temp.home_acl_snapshot() IS DISTINCT FROM $expected${"table":{"acl":["anon=arwdDxtm/postgres","authenticated=arwdDxtm/postgres","postgres=arwdDxtm/postgres","service_role=arwdDxtm/postgres"],"rls":true,"owner":"postgres","force_rls":false},"sequence":{"acl":["anon=rwU/postgres","authenticated=rwU/postgres","postgres=rwU/postgres","service_role=rwU/postgres"],"name":"public.home_agent_log_id_seq","owner":"postgres","column":"id","dependency_type":"a"},"columns":[{"name":"id","type":"bigint","default":"nextval('home_agent_log_id_seq'::regclass)","identity":"","not_null":true},{"name":"session_id","type":"text","default":null,"identity":"","not_null":true},{"name":"ip_hash","type":"text","default":null,"identity":"","not_null":false},{"name":"role","type":"text","default":null,"identity":"","not_null":true},{"name":"message","type":"text","default":null,"identity":"","not_null":true},{"name":"model","type":"text","default":null,"identity":"","not_null":false},{"name":"created_at","type":"timestamp with time zone","default":"now()","identity":"","not_null":true},{"name":"agent_slug","type":"text","default":"'home-guide'::text","identity":"","not_null":true}],"column_acls":[],"constraints":[{"name":"home_agent_log_pkey","type":"p","validated":true,"definition":"PRIMARY KEY (id)"},{"name":"home_agent_log_role_check","type":"c","validated":true,"definition":"CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text])))"}],"roles":[{"rolname":"anon","rolsuper":false,"rolinherit":true,"rolcanlogin":false,"rolbypassrls":false},{"rolname":"authenticated","rolsuper":false,"rolinherit":true,"rolcanlogin":false,"rolbypassrls":false},{"rolname":"authenticator","rolsuper":false,"rolinherit":false,"rolcanlogin":true,"rolbypassrls":false},{"rolname":"postgres","rolsuper":false,"rolinherit":true,"rolcanlogin":true,"rolbypassrls":true},{"rolname":"service_role","rolsuper":false,"rolinherit":true,"rolcanlogin":false,"rolbypassrls":true}],"memberships":[{"set":true,"role":"anon","admin":false,"member":"authenticator","inherit":false},{"set":true,"role":"authenticated","admin":false,"member":"authenticator","inherit":false},{"set":true,"role":"service_role","admin":false,"member":"authenticator","inherit":false},{"set":true,"role":"postgres","admin":false,"member":"cli_login_postgres","inherit":false},{"set":true,"role":"anon","admin":true,"member":"postgres","inherit":true},{"set":true,"role":"authenticated","admin":true,"member":"postgres","inherit":true},{"set":true,"role":"authenticator","admin":true,"member":"postgres","inherit":true},{"set":true,"role":"pg_create_subscription","admin":true,"member":"postgres","inherit":true},{"set":true,"role":"pg_monitor","admin":true,"member":"postgres","inherit":true},{"set":true,"role":"pg_read_all_data","admin":true,"member":"postgres","inherit":true},{"set":true,"role":"pg_signal_backend","admin":true,"member":"postgres","inherit":true},{"set":true,"role":"service_role","admin":true,"member":"postgres","inherit":true},{"set":true,"role":"supabase_privileged_role","admin":false,"member":"postgres","inherit":true},{"set":true,"role":"authenticator","admin":false,"member":"supabase_storage_admin","inherit":false}],"schema":{"acl":["=U/pg_database_owner","anon=U/pg_database_owner","authenticated=U/pg_database_owner","pg_database_owner=UC/pg_database_owner","postgres=U/pg_database_owner","service_role=U/pg_database_owner"],"owner":"pg_database_owner"},"default_acls":[{"acl":["anon=rwU/postgres","authenticated=rwU/postgres","postgres=rwU/postgres","service_role=rwU/postgres"],"owner":"postgres","schema":"public","object_type":"S"},{"acl":["anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"],"owner":"postgres","schema":"public","object_type":"f"},{"acl":["anon=arwdDxtm/postgres","authenticated=arwdDxtm/postgres","postgres=arwdDxtm/postgres","service_role=arwdDxtm/postgres"],"owner":"postgres","schema":"public","object_type":"r"}],"effective":[{"role":"anon","seq_usage":true,"seq_select":true,"seq_update":true,"schema_usage":true,"table_delete":true,"table_insert":true,"table_select":true,"table_update":true,"schema_create":false,"table_trigger":true,"table_maintain":true,"table_truncate":true,"table_references":true},{"role":"authenticated","seq_usage":true,"seq_select":true,"seq_update":true,"schema_usage":true,"table_delete":true,"table_insert":true,"table_select":true,"table_update":true,"schema_create":false,"table_trigger":true,"table_maintain":true,"table_truncate":true,"table_references":true},{"role":"authenticator","seq_usage":false,"seq_select":false,"seq_update":false,"schema_usage":true,"table_delete":false,"table_insert":false,"table_select":false,"table_update":false,"schema_create":false,"table_trigger":false,"table_maintain":false,"table_truncate":false,"table_references":false},{"role":"postgres","seq_usage":true,"seq_select":true,"seq_update":true,"schema_usage":true,"table_delete":true,"table_insert":true,"table_select":true,"table_update":true,"schema_create":true,"table_trigger":true,"table_maintain":true,"table_truncate":true,"table_references":true},{"role":"service_role","seq_usage":true,"seq_select":true,"seq_update":true,"schema_usage":true,"table_delete":true,"table_insert":true,"table_select":true,"table_update":true,"schema_create":false,"table_trigger":true,"table_maintain":true,"table_truncate":true,"table_references":true}],"policies":[],"triggers":[]}$expected$::jsonb
  THEN RAISE EXCEPTION 'Before commit metadata/effective-privilege drift; abort'; END IF;
END;
$assert$;

DROP FUNCTION pg_temp.home_acl_snapshot();
\echo ACL_COMMIT_GATE_READY
\prompt '' acl_commit_gate
\if :acl_commit_gate
COMMIT;
\else
ROLLBACK;
DO $commit_refused$ BEGIN
 RAISE EXCEPTION USING MESSAGE='Fixture commit gate refused; transaction rolled back';
END $commit_refused$;
\endif
