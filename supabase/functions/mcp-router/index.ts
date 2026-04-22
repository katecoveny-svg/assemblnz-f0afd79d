// ============================================================================
// Assembl MCP Server v2 — routing layer
// ----------------------------------------------------------------------------
// Translates MCP tool calls into Supabase edge function invocations with:
//   1. Real JWT validation against Supabase Auth (CRITICAL-01 fix)
//   2. Deny-by-default toolset gating (CRITICAL-02 fix)
//   3. Tier-based toolset + monthly call enforcement (CRITICAL-03 fix)
//   4. Mana Trust Layer policy execution at kahu_pre / mana_post (CRITICAL-04)
//   5. Outbound host whitelist for forwarded auth (HIGH-04 fix)
//   6. Response size cap (HIGH-05 fix)
//
// Public docs: https://assembl.co.nz/developers
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { parseToolsetsFlag, TOOLSETS, type ToolsetSlug } from "./toolsets.ts";
import {
  applyPiiMask,
  applyContentPolicy,
  checkRateLimit,
  checkMaoriSovereignty,
  type PolicyRule,
} from "../_shared/policy.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept, mcp-protocol-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Service-role client for tenant lookups, logging, and policy reads.
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

// HIGH-04: only forward caller auth to known-trusted hosts.
const ALLOWED_HOSTS = new Set<string>([
  new URL(SUPABASE_URL).host,
]);

// HIGH-05: cap responses returned through MCP. MCP clients load every
// response into the LLM's context, so anything large must be summarised.
const MAX_RESPONSE_BYTES = 50_000;

// ---------------------------------------------------------------------------
// JSON-RPC helpers
// ---------------------------------------------------------------------------
function mcpError(code: number, message: string, id: unknown = null) {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}
function mcpResult(id: unknown, result: unknown) {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", id, result }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

// ---------------------------------------------------------------------------
// Audit logging
// ---------------------------------------------------------------------------
async function logCall(input: {
  tool_name: string;
  toolset_slug: string | null;
  user_id: string | null;
  org_id: string | null;
  status: "success" | "denied" | "error";
  duration_ms: number;
  error_message: string | null;
}) {
  await supabase.from("mcp_tool_calls").insert(input);
}

// ---------------------------------------------------------------------------
// Tier definition (cached per request)
// ---------------------------------------------------------------------------
interface TierInfo {
  tier_name: string;
  included_toolsets: string[];
  included_calls_per_month: number | null;
  per_call_overage_nzd: number | null;
}

interface AuthContext {
  userId: string | null;
  orgId: string | null;
  scopes: string[];
  tier: TierInfo | null;
  enabledToolsets: ToolsetSlug[];
}

// ---------------------------------------------------------------------------
// CRITICAL-01: real auth context resolution
// ---------------------------------------------------------------------------
async function resolveAuthContext(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.toLowerCase().startsWith("bearer ")) {
    return { userId: null, orgId: null, scopes: [], tier: null, enabledToolsets: ["core"] };
  }

  const token = authHeader.slice(7).trim();

  // Validate the bearer token against Supabase Auth.
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);

  if (claimsError || !claimsData?.claims?.sub) {
    return { userId: null, orgId: null, scopes: [], tier: null, enabledToolsets: ["core"] };
  }

  const userId = claimsData.claims.sub as string;
  const scopes = (claimsData.claims.app_metadata as { scopes?: string[] } | undefined)?.scopes ?? [];

  // Resolve the user's tenant (most-recent membership wins).
  const { data: member } = await supabase
    .from("tenant_members")
    .select("tenant_id, role, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const orgId = (member as { tenant_id?: string } | null)?.tenant_id ?? null;

  // Resolve the tenant's plan → tier.
  let tier: TierInfo | null = null;
  if (orgId) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("plan")
      .eq("id", orgId)
      .maybeSingle();
    const planName = (tenant as { plan?: string } | null)?.plan ?? "starter";
    const { data: tierRow } = await supabase
      .from("mcp_subscription_tiers")
      .select("tier_name, included_toolsets, included_calls_per_month, per_call_overage_nzd")
      .eq("tier_name", planName)
      .maybeSingle();
    tier = (tierRow as TierInfo | null) ?? null;
  }

  // Pull enabled toolsets from mcp_org_toolsets — never trust URL params for
  // entitlements. Intersect with the tier allowlist as a defence-in-depth step.
  let enabled: ToolsetSlug[] = ["core"];
  if (orgId) {
    const { data: toolsetRows } = await supabase
      .from("mcp_org_toolsets")
      .select("toolset_slug")
      .eq("org_id", orgId)
      .eq("enabled", true);

    const fromOrg = ((toolsetRows ?? []) as { toolset_slug: string }[])
      .map((r) => r.toolset_slug)
      .filter((s): s is ToolsetSlug => s in TOOLSETS);

    const tierAllow = new Set(tier?.included_toolsets ?? ["core"]);
    enabled = Array.from(new Set<ToolsetSlug>(["core", ...fromOrg.filter((s) => tierAllow.has(s))]));
  }

  return { userId, orgId, scopes, tier, enabledToolsets: enabled };
}

// ---------------------------------------------------------------------------
// Tool + toolset lookups
// ---------------------------------------------------------------------------
async function lookupTool(name: string) {
  const { data, error } = await supabase
    .from("mcp_tools")
    .select(
      "id, name, description, agent_code, edge_function_url, input_schema_json, requires_auth_scope, is_ga, toolset_id, mcp_toolsets:toolset_id(slug, is_active)",
    )
    .eq("name", name)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function orgHasToolset(orgId: string, slug: string): Promise<boolean> {
  const { data } = await supabase
    .from("mcp_org_toolsets")
    .select("enabled")
    .eq("org_id", orgId)
    .eq("toolset_slug", slug)
    .maybeSingle();
  return !!(data as { enabled?: boolean } | null)?.enabled;
}

function scopeMatches(required: string | null, granted: string[]): boolean {
  if (!required) return true;
  if (granted.includes(required)) return true;
  // Hierarchical scopes: `manaaki:*` grants `manaaki:bookings.read`, etc.
  for (const g of granted) {
    if (g.endsWith(":*") && required.startsWith(g.slice(0, -1))) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// CRITICAL-04: Mana Trust Layer rule fetcher
// ---------------------------------------------------------------------------
async function getPolicyRules(
  toolsetSlug: string | null,
  toolName: string,
  stage: PolicyRule["enforcement_stage"],
): Promise<PolicyRule[]> {
  const { data } = await supabase
    .from("mcp_policy_rules")
    .select("*")
    .eq("is_active", true)
    .eq("enforcement_stage", stage);

  return ((data ?? []) as PolicyRule[]).filter((rule) => {
    const toolsetMatch =
      !rule.applies_to_toolset ||
      rule.applies_to_toolset.length === 0 ||
      (toolsetSlug && rule.applies_to_toolset.includes(toolsetSlug));
    const toolMatch =
      !rule.applies_to_tool ||
      rule.applies_to_tool.length === 0 ||
      rule.applies_to_tool.includes(toolName);
    return toolsetMatch && toolMatch;
  });
}

// ---------------------------------------------------------------------------
// Tools/list — public catalogue (no auth required)
// ---------------------------------------------------------------------------
async function handleToolsList(req: Request, ctx: AuthContext, id: unknown) {
  // Authenticated callers see their org's enabled toolsets;
  // anonymous callers see the public `core` catalogue + anything advertised
  // via the URL flag (so MCP clients can preview what's available).
  const slugs = ctx.userId
    ? ctx.enabledToolsets
    : Array.from(new Set<ToolsetSlug>([
        "core",
        ...parseToolsetsFlag(
          new URL(req.url).searchParams.get("toolsets") ??
            req.headers.get("x-assembl-toolsets"),
        ),
      ]));

  const { data: tools } = await supabase
    .from("mcp_tools")
    .select("name, description, input_schema_json, mcp_toolsets:toolset_id(slug)")
    .eq("is_ga", true);

  const filtered = ((tools ?? []) as Array<{
    name: string;
    description: string | null;
    input_schema_json: unknown;
    mcp_toolsets: { slug: string } | null;
  }>).filter((t) => slugs.includes((t.mcp_toolsets?.slug ?? "") as ToolsetSlug));

  return mcpResult(id, {
    tools: filtered.map((t) => ({
      name: t.name,
      description: t.description ?? "",
      inputSchema: t.input_schema_json ?? { type: "object" },
    })),
  });
}

// ---------------------------------------------------------------------------
// Tools/call — full enforcement pipeline
// ---------------------------------------------------------------------------
async function handleToolsCall(
  req: Request,
  ctx: AuthContext,
  id: unknown,
  params: { name?: string; arguments?: Record<string, unknown> },
) {
  const start = performance.now();
  const toolName = params?.name;
  const args: Record<string, unknown> = params?.arguments ?? {};

  if (!toolName) return mcpError(-32602, "Missing tool name", id);

  // CRITICAL-02: deny-by-default — no auth means no tool calls.
  if (!ctx.userId || !ctx.orgId) {
    await logCall({
      tool_name: toolName,
      toolset_slug: null,
      user_id: ctx.userId,
      org_id: ctx.orgId,
      status: "denied",
      duration_ms: Math.round(performance.now() - start),
      error_message: "unauthenticated",
    });
    return mcpError(-32000, "Authentication required for tools/call", id);
  }

  let tool;
  try {
    tool = await lookupTool(toolName);
  } catch (e) {
    await logCall({
      tool_name: toolName,
      toolset_slug: null,
      user_id: ctx.userId,
      org_id: ctx.orgId,
      status: "error",
      duration_ms: Math.round(performance.now() - start),
      error_message: (e as Error).message,
    });
    return mcpError(-32603, "Tool lookup failed", id);
  }

  if (!tool) {
    await logCall({
      tool_name: toolName,
      toolset_slug: null,
      user_id: ctx.userId,
      org_id: ctx.orgId,
      status: "error",
      duration_ms: Math.round(performance.now() - start),
      error_message: "tool_not_found",
    });
    return mcpError(-32601, `Tool not found: ${toolName}`, id);
  }

  const toolsetSlug = ((tool as { mcp_toolsets?: { slug?: string } }).mcp_toolsets?.slug ?? null) as
    | ToolsetSlug
    | null;

  // CRITICAL-03 (a): tier gate — toolset must be in the tier allowlist.
  if (toolsetSlug && ctx.tier && !ctx.tier.included_toolsets.includes(toolsetSlug)) {
    await logCall({
      tool_name: toolName,
      toolset_slug: toolsetSlug,
      user_id: ctx.userId,
      org_id: ctx.orgId,
      status: "denied",
      duration_ms: Math.round(performance.now() - start),
      error_message: `tier_excludes_toolset:${toolsetSlug}`,
    });
    return mcpError(
      -32000,
      `Your tier (${ctx.tier.tier_name}) does not include the "${toolsetSlug}" toolset`,
      id,
    );
  }

  // CRITICAL-02 (b): toolset must be explicitly enabled for this org.
  if (toolsetSlug && !(await orgHasToolset(ctx.orgId, toolsetSlug))) {
    await logCall({
      tool_name: toolName,
      toolset_slug: toolsetSlug,
      user_id: ctx.userId,
      org_id: ctx.orgId,
      status: "denied",
      duration_ms: Math.round(performance.now() - start),
      error_message: "toolset_not_enabled",
    });
    return mcpError(-32000, `Toolset "${toolsetSlug}" not enabled for org`, id);
  }

  // Scope check
  const requiredScope = (tool as { requires_auth_scope: string | null }).requires_auth_scope;
  if (!scopeMatches(requiredScope, ctx.scopes)) {
    await logCall({
      tool_name: toolName,
      toolset_slug: toolsetSlug,
      user_id: ctx.userId,
      org_id: ctx.orgId,
      status: "denied",
      duration_ms: Math.round(performance.now() - start),
      error_message: `missing_scope:${requiredScope}`,
    });
    return mcpError(-32000, `Missing scope: ${requiredScope}`, id);
  }

  // CRITICAL-03 (b): monthly usage check.
  if (ctx.tier?.included_calls_per_month != null) {
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("mcp_tool_calls")
      .select("id", { count: "exact", head: true })
      .eq("org_id", ctx.orgId)
      .eq("status", "success")
      .gte("called_at", monthStart.toISOString());

    if (
      (count ?? 0) >= ctx.tier.included_calls_per_month &&
      (ctx.tier.per_call_overage_nzd == null || ctx.tier.per_call_overage_nzd <= 0)
    ) {
      await logCall({
        tool_name: toolName,
        toolset_slug: toolsetSlug,
        user_id: ctx.userId,
        org_id: ctx.orgId,
        status: "denied",
        duration_ms: Math.round(performance.now() - start),
        error_message: "monthly_quota_exceeded",
      });
      return mcpError(
        -32000,
        `Monthly call quota exceeded for tier ${ctx.tier.tier_name}`,
        id,
      );
    }
    // Otherwise: overage is allowed; downstream billing job computes the charge.
  }

  // CRITICAL-04 (a): kahu_pre — PII masking, rate limiting, sovereignty checks.
  let maskedArgs: Record<string, unknown> = { ...args };
  const preRules = await getPolicyRules(toolsetSlug, toolName, "kahu_pre");
  for (const rule of preRules) {
    if (rule.rule_type === "pii_mask") {
      maskedArgs = applyPiiMask(maskedArgs, rule.rule_logic);
    } else if (rule.rule_type === "rate_limit") {
      const result = checkRateLimit(ctx.orgId, ctx.tier?.tier_name ?? null, rule.rule_logic, rule.id);
      if (!result.ok) {
        await logCall({
          tool_name: toolName,
          toolset_slug: toolsetSlug,
          user_id: ctx.userId,
          org_id: ctx.orgId,
          status: "denied",
          duration_ms: Math.round(performance.now() - start),
          error_message: `rate_limit:${rule.rule_code}`,
        });
        return mcpError(
          -32000,
          `Rate limit exceeded (retry in ${result.retryAfterSeconds ?? 60}s)`,
          id,
        );
      }
    } else if (rule.rule_type === "maori_data_sovereignty") {
      const sov = checkMaoriSovereignty(maskedArgs, rule.rule_logic);
      if (!sov.ok) {
        await logCall({
          tool_name: toolName,
          toolset_slug: toolsetSlug,
          user_id: ctx.userId,
          org_id: ctx.orgId,
          status: "denied",
          duration_ms: Math.round(performance.now() - start),
          error_message: `mds:${rule.rule_code}`,
        });
        return mcpError(-32000, sov.reason ?? "Māori data sovereignty check failed", id);
      }
    }
  }

  const edgeUrl = (tool as { edge_function_url: string | null }).edge_function_url;
  if (!edgeUrl) return mcpError(-32603, "Tool has no edge_function_url configured", id);

  // HIGH-04: never forward caller auth to non-allowlisted hosts.
  let upstreamUrl: URL;
  try {
    upstreamUrl = new URL(edgeUrl);
  } catch {
    return mcpError(-32603, "Tool has malformed edge_function_url", id);
  }
  const forwardAuth = ALLOWED_HOSTS.has(upstreamUrl.host);

  try {
    const upstream = await fetch(upstreamUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(forwardAuth && req.headers.get("authorization")
          ? { Authorization: req.headers.get("authorization")! }
          : {}),
        // Service-role for cross-function trust on internal hosts.
        ...(forwardAuth ? { apikey: SERVICE_ROLE } : {}),
      },
      body: JSON.stringify({
        args: maskedArgs,
        agent: (tool as { agent_code: string }).agent_code,
        _mcp_context: { user_id: ctx.userId, org_id: ctx.orgId },
      }),
    });

    const text = await upstream.text();
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }

    if (!upstream.ok) {
      await logCall({
        tool_name: toolName,
        toolset_slug: toolsetSlug,
        user_id: ctx.userId,
        org_id: ctx.orgId,
        status: "error",
        duration_ms: Math.round(performance.now() - start),
        error_message: `upstream_${upstream.status}`,
      });
      return mcpError(-32000, `Tool execution failed (${upstream.status})`, id);
    }

    // CRITICAL-04 (b): mana_post — content policy, macron normalisation,
    // disclaimers, field stripping.
    const postRules = await getPolicyRules(toolsetSlug, toolName, "mana_post");
    let finalPayload = payload;
    for (const rule of postRules) {
      if (rule.rule_type === "content_policy") {
        finalPayload = applyContentPolicy(finalPayload, rule.rule_logic);
      }
    }

    // HIGH-05: response size cap.
    const serialised =
      typeof finalPayload === "string" ? finalPayload : JSON.stringify(finalPayload);
    const finalText =
      serialised.length > MAX_RESPONSE_BYTES
        ? serialised.slice(0, MAX_RESPONSE_BYTES) +
          `\n\n[... response truncated at ${MAX_RESPONSE_BYTES} bytes; original length ${serialised.length}]`
        : serialised;

    await logCall({
      tool_name: toolName,
      toolset_slug: toolsetSlug,
      user_id: ctx.userId,
      org_id: ctx.orgId,
      status: "success",
      duration_ms: Math.round(performance.now() - start),
      error_message: null,
    });

    return mcpResult(id, { content: [{ type: "text", text: finalText }] });
  } catch (e) {
    await logCall({
      tool_name: toolName,
      toolset_slug: toolsetSlug,
      user_id: ctx.userId,
      org_id: ctx.orgId,
      status: "error",
      duration_ms: Math.round(performance.now() - start),
      error_message: (e as Error).message,
    });
    return mcpError(-32603, "Network error reaching tool", id);
  }
}

// ---------------------------------------------------------------------------
// HTTP entry
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { id?: unknown; method?: string; params?: { name?: string; arguments?: Record<string, unknown> } };
  try {
    body = await req.json();
  } catch {
    return mcpError(-32700, "Parse error: invalid JSON");
  }

  const id = body?.id ?? null;
  const method = body?.method ?? "";
  const ctx = await resolveAuthContext(req);

  switch (method) {
    case "initialize":
      return mcpResult(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "assembl-mcp", version: "2.0.0" },
      });
    case "tools/list":
      return handleToolsList(req, ctx, id);
    case "tools/call":
      return handleToolsCall(req, ctx, id, body?.params ?? {});
    case "ping":
      return mcpResult(id, {});
    default:
      return mcpError(-32601, `Method not found: ${method}`, id);
  }
});

// Suppress unused warning — TOOLSETS is exported for clients that import it.
void TOOLSETS;
