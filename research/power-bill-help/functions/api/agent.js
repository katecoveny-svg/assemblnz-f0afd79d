// Cloudflare Pages Function — /api/agent
// Anthropic-Messages-shaped proxy for the concept microsites.
//
// Front-end posts {system, messages} and reads {content:[{type:'text',text}]}.
// An empty text is the signal for the page's own grounded fallback, so a demo
// is never dead even if this fails.
//
// Ladder: claude-opus-5 → gemini-2.5-flash → Workers AI → the page's own
// written answers. Each rung is tried when the one above it fails, not only
// when its key is absent — a key that is present but rejected must fall
// through too, or the demo goes silent. GET /api/agent reports which rung is
// configured and why the last call fell through.

const MODEL = 'claude-opus-5';
const GEMINI_MODEL = 'gemini-2.5-flash';
const MAX_TOKENS = 1200;

// Best-effort spend guard. Pages isolates are ephemeral, so this is a speed
// bump rather than a wall — it stops one tab hammering the endpoint.
const HITS = new Map();
const WINDOW_MS = 60 * 60_000;
const MAX_HITS = 60;

function rateLimited(ip) {
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  HITS.set(ip, recent);
  return recent.length > MAX_HITS;
}

/** Class of the last Anthropic failure. Never the key, never the raw body. */
let lastFailure = null;

export async function onRequestGet(context) {
  const { env } = context;
  const k = env.ANTHROPIC_API_KEY ?? '';
  return Response.json({
    model: MODEL,
    anthropic_key_present: Boolean(k),
    key_length: k.length,          // a real key is ~108; anything else is a paste problem
    last_failure: lastFailure,
    gemini_fallback: Boolean(env.GEMINI_API_KEY),
    gemini_model: GEMINI_MODEL,
    workers_ai_fallback: Boolean(env.AI),
  });
}

/** Gemini Flash, then the Workers AI binding. Returns '' if neither answers,
 *  which is the signal for the page's own grounded written answers. */
async function geminiThenWorkers(env, system, messages) {
  if (env.GEMINI_API_KEY) {
    try {
      const r = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL +
        ':generateContent?key=' + encodeURIComponent(env.GEMINI_API_KEY),
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: system }] },
            // Gemini calls the assistant turn "model", not "assistant".
            contents: messages.map((m) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            })),
            generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.4 },
          }),
        },
      );
      const j = await r.json();
      const parts = j && j.candidates && j.candidates[0] && j.candidates[0].content
        && j.candidates[0].content.parts;
      const out = (parts || []).map((p) => p.text || '').join('').trim();
      if (out) { lastFailure = null; return out; }
      lastFailure = (lastFailure ? lastFailure + ' → ' : '') +
        'gemini:' + (r.status + ((j && j.error && j.error.status) ? ':' + j.error.status : ''));
    } catch (e) {
      lastFailure = (lastFailure ? lastFailure + ' → ' : '') + 'gemini:threw';
      console.error('[agent] gemini failed:', e);
    }
  }
  // Deliberately NO Workers-AI (llama) fallback on this help tool: the smaller
  // model gave a subtly wrong answer (it read prepay POWER as prepay mobile). For
  // a page vulnerable people rely on, an empty reply — which triggers the page's
  // safe written fallback ("ring MoneyTalks / Work and Income") — is far better
  // than a plausible-but-wrong one. Real replies come from claude-opus-5 once the
  // ANTHROPIC_API_KEY secret is set on this project.
  return '';
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('bad json', { status: 400 });
  }

  const { system = '', messages = [] } = body;
  const trimmed = (Array.isArray(messages) ? messages : [])
    .slice(-12)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string');

  if (!trimmed.length) return Response.json({ content: [{ type: 'text', text: '' }] });

  const ip = request.headers.get('cf-connecting-ip') ?? 'anon';
  if (rateLimited(ip)) {
    return Response.json({
      content: [{ type: 'text', text: 'Give it a minute — this concept has a limit on how often it answers.' }],
    });
  }

  let text = '';
  try {
    if (env.ANTHROPIC_API_KEY) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, system, messages: trimmed }),
      });
      const j = await r.json();
      if (j && Array.isArray(j.content)) {
        // opus-5 emits a leading empty `thinking` block, so the answer is not
        // content[0]. Pull the text block(s) out and hand the page the clean
        // shape it reads — otherwise it shows the empty thinking block as blank.
        const answer = j.content.filter((b) => b && b.type === 'text').map((b) => b.text || '').join('').trim();
        if (answer) { lastFailure = null; return Response.json({ content: [{ type: 'text', text: answer }] }, { headers: { 'cache-control': 'no-store' } }); }
      }
      const t = (j && j.error && j.error.type) || String(r.status);
      lastFailure = r.status + ':' + t;
      console.error('[agent] anthropic returned no content:', t);
      text = await geminiThenWorkers(env, system, trimmed);
    } else {
      text = await geminiThenWorkers(env, system, trimmed);
    }
  } catch (e) {
    console.error('[agent] call failed:', e);
    text = '';
  }

  return Response.json({ content: [{ type: 'text', text }] }, { headers: { 'cache-control': 'no-store' } });
}
