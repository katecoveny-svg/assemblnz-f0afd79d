/**
 * SPARK "Build One Thing" winter mini-series → /admin/approvals wiring.
 *
 * Each episode lives as a dated markdown file in content/spark-winter-series/.
 * This module parses one episode into its four platform posts and files them
 * into content_approvals as PENDING rows — one per platform — so each drops
 * into /admin/approvals as a draft Kate approves, edits, or kills.
 *
 * HARD RULES honoured here:
 *  - Draft-only. A row lands 'pending'. Approving it just records the yes;
 *    content_approvals dispatches NOTHING, and ACTION_DISPATCH_ENABLED stays OFF,
 *    so approval never posts anything. A separate, deliberately-flagged poster
 *    would read approved rows later.
 *  - The [GENERATE_IMAGE: …] block is preserved verbatim in the payload; the
 *    imagegen pass runs at post time, not here.
 *  - Idempotent: re-ingesting the same date never double-files a platform.
 *
 * Server-only (reads the committed markdown from disk + service-role writes).
 */
import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getServiceClient } from '@/lib/supabase/service';

export type WinterPlatform = 'linkedin' | 'instagram' | 'x' | 'facebook';

export type WinterPost = {
  platform: WinterPlatform;
  label: string; // "LinkedIn"
  postTime: string; // "9am NZT"
  body: string; // the full post copy, verbatim
  imageConcept: string | null; // the Instagram [GENERATE_IMAGE: …] block, verbatim
};

export type WinterEpisode = {
  date: string; // 2026-07-14
  episode: number | null;
  day: string | null;
  tool: string | null;
  capability: string | null;
  posts: WinterPost[];
};

export type IngestResult = {
  ok: boolean;
  date: string;
  inserted: number;
  skipped: number; // platforms already in the queue for this date
  reason?: string;
};

/** The six-Tuesday winter window (Ep1 ran 2026-07-07; Eps 2–6 below). */
export const WINTER_DATES = [
  '2026-07-14',
  '2026-07-21',
  '2026-07-28',
  '2026-08-04',
  '2026-08-11',
] as const;

const SERIES = 'spark-winter';
const DIR = path.join(process.cwd(), 'content', 'spark-winter-series');
const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;

function frontmatter(md: string): Record<string, string> {
  const m = md.match(/^---\s*\n([\s\S]*?)\n---/);
  const out: Record<string, string> = {};
  if (!m) return out;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (kv) out[kv[1].trim()] = kv[2].trim();
  }
  return out;
}

/** Split the body into its top-level `## …` sections (heading → text). */
function sections(md: string): { heading: string; body: string }[] {
  const body = md.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
  const re = /^##\s+(.+)$/gm;
  const hits: { heading: string; index: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    hits.push({ heading: m[1].trim(), index: m.index, end: re.lastIndex });
  }
  return hits.map((h, i) => ({
    heading: h.heading,
    body: body.slice(h.end, i + 1 < hits.length ? hits[i + 1].index : body.length).trim(),
  }));
}

function timeFrom(heading: string): string {
  return heading.match(/\(([^)]*NZT[^)]*)\)/i)?.[1]?.trim() ?? '';
}

export function parseEpisode(md: string, date: string): WinterEpisode | null {
  const fm = frontmatter(md);
  const secs = sections(md);
  const posts: WinterPost[] = [];

  for (const s of secs) {
    const h = s.heading.toLowerCase();
    if (h.startsWith('linkedin')) {
      posts.push({ platform: 'linkedin', label: 'LinkedIn', postTime: timeFrom(s.heading), body: s.body, imageConcept: null });
    } else if (h.startsWith('instagram')) {
      // Split the caption from its `### Image concept` subsection.
      const split = s.body.split(/^###\s+Image concept\s*$/im);
      const caption = split[0].trim();
      const imageConcept = split.length > 1 ? split.slice(1).join('\n').trim() : null;
      posts.push({ platform: 'instagram', label: 'Instagram', postTime: timeFrom(s.heading), body: caption, imageConcept });
    } else if (h.startsWith('x /') || h.startsWith('x/') || h.startsWith('x ') || h.startsWith('twitter')) {
      posts.push({ platform: 'x', label: 'X / Twitter', postTime: timeFrom(s.heading), body: s.body, imageConcept: null });
    } else if (h.startsWith('facebook')) {
      posts.push({ platform: 'facebook', label: 'Facebook', postTime: timeFrom(s.heading), body: s.body, imageConcept: null });
    }
  }

  if (posts.length === 0) return null;
  const epNum = Number.parseInt(fm.episode ?? '', 10);
  return {
    date,
    episode: Number.isFinite(epNum) ? epNum : null,
    day: fm.day ?? null,
    tool: fm.tool ?? null,
    capability: fm.capability_proved ?? null,
    posts,
  };
}

export async function readEpisodeFile(date: string): Promise<string | null> {
  if (!RE_DATE.test(date)) return null;
  try {
    return await fs.readFile(path.join(DIR, `${date}.md`), 'utf8');
  } catch {
    return null;
  }
}

/**
 * File one episode's four posts into content_approvals as pending drafts.
 * Idempotent per (date, platform); safe to call repeatedly (admin re-click or a
 * Tuesday cron that fires twice).
 */
export async function ingestWinterEpisode(
  date: string,
  createdBy = 'echo:spark-winter',
): Promise<IngestResult> {
  const md = await readEpisodeFile(date);
  if (!md) return { ok: false, date, inserted: 0, skipped: 0, reason: 'no episode file for that date' };

  const ep = parseEpisode(md, date);
  if (!ep || ep.posts.length === 0) return { ok: false, date, inserted: 0, skipped: 0, reason: 'could not parse episode' };

  let sb;
  try {
    sb = getServiceClient();
  } catch {
    return { ok: false, date, inserted: 0, skipped: 0, reason: 'supabase not configured' };
  }

  // Idempotency: which platforms are already queued for this episode date?
  const { data: existing } = await sb
    .from('content_approvals')
    .select('payload')
    .contains('payload', { series: SERIES, episodeDate: date });
  const done = new Set(
    (existing ?? [])
      .map((r) => (r.payload as { platform?: string } | null)?.platform)
      .filter((p): p is string => Boolean(p)),
  );

  const rows = ep.posts
    .filter((p) => !done.has(p.platform))
    .map((p) => ({
      surface: `social:${p.platform}`,
      kind: 'social-post',
      title: `SPARK Winter Ep${ep.episode ?? '?'} · ${p.label} (${p.postTime}) — ${ep.tool ?? 'winter series'}`,
      summary: p.body.length > 300 ? `${p.body.slice(0, 297)}…` : p.body,
      payload: {
        series: SERIES,
        episode: ep.episode,
        episodeDate: date,
        day: ep.day,
        tool: ep.tool,
        capability: ep.capability,
        platform: p.platform,
        postTime: p.postTime,
        body: p.body,
        imageConcept: p.imageConcept,
        sourceFile: `content/spark-winter-series/${date}.md`,
        ingestKey: `${SERIES}/${date}/${p.platform}`,
        note: 'Draft only. Approving records a yes — content_approvals dispatches nothing and ACTION_DISPATCH_ENABLED stays OFF, so nothing posts. [GENERATE_IMAGE] runs at post time.',
      },
      status: 'pending' as const,
      created_by: createdBy,
    }));

  if (rows.length === 0) return { ok: true, date, inserted: 0, skipped: done.size };

  const { error } = await sb.from('content_approvals').insert(rows);
  if (error) return { ok: false, date, inserted: 0, skipped: done.size, reason: error.message };
  return { ok: true, date, inserted: rows.length, skipped: done.size };
}
