// Cloudflare Pages Function — /api/agent · UNIFIED (both microsite patterns)
//
// Pattern A (concept page, "ask assembling — live" widget):
//   POST {agent:'concept'|'kaimahi', message} → {text, backend, agent}
//   Uses the PER-CLIENT KB + SYSTEM prompts below — fill them per client.
// Pattern B (minute-one family guide, "Ask the guide"):
//   POST {system, messages:[{role,content}…]} → Anthropic-shape {content:[{type:'text',text}]}
//   The page sends its own GENOME as `system`; empty text → page falls back
//   to its grounded scripted guide.
//
// Backend: Workers AI free tier ([ai] binding). Set ANTHROPIC_API_KEY as a
// project secret to upgrade to Claude:
//   wrangler pages secret put ANTHROPIC_API_KEY --project-name assembling-<client-slug>

// ═══ PER-CLIENT KB — replace per client (see assembling-live/functions/api/agent.js for a full example) ═══
const KB = `
=== PUBLIC FACTS · SOURCED ===

=== ABOUT ASSEMBL · WHO IS BEHIND THIS ===
- assembl is an independent product studio in Aotearoa New Zealand, founded and led by Kate Hudson.
- assembl builds agentic customer journeys: AI drafts the work, a named person approves it, and every
  output carries a signed mana receipt — the sources used, the agents that ran, and who signed it off.
- Contact: assembl@assembl.co.nz · assembl.co.nz.
- This concept page is independent and unsolicited. No production access is requested by this concept.

(client facts here — verified, dated, sourced; never invented)
`;
const SYSTEM_CONCEPT = `You are the assembling concept agent on an independent pitch microsite. Answer briefly and warmly about the concept, the boundary (no production access requested by this concept; nothing sends without a person's yes), the Mana Receipt, and the pilot shape. Facts you may use:\n${KB}`;
const SYSTEM_KAIMAHI = `You are the in-app agent from the phone mockup. Stay in character, draft-only, never claim live system access. Facts:\n${KB}`;
// ═══════════════════════════════════════════════════════════════════════════

async function callAnthropic(key, system, messages) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-haiku-4-5", max_tokens: 400, system, messages })
  });
  return r.json();
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch { return new Response("bad json", { status: 400 }); }

  // ── Pattern B: {system, messages} → Anthropic-shape ──
  if (typeof body.system === "string" && Array.isArray(body.messages)) {
    const trimmed = body.messages.slice(-12)
      .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string");
    let text = "";
    try {
      if (env.ANTHROPIC_API_KEY) {
        const j = await callAnthropic(env.ANTHROPIC_API_KEY, body.system, trimmed);
        if (j && j.content) return Response.json(j);
      } else if (env.AI) {
        const res = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
          messages: [{ role: "system", content: body.system }, ...trimmed], max_tokens: 400
        });
        text = (res && res.response) || "";
      }
    } catch (e) { text = ""; }
    return Response.json({ content: [{ type: "text", text }] }, { headers: { "cache-control": "no-store" } });
  }

  // ── Pattern A: {agent, message} → {text} ──
  const { agent = "concept", message = "" } = body;
  if (!message.trim()) return Response.json({ text: "" });
  const system = agent === "kaimahi" ? SYSTEM_KAIMAHI : SYSTEM_CONCEPT;
  let text = "", backend = "workers-ai";
  try {
    if (env.ANTHROPIC_API_KEY) {
      const j = await callAnthropic(env.ANTHROPIC_API_KEY, system, [{ role: "user", content: message }]);
      text = (j.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      backend = "anthropic-haiku-4-5";
    } else if (env.AI) {
      const res = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [{ role: "system", content: system }, { role: "user", content: message }], max_tokens: 400
      });
      text = (res && res.response) || "";
    } else { text = "no ai backend configured."; backend = "none"; }
  } catch (e) { text = "agent error: " + (e && e.message ? e.message : String(e)); backend = "error"; }
  return Response.json({ text, backend, agent }, { headers: { "cache-control": "no-store" } });
}
