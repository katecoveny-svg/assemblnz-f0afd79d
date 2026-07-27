// Cloudflare Pages Function — /api/agent
// Anthropic-Messages-shaped proxy for the "minute one" family-guide microsites.
// Front-end posts {system, messages} and reads {content:[{type:'text',text}]};
// an empty text makes the page fall back to its grounded scripted guide.
export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch { return new Response("bad json", { status: 400 }); }
  const { system = "", messages = [] } = body;
  const trimmed = (Array.isArray(messages) ? messages : []).slice(-12)
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string");
  let text = "";
  try {
    if (env.ANTHROPIC_API_KEY) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-haiku-4-5", max_tokens: 400, system, messages: trimmed })
      });
      const j = await r.json();
      if (j && j.content) return Response.json(j);
    } else if (env.AI) {
      const res = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [{ role: "system", content: system }, ...trimmed], max_tokens: 400
      });
      text = (res && res.response) || "";
    }
  } catch (e) { text = ""; }
  return Response.json({ content: [{ type: "text", text }] }, { headers: { "cache-control": "no-store" } });
}
