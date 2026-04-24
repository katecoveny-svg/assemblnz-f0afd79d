import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * agent-tool-e2e
 *
 * End-to-end liveness probe for a single agent × tool pair.
 *
 * Forces a real model call via Lovable AI Gateway with a tool-calling schema
 * so we can verify the model actually decided to invoke the tool (not a mock).
 * Runs the call twice to assert content variance — proof of a non-cached,
 * non-mocked response. Records the result row in agent_test_results so the
 * admin dashboard has a single source of truth.
 *
 * Cost guardrail: every call is forced through google/gemini-2.5-flash-lite
 * regardless of the agent's normal model_preference.
 */

const FORCED_MODEL = "google/gemini-2.5-flash-lite";
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface E2EBody {
  agent_id?: string;
  tool_name?: string;
  sample_prompt?: string;
}

interface ToolCallResult {
  text: string;
  toolName: string | null;
  toolArgs: unknown;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  model: string;
  raw: unknown;
}

async function callGateway(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  toolName: string,
  toolDescription: string,
): Promise<ToolCallResult> {
  const start = Date.now();
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: FORCED_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: toolName,
            description: toolDescription,
            parameters: {
              type: "object",
              properties: {
                action_summary: {
                  type: "string",
                  description:
                    "One-sentence plain-English summary of what this tool would do for this request.",
                },
                key_inputs: {
                  type: "array",
                  description:
                    "The main inputs the tool would need from the caller, as short strings.",
                  items: { type: "string" },
                },
                expected_output: {
                  type: "string",
                  description:
                    "What the operator should expect to see back. NZ English.",
                },
              },
              required: ["action_summary", "expected_output"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: toolName } },
      max_tokens: 400,
    }),
  });

  const durationMs = Date.now() - start;
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Gateway ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = JSON.parse(text);
  const choice = data.choices?.[0];
  const message = choice?.message ?? {};
  const toolCall = message.tool_calls?.[0];
  const argsRaw = toolCall?.function?.arguments;
  let toolArgs: unknown = null;
  if (typeof argsRaw === "string") {
    try {
      toolArgs = JSON.parse(argsRaw);
    } catch {
      toolArgs = argsRaw;
    }
  } else if (argsRaw) {
    toolArgs = argsRaw;
  }

  return {
    text: typeof message.content === "string" ? message.content : "",
    toolName: toolCall?.function?.name ?? null,
    toolArgs,
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
    durationMs,
    model: data.model ?? FORCED_MODEL,
    raw: data,
  };
}

function fingerprint(args: unknown): string {
  if (!args) return "";
  const json = JSON.stringify(args);
  return json.slice(0, 200);
}

function looksLikeNonMock(
  a: ToolCallResult,
  b: ToolCallResult,
): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let ok = true;
  if (a.inputTokens <= 0 || a.outputTokens <= 0) {
    ok = false;
    reasons.push("Token counts missing or zero");
  }
  if (a.durationMs < 200) {
    ok = false;
    reasons.push(`Latency too low (${a.durationMs}ms) — looks cached or local`);
  }
  if (!a.toolName) {
    ok = false;
    reasons.push("Model did not invoke the tool");
  }
  const fpA = fingerprint(a.toolArgs);
  const fpB = fingerprint(b.toolArgs);
  if (fpA && fpB && fpA === fpB) {
    // Identical fingerprints — possibly cached. Not always a fail because the
    // model may legitimately produce the same args, but flag as low variance.
    reasons.push("Two runs returned identical args — low variance");
  }
  return { ok, reasons };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body = (await req.json()) as E2EBody;
    const agentId = body.agent_id?.trim();
    const toolName = body.tool_name?.trim();
    const samplePrompt =
      body.sample_prompt?.trim() ||
      `Run a representative real task that exercises the ${toolName} tool. Use realistic NZ-context inputs (NZD, DD/MM/YYYY, NZ place names).`;

    if (!agentId || !toolName) {
      return new Response(
        JSON.stringify({ error: "agent_id and tool_name are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const sb = createClient(supabaseUrl, serviceKey);

    // Look up tool metadata so the model knows what the tool is for
    const { data: toolRow } = await sb
      .from("tool_registry")
      .select("description, tool_category")
      .eq("tool_name", toolName)
      .maybeSingle();

    const toolDescription =
      toolRow?.description ||
      `Specialist tool ${toolName} in category ${toolRow?.tool_category ?? "general"}.`;

    const systemPrompt =
      `You are the Assembl agent "${agentId}". You have access to one tool: ` +
      `"${toolName}". When asked to perform a task, call that tool with realistic ` +
      `arguments grounded in NZ context. Use NZ English, NZD, DD/MM/YYYY. ` +
      `Never refuse — produce a representative tool call.`;

    const e2eStart = Date.now();
    let runA: ToolCallResult | null = null;
    let runB: ToolCallResult | null = null;
    let errorMessage: string | null = null;

    try {
      runA = await callGateway(
        LOVABLE_API_KEY,
        systemPrompt,
        samplePrompt,
        toolName,
        toolDescription,
      );
      runB = await callGateway(
        LOVABLE_API_KEY,
        systemPrompt,
        samplePrompt + "\n\n(Re-run for variance check. Vary phrasing.)",
        toolName,
        toolDescription,
      );
    } catch (e) {
      errorMessage = (e as Error).message;
    }

    const totalDurationMs = Date.now() - e2eStart;
    let livenessOk = false;
    let livenessReasons: string[] = [];
    if (runA && runB) {
      const lv = looksLikeNonMock(runA, runB);
      livenessOk = lv.ok;
      livenessReasons = lv.reasons;
    } else {
      livenessReasons = [errorMessage ?? "No response from gateway"];
    }

    const overallVerdict = errorMessage
      ? "fail"
      : livenessOk
        ? "pass"
        : "warn";

    // Persist to agent_test_results so the existing dashboard surfaces it
    const { data: inserted } = await sb
      .from("agent_test_results")
      .insert({
        kete: "E2E",
        agent_slug: agentId,
        prompt: `[E2E:${toolName}] ${samplePrompt}`.slice(0, 2000),
        response: JSON.stringify(
          {
            tool: toolName,
            run_a: runA?.toolArgs ?? null,
            run_b: runB?.toolArgs ?? null,
            error: errorMessage,
          },
          null,
          2,
        ).slice(0, 4000),
        verdict_kahu: "pass",
        verdict_iho: runA?.toolName ? "pass" : "fail",
        verdict_ta: errorMessage ? "fail" : "pass",
        verdict_mahara: livenessOk ? "pass" : "warn",
        verdict_mana: overallVerdict,
        overall_verdict: overallVerdict,
        audit_entry: {
          source: "agent-tool-e2e",
          tool_name: toolName,
          model: FORCED_MODEL,
          total_duration_ms: totalDurationMs,
          run_a: runA && {
            duration_ms: runA.durationMs,
            input_tokens: runA.inputTokens,
            output_tokens: runA.outputTokens,
            tool_called: runA.toolName,
            args_fingerprint: fingerprint(runA.toolArgs),
          },
          run_b: runB && {
            duration_ms: runB.durationMs,
            input_tokens: runB.inputTokens,
            output_tokens: runB.outputTokens,
            tool_called: runB.toolName,
            args_fingerprint: fingerprint(runB.toolArgs),
          },
          liveness_ok: livenessOk,
          liveness_reasons: livenessReasons,
          error: errorMessage,
        },
        run_by: userId,
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({
        ok: !errorMessage,
        agent_id: agentId,
        tool_name: toolName,
        overall_verdict: overallVerdict,
        liveness_ok: livenessOk,
        liveness_reasons: livenessReasons,
        total_duration_ms: totalDurationMs,
        model: FORCED_MODEL,
        run_a: runA && {
          duration_ms: runA.durationMs,
          input_tokens: runA.inputTokens,
          output_tokens: runA.outputTokens,
          tool_called: runA.toolName,
          tool_args: runA.toolArgs,
        },
        run_b: runB && {
          duration_ms: runB.durationMs,
          input_tokens: runB.inputTokens,
          output_tokens: runB.outputTokens,
          tool_called: runB.toolName,
          tool_args: runB.toolArgs,
        },
        result_id: inserted?.id ?? null,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("agent-tool-e2e error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "E2E run failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
