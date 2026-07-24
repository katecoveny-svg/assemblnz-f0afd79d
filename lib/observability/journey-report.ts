/**
 * assembl — journey error monitoring
 * ----------------------------------
 * A small, provider-agnostic error reporter. The repo has no error-tracking
 * dependency (Sentry/PostHog), so this emits structured, REDACTED JSON to the
 * server log — which Vercel captures — and exposes one integration point
 * (`forward`) where a real provider can be wired when a DSN is configured.
 *
 * NEVER transmits raw customer prompts, secrets, full customer context or
 * business data. Only categories, ids, counts and short safe messages.
 */

import 'server-only';

export type JourneyErrorKind =
  | 'unhandled_server_error'
  | 'model_call_failed'
  | 'tool_call_failed'
  | 'agent_verification_failed'
  | 'journey_failed'
  | 'proof_calculation_failed'
  | 'rate_limited'
  | 'input_rejected';

export type JourneyErrorEvent = {
  kind: JourneyErrorKind;
  /** Safe, human-readable summary — no customer content. */
  message: string;
  runId?: string;
  invocationId?: string;
  agentId?: string;
  /** Small non-sensitive tags (counts, statuses). */
  meta?: Record<string, string | number | boolean>;
};

const DEPLOY_VERSION =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? process.env.DEPLOY_VERSION ?? 'dev';
const ENVIRONMENT = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'unknown';

/** Redact anything that looks like a secret or free-text customer content. */
function redact(meta: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!meta) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (/prompt|intent|context|email|token|key|secret|address|name|payload/i.test(k)) {
      out[k] = '[redacted]';
      continue;
    }
    if (typeof v === 'string' && v.length > 120) out[k] = `${v.slice(0, 40)}…[truncated]`;
    else out[k] = v;
  }
  return out;
}

/** Integration point for a real provider (Sentry/etc.) once a DSN is set. */
function forward(_event: Record<string, unknown>): void {
  // env setup pending — no DSN configured. Structured console log below is the
  // current sink (captured by Vercel runtime logs).
}

export function reportJourneyError(event: JourneyErrorEvent): void {
  const record = {
    evt: 'journey.error',
    kind: event.kind,
    message: event.message.slice(0, 200),
    runId: event.runId,
    invocationId: event.invocationId,
    agentId: event.agentId,
    meta: redact(event.meta),
    version: DEPLOY_VERSION,
    environment: ENVIRONMENT,
    at: new Date().toISOString(),
  };
  // eslint-disable-next-line no-console
  console.error(JSON.stringify(record));
  try {
    forward(record);
  } catch {
    // never let monitoring break the request
  }
}

/** A deliberately safe test event, used by the release checklist smoke test. */
export function emitTestErrorEvent(): void {
  reportJourneyError({
    kind: 'unhandled_server_error',
    message: 'monitoring smoke-test event (safe, synthetic)',
    meta: { synthetic: true },
  });
}
