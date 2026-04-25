/**
 * @assembl/mcp — local MCP server
 *
 * Implements the Model Context Protocol locally over stdio (compatible with
 * Claude Desktop, Cursor, and any other MCP client) and forwards tool calls
 * to the Assembl gateway.
 */

import { McpServer, StdioTransport } from "mcp-lite";
import { loadConfig } from "./config.js";
import { AssemblGatewayClient, GatewayError } from "./gateway.js";

export async function startServer() {
  const config = loadConfig();
  const log = (level: "debug" | "info" | "warn" | "error", msg: string) => {
    const order = { debug: 0, info: 1, warn: 2, error: 3 };
    if (order[level] >= order[config.logLevel]) {
      // MCP stdio uses stdout for JSON-RPC; logs MUST go to stderr.
      process.stderr.write(`[assembl-mcp] [${level}] ${msg}\n`);
    }
  };

  const gateway = new AssemblGatewayClient(config);

  // Verify connectivity + key validity at startup.
  try {
    await gateway.initialize();
    log("info", `Connected to ${config.apiUrl}`);
  } catch (err) {
    log("error", `Failed to reach Assembl gateway: ${(err as Error).message}`);
    log("error", "Check ASSEMBL_API_KEY and ASSEMBL_API_URL.");
    process.exit(1);
  }

  // Discover tools from the gateway and register them locally.
  const remoteTools = await gateway.listTools();
  log("info", `Loaded ${remoteTools.length} tools from gateway`);

  const server = new McpServer({
    name: "@assembl/mcp",
    version: "0.1.0-alpha.1",
  });

  for (const tool of remoteTools) {
    server.tool({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema as Record<string, unknown>,
      handler: async (args: Record<string, unknown>) => {
        log("debug", `tools/call ${tool.name}`);
        try {
          const result = await gateway.callTool(tool.name, args);
          return result;
        } catch (err) {
          if (err instanceof GatewayError) {
            // Surface the gateway error message into the MCP response so the
            // calling LLM can react (e.g. "tier_excludes_toolset").
            return {
              content: [
                {
                  type: "text" as const,
                  text: `Error from Assembl gateway: ${err.message} (code ${err.code})`,
                },
              ],
              isError: true,
            };
          }
          throw err;
        }
      },
    });
  }

  const transport = new StdioTransport();
  await transport.connect(server);
  log("info", "MCP server ready on stdio");
}
