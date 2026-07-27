import { lookup } from 'node:dns/promises';

/**
 * /api/ai-ready — the checks behind the free AI-search readiness tool.
 *
 * POST { url } → fetches the site's homepage, robots.txt and llms.txt and
 * runs eight deterministic checks: can AI crawlers get in, is there a machine
 * map, is the entity defined, is there question-shaped text to lift, is there
 * any crawlable prose at all. No model call — the checks are facts, they run
 * in a second, and the same input always scores the same. The companion
 * journey document on /ai-ready uses /api/agent-brief (Opus 5) separately.
 *
 * Same SSRF posture as agent-brief: resolve the host and refuse private,
 * loopback, link-local and metadata ranges — hostname strings are not enough.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 1_500_000;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_HITS = 40;
const HITS = new Map<string, number[]>();

function rateLimited(ip: string | null): boolean {
  if (!ip) return false;
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) { HITS.set(ip, recent); return true; }
  recent.push(now); HITS.set(ip, recent); return false;
}

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
    (a === 169 && b === 254) ||
    (a === 172 && b! >= 16 && b! <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b! >= 64 && b! <= 127) ||
    a! >= 224
  );
}

async function safeUrl(raw: string): Promise<URL | null> {
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const host = u.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return null;
  try {
    const { address } = await lookup(host);
    if (isBlockedAddress(address)) return null;
  } catch { return null; }
  return u;
}

async function grab(u: URL, path: string): Promise<{ status: number; text: string } | null> {
  try {
    const target = new URL(path, u.origin);
    const res = await fetch(target, {
      redirect: 'follow',
      signal: AbortSignal.timeout(9000),
      headers: { 'user-agent': 'assembl-ai-ready/1.0 (+https://www.assembl.co.nz/ai-ready)', accept: 'text/html,text/plain,*/*' },
    });
    const buf = await res.arrayBuffer();
    const slice = buf.byteLength > MAX_BYTES ? buf.slice(0, MAX_BYTES) : buf;
    return { status: res.status, text: new TextDecoder('utf-8', { fatal: false }).decode(slice) };
  } catch { return null; }
}

const AI_UAS = ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];

type Check = {
  id: string;
  label: string;
  status: 'pass' | 'partial' | 'fail';
  detail: string;
  fix: string;
  weight: number;
};

/** Is this UA blocked by the robots.txt? Minimal parser: last matching group wins per UA. */
function uaBlocked(robots: string, ua: string): boolean {
  const lines = robots.split(/\r?\n/).map((l) => l.replace(/#.*$/, '').trim());
  let applies = false, blocked = false, sawSpecific = false;
  let starBlocked = false, inStar = false;
  for (const line of lines) {
    const m = /^user-agent:\s*(.+)$/i.exec(line);
    if (m) {
      const name = m[1]!.trim().toLowerCase();
      applies = name === ua.toLowerCase();
      inStar = name === '*';
      if (applies) sawSpecific = true;
      continue;
    }
    const d = /^disallow:\s*(.*)$/i.exec(line);
    if (d) {
      const path = d[1]!.trim();
      if (applies && path === '/') blocked = true;
      if (applies && path === '') blocked = false;
      if (inStar && path === '/') starBlocked = true;
    }
  }
  return sawSpecific ? blocked : starBlocked;
}

export async function POST(req: Request): Promise<Response> {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0]!.trim() || null;
  if (rateLimited(ip)) return Response.json({ error: 'Busy — try again in a little while.' }, { status: 429 });

  let raw: string;
  try {
    const body = (await req.json()) as { url?: string };
    raw = String(body.url ?? '').trim();
  } catch { return Response.json({ error: 'Send { url }.' }, { status: 400 }); }
  if (!raw) return Response.json({ error: 'Send { url }.' }, { status: 400 });

  const u = await safeUrl(raw);
  if (!u) return Response.json({ error: 'That address did not check out — try the public https:// address of the site.' }, { status: 400 });

  const [home, robots, llms] = await Promise.all([
    grab(u, '/'),
    grab(u, '/robots.txt'),
    grab(u, '/llms.txt'),
  ]);
  if (!home || home.status >= 500) {
    return Response.json({ error: 'The site did not answer — it may be down, or blocking automated visits.' }, { status: 502 });
  }
  const html = home.text;

  // ── the eight checks ──
  const checks: Check[] = [];
  const push = (c: Omit<Check, 'weight'> & { weight?: number }) =>
    checks.push({ weight: 12, ...c } as Check);

  // 1. AI crawlers welcome
  const robotsOk = robots && robots.status === 200 && /user-agent/i.test(robots.text);
  const blockedUas = robotsOk ? AI_UAS.filter((ua) => uaBlocked(robots.text, ua)) : [];
  push({
    id: 'crawlers', label: 'AI crawlers can get in',
    status: !robotsOk ? 'partial' : blockedUas.length === 0 ? 'pass' : blockedUas.length < AI_UAS.length ? 'partial' : 'fail',
    detail: !robotsOk
      ? 'No readable robots.txt — most crawlers will assume they are allowed, but saying so removes the doubt.'
      : blockedUas.length === 0
        ? 'GPTBot, ClaudeBot, Perplexity and friends are not blocked.'
        : `robots.txt blocks: ${blockedUas.join(', ')}. Those assistants cannot read this site at all.`,
    fix: 'Name the AI crawlers in robots.txt and allow them explicitly (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended).',
    weight: 16,
  });

  // 2. llms.txt
  const llmsOk = llms && llms.status === 200 && llms.text.trim().startsWith('#');
  push({
    id: 'llms', label: 'llms.txt machine map',
    status: llmsOk ? 'pass' : 'fail',
    detail: llmsOk ? 'A machine-readable map of the site exists at /llms.txt.' : 'No /llms.txt — assistants have no curated map of what this site is or where its important pages live.',
    fix: 'Publish /llms.txt (llmstxt.org): one paragraph of what you are, your key terms, and your important pages.',
    weight: 12,
  });

  // 3. structured data present
  const ldBlocks = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]!);
  const ldTypes = new Set<string>();
  for (const b of ldBlocks) {
    try {
      const d = JSON.parse(b) as Record<string, unknown>;
      const nodes = Array.isArray((d as { '@graph'?: unknown[] })['@graph']) ? (d as { '@graph': Record<string, unknown>[] })['@graph'] : [d];
      for (const n of nodes) {
        const t = n['@type'];
        (Array.isArray(t) ? t : [t]).forEach((x) => typeof x === 'string' && ldTypes.add(x));
      }
    } catch { /* invalid JSON-LD counts as absent */ }
  }
  const hasOrg = ldTypes.has('Organization') || ldTypes.has('LocalBusiness');
  push({
    id: 'jsonld', label: 'Structured data (JSON-LD)',
    status: ldBlocks.length === 0 ? 'fail' : hasOrg ? 'pass' : 'partial',
    detail: ldBlocks.length === 0
      ? 'No JSON-LD at all — engines must guess what this site is.'
      : `Found: ${[...ldTypes].slice(0, 6).join(', ') || 'unreadable blocks'}.${hasOrg ? '' : ' No Organization node — the entity itself is undefined.'}`,
    fix: 'Add an Organization node with a real description of what the business is, plus WebSite and (ideally) FAQPage.',
    weight: 14,
  });

  // 4. entity clarity
  const metaDesc = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i.exec(html)?.[1]
    ?? /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i.exec(html)?.[1] ?? '';
  const orgDesc = (() => {
    for (const b of ldBlocks) {
      try {
        const d = JSON.parse(b) as Record<string, unknown>;
        const nodes = Array.isArray((d as { '@graph'?: unknown[] })['@graph']) ? (d as { '@graph': Record<string, unknown>[] })['@graph'] : [d];
        for (const n of nodes) {
          if ((n['@type'] === 'Organization' || n['@type'] === 'LocalBusiness') && typeof n.description === 'string') return n.description;
        }
      } catch { /* skip */ }
    }
    return '';
  })();
  const clarity = Math.max(orgDesc.length, metaDesc.length);
  push({
    id: 'entity', label: 'The entity is defined',
    status: clarity >= 120 ? 'pass' : clarity >= 60 ? 'partial' : 'fail',
    detail: clarity >= 120
      ? 'There is a real definition of what this business is, where an engine will find it.'
      : clarity >= 60
        ? 'A short description exists, but it is thin — engines summarise what you give them.'
        : 'No usable description in the metadata or Organization node.',
    fix: 'Write one honest paragraph: what you are, for whom, where — and put it in both the meta description and the Organization node.',
    weight: 12,
  });

  // 5. question-shaped content
  const textOnly = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ');
  const hasFaqLd = ldTypes.has('FAQPage');
  const questionCount = (textOnly.match(/\?/g) ?? []).length;
  push({
    id: 'questions', label: 'Question-shaped text',
    status: hasFaqLd ? 'pass' : questionCount >= 3 ? 'partial' : 'fail',
    detail: hasFaqLd
      ? 'FAQPage structured data found — answers an assistant can lift directly.'
      : questionCount >= 3
        ? 'Some questions appear in the text, but they are not marked up as FAQs.'
        : 'Nothing question-shaped — assistants answer questions, and this site never asks any.',
    fix: 'Add a short visible Q&A (the questions people actually ask an assistant) and mirror it as FAQPage JSON-LD.',
    weight: 12,
  });

  // 6. crawlable prose
  const words = textOnly.split(' ').filter((w) => w.length > 2).length;
  push({
    id: 'prose', label: 'Crawlable text',
    status: words >= 350 ? 'pass' : words >= 120 ? 'partial' : 'fail',
    detail: `${words} readable words in the served HTML.` + (words < 120 ? ' A JavaScript-only page is nearly invisible to most crawlers.' : ''),
    fix: 'Server-render your key copy. If the page is a visual experience, add a plain-words section — engines can only cite text.',
    weight: 12,
  });

  // 7. title + description hygiene
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim() ?? '';
  const titleOk = title.length >= 10 && title.length <= 70;
  const descOk = metaDesc.length >= 50 && metaDesc.length <= 175;
  push({
    id: 'meta', label: 'Title and description',
    status: titleOk && descOk ? 'pass' : titleOk || descOk ? 'partial' : 'fail',
    detail: `Title: ${title ? `“${title.slice(0, 60)}${title.length > 60 ? '…' : ''}”` : 'missing'} · description ${metaDesc ? `${metaDesc.length} chars` : 'missing'}.`,
    fix: 'A 10–70 character title and a 50–175 character description, each carrying the phrase you want to be known for.',
    weight: 10,
  });

  // 8. sitemap
  const sitemapListed = robotsOk && /sitemap:/i.test(robots.text);
  const sitemap = sitemapListed ? { status: 200, text: '' } : await grab(u, '/sitemap.xml');
  const sitemapOk = sitemapListed || (sitemap !== null && sitemap.status === 200);
  push({
    id: 'sitemap', label: 'Sitemap',
    status: sitemapOk ? 'pass' : 'fail',
    detail: sitemapOk ? 'A sitemap exists for the crawl.' : 'No sitemap found in robots.txt or at /sitemap.xml.',
    fix: 'Publish /sitemap.xml and point to it from robots.txt.',
    weight: 12,
  });

  const total = checks.reduce((n, c) => n + c.weight, 0);
  const got = checks.reduce((n, c) => n + (c.status === 'pass' ? c.weight : c.status === 'partial' ? c.weight / 2 : 0), 0);
  const score = Math.round((got / total) * 100);

  return Response.json({
    url: u.origin,
    site: title || u.hostname,
    score,
    checks: checks.map(({ weight: _w, ...c }) => c),
    checkedAt: new Date().toISOString(),
  });
}
