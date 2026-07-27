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
import { extractBrandColours, stylesheetUrls } from '@/lib/build-an-agent/brand-colours';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FETCH_TIMEOUT_MS = 9_000;
const MAX_BYTES = 2_000_000;
const MAX_TEXT = 14_000;

const HITS = new Map<string, number[]>();
const WINDOW_MS = 60 * 60_000;
const MAX_HITS = 30;

/**
 * Returns true when this client has already had its allowance this hour.
 *
 * A rejected request must NOT be recorded. Counting them made the window
 * self-perpetuating: once someone tripped the limit, every retry pushed a
 * fresh timestamp and the hour never drained, so they were locked out for as
 * long as they kept trying. Only successful admissions are counted now.
 */
function rateLimited(ip: string | null): boolean {
  // An unidentifiable client must not share one bucket with every other
  // unidentifiable client — that turned a per-IP limit into a global one.
  if (!ip) return false;
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    HITS.set(ip, recent);
    return true;
  }
  recent.push(now);
  HITS.set(ip, recent);
  return false;
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

/**
 * Harvest the parts of a page that carry meaning but sit outside the body.
 *
 * Single-page apps render their content in the browser, so stripping tags
 * leaves almost nothing — giltrap.com yields 1,900 characters that way, which
 * is too thin to read a business from. What those sites *do* ship in the HTML
 * is the title, the meta and Open Graph description, and JSON-LD structured
 * data. That is often the richest description of the business on the page.
 */
function harvestMeta(html: string): string {
  const out: string[] = [];

  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  if (title) out.push(`Page title: ${title.trim()}`);

  const metaOf = (name: string) => {
    const re = new RegExp(
      `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i');
    const alt = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i');
    return re.exec(html)?.[1] ?? alt.exec(html)?.[1];
  };
  for (const [label, key] of [
    ['Description', 'description'],
    ['Site name', 'og:site_name'],
    ['Open Graph title', 'og:title'],
    ['Open Graph description', 'og:description'],
  ] as const) {
    const v = metaOf(key);
    if (v) out.push(`${label}: ${v.trim()}`);
  }

  // JSON-LD is where a well-built site describes itself properly.
  const ld = html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of ld) {
    const raw = (m[1] ?? '').trim();
    if (raw.length > 4 && raw.length < 6_000) out.push(`Structured data: ${raw}`);
  }

  // Image alt text names products and services on image-led sites.
  const alts = [...html.matchAll(/<img[^>]+alt=["']([^"']{4,90})["']/gi)]
    .map((m) => m[1]!.trim())
    .filter((a) => !/^(icon|logo|image|photo|banner|arrow|chevron)$/i.test(a));
  if (alts.length) out.push(`Images on the page: ${[...new Set(alts)].slice(0, 30).join(' · ')}`);

  return out.join('\n');
}


/** A specific, honest reason beats one apologetic message for every cause. */
function fetchErrorMessage(): string {
  const r = lastFetchReason ?? '';
  if (/^http 40[13]$/.test(r))
    return 'That site turns away automated readers, so we can\u2019t read it from our servers. Some big retailers do. Try a page that isn\u2019t behind their bot protection, like your About or Services page.';
  if (/^http 404$/.test(r))
    return 'That page wasn\u2019t found. Check the address, or try the site\u2019s home page.';
  if (/^http 5/.test(r))
    return 'That site is having trouble right now \u2014 the error came from their end, not ours. Worth trying again shortly.';
  if (r === 'timeout')
    return 'That site took too long to answer. Try again, or give us a lighter page such as your About page.';
  return 'We couldn\u2019t reach that site. Check the address, or try another page.';
}

/** Strip a page to readable text, dropping chrome that adds no signal. */
function toText(html: string): string {
  const body = html
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
    .trim();
  const meta = harvestMeta(html);
  const combined = meta ? `${meta}\n\nPage text:\n${body}` : body;
  return combined.slice(0, MAX_TEXT);
}

/** Why the last page fetch failed, for the GET health check. Never a URL. */
let lastFetchReason: string | null = null;

async function fetchBody(u: URL, accept: string): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(u.toString(), {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        'user-agent': 'assembl-blueprint/1.0 (+https://www.assembl.co.nz/build-an-agent)',
        accept,
      },
    });
    if (!res.ok) {
      lastFetchReason = `http ${res.status}`;
      return null;
    }
    lastFetchReason = null;
    const buf = await res.arrayBuffer();
    // A big page is not an unreadable one. Rejecting anything over the cap
    // meant a 1.3MB retail homepage came back as "couldn't read that site",
    // when everything worth reading sits in the first chunk anyway. Truncate
    // instead of failing — the cap is here to bound memory, not to judge.
    const slice = buf.byteLength > MAX_BYTES ? buf.slice(0, MAX_BYTES) : buf;
    return new TextDecoder('utf-8', { fatal: false }).decode(slice);
  } catch (err) {
    lastFetchReason = /abort|timeout/i.test(String(err)) ? 'timeout' : 'network';
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchPage(u: URL): Promise<string | null> {
  return fetchBody(u, 'text/html,application/xhtml+xml');
}

/**
 * Pull the site's own stylesheets so the brand palette comes from what they
 * actually ship, not from inline utility classes. Each URL is re-checked
 * through the same SSRF guard — a page can link a stylesheet anywhere.
 */
async function fetchStyles(html: string, base: URL): Promise<string[]> {
  const urls = stylesheetUrls(html, base);
  const bodies = await Promise.all(
    urls.map(async (raw) => {
      const safe = await safeUrl(raw);
      if (!safe) return null;
      return fetchBody(safe, 'text/css');
    }),
  );
  return bodies.filter((b): b is string => typeof b === 'string');
}

const EXTRACT_SYSTEM = `You read a business's own public website and write the Business Blueprint an AI agent would need to answer that business's customers honestly.

Rules:
- Use ONLY what the page says. Never invent services, prices, locations, claims or statistics. If the page does not say it, leave it out.
- Write in plain New Zealand English. Short sentences. No marketing adjectives, no "seamless", "unlock", "empower", "elevate", "cutting-edge".
- "voice" describes how this business already writes — tone, formality, the words they favour — so an agent can sound like them.
- "questions" are the five things this business's customers MOST want to know before they buy or commit. Choose them from the customer's point of view ONLY — decide the list BEFORE you consider whether the page answers them, and never pick easier questions to make the tally look better. If customers would ask about price, eligibility, timeframes or what happens if something goes wrong, those belong in the list whether or not the page covers them.
- Then, for each question, set "answerable" to true ONLY if this page gives a customer enough to actually act on. Be strict: naming a topic is not answering it, and a link to somewhere else is not an answer. It is normal for several to be false — most websites answer perhaps half. A run of five "true" almost always means the questions were chosen too gently.
- "questions" and "blindSpots" must agree with each other: if something is listed as a blind spot, any question about it is not answerable.
- "facts" are concrete, checkable specifics an agent must get right: services offered, locations, hours, guarantees, named products, and numbers the business asserts ABOUT ITSELF.
- CRITICAL — tell claims apart from sample data. Many sites render a product demo, mockup, screenshot, worked example, calculator or interactive preview, and the numbers inside those are illustrative placeholders, not claims. A figure sitting in a fake dashboard, an example receipt, a sample report or a "try it" widget is UI content — it is what the product would show a user, not something the business is asserting is true. Treat a number as a fact ONLY if the business states it in its own voice as a claim about its business, product or results. When in doubt, leave it out: wrongly reporting a demo value as a company claim is the worst error you can make here, because an agent will then repeat it to customers as true.
- "blindSpots" name things a customer would want to know that the page does NOT answer. Be specific and useful — this is the most valuable field.

Reply with ONLY a JSON object, no prose or code fences:
{"business":"one sentence: who they are and who they serve","sells":["up to 6 things they offer"],"voice":"1-2 sentences on how they write","questions":[{"q":"a real customer question","answerable":true}],"facts":["up to 8 concrete facts from the page"],"blindSpots":["up to 4 things the page does not answer"]}`;

type Brief = {
  business: string;
  sells: string[];
  voice: string;
  questions: string[];
  facts: string[];
  blindSpots: string[];
  /** How many of `questions` the page actually answers. A count of real
   *  things — deliberately not a score, because there is no rubric behind one. */
  answered: number;
  /** The ones it does not answer, kept so the agent can be asked a question it
   *  will honestly refuse — the most convincing thing it does. */
  unanswered: string[];
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

  // Questions come back as {q, answerable}. Older shapes (plain strings) are
  // still accepted so a model that ignores the schema degrades rather than fails.
  const rawQs = Array.isArray(o.questions) ? o.questions.slice(0, 5) : [];
  const questions: string[] = [];
  const unanswered: string[] = [];
  let answered = 0;
  for (const item of rawQs) {
    if (typeof item === 'string') { questions.push(item); continue; }
    if (item && typeof item === 'object') {
      const q = (item as Record<string, unknown>).q;
      if (typeof q !== 'string') continue;
      questions.push(q);
      if ((item as Record<string, unknown>).answerable === true) answered += 1;
      else unanswered.push(q);
    }
  }

  return {
    business,
    sells: list(o.sells, 6),
    voice: typeof o.voice === 'string' ? o.voice : '',
    questions,
    facts: list(o.facts, 8),
    blindSpots: list(o.blindSpots, 4),
    answered,
    unanswered,
  };
}

/**
 * Emit the assembly as NDJSON so the page can show what has actually finished.
 * Only real milestones are reported — the fetch, the stylesheets, the resolved
 * palette. Nothing here is a timer pretending to be progress.
 */
function streamed(run: (emit: (evt: unknown) => void) => Promise<void>): Response {
  const enc = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const emit = (evt: unknown) => controller.enqueue(enc.encode(`${JSON.stringify(evt)}\n`));
      try {
        await run(emit);
      } catch (err) {
        console.error('[agent-brief] stream failed', err);
        emit({ stage: 'error', error: 'The blueprint did not come back cleanly. Try again in a moment.' });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(body, {
    headers: { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/** The model call, shared by the streaming and plain paths. */
async function runExtraction(u: URL, text: string): Promise<Brief | null> {
  // Deep tier: judging what a business does from its own marketing copy is
  // reasoning work, and a wrong blueprint poisons every answer after it.
  const rung = pickRung(resolveModelLadder(MODEL_TIER_TO_ANTHROPIC.premium, []));
  if (!rung) return null;
  try {
    const { text: generated } = await generateText({
      model: rung.model,
      system: EXTRACT_SYSTEM,
      messages: [{ role: 'user', content: `Website: ${u.toString()}\n\nPage text:\n${text}` }],
      maxRetries: 1,
    });
    return coerce(generated);
  } catch (err) {
    console.error('[agent-brief] extraction failed', err);
    // Surface the *class* of failure so a live outage can be diagnosed from
    // outside without reading logs. Never includes the key or the message body.
    const raw = String((err as { message?: string })?.message ?? err);
    lastFailureReason =
      /authentication|invalid x-api-key|401/i.test(raw) ? 'auth: the API key was rejected'
      : /credit|billing|quota|insufficient/i.test(raw) ? 'billing: credit or quota exhausted'
      : /not_found|model/i.test(raw) ? 'model: that model is not available to this key'
      : /rate.?limit|429/i.test(raw) ? 'upstream rate limit'
      : /timeout|abort|ETIMEDOUT/i.test(raw) ? 'timeout reading or generating'
      : 'unknown';
    // Claude is the right model for this judgement, but a blueprint that does
    // not come back at all is worse than one from the second-best model.
    const viaGemini = await extractWithGemini(u, text);
    if (viaGemini) {
      lastFailureReason += ' — answered by gemini instead';
      return viaGemini;
    }
    return null;
  }
}

/**
 * Fallback rung: Gemini Flash, called over REST so this adds no dependency to
 * a route that is already in production. Returns null on any doubt — a wrong
 * blueprint is worse than none.
 */
async function extractWithGemini(u: URL, text: string): Promise<Brief | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: EXTRACT_SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: `Website: ${u.toString()}\n\nPage text:\n${text}` }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2400, responseMimeType: 'application/json' },
        }),
        signal: AbortSignal.timeout(28_000),
      },
    );
    const j = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const out = (j.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('').trim();
    return out ? coerce(out) : null;
  } catch (err) {
    console.error('[agent-brief] gemini fallback failed', err);
    return null;
  }
}

/** Last extraction failure class, for the GET health check. Never a key. */
let lastFailureReason: string | null = null;

export async function GET() {
  return Response.json({
    ok: true,
    anthropic_key_present: Boolean(process.env.ANTHROPIC_API_KEY),
    key_length: (process.env.ANTHROPIC_API_KEY ?? '').length,
    last_failure: lastFailureReason,
    last_fetch_failure: lastFetchReason,
  });
}

export async function POST(req: NextRequest) {
  let body: { url?: string; stream?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return bad(400, 'bad request');
  }

  const ip = clientIpFromHeaders(req.headers);
  if (rateLimited(ip)) {
    return bad(429, "That's a lot of websites. Take a breather, or email assembl@assembl.co.nz.");
  }

  const u = await safeUrl(String(body.url ?? '').trim().slice(0, 300));
  if (!u) return bad(400, "That doesn't look like a public website address. Try yourbusiness.co.nz");

  if (body.stream) {
    return streamed(async (emit) => {
      const html = await fetchPage(u);
      if (!html) {
        emit({ stage: 'error', error: fetchErrorMessage() });
        return;
      }
      emit({ stage: 'fetched', source: u.hostname });

      const text = toText(html);
      if (text.length < 200) {
        emit({ stage: 'error', error: "There wasn't much readable text on that page. Try the About or Services page." });
        return;
      }

      const styles = await fetchStyles(html, u);
      emit({ stage: 'styles', count: styles.length });

      const brand = extractBrandColours([html, ...styles]);
      emit({ stage: 'colours', brand });
      emit({ stage: 'reading' });

      const brief = await runExtraction(u, text);
      if (!brief) {
        emit({ stage: 'error', error: "The blueprint didn't come back cleanly. Try again in a moment." });
        return;
      }
      emit({ stage: 'done', brief: { ...brief, brand, source: u.hostname } });
    });
  }

  const html = await fetchPage(u);
  if (!html) return bad(422, fetchErrorMessage());

  const text = toText(html);
  if (text.length < 200) {
    return bad(422, "There wasn't much readable text on that page. Try the About or Services page.");
  }

  // Brand palette, counted rather than guessed (see lib/build-an-agent/brand-colours).
  const styles = await fetchStyles(html, u);
  let brand = extractBrandColours([html, ...styles]);
  // Our own domain is the one case where counting misleads: years of legacy
  // pages out-vote the current Instrument palette, so the demo-of-ourselves
  // came back teal and red. The declared brand kit is the truthful answer.
  if (/(^|\.)assembl\.co\.nz$/i.test(u.hostname)) {
    brand = {
      ...brand,
      primary: '#D4A843',
      secondary: '#050F1C',
      ink: '#050F1C',
      palette: ['#050F1C', '#D4A843', '#B8964F', '#F0EEE9'],
    } as typeof brand;
  }

  const brief = await runExtraction(u, text);
  if (!brief) return bad(502, "The blueprint didn't come back cleanly. Try again in a moment.");

  return Response.json(
    { ...brief, brand, source: u.hostname, model: MODEL_TIER_TO_ANTHROPIC.premium },
    { headers: { 'cache-control': 'no-store' } },
  );
}
