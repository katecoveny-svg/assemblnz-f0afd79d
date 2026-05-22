// ════════════════════════════════════════════════════════════════════════
// gets-client — fetches the NZ Government Electronic Tenders Service RSS
// feed at https://www.gets.govt.nz/ExternalRSSFeed.htm.
//
// The feed is server-rendered, no auth required. We follow the standard
// adapter-rss conventions: custom User-Agent, generous timeout, return raw
// items for the extractor to parse.
//
// Detail-page enrichment is wired but optional and currently OFF by default.
// Smoke testing will tell us whether the RSS title + description is rich
// enough to score accurately, or whether we need the detail page text.
// ════════════════════════════════════════════════════════════════════════
import Parser from "https://esm.sh/rss-parser@3.13.0";

const GETS_RSS_URL = "https://www.gets.govt.nz/ExternalRSSFeed.htm";
const UA = "Mozilla/5.0 (compatible; AssemblBot/1.0; +https://assembl.co.nz)";

export interface GetsRawItem {
  /** Raw rss-parser item. Untyped to avoid coupling to library internals. */
  guid?: string;
  link?: string;
  title?: string;
  contentSnippet?: string;
  content?: string;
  summary?: string;
  isoDate?: string;
  pubDate?: string;
  // GETS often puts extra fields in dc:* or via custom namespaces; rss-parser
  // lifts unknown elements onto the item. We just hand them through.
  [key: string]: unknown;
}

export interface FetchResult {
  items: GetsRawItem[];
  feedTitle: string | null;
  fetchedAt: string;
}

export async function fetchGetsRss(): Promise<FetchResult> {
  const parser = new Parser({
    timeout: 30_000,
    headers: {
      "User-Agent": UA,
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
    },
  });

  const resp = await fetch(GETS_RSS_URL, {
    headers: {
      "User-Agent": UA,
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
    },
    redirect: "follow",
  });

  if (!resp.ok) {
    throw new Error(`GETS RSS fetch failed: HTTP ${resp.status}`);
  }

  const xml = await resp.text();
  const feed = await parser.parseString(xml);

  const items: GetsRawItem[] = (feed.items ?? []).map((it) => ({
    guid: it.guid,
    link: it.link,
    title: it.title,
    contentSnippet: it.contentSnippet,
    content: it.content,
    summary: it.summary,
    isoDate: it.isoDate,
    pubDate: it.pubDate,
    ...(it as Record<string, unknown>),
  }));

  return {
    items,
    feedTitle: feed.title ?? null,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Optional detail-page enrichment. Fetches the GETS detail HTML and returns
 * the response body. Caller decides whether/how to parse it (we do NOT depend
 * on cheerio or any DOM parser here — the matcher works on plain text).
 *
 * Detail URL pattern: /{ORG_CODE}/ExternalTenderDetails.htm?id={RFX_ID}
 * The link field in the RSS item usually contains the full URL.
 */
export async function fetchGetsDetailHtml(detailUrl: string): Promise<string | null> {
  try {
    const resp = await fetch(detailUrl, {
      headers: { "User-Agent": UA, Accept: "text/html,*/*" },
      redirect: "follow",
    });
    if (!resp.ok) return null;
    return await resp.text();
  } catch {
    return null;
  }
}

/** Best-effort: strip all HTML tags, collapse whitespace. Suitable for matcher input. */
export function plainTextFromHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
