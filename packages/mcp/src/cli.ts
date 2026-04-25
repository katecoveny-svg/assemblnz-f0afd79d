#!/usr/bin/env node
/**
 * @assembl/mcp CLI entry point
 *
 * Usage:
 *   npx @assembl/mcp@latest --toolsets=manaaki,core
 *
 * Most config is read from environment variables — see README for full list.
 */

import { startServer } from "./server.js";

startServer().catch((err) => {
  process.stderr.write(`[assembl-mcp] fatal: ${(err as Error).message}\n`);
  process.exit(1);
});
