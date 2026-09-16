-- Reconcile legacy tenant policies with the newer owner-only memory contract.
-- `shared` means this owner's other agents, never another account in a tenant.
-- Preserve rows, owner CRUD, and trusted service-role jobs.
BEGIN;

ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agent_memory_tenant_read ON public.agent_memory;
DROP POLICY IF EXISTS agent_memory_tenant_write ON public.agent_memory;

-- RLS does not protect TRUNCATE. Public clients only need owner-scoped CRUD.
REVOKE ALL ON TABLE public.agent_memory FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.agent_memory TO authenticated;

-- A SECURITY DEFINER search would bypass the table's owner policies.
ALTER FUNCTION public.match_agent_memory(uuid, uuid, vector, integer, double precision)
  SECURITY INVOKER;
REVOKE ALL ON FUNCTION public.match_agent_memory(uuid, uuid, vector, integer, double precision)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_agent_memory(uuid, uuid, vector, integer, double precision)
  TO authenticated, service_role;

COMMIT;
