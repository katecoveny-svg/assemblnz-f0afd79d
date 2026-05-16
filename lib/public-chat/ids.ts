const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

// /api/public-chat persists session_id to two `uuid`-typed columns
// (assembl_agent_analytics.session_id, agent_cost_log.request_id), and
// their inserts swallow errors. A non-UUID id from the caller silently
// drops two of three analytics rows. Coerce to a fresh UUID when the
// caller's value isn't one.
export function uuidOrNew(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed && UUID_RE.test(trimmed) ? trimmed : crypto.randomUUID();
}
