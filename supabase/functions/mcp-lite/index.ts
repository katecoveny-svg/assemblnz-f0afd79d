// ═══════════════════════════════════════════════════════════════
// assembl MCP Server — Exposes agents as MCP tools for external platforms
// Protocol: MCP Streamable HTTP (JSON-RPC 2.0)
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// ── Tool definitions exposed via MCP ──
const TOOLS = [
  {
    name: "ask_agent",
    description: "Send a message to any of assembl's 46 specialist agents and get an expert NZ-compliant response. Agents cover construction, hospitality, automotive, agriculture, legal, employment, finance, marketing, and more.",
    inputSchema: {
      type: "object",
      properties: {
        agent: {
          type: "string",
          description: "Agent slug (e.g. LEDGER, AROHA, APEX, FLUX, FORGE, AURA, PRISM, ANCHOR, ECHO, PILOT, KAUPAPA, TŌRO). Use 'iho' to auto-route.",
        },
        message: {
          type: "string",
          description: "The question or instruction to send to the agent.",
        },
        context: {
          type: "object",
          description: "Optional context: { industry, team_size, region }",
        },
      },
      required: ["agent", "message"],
    },
  },
  {
    name: "search_nz_compliance",
    description: "Search assembl's verified NZ compliance knowledge base for legislation, rates, thresholds, and regulations. Covers Employment, Tax, Building, Food Safety, Health & Safety, Privacy, and more.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (e.g. 'minimum wage 2026', 'GST rate', 'sick leave entitlement').",
        },
        domain: {
          type: "string",
          description: "Optional domain filter: employment, tax, building, food_safety, health_safety, privacy, automotive, agriculture.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "list_agents",
    description: "List all available assembl agents with their capabilities and industry focus.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// ── JSON-RPC handler ──
async function handleJsonRpc(body: any): Promise<any> {
  const { method, params, id } = body;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  switch (method) {
    case "initialize":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: { listChanged: false } },
          serverInfo: {
            name: "assembl-mcp",
            version: "1.0.0",
          },
        },
      };

    case "tools/list":
      return {
        jsonrpc: "2.0",
        id,
        result: { tools: TOOLS },
      };

    case "tools/call": {
      const toolName = params?.name;
      const args = params?.arguments || {};

      if (toolName === "list_agents") {
        const { data } = await supabase
          .from("agent_prompts")
          .select("agent_name, display_name, pack, model_preference")
          .eq("is_active", true)
          .order("pack");

        const agents = (data || []).map((a: any) => `${a.agent_name} (${a.display_name}) — ${a.pack}`).join("\n");

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: agents || "No agents found." }],
          },
        };
      }

      if (toolName === "search_nz_compliance") {
        let query = supabase
          .from("agent_knowledge_base")
          .select("agent_id, topic, content, confidence, last_verified")
          .eq("is_active", true)
          .gte("confidence", 0.5)
          .ilike("content", `%${args.query}%`)
          .order("confidence", { ascending: false })
          .limit(10);

        if (args.domain) {
          query = query.ilike("topic", `%${args.domain}%`);
        }

        const { data, error } = await query;
        if (error) {
          return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: `Error: ${error.message}` }] } };
        }

        const results = (data || []).map((k: any) => {
          const stale = k.last_verified && new Date(k.last_verified) < new Date(Date.now() - 90 * 86400_000) ? " ⚠️ STALE" : "";
          return `[${k.topic}] ${k.content} (confidence: ${k.confidence}${stale})`;
        }).join("\n\n");

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: results || "No matching compliance data found." }],
          },
        };
      }

      if (toolName === "ask_agent") {
        // Call the agent-router edge function
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

        const response = await fetch(`${SUPABASE_URL}/functions/v1/agent-router`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: args.message }],
            agentId: args.agent || "iho",
            context: args.context || {},
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: `Agent error: ${errText}` }] } };
        }

        // Read SSE stream and collect full response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        if (reader) {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let newlineIndex: number;
            while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
              let line = buffer.slice(0, newlineIndex);
              buffer = buffer.slice(newlineIndex + 1);
              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (!line.startsWith("data: ")) continue;
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) fullText += content;
              } catch { /* partial */ }
            }
          }
        }

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: fullText || "No response from agent." }],
          },
        };
      }

      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Unknown tool: ${toolName}` },
      };
    }

    default:
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Handle batch requests
    if (Array.isArray(body)) {
      const results = await Promise.all(body.map(handleJsonRpc));
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await handleJsonRpc(body);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("MCP server error:", e);
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error" },
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
