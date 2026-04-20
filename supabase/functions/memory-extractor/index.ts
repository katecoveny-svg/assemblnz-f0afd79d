// supabase/functions/memory-extractor/index.ts
// Drains memory_extraction_queue. Triggered by cron (~60s).
// Reads finished conversations, summarises with Claude Haiku via OpenRouter,
// embeds with text-embedding-3-small, writes to agent_memory.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.39.0/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENROUTER_KEY = Deno.env.get("OPENROUTER_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const EXTRACTION_PROMPT = `You are a memory extractor for the Assembl platform.
Read the conversation below and return 0 to 5 memory facts that should be remembered for future conversations with this user.

Rules:
- Only extract durable facts that will be useful next week or next month. Skip one-off or transient details.
- Each fact must be self-contained (readable without the conversation).
- Prefer facts about: the user, their projects, their preferences, their team, their constraints.
- Do NOT extract sensitive personal information (health, ethnicity, religion, political opinion) unless the user volunteered it as project-relevant.
- Return strict JSON. No prose.

Output schema:
{
  "facts": [
    {
      "memory_type": "profile" | "project" | "preference" | "fact" | "relationship",
      "subject": "short noun phrase, max 60 chars",
      "content": "one to three sentences, plain English",
      "importance": 1-5 integer (5 = critical, 3 = normal, 1 = trivia)
    }
  ]
}`;

async function extractFacts(conversationText: string): Promise<any[]> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "anthropic/claude-haiku-4-5",
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        { role: "user", content: conversationText.slice(0, 30000) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!res.ok) throw new Error(`Extractor LLM failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  try {
    const parsed = JSON.parse(data.choices[0].message.content);
    return parsed.facts ?? [];
  } catch {
    return [];
  }
}

async function embed(text: string): Promise<number[]> {
  const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/text-embedding-3-small",
      input: text,
    }),
  });

  if (!res.ok) throw new Error(`Embedding failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.data[0].embedding;
}

function flattenMessages(raw: any): { role: string; content: string }[] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : (raw.messages ?? []);
  return arr
    .map((m: any) => ({
      role: String(m.role ?? "user"),
      content: typeof m.content === "string" ? m.content : JSON.stringify(m.content ?? ""),
    }))
    .filter((m: any) => m.content && m.content.length > 0);
}

async function processOne(queueRow: any) {
  await supabase
    .from("memory_extraction_queue")
    .update({ status: "processing", attempts: (queueRow.attempts ?? 0) + 1 })
    .eq("id", queueRow.id);

  try {
    // conversations.messages is a jsonb array on the conversations table itself
    const { data: convo, error: convoErr } = await supabase
      .from("conversations")
      .select("messages, user_id")
      .eq("id", queueRow.conversation_id)
      .maybeSingle();

    if (convoErr) throw convoErr;

    const messages = flattenMessages(convo?.messages);

    if (!messages.length) {
      await supabase
        .from("memory_extraction_queue")
        .update({ status: "done", processed_at: new Date().toISOString() })
        .eq("id", queueRow.id);
      return { id: queueRow.id, facts: 0, skipped: "empty conversation" };
    }

    const conversationText = messages
      .map((m) => `[${m.role}] ${m.content}`)
      .join("\n\n");

    const facts = await extractFacts(conversationText);
    const userId = queueRow.user_id ?? convo?.user_id ?? null;

    let written = 0;
    for (const fact of facts) {
      if (!fact?.content || String(fact.content).length < 5) continue;
      try {
        const embedding = await embed(`${fact.subject}: ${fact.content}`);
        const { error: insErr } = await supabase.from("agent_memory").insert({
          tenant_id: queueRow.tenant_id,
          user_id: userId,
          conversation_id: queueRow.conversation_id,
          memory_type: fact.memory_type || "fact",
          subject: String(fact.subject ?? "(untitled)").slice(0, 200),
          content: String(fact.content),
          importance: Math.min(5, Math.max(1, parseInt(fact.importance) || 3)),
          embedding,
          source: "extracted",
          // legacy compat columns kept nullable
          agent_id: "memory-extractor",
          memory_key: String(fact.subject ?? "fact").slice(0, 200),
          memory_value: { content: fact.content, importance: fact.importance },
        });
        if (!insErr) written++;
        else console.error("[memory-extractor] insert failed:", insErr.message);
      } catch (embedErr) {
        console.error("[memory-extractor] embed/insert error:", embedErr);
      }
    }

    await supabase
      .from("memory_extraction_queue")
      .update({ status: "done", processed_at: new Date().toISOString() })
      .eq("id", queueRow.id);

    return { id: queueRow.id, facts: written };
  } catch (err: any) {
    const attempts = (queueRow.attempts ?? 0) + 1;
    await supabase
      .from("memory_extraction_queue")
      .update({
        status: attempts >= 3 ? "failed" : "pending",
        last_error: String(err?.message || err).slice(0, 1000),
      })
      .eq("id", queueRow.id);
    return { id: queueRow.id, error: String(err?.message || err) };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { data: queue, error } = await supabase
    .from("memory_extraction_queue")
    .select("*")
    .eq("status", "pending")
    .lt("attempts", 3)
    .order("created_at", { ascending: true })
    .limit(10);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: any[] = [];
  for (const row of queue ?? []) {
    results.push(await processOne(row));
  }

  return new Response(
    JSON.stringify({ processed: results.length, results }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
