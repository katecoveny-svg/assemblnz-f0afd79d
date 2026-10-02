/** Inactive proposal only. No app route, env resolver, provider, database client or fetch. */
export const HOSTING_PROPOSAL = {
  status: 'inactive_proposal', version: 'nz-public-hosting-v1',
  hosts: { freight: 'nz-freight.assembl.co.nz', architecture: 'nz-rfi.assembl.co.nz' },
  mcpPath: '/mcp', challengePath: '/.well-known/openai-apps-challenge',
  backendAttemptsPerMinuteGlobal: 480, summariesPerMinuteGlobal: 10, localAdmissionAttemptsPerMinute: 60,
  requestsPerMinuteGlobal: 120, requestsPerUtcDayGlobal: 2000,
  activeRequestsGlobal: 4, activeSourceLoadsGlobal: 2, sourceLoadsPerUtcDayGlobal: 200,
  requestBytes: 1048576, resultBytes: 524288, deadlineMs: 10000,
  platformMaxDurationSeconds: 15, leaseMs: 20000, admissionDeadlineMs: 1000,
  parserWorkerDeadlineMs: 3000, sourceDeadlineMs: 8000,
  logRetentionHours: 24, quotaRetentionHours: 48,
} as const;
export type Domain = keyof typeof HOSTING_PROPOSAL.hosts;
export type Gate = { state: 'eligible'; domain: Domain } | { state: 'denied'; status: 400 | 403 | 404 | 405 | 413 | 415 };

export type AliasGate = { state: 'ordinary_host' } | { state: 'plugin_path'; domain: Domain; route: 'mcp' | 'challenge' | 'public_info' } | { state: 'denied'; status: 400 | 404 | 405 };
/** Must run for EVERY plugin-host request, including static paths, before app/auth middleware.
 * Pure proposal only: an eligible path is not release permission or a mounted handler.
 */
export function pluginAliasGate(request: Request): AliasGate {
  const u = new URL(request.url);
  const domain = (Object.keys(HOSTING_PROPOSAL.hosts) as Domain[]).find(d => u.hostname.replace(/\.$/, '') === HOSTING_PROPOSAL.hosts[d]);
  if (!domain) return { state: 'ordinary_host' };
  if (u.origin !== `https://${HOSTING_PROPOSAL.hosts[domain]}` || u.search || u.hash || u.username || u.password || (request.headers.has('host') && request.headers.get('host') !== u.host)) return { state: 'denied', status: 404 };
  const route = u.pathname === HOSTING_PROPOSAL.mcpPath ? 'mcp' : u.pathname === HOSTING_PROPOSAL.challengePath ? 'challenge' : ['/privacy', '/terms', '/support'].includes(u.pathname) ? 'public_info' : undefined;
  if (!route) return { state: 'denied', status: 404 };
  if (route === 'mcp' ? request.method !== 'POST' : !['GET', 'HEAD'].includes(request.method)) return { state: 'denied', status: 405 };
  return { state: 'plugin_path', domain, route };
}

/** Pure boundary specification; eligible is not activation or authorization to execute. */
export function inspectProposedRequest(request: Request): Gate {
  const u = new URL(request.url);
  const domain = (Object.keys(HOSTING_PROPOSAL.hosts) as Domain[]).find(d => u.origin === `https://${HOSTING_PROPOSAL.hosts[d]}`);
  if (!domain || u.pathname !== HOSTING_PROPOSAL.mcpPath || u.search || u.hash || u.username || u.password) return { state: 'denied', status: 404 };
  const origin = request.headers.get('origin');
  if (origin !== null && origin !== u.origin) return { state: 'denied', status: 403 };
  // Public stateless tools must not silently consume app cookies, account JWTs or session handles.
  if (['authorization', 'cookie', 'mcp-session-id'].some(h => request.headers.has(h))) return { state: 'denied', status: 400 };
  if (request.method !== 'POST') return { state: 'denied', status: 405 };
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get('content-type') ?? '')) return { state: 'denied', status: 415 };
  const length = request.headers.get('content-length');
  if (length !== null && (!/^\d{1,10}$/.test(length) || Number(length) > HOSTING_PROPOSAL.requestBytes)) return { state: 'denied', status: 413 };
  return { state: 'eligible', domain };
}

export type AdmissionRequest = {
  policy: typeof HOSTING_PROPOSAL.version;
  invocationId: string; // server-generated UUID, never a caller request/document/account ID
  domain: Domain; kind: 'mcp' | 'source_load'; parentLeaseId?: string;
};
export type Lease = { id: string; issuedAtMs: number; expiresAtMs: number; fence: number };
export type MonotonicClock = () => number;
export type Admission = { state: 'admitted'; databaseNowMs: number; lease: Lease } | { state: 'denied'; reason: 'closed' | 'limit' | 'unavailable' | 'duplicate'; retryAfterSeconds: number };
/** Future backend: one transaction checks kill state, counters and leases under common locks.
 * No caller-provided caps/clocks, refund on finish, memory fallback or user-body persistence.
 * Every MCP transport request counts. Source claims require a live parent lease; retries count.
 * Database-issued interval and fresh databaseNowMs are sampled after all locks, immediately
 * before response/commit. Consumer subtracts the entire monotonic RPC elapsed time as a
 * conservative transit bound, and requires the full15second job envelope to remain.
 * Duplicate invocation IDs cannot acquire another lease or execute twice. Completed IDs retain
 * only a bounded tombstone, never response bodies. Release is exact-ID/fence, idempotent.
 */
export interface DistributedAdmission {
  claim(request: AdmissionRequest, signal: AbortSignal): Promise<Admission>;
  release(lease: Lease): Promise<void>;
}
export const closedAdmission: DistributedAdmission = {
  async claim() { return { state: 'denied', reason: 'closed', retryAfterSeconds: 60 }; },
  async release() { throw new Error('No lease exists in the closed adapter'); },
};
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
/** Contract consumer for local tests only. Real distributed storage/transaction proof is a release gate. */
export async function checkedClaim(request: AdmissionRequest, store: DistributedAdmission = closedAdmission, monotonic: MonotonicClock = () => performance.now()): Promise<Admission> {
  const startMs = monotonic();
  if (!Number.isFinite(startMs) || request.policy !== HOSTING_PROPOSAL.version || !uuid.test(request.invocationId) || !Object.hasOwn(HOSTING_PROPOSAL.hosts, request.domain) || !['mcp', 'source_load'].includes(request.kind) || (request.kind === 'source_load' ? !uuid.test(request.parentLeaseId ?? '') : request.parentLeaseId !== undefined)) return { state: 'denied', reason: 'unavailable', retryAfterSeconds: 60 };
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const deadline = new Promise<never>((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error()); }, HOSTING_PROPOSAL.admissionDeadlineMs); });
    const result = await Promise.race([store.claim({ policy: request.policy, invocationId: request.invocationId, domain: request.domain, kind: request.kind, ...(request.kind === 'source_load' ? { parentLeaseId: request.parentLeaseId } : {}) }, controller.signal), deadline]);
    if (result.state === 'denied') {
      if (!['closed', 'limit', 'unavailable', 'duplicate'].includes(result.reason) || !Number.isInteger(result.retryAfterSeconds) || result.retryAfterSeconds < 1 || result.retryAfterSeconds > 86400) throw new Error();
      return { state: 'denied', reason: result.reason, retryAfterSeconds: result.retryAfterSeconds };
    }
    const l = result.lease, endMs = monotonic(), elapsedMs = endMs - startMs;
    if (result.state !== 'admitted' || !l || !uuid.test(l.id) || !Number.isSafeInteger(l.fence) || l.fence < 1 || !Number.isSafeInteger(l.issuedAtMs) || !Number.isSafeInteger(l.expiresAtMs) || !Number.isSafeInteger(result.databaseNowMs) || l.issuedAtMs > result.databaseNowMs || l.expiresAtMs <= result.databaseNowMs || l.expiresAtMs - l.issuedAtMs > HOSTING_PROPOSAL.leaseMs || !Number.isFinite(endMs) || elapsedMs < 0 || elapsedMs > HOSTING_PROPOSAL.admissionDeadlineMs || l.expiresAtMs - result.databaseNowMs - elapsedMs < HOSTING_PROPOSAL.platformMaxDurationSeconds * 1000) throw new Error();
    return { state: 'admitted', databaseNowMs: result.databaseNowMs, lease: { id: l.id, issuedAtMs: l.issuedAtMs, expiresAtMs: l.expiresAtMs, fence: l.fence } };
  } catch { return { state: 'denied', reason: 'unavailable', retryAfterSeconds: 60 }; }
  finally { clearTimeout(timer); }
}

const statuses = ['ok', 'denied', 'unavailable', 'stale', 'ambiguous'] as const;
const buckets = ['under_100ms', 'under_1s', 'under_10s', 'timeout'] as const;
/** Strict allowlist, not a generic logger/redactor. No body, URL, error object or caller ID. */
export function operationalEvent(raw: unknown) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid metric');
  const p = raw as Record<string, unknown>;
  if (Object.keys(p).some(k => !['domain', 'status', 'duration', 'requestBytes', 'responseBytes'].includes(k)) || (typeof p.domain !== 'string' || !Object.hasOwn(HOSTING_PROPOSAL.hosts, p.domain)) || !statuses.includes(p.status as typeof statuses[number]) || !buckets.includes(p.duration as typeof buckets[number]) || !Number.isSafeInteger(p.requestBytes) || Number(p.requestBytes) < 0 || Number(p.requestBytes) > HOSTING_PROPOSAL.requestBytes || !Number.isSafeInteger(p.responseBytes) || Number(p.responseBytes) < 0 || Number(p.responseBytes) > HOSTING_PROPOSAL.resultBytes) throw new Error('Invalid metric');
  return { event: 'nz_plugin_request', domain: p.domain as Domain, status: p.status as typeof statuses[number], duration: p.duration as typeof buckets[number], requestBytes: Number(p.requestBytes), responseBytes: Number(p.responseBytes) };
}

/** Inactive dispatcher: plugin aliases never fall through to the ordinary app.
 * No live/plugin handler injection exists in this closed stage.
 */
export async function closedHostDispatcher(request: Request, ordinaryApp: (request: Request) => Promise<Response>): Promise<Response> {
  const gate = pluginAliasGate(request);
  if (gate.state === 'ordinary_host') return ordinaryApp(request);
  return new Response(null, { status: gate.state === 'denied' ? gate.status : 503, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

/** Pure reference for the unapplied SQL issuance contract; not a DB executor. */
export function proposedChildInterval(databaseNowMs: number, parentExpiresAtMs: number) {
  if (![databaseNowMs, parentExpiresAtMs].every(Number.isSafeInteger)) return null;
  const expiresAtMs = Math.min(databaseNowMs + 20000, parentExpiresAtMs);
  if (expiresAtMs - databaseNowMs < 15000) return null;
  return { issuedAtMs: databaseNowMs, expiresAtMs };
}
