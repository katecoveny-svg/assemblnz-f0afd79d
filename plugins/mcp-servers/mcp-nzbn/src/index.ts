#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { NzbnClient } from "./nzbn-client.js";
import {
  runVerifyNzbn,
  verifyNzbnToolDefinition,
} from "./tool-verify-nzbn.js";
import {
  lookupEntityToolDefinition,
  runLookupEntity,
} from "./tool-lookup-entity.js";

const SERVER_NAME = "assembl-mcp-nzbn";
const SERVER_VERSION = "0.0.1";

async function main(): Promise<void> {
  const client = new NzbnClient();

  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [verifyNzbnToolDefinition, lookupEntityToolDefinition],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "verify_nzbn": {
          const result = await runVerifyNzbn(args ?? {}, client);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }
        case "lookup_entity": {
          const result = await runLookupEntity(args ?? {}, client);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }
        default:
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Unknown tool: ${name}`,
              },
            ],
          };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error invoking ${name}: ${message}`,
          },
        ],
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("[assembl-mcp-nzbn] fatal error:", err);
  process.exit(1);
});
