/**
 * @assembl/mcp — gateway client
 *
 * Thin JSON-RPC client that forwards MCP `tools/list` and `tools/call` requests
 * to the hosted Assembl mcp-router edge function, authenticating with the
 * per-org API key.
 */

import { request } from "undici";
import type { AssemblConfig } from "./config.js";

interface JsonRpcResponse<T = unknown> {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: T;
  error?: { code: number; message: string; data?: unknown };
}

export interface RemoteTool {
  name: string;
  description: string;
  inputSchema: unknown;
}

export interface ToolCallContent {
  content: Array<{ type: "text"; text: string }>;
}

export class GatewayError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "GatewayError";
  }
}

export class AssemblGatewayClient {
  private idCounter = 0;
  constructor(private readonly config: AssemblConfig) {}

  private nextId() {
    this.idCounter += 1;
    return this.idCounter;
  }

  private async call<T>(method: string, params?: unknown): Promise<T> {
    const id = this.nextId();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await request(this.config.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          "X-Assembl-Api-Key": this.config.apiKey,
          "User-Agent": `@assembl/mcp/${VERSION}`,
        },
        body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
        signal: controller.signal,
      });

      const body = (await response.body.json()) as JsonRpcResponse<T>;
      if (body.error) {
        throw new GatewayError(body.error.message, body.error.code, body.error.data);
      }
      if (body.result === undefined) {
        throw new GatewayError("Empty response from gateway", -32603);
      }
      return body.result;
    } catch (err) {
      if (err instanceof GatewayError) throw err;
      if ((err as Error).name === "AbortError") {
        throw new GatewayError(
          `Gateway request timed out after ${this.config.timeoutMs}ms`,
          -32001,
        );
      }
      throw new GatewayError(
        `Gateway network error: ${(err as Error).message}`,
        -32002,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  async initialize() {
    return this.call<{ protocolVersion: string; serverInfo: { name: string; version: string } }>(
      "initialize",
      {},
    );
  }

  async listTools(): Promise<RemoteTool[]> {
    const result = await this.call<{ tools: RemoteTool[] }>("tools/list");
    return result.tools ?? [];
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<ToolCallContent> {
    return this.call<ToolCallContent>("tools/call", { name, arguments: args });
  }
}

const VERSION = "0.1.0-alpha.1";
