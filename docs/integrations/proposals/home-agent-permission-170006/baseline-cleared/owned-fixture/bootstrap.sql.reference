-- DISPOSABLE FIXTURE ONLY. Runs as fixture_admin superuser created by initdb.
CREATE ROLE postgres LOGIN NOSUPERUSER BYPASSRLS INHERIT;
CREATE ROLE anon NOLOGIN NOSUPERUSER NOBYPASSRLS INHERIT;
CREATE ROLE authenticated NOLOGIN NOSUPERUSER NOBYPASSRLS INHERIT;
CREATE ROLE service_role NOLOGIN NOSUPERUSER BYPASSRLS INHERIT;
CREATE ROLE authenticator LOGIN NOSUPERUSER NOBYPASSRLS NOINHERIT;
CREATE ROLE supabase_storage_admin NOLOGIN;
CREATE ROLE supabase_privileged_role NOLOGIN;
CREATE ROLE cli_login_postgres NOLOGIN;
GRANT anon,authenticated,service_role TO authenticator WITH ADMIN FALSE, INHERIT FALSE, SET TRUE;
GRANT authenticator TO supabase_storage_admin WITH ADMIN FALSE, INHERIT FALSE, SET TRUE;
GRANT anon,authenticated,service_role,authenticator,pg_monitor,pg_read_all_data,pg_signal_backend,pg_create_subscription
 TO postgres WITH ADMIN TRUE, INHERIT TRUE, SET TRUE;
GRANT supabase_privileged_role TO postgres WITH ADMIN FALSE, INHERIT TRUE, SET TRUE;
GRANT postgres TO cli_login_postgres WITH ADMIN FALSE, INHERIT FALSE, SET TRUE;
CREATE DATABASE acl_fixture OWNER postgres;
\connect acl_fixture postgres
GRANT USAGE ON SCHEMA public TO postgres,anon,authenticated,service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
 GRANT ALL ON TABLES TO anon,authenticated,service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
 GRANT ALL ON SEQUENCES TO anon,authenticated,service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
 GRANT EXECUTE ON FUNCTIONS TO anon,authenticated,service_role;
-- Explicit owner entries match captured schema-local defaults; fixture only.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO postgres;
CREATE TABLE public.home_agent_log(
 id bigserial PRIMARY KEY,session_id text NOT NULL,ip_hash text,role text NOT NULL CHECK(role IN ('user','assistant')),
 message text NOT NULL,model text,created_at timestamptz NOT NULL DEFAULT now(),
 agent_slug text NOT NULL DEFAULT 'home-guide'
);
CREATE INDEX home_agent_log_session_idx ON public.home_agent_log(session_id,created_at DESC);
CREATE INDEX home_agent_log_ip_idx ON public.home_agent_log(ip_hash,created_at DESC);
CREATE INDEX home_agent_log_agent_slug_idx ON public.home_agent_log(agent_slug,created_at DESC);
ALTER TABLE public.home_agent_log ENABLE ROW LEVEL SECURITY;

