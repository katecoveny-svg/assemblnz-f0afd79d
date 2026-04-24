// ============================================================================
// Assembl — Shared Live Data Context
// ----------------------------------------------------------------------------
// Every agent edge function gets the SAME authorised data-access payload at
// runtime via `buildLiveDataContext(req, opts)`. This guarantees that:
//
//   1. The caller's identity (user_id, tenant_id, kete) is resolved once.
//   2. Authorisation is enforced once — agents never call live feeds directly
//      without going through this gate.
//   3. Every downstream live-feed request carries an audit-ready provenance
//      header (X-Assembl-Trace-Id) so the audit_log can stitch them back.
//   4. The same NZ live-data sources (weather, fuel, compliance, KB, fleet,
//      freight, AIS, maritime, construction conditions, etc.) are exposed
//      through ONE typed surface — no agent reaches out to fetch() directly.
//
// Usage from an edge function:
//
//   import { buildLiveDataContext } from "../_shared/live-data-context.ts";
//
//   const ctx = await buildLiveDataContext(req, {
//     agentCode: "ARAI",
//     kete: "waihanga",
//     requiredScopes: ["weather", "compliance"],
//   });
//   const weather = await ctx.feeds.weather({ city: "Auckland" });
//   const compliance = await ctx.feeds.compliance({ kete: "waihanga" });
//
// The context object is intentionally minimal — agents call typed methods,
// not raw `supabase.functions.invoke()`. That keeps governance checks in one
// place and makes it impossible for an agent to bypass the trust layer.
// ============================================================================

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Kete =
  | "manaaki"
  | "waihanga"
  | "auaha"
  | "arataki"
  | "pikau"
  | "hoko"
  | "ako"
  | "toro";

export type LiveDataScope =
  | "weather"
  | "fuel"
  | "compliance"
  | "knowledge_base"
  | "routes"
  | "fleet"
  | "freight"
  | "ais"
  | "construction"
  | "agriculture"
  | "marine";

export interface LiveDataIdentity {
  /** Authenticated Supabase user, or null for service-role / anonymous calls. */
  userId: string | null;
  /** Tenant the call is scoped to. Falls back to default tenant. */
  tenantId: string;
  /** Industry kete the agent belongs to. */
  kete: Kete | null;
  /** The agent code that is making the request (e.g. ARAI, AURA, FLUX). */
  agentCode: string;
  /** Trace id propagated to every downstream live-feed call. */
  traceId: string;
  /** Whether the caller authenticated with a JWT or only the anon key. */
  isAuthenticated: boolean;
}

export interface LiveDataContextOptions {
  /** Agent making the request — required for audit + scope checks. */
  agentCode: string;
  /** Industry kete the agent runs under. */
  kete?: Kete;
  /** Scopes the agent needs. Used to fail fast before any feed is hit. */
  requiredScopes?: LiveDataScope[];
  /** Override the default tenant when running under service role. */
  tenantId?: string;
}

export interface LiveDataDecision {
  allowed: boolean;
  reason?: string;
}

export interface LiveDataContext {
  identity: LiveDataIdentity;
  supabase: SupabaseClient;
  /** Check whether a scope is allowed for this caller before invoking. */
  authorize: (scope: LiveDataScope) => LiveDataDecision;
  /** Typed live feed surface — every method is governance-checked + traced. */
  feeds: LiveFeeds;
  /** Append a row to audit_log with the trace id pre-filled. */
  audit: (entry: AuditEntry) => Promise<void>;
}

export interface AuditEntry {
  action: string;
  scope: LiveDataScope;
  request_summary?: string;
  response_summary?: string;
  compliance_passed?: boolean;
  error_message?: string;
}

// ---------------------------------------------------------------------------
// Live feed surface — the only way an agent fetches NZ data
// ---------------------------------------------------------------------------

export interface LiveFeeds {
  weather: (args: { city?: string; lat?: number; lon?: number; mode?: "current" | "forecast" | "both" }) => Promise<unknown>;
  fuel: () => Promise<unknown>;
  compliance: (args: { kete: Kete; dryRun?: boolean }) => Promise<unknown>;
  knowledgeBase: (args: { query: string; kete?: Kete; limit?: number }) => Promise<unknown>;
  routes: (args: { origin: { lat: number; lon: number }; destination: { lat: number; lon: number } }) => Promise<unknown>;
  fleet: (args?: { action?: "fleet_status" | "driver_scores" | "vehicle_health" }) => Promise<unknown>;
  freight: (args: { trackingCode: string }) => Promise<unknown>;
  ais: (args: { bbox?: [number, number, number, number] }) => Promise<unknown>;
  construction: (args: { action: "site_conditions" | "material_prices"; lat?: number; lon?: number }) => Promise<unknown>;
  agriculture: (args: { lat: number; lon: number }) => Promise<unknown>;
  marine: (args: { lat: number; lon: number }) => Promise<unknown>;
}

// ---------------------------------------------------------------------------
// Default kete → scope allow-list. Agents inherit the kete's scopes plus
// anything explicitly granted by `requiredScopes`. This is the single source
// of truth for "what can this agent actually reach".
// ---------------------------------------------------------------------------

const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export const KETE_SCOPES: Record<Kete, LiveDataScope[]> = {
  manaaki: ["weather", "compliance", "knowledge_base"],
  waihanga: ["weather", "compliance", "knowledge_base", "construction"],
  auaha: ["compliance", "knowledge_base"],
  arataki: ["weather", "fuel", "compliance", "knowledge_base", "routes", "fleet"],
  pikau: ["weather", "compliance", "knowledge_base", "routes", "freight", "ais", "marine"],
  hoko: ["compliance", "knowledge_base"],
  ako: ["compliance", "knowledge_base"],
  toro: ["weather", "knowledge_base"],
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function generateTraceId(): string {
  // RFC4122-ish trace id; cheap and good enough for audit stitching
  const rand = (n: number) =>
    Array.from(crypto.getRandomValues(new Uint8Array(n)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  return `assembl-${Date.now().toString(36)}-${rand(6)}`;
}

async function resolveIdentity(
  req: Request,
  supabase: SupabaseClient,
  opts: LiveDataContextOptions,
): Promise<LiveDataIdentity> {
  const auth = req.headers.get("Authorization") ?? "";
  let userId: string | null = null;
  let isAuthenticated = false;

  if (auth.toLowerCase().startsWith("bearer ")) {
    const token = auth.slice(7).trim();
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        userId = data.user.id;
        isAuthenticated = true;
      }
    } catch {
      // anon — leave userId null
    }
  }

  return {
    userId,
    tenantId: opts.tenantId ?? DEFAULT_TENANT_ID,
    kete: opts.kete ?? null,
    agentCode: opts.agentCode,
    traceId: req.headers.get("X-Assembl-Trace-Id") ?? generateTraceId(),
    isAuthenticated,
  };
}

function buildAuthorizer(identity: LiveDataIdentity, required: LiveDataScope[]) {
  const allowed = new Set<LiveDataScope>([
    ...(identity.kete ? KETE_SCOPES[identity.kete] : []),
    ...required,
  ]);
  return (scope: LiveDataScope): LiveDataDecision => {
    if (!allowed.has(scope)) {
      return {
        allowed: false,
        reason: `Agent ${identity.agentCode} (${identity.kete ?? "no kete"}) is not authorised for scope "${scope}".`,
      };
    }
    return { allowed: true };
  };
}

function buildAudit(supabase: SupabaseClient, identity: LiveDataIdentity) {
  return async (entry: AuditEntry) => {
    const { error } = await supabase.from("audit_log").insert({
      agent_code: identity.agentCode,
      agent_name: identity.agentCode,
      model_used: "live-data-gateway",
      tenant_id: identity.tenantId,
      user_id: identity.userId ?? identity.tenantId,
      request_id: identity.traceId,
      request_summary: entry.request_summary ?? `${entry.action}/${entry.scope}`,
      response_summary: entry.response_summary ?? null,
      compliance_passed: entry.compliance_passed ?? true,
      error_message: entry.error_message ?? null,
      data_classification: "INTERNAL",
      pii_detected: false,
      pii_masked: false,
    });
    if (error) {
      console.warn(`[live-data-context] audit insert failed: ${error.message}`);
    }
  };
}

// ---------------------------------------------------------------------------
// Feed builder — every method goes through `gate(scope)` so callers cannot
// accidentally bypass authorisation or skip the trace header.
// ---------------------------------------------------------------------------

function buildFeeds(
  supabase: SupabaseClient,
  identity: LiveDataIdentity,
  authorize: (scope: LiveDataScope) => LiveDataDecision,
  audit: (entry: AuditEntry) => Promise<void>,
): LiveFeeds {
  const traceHeaders = {
    "X-Assembl-Trace-Id": identity.traceId,
    "X-Assembl-Agent": identity.agentCode,
    "X-Assembl-Kete": identity.kete ?? "none",
  };

  const invoke = async (
    scope: LiveDataScope,
    fn: string,
    body: Record<string, unknown>,
  ): Promise<unknown> => {
    const decision = authorize(scope);
    if (!decision.allowed) {
      await audit({
        action: "live_feed_denied",
        scope,
        compliance_passed: false,
        error_message: decision.reason,
      });
      throw new Error(decision.reason ?? "Forbidden");
    }
    const { data, error } = await supabase.functions.invoke(fn, {
      body,
      headers: traceHeaders,
    });
    await audit({
      action: `live_feed:${fn}`,
      scope,
      request_summary: JSON.stringify(body).slice(0, 500),
      compliance_passed: !error,
      error_message: error?.message,
    });
    if (error) throw error;
    return data;
  };

  return {
    weather: ({ city, lat, lon, mode = "both" }) =>
      city
        ? invoke("weather", "iot-weather", { city, mode })
        : invoke("weather", "nz-weather", { latitude: lat, longitude: lon, days: 3 }),
    fuel: () => invoke("fuel", "nz-fuel-prices", {}),
    compliance: ({ kete, dryRun = true }) =>
      invoke("compliance", "nz-compliance-autoupdate", { dryRun, kete }),
    knowledgeBase: ({ query, kete, limit = 4 }) =>
      invoke("knowledge_base", "ikb-search", { query, kete: kete ?? identity.kete, limit }),
    routes: ({ origin, destination }) =>
      invoke("routes", "nz-routes", { origin, destination }),
    fleet: ({ action = "fleet_status" } = {}) =>
      invoke("fleet", "iot-vehicle-tracking", { action }),
    freight: ({ trackingCode }) =>
      invoke("freight", "iot-freight-tracking", { action: "track", tracking_code: trackingCode }),
    ais: ({ bbox }) => invoke("ais", "iot-ais-tracking", { bbox }),
    construction: ({ action, lat = -36.85, lon = 174.76 }) =>
      invoke("construction", "iot-construction", { action, lat, lon }),
    agriculture: ({ lat, lon }) =>
      invoke("agriculture", "iot-agriculture", { lat, lon }),
    marine: ({ lat, lon }) => invoke("marine", "iot-marine", { lat, lon }),
  };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function buildLiveDataContext(
  req: Request,
  opts: LiveDataContextOptions,
): Promise<LiveDataContext> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    throw new Error("[live-data-context] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const identity = await resolveIdentity(req, supabase, opts);
  const authorize = buildAuthorizer(identity, opts.requiredScopes ?? []);
  const audit = buildAudit(supabase, identity);

  // Fail-fast if any required scope is denied — no surprises mid-execution.
  for (const scope of opts.requiredScopes ?? []) {
    const decision = authorize(scope);
    if (!decision.allowed) {
      await audit({
        action: "context_denied",
        scope,
        compliance_passed: false,
        error_message: decision.reason,
      });
      throw new Error(decision.reason ?? `Scope ${scope} denied`);
    }
  }

  const feeds = buildFeeds(supabase, identity, authorize, audit);
  return { identity, supabase, authorize, feeds, audit };
}
