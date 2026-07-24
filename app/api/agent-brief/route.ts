/**
 * POST /api/agent-brief — read a real business website and assemble a Business
 * Blueprint from it.
 *
 * Body: { url: string }
 * Returns: { business, sells[], voice, questions[], facts[], source, model }
 *
 * This is what makes /build-an-agent genuinely useful rather than a toy: the
 * agent the visitor then talks to is grounded in their own public website, not
 * in invented detail. Extraction runs on the deep tier (Opus) because the job
 * is judgement — deciding what a business actually does from messy marketing
 * copy — not pattern-filling.
 *
 * Only public pages are read. Nothing is stored: the blueprint goes straight
 * back to the browser that asked for it.
 *
 * Rate-limit: 8 sites per IP per hour (fetching costs someone else bandwidth).
 */

import { NextRequest } from 'next/server';
import { lookup } from 'node:dns/promises';
import { generateText } from 'ai';

import { pickRung, resolveModelLadder } from '@/lib/ai/router';
import { clientIpFromHeaders } from '@/lib/lead-capture';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FETCH_TIMEOUT_MS = 9_000;
const MAX_BYTES = 900_000;
const MAX_TEXT = 14_000;

const HITS = new Map<string, number[]>();
const WINDOW_MS = 60 * 60_000;
const MAX_HITS = 8;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  HITS.set(ip, recent);
  return recent.length > MAX_HITS;
}

function bad(status: number, error: string): Response {
  return Response.json({ error }, { status });
}

/**
 * Private/loopback/link-local ranges. A public endpoint that fetches a
 * caller-supplied URL is an SSRF hole unless the resolved address is checked —
 * hostname strings alone are not enough (DNS can point anywhere).
 */
function isBlockedAddress(addr: string): boolean {
  if (addr.includes(':')) {
    const a = addr.toLowerCase();
    return a === '::1' || a.startsWith('fc') || a.startsWith('fd') || a.startsWith('fe80') || a.startsWith('::ffff:');
  }
  const p = addr.split('.').map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
  const [a, b] = p;
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 169 && b === 254) ||          // link-local + cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224
  );
}

async function safeUrl(raw: string): Promise<URL | null> {
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const host = u.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return null;
  try {
    const { address } = await lookup(host);
    if (isBlockedAddress(address)) return null;
  } catch {
    return null;
  }
  return u;
}

/** Strip a page to readable text, dropping chrome that adds no signal. */
function toText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TEXT);
}

async function fetchPage(u: URL): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(u.toString(), {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        'user-agent': 'assembl-blueprint/1.0 (+https://www.assembl.co.nz/build-an-agent)',
        accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') ?? '';
    if (!type.includes('html')) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) return null;
    return new TextDecoder().decode(buf);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const EXTRACT_SYSTEM = `You read a business's own public website and write the Business Blueprint an AI agent would need to answer that business's customers honestly.

Rules:
- Use ONLY what the page says. Never invent services, prices, locations, claims or statistics. If the page does not say it, leave it out.
- Write in plain New Zealand English. Short sentences. No marketing adjectives, no "seamless", "unlock", "empower", "elevate", "cutting-edge".
- "voice" describes how this business already writes — tone, formality, the words they favour — so an agent can sound like them.
- "questions" are the questions this business's real customers would ask, judging by what the page emphasises and what it leaves unclear.
- "facts" are concrete, checkable specifics an agent must get right: services offered, locations, hours, guarantees, named products, anything numeric the page states.
- "blindSpots" name things a customer would want to know that the page does NOT answer. Be specific and useful — this is the most valuable field.

Reply with ONLY a JSON object, no prose or code fences:
{"business":"one sentence: who they are and who they serve","sells":["up to 6 things they offer"],"voice":"1-2 sentences on how they write","questions":["up to 5 real customer questions"],"facts":["up to 8 concrete facts from the page"],"blindSpots":["up to 4 things the page does not answer"]}`;

type Brief = {
  business: string;
  sells: string[];
  voice: string;
  questions: string[];
  facts: string[];
  blindSpots: string[];
};

function coerce(raw: string): Brief | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
  const o = parsed as Record<string, unknown>;
  const list = (v: unknown, cap: number) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, cap) : [];
  const business = typeof o.business === 'string' ? o.business : '';
  if (!business) return null;
  return {
    business,
    sells: list(o.sells, 6),
    voice: typeof o.voice === 'string' ? o.voice : '',
    questions: list(o.questions, 5),
    facts: list(o.facts, 8),
    blindSpots: list(o.blindSpots, 4),
  };
}

export async function POST(req: NextRequest) {
  let body: { url?: string } = {};
  try {
    body = await req.json();
  } catch {
    return bad(400, 'bad request');
  }

  const ip = clientIpFromHeaders(req.headers) ?? 'anon';
  if (rateLimited(ip)) {
    return bad(429, "That's a lot of websites. Take a breather, or email assembl@assembl.co.nz.");
  }

  const u = await safeUrl(String(body.url ?? '').trim().slice(0, 300));
  if (!u) return bad(400, "That doesn't look like a public website address. Try yourbusiness.co.nz");

  const html = await fetchPage(u);
  if (!html) return bad(422, "Couldn't read that site — it may be down, private, or blocking robots. Try another page.");

  const text = toText(html);
  if (text.length < 200) {
    return bad(422, "There wasn't much readable text on that page. Try the About or Services page.");
  }

  // Deep tier: judging what a business does from its own marketing copy is
  // reasoning work, and a wrong blueprint poisons every answer after it.
  const ladder = resolveModelLadder(MODEL_TIER_TO_ANTHROPIC.premium, []);
  const rung = pickRung(ladder);
  if (!rung) return bad(503, 'The blueprint model is offline right now.');

  let out: string;
  try {
    const { text: generated } = await generateText({
      model: rung.model,
      system: EXTRACT_SYSTEM,
      messages: [{ role: 'user', content: `Website: ${u.toString()}\n\nPage text:\n${text}` }],
      maxRetries: 1,
    });
    out = generated;
  } catch (err) {
    console.error('[agent-brief] extraction failed', err);
    return bad(502, "The blueprint didn't come back cleanly. Try again in a moment.");
  }

  const brief = coerce(out);
  if (!brief) return bad(502, "The blueprint didn't come back cleanly. Try again in a moment.");

  return Response.json(
    { ...brief, source: u.hostname, model: rung.id },
    { headers: { 'cache-control': 'no-store' } },
  );
}
