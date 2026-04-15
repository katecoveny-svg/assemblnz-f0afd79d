/**
 * Buffer MCP Server — Supabase Edge Function
 * Exposes Buffer's Publish API as MCP tools via Streamable HTTP (JSON-RPC 2.0)
 */

import { Hono } from "https://deno.land/x/hono@v4.3.6/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const BASE_URL = "https://api.bufferapp.com/1";

// ── Buffer API helper ──

type HttpMethod = "GET" | "POST";

async function bufferRequest(
  token: string,
  path: string,
  method: HttpMethod = "GET",
  body?: Record<string, unknown>,
): Promise<unknown> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("access_token", token);

  const init: RequestInit = { method, headers: {} };

  if (method === "POST" && body) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(body)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) {
        for (const item of v) params.append(`${k}[]`, String(item));
      } else {
        params.append(k, String(v));
      }
    }
    init.body = params.toString();
    (init.headers as Record<string, string>)["Content-Type"] = "application/x-www-form-urlencoded";
  }

  const res = await fetch(url.toString(), init);
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Buffer API ${method} ${path} failed: ${res.status} ${res.statusText} — ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ── Tool definitions ──

const TOOLS = [
  {
    name: "buffer_get_user",
    description: "Return the authenticated Buffer user. Useful first call to confirm the access token works.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "buffer_list_profiles",
    description: "List all social profiles connected to the Buffer account (LinkedIn, Instagram, X, Facebook, etc).",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "buffer_list_pending",
    description: "List posts queued (not yet sent) for a given profile. Paginated.",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Buffer profile id" },
        page: { type: "number", description: "Page number, default 1" },
        count: { type: "number", description: "Results per page, max 100" },
      },
      required: ["profile_id"],
    },
  },
  {
    name: "buffer_list_sent",
    description: "List posts already sent from a given profile, with basic engagement stats.",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Buffer profile id" },
        page: { type: "number", description: "Page number, default 1" },
        count: { type: "number", description: "Results per page, max 100" },
        since: { type: "number", description: "Unix timestamp — only return posts sent after this time" },
      },
      required: ["profile_id"],
    },
  },
  {
    name: "buffer_get_update",
    description: "Fetch a single update (post) by id.",
    inputSchema: {
      type: "object",
      properties: { update_id: { type: "string", description: "Buffer update (post) id" } },
      required: ["update_id"],
    },
  },
  {
    name: "buffer_get_update_interactions",
    description: "Fetch engagement interactions (likes, comments, retweets) on a sent update.",
    inputSchema: {
      type: "object",
      properties: { update_id: { type: "string", description: "Buffer update (post) id" } },
      required: ["update_id"],
    },
  },
  {
    name: "buffer_create_update",
    description: "Create a new post on one or more Buffer profiles. Queue by default; pass now=true to publish immediately.",
    inputSchema: {
      type: "object",
      properties: {
        profile_ids: { type: "array", items: { type: "string" }, description: "One or more Buffer profile ids" },
        text: { type: "string", description: "The post text" },
        now: { type: "boolean", description: "If true, publish immediately" },
        top: { type: "boolean", description: "If true, add to top of queue" },
        scheduled_at: { type: "number", description: "Unix timestamp to schedule the post" },
        media_photo: { type: "string", description: "Public URL to a photo to attach" },
        media_link: { type: "string", description: "A link to share in the post" },
        shorten: { type: "boolean", description: "Whether to auto-shorten links" },
      },
      required: ["profile_ids", "text"],
    },
  },
  {
    name: "buffer_update_update",
    description: "Edit a pending (not yet sent) post's text or media.",
    inputSchema: {
      type: "object",
      properties: {
        update_id: { type: "string", description: "Id of the pending update to edit" },
        text: { type: "string", description: "Replacement post text" },
        now: { type: "boolean" },
        media_photo: { type: "string" },
        media_link: { type: "string" },
      },
      required: ["update_id", "text"],
    },
  },
  {
    name: "buffer_delete_update",
    description: "Delete a pending post.",
    inputSchema: {
      type: "object",
      properties: { update_id: { type: "string", description: "Buffer update id" } },
      required: ["update_id"],
    },
  },
];

// ── Tool dispatch ──

async function dispatch(token: string, name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "buffer_get_user":
      return bufferRequest(token, "/user.json");

    case "buffer_list_profiles":
      return bufferRequest(token, "/profiles.json");

    case "buffer_list_pending": {
      const qs = new URLSearchParams();
      if (args.page) qs.set("page", String(args.page));
      if (args.count) qs.set("count", String(args.count));
      const tail = qs.toString() ? `?${qs}` : "";
      return bufferRequest(token, `/profiles/${args.profile_id}/updates/pending.json${tail}`);
    }

    case "buffer_list_sent": {
      const qs = new URLSearchParams();
      if (args.page) qs.set("page", String(args.page));
      if (args.count) qs.set("count", String(args.count));
      if (args.since) qs.set("since", String(args.since));
      const tail = qs.toString() ? `?${qs}` : "";
      return bufferRequest(token, `/profiles/${args.profile_id}/updates/sent.json${tail}`);
    }

    case "buffer_get_update":
      return bufferRequest(token, `/updates/${args.update_id}.json`);

    case "buffer_get_update_interactions":
      return bufferRequest(token, `/updates/${args.update_id}/interactions.json`);

    case "buffer_create_update": {
      const body: Record<string, unknown> = {
        profile_ids: args.profile_ids,
        text: args.text,
      };
      if (args.now !== undefined) body.now = args.now;
      if (args.top !== undefined) body.top = args.top;
      if (args.scheduled_at !== undefined) body.scheduled_at = args.scheduled_at;
      if (args.media_photo) body["media[photo]"] = args.media_photo;
      if (args.media_link) body["media[link]"] = args.media_link;
      if (args.shorten !== undefined) body.shorten = args.shorten;
      return bufferRequest(token, "/updates/create.json", "POST", body);
    }

    case "buffer_update_update": {
      const body: Record<string, unknown> = { text: args.text };
      if (args.now !== undefined) body.now = args.now;
      if (args.media_photo) body["media[photo]"] = args.media_photo;
      if (args.media_link) body["media[link]"] = args.media_link;
      return bufferRequest(token, `/updates/${args.update_id}/update.json`, "POST", body);
    }

    case "buffer_delete_update":
      return bufferRequest(token, `/updates/${args.update_id}/destroy.json`, "POST");

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ── Hono app ──

const app = new Hono();

app.options("/*", (c) => new Response(null, { headers: corsHeaders }));

app.post("/*", async (c) => {
  const TOKEN = Deno.env.get("BUFFER_ACCESS_TOKEN");
  if (!TOKEN) {
    return c.json(
      { jsonrpc: "2.0", id: null, error: { code: -32000, message: "BUFFER_ACCESS_TOKEN not configured" } },
      500,
      corsHeaders,
    );
  }

  const body = await c.req.json();
  const { method, params, id } = body;
  const headers = { ...corsHeaders, "Content-Type": "application/json" };

  if (method === "initialize") {
    return c.json({
      jsonrpc: "2.0", id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "buffer-mcp", version: "1.0.0" },
      },
    }, 200, headers);
  }

  if (method === "tools/list") {
    return c.json({ jsonrpc: "2.0", id, result: { tools: TOOLS } }, 200, headers);
  }

  if (method === "tools/call") {
    const toolName = params?.name;
    const toolArgs = params?.arguments || {};
    try {
      const result = await dispatch(TOKEN, toolName, toolArgs);
      return c.json({
        jsonrpc: "2.0", id,
        result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] },
      }, 200, headers);
    } catch (e) {
      return c.json({
        jsonrpc: "2.0", id,
        result: { content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Unknown"}` }], isError: true },
      }, 200, headers);
    }
  }

  return c.json({ jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } }, 200, headers);
});

app.get("/*", (c) =>
  c.json({ status: "ok", server: "buffer-mcp", version: "1.0.0", tools: TOOLS.map((t) => t.name) }, 200, corsHeaders),
);

Deno.serve(app.fetch);
