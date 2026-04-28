CREATE OR REPLACE FUNCTION public.admin_claude_usage_stats(
  p_since timestamptz DEFAULT (now() - interval '7 days'),
  p_only_claude boolean DEFAULT true
)
RETURNS TABLE (
  agent_name text,
  model_used text,
  messages bigint,
  errors bigint,
  error_rate numeric,
  avg_latency_ms numeric,
  p95_latency_ms numeric,
  total_input_tokens bigint,
  total_output_tokens bigint,
  total_cost_nzd numeric,
  last_used timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.agent_name,
    COALESCE(a.model_used, 'unknown') AS model_used,
    COUNT(*)::bigint AS messages,
    COUNT(*) FILTER (WHERE a.error)::bigint AS errors,
    ROUND(
      (COUNT(*) FILTER (WHERE a.error)::numeric
        / NULLIF(COUNT(*), 0)::numeric) * 100, 2
    ) AS error_rate,
    ROUND(AVG(a.response_time_ms)::numeric, 0) AS avg_latency_ms,
    ROUND(
      percentile_cont(0.95) WITHIN GROUP (ORDER BY a.response_time_ms)::numeric,
      0
    ) AS p95_latency_ms,
    COALESCE(SUM(a.input_tokens), 0)::bigint AS total_input_tokens,
    COALESCE(SUM(a.output_tokens), 0)::bigint AS total_output_tokens,
    ROUND(COALESCE(SUM(a.estimated_cost_nzd), 0)::numeric, 4) AS total_cost_nzd,
    MAX(a.created_at) AS last_used
  FROM public.agent_analytics a
  WHERE a.created_at >= p_since
    AND public.has_role(auth.uid(), 'admin')
    AND (NOT p_only_claude OR a.model_used ILIKE 'anthropic/%' OR a.model_used ILIKE 'claude%')
  GROUP BY a.agent_name, a.model_used
  ORDER BY messages DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_claude_usage_stats(timestamptz, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_claude_usage_stats(timestamptz, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_claude_recent_errors(
  p_since timestamptz DEFAULT (now() - interval '7 days'),
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  created_at timestamptz,
  agent_name text,
  model_used text,
  error_message text,
  response_time_ms integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.created_at,
    a.agent_name,
    COALESCE(a.model_used, 'unknown'),
    a.error_message,
    a.response_time_ms
  FROM public.agent_analytics a
  WHERE a.error = true
    AND a.created_at >= p_since
    AND public.has_role(auth.uid(), 'admin')
  ORDER BY a.created_at DESC
  LIMIT GREATEST(LEAST(p_limit, 500), 1);
$$;

REVOKE ALL ON FUNCTION public.admin_claude_recent_errors(timestamptz, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_claude_recent_errors(timestamptz, integer) TO authenticated;