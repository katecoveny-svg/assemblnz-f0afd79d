// ============================================================================
// Assembl MCP Server v2 — routing layer (SCAFFOLD)
// ----------------------------------------------------------------------------
// Thin TypeScript router that translates MCP tool calls into Supabase edge
// function invocations. NO business logic lives here. Auth, scope checks,
// retries, and circuit breakers are all stubbed — finish them in Claude Code.
//
// Public docs: https://assembl.co.nz/developers
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { parseToolsetsFlag, TOOLSETS, type ToolsetSlug } from "./toolsets.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept, mcp-protocol-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

// MCP error format -----------------------------------------------------------
function mcpError(code: number, message: string, id: unknown = null) {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }),
    {
      status: 200, // MCP errors are still HTTP 200
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

// Logging helper -------------------------------------------------------------
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

// Auth context (stub) --------------------------------------------------------
interface AuthContext {
  userId: string | null;
  orgId: string | null;
  scopes: string[];
  enabledToolsets: ToolsetSlug[];
}

async function resolveAuthContext(req: Request): Promise<AuthContext> {
  // TODO(claude-code): Validate the bearer token against Supabase Auth and
  // resolve the caller's org + scope claims. Treat invalid/expired tokens as
  // anonymous (null userId, only public tools allowed).
  const url = new URL(req.url);
  const enabled = parseToolsetsFlag(
    url.searchParams.get("toolsets") ?? req.headers.get("x-assembl-toolsets"),
  );
  const orgId = url.searchParams.get("orgs") ?? req.headers.get("x-assembl-org") ?? null;

  return {
    userId: null,
    orgId,
    scopes: [], // TODO(claude-code): pull scopes from JWT claims
    enabledToolsets: enabled,
  };
}

// Tool lookup ---------------------------------------------------------------
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

// Toolset-enabled-for-org check ---------------------------------------------
async function orgHasToolset(orgId: string, slug: string): Promise<boolean> {
  const { data } = await supabase
    .from("mcp_org_toolsets")
    .select("enabled")
    .eq("org_id", orgId)
    .eq("toolset_slug", slug)
    .maybeSingle();
  return !!data?.enabled;
}

// Scope check (stub) --------------------------------------------------------
function scopeMatches(required: string | null, granted: string[]): boolean {
  if (!required) return true;
  // TODO(claude-code): support hierarchical scopes (e.g. `manaaki:*`).
  return granted.includes(required);
}

// Tools/list handler --------------------------------------------------------
async function handleToolsList(ctx: AuthContext, id: unknown) {
  const slugs = ctx.enabledToolsets;
  const { data: tools } = await supabase
    .from("mcp_tools")
    .select("name, description, input_schema_json, mcp_toolsets:toolset_id(slug)")
    .eq("is_ga", true);

  const filtered = (tools ?? []).filter((t: any) =>
    slugs.includes(t.mcp_toolsets?.slug),
  );

  return mcpResult(id, {
    tools: filtered.map((t: any) => ({
      name: t.name,
      description: t.description ?? "",
      inputSchema: t.input_schema_json ?? { type: "object" },
    })),
  });
}

// Tools/call handler --------------------------------------------------------
async function handleToolsCall(req: Request, ctx: AuthContext, id: unknown, params: any) {
  const start = performance.now();
  const toolName: string = params?.name;
  const args: Record<string, unknown> = params?.arguments ?? {};

  if (!toolName) return mcpError(-32602, "Missing tool name", id);

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

  const toolsetSlug = (tool as any).mcp_toolsets?.slug as ToolsetSlug | undefined;

  // Toolset enabled for this org?
  if (ctx.orgId && toolsetSlug && !(await orgHasToolset(ctx.orgId, toolsetSlug))) {
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
  if (!scopeMatches(tool.requires_auth_scope, ctx.scopes)) {
    await logCall({
      tool_name: toolName,
      toolset_slug: toolsetSlug ?? null,
      user_id: ctx.userId,
      org_id: ctx.orgId,
      status: "denied",
      duration_ms: Math.round(performance.now() - start),
      error_message: `missing_scope:${tool.requires_auth_scope}`,
    });
    return mcpError(-32000, `Missing scope: ${tool.requires_auth_scope}`, id);
  }

  // Forward to the edge function
  // TODO(claude-code): retry with exponential backoff (3 attempts), wrap with
  // a circuit breaker per edge function URL (open after 5 consecutive 5xx).
  if (!tool.edge_function_url) {
    return mcpError(-32603, "Tool has no edge_function_url configured", id);
  }

  try {
    const upstream = await fetch(tool.edge_function_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Preserve caller auth so the downstream edge function can re-validate.
        ...(req.headers.get("authorization")
          ? { Authorization: req.headers.get("authorization")! }
          : {}),
      },
      body: JSON.stringify({ args, agent: tool.agent_code }),
    });

    const text = await upstream.text();
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }

    const status = upstream.ok ? "success" : "error";
    await logCall({
      tool_name: toolName,
      toolset_slug: toolsetSlug ?? null,
      user_id: ctx.userId,
      org_id: ctx.orgId,
      status,
      duration_ms: Math.round(performance.now() - start),
      error_message: upstream.ok ? null : `upstream_${upstream.status}`,
    });

    if (!upstream.ok) {
      return mcpError(-32000, `Tool execution failed (${upstream.status})`, id);
    }

    return mcpResult(id, {
      content: [
        {
          type: "text",
          text: typeof payload === "string" ? payload : JSON.stringify(payload),
        },
      ],
    });
  } catch (e) {
    await logCall({
      tool_name: toolName,
      toolset_slug: toolsetSlug ?? null,
      user_id: ctx.userId,
      org_id: ctx.orgId,
      status: "error",
      duration_ms: Math.round(performance.now() - start),
      error_message: (e as Error).message,
    });
    return mcpError(-32603, "Network error reaching tool", id);
  }
}

// HTTP entry point ----------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return mcpError(-32700, "Parse error: invalid JSON");
  }

  const id = body?.id ?? null;
  const method: string = body?.method ?? "";
  const ctx = await resolveAuthContext(req);

  switch (method) {
    case "initialize":
      return mcpResult(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "assembl-mcp", version: "2.0.0" },
      });

    case "tools/list":
      return handleToolsList(ctx, id);

    case "tools/call":
      return handleToolsCall(req, ctx, id, body?.params);

    case "ping":
      return mcpResult(id, {});

    default:
      return mcpError(-32601, `Method not found: ${method}`, id);
  }
});

// Suppress unused warning — TOOLSETS is exported for clients that import it.
void TOOLSETS;
