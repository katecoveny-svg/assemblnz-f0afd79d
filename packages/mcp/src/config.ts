/**
 * @assembl/mcp — runtime config loader
 *
 * Reads from process.env so customers can configure the package via their MCP
 * client's `env` block (see README for examples).
 */

export interface AssemblConfig {
  /** Base URL of the Assembl MCP gateway. */
  apiUrl: string;
  /** Per-org API key (asm_live_...). Required. */
  apiKey: string;
  /** Optional: org id override. The key already encodes the org. */
  orgId?: string;
  /** Toolsets to expose (comma list). Default: ["core"]. */
  toolsets: string[];
  /** Tier hint, only used for client-side display. */
  tier?: string;
  /** Strict Mana-trust enforcement. Defaults to "enforce". */
  manaTrust: "enforce" | "warn" | "off";
  /** Log level. */
  logLevel: "debug" | "info" | "warn" | "error";
  /** Request timeout in ms. */
  timeoutMs: number;
}

const DEFAULT_API_URL = "https://api.assembl.co.nz";
// Fallback used while api.assembl.co.nz DNS is being set up.
const FALLBACK_API_URL =
  "https://ssaxxdkxzrvkdjsanhei.supabase.co/functions/v1/mcp-router";

function parseToolsets(raw: string | undefined): string[] {
  if (!raw) return ["core"];
  const parts = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return parts.length ? Array.from(new Set(["core", ...parts])) : ["core"];
}

function parseCliArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const eq = arg.indexOf("=");
    if (eq === -1) continue;
    const key = arg.slice(2, eq);
    const value = arg.slice(eq + 1);
    out[key] = value;
  }
  return out;
}

export function loadConfig(argv: string[] = process.argv.slice(2)): AssemblConfig {
  const cli = parseCliArgs(argv);

  const apiKey = process.env.ASSEMBL_API_KEY ?? cli.apiKey;
  if (!apiKey) {
    throw new Error(
      "ASSEMBL_API_KEY is required. Set it in your MCP client's env, e.g.\n\n" +
        '  "env": { "ASSEMBL_API_KEY": "asm_live_..." }\n\n' +
        "Generate a key at https://assembl.co.nz/admin/mcp/api-keys",
    );
  }

  const apiUrlEnv = process.env.ASSEMBL_API_URL;
  const apiUrl =
    apiUrlEnv && apiUrlEnv.length > 0
      ? apiUrlEnv
      : process.env.ASSEMBL_USE_FALLBACK === "1"
        ? FALLBACK_API_URL
        : DEFAULT_API_URL;

  return {
    apiUrl: apiUrl.replace(/\/$/, ""),
    apiKey,
    orgId: process.env.ASSEMBL_ORG_ID ?? cli.orgs,
    toolsets: parseToolsets(process.env.ASSEMBL_TOOLSETS ?? cli.toolsets),
    tier: process.env.ASSEMBL_TIER ?? cli.tier,
    manaTrust:
      ((process.env.ASSEMBL_MANA_TRUST ?? cli["mana-trust"] ?? "enforce") as
        | "enforce"
        | "warn"
        | "off"),
    logLevel:
      ((process.env.ASSEMBL_LOG_LEVEL ?? "info") as
        | "debug"
        | "info"
        | "warn"
        | "error"),
    timeoutMs: Number(process.env.ASSEMBL_TIMEOUT_MS ?? 30_000),
  };
}
