/**
 * @assembl/mcp — public exports
 *
 * Most users will use the CLI (`npx @assembl/mcp`), but the building blocks
 * are exported for embedding in custom MCP servers or test harnesses.
 */

export { loadConfig, type AssemblConfig } from "./config.js";
export { AssemblGatewayClient, GatewayError, type RemoteTool } from "./gateway.js";
export { startServer } from "./server.js";
