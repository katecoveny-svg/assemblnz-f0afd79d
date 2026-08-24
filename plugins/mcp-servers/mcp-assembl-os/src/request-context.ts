import { AsyncLocalStorage } from 'node:async_hooks';

export type McpRequestContext = {
  accessToken: string;
};

const storage = new AsyncLocalStorage<McpRequestContext>();

export function withMcpRequestContext<T>(context: McpRequestContext, fn: () => Promise<T>): Promise<T> {
  return storage.run(context, fn);
}

export function currentMcpAccessToken(): string {
  const token = storage.getStore()?.accessToken;
  if (!token) throw new Error('No authenticated MCP access token is available for this request.');
  return token;
}
