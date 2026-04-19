-- Helper: list KB-related cron jobs (read-only, security definer so app role can inspect)
CREATE OR REPLACE FUNCTION public.kb_cron_status()
RETURNS TABLE(jobname text, schedule text, active boolean, last_run_status text, last_run_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, cron
AS $$
  SELECT
    j.jobname::text,
    j.schedule::text,
    j.active,
    (SELECT r.status::text FROM cron.job_run_details r WHERE r.jobid = j.jobid ORDER BY r.start_time DESC LIMIT 1) AS last_run_status,
    (SELECT r.start_time FROM cron.job_run_details r WHERE r.jobid = j.jobid ORDER BY r.start_time DESC LIMIT 1) AS last_run_at
  FROM cron.job j
  WHERE j.jobname LIKE 'kb-%' OR j.jobname IN ('tick-every-minute','embed-worker-every-5min','health-check-hourly')
  ORDER BY j.jobname;
$$;

GRANT EXECUTE ON FUNCTION public.kb_cron_status() TO authenticated, anon, service_role;

-- Re-queue all existing documents (the prior embed-worker runs marked many as 'done' or 'error' with 0 chunks)
INSERT INTO public.kb_embed_queue (document_id, status)
SELECT d.id, 'pending'
FROM public.kb_documents d
WHERE NOT EXISTS (SELECT 1 FROM public.kb_doc_chunks c WHERE c.document_id = d.id)
ON CONFLICT DO NOTHING;