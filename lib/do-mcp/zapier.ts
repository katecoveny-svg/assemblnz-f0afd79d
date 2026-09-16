import 'server-only';

import { zapierMcpConfigured } from './providers';

const ZAPIER_MCP_URL = 'https://mcp.zapier.com/api/v1/connect';

/**
 * Zapier MCP stub / thin probe.
 * Full Streamable HTTP MCP client is follow-up; tonight we only report
 * configuration honesty and refuse fake execute.
 */
export async function zapierMcpProbe(): Promise<
  | { ok: true; endpoint: string; note: string }
  | { ok: false; error: string }
> {
  if (!zapierMcpConfigured()) {
    return {
      ok: false,
      error: 'ZAPIER_MCP_TOKEN is not configured. Create a server at mcp.zapier.com and set the connection token.',
    };
  }
  return {
    ok: true,
    endpoint: ZAPIER_MCP_URL,
    note: 'Token present. Tool list/call via Streamable HTTP MCP client is not wired yet — do not claim live Zapier actions.',
  };
}

export async function zapierMcpExecute(_input: {
  toolName: string;
  arguments?: Record<string, unknown>;
}): Promise<{ ok: false; error: string }> {
  if (!zapierMcpConfigured()) {
    return { ok: false, error: 'ZAPIER_MCP_TOKEN is not configured' };
  }
  return {
    ok: false,
    error: 'Zapier MCP execute is stubbed. Use Composio for primary app tools tonight; Zapier long-tail ships after Streamable HTTP client lands.',
  };
}
