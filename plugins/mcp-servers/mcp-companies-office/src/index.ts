#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { CompaniesOfficeClient } from "./companies-office-client.js";
import {
  lookupCompanyToolDefinition,
  runLookupCompany,
} from "./tool-lookup-company.js";
import {
  lookupDirectorToolDefinition,
  runLookupDirector,
} from "./tool-lookup-director.js";

const SERVER_NAME = "assembl-mcp-companies-office";
const SERVER_VERSION = "0.0.1";

async function main(): Promise<void> {
  const client = new CompaniesOfficeClient();

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
    tools: [lookupCompanyToolDefinition, lookupDirectorToolDefinition],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "lookup_company": {
          const result = await runLookupCompany(args ?? {}, client);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }
        case "lookup_director": {
          const result = await runLookupDirector(args ?? {}, client);
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
  console.error("[assembl-mcp-companies-office] fatal error:", err);
  process.exit(1);
});
