// ════════════════════════════════════════════════════════════════════════
// extractor — turn one rss-parser GETS item into typed structured fields.
//
// GETS RSS items follow a consistent shape. Title examples:
//   "14247 - Ashhurst Domain to Western Gateway Shared Use Path"
//   "RFP-2026-002 Network Refresh"
//
// Description / content typically contains the close date, agency, tender
// type, and a short summary. Format varies; we extract best-effort.
// ════════════════════════════════════════════════════════════════════════

export interface ExtractedTender {
  rfx_id: string;
  ref_number: string | null;
  title: string;
  summary: string | null;
  agency: string | null;
  tender_type: string | null; // RFP, RFT, RFI, NOI, ROI, or null
  close_at: string | null; // ISO 8601 or null
  detail_url: string | null;
  response_format: string | null;
  /** Best-effort: amount in NZD if a budget is mentioned. null otherwise. */
  budget_nzd_estimate: number | null;
  published_at: string | null;
}

const TENDER_TYPES = ["RFP", "RFT", "RFI", "NOI", "ROI", "RFx", "EOI"];

/** Strip leading "12345 - " or "RFP-2026-001 " prefix from the title. */
export function refNumberFromTitle(title: string): {
  ref: string | null;
  cleaned: string;
} {
  const m = title.match(/^([A-Z]{2,5}-?\d{2,6}(?:-\d{2,6})?|\d{4,8})\s*[-:]\s*(.+)$/);
  if (m) return { ref: m[1], cleaned: m[2].trim() };
  return { ref: null, cleaned: title.trim() };
}

/** Extract the RFx id from a guid/link. Examples: id=34033788 */
export function rfxIdFrom(item: {
  guid?: string;
  link?: string;
}): string | null {
  const candidates = [item.guid, item.link].filter(
    (s): s is string => typeof s === "string" && s.length > 0,
  );
  for (const c of candidates) {
    const m = c.match(/[?&]id=(\d+)/);
    if (m) return m[1];
    // Some GETS guids are just the numeric ID
    if (/^\d{6,12}$/.test(c)) return c;
  }
  // Fall back to a hash of the link/guid so we still have a stable dedup key
  const fallback = candidates[0];
  return fallback ?? null;
}

const TENDER_TYPE_RE = new RegExp(`\\b(${TENDER_TYPES.join("|")})\\b`, "i");

export function tenderTypeFrom(title: string, body: string): string | null {
  const m = (title + " " + body).match(TENDER_TYPE_RE);
  return m ? m[1].toUpperCase() : null;
}

const CLOSE_DATE_RE =
  /\bclos(?:e|ing|es)\b[^.]{0,40}?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}(?:[T ]\d{1,2}:\d{2})?)/i;
const ISO_DATE_RE = /\b(\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:?\d{2})?)?)\b/;

export function closeAtFrom(body: string): string | null {
  const m = body.match(CLOSE_DATE_RE);
  if (m) return normaliseDate(m[1]);
  const iso = body.match(ISO_DATE_RE);
  if (iso) return iso[1];
  return null;
}

function normaliseDate(raw: string): string | null {
  // Accept dd/mm/yyyy and dd-mm-yyyy plus optional time.
  const m = raw.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:[T ](\d{1,2}):(\d{2}))?$/,
  );
  if (!m) return null;
  const [, d, mo, y, hh, mm] = m;
  const year = y.length === 2 ? `20${y}` : y;
  const dt = new Date(
    `${year}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T${(hh ?? "12").padStart(2, "0")}:${mm ?? "00"}:00+12:00`,
  );
  return Number.isFinite(dt.getTime()) ? dt.toISOString() : null;
}

const AGENCY_RE =
  /\b(?:by|from|on behalf of)?\s*((?:[A-Z][A-Za-z'&]+ ){1,4}(?:Council|Authority|Agency|Ministry|Service|Commission|Board|Trust|Department|Corporation|University|Institute|District Health Board|DHB|Te [A-Z][a-zāēīōū]+)(?:[A-Za-z' ]*)?)\b/;

export function agencyFrom(body: string): string | null {
  const m = body.match(AGENCY_RE);
  return m ? m[1].trim() : null;
}

const BUDGET_RE = /\bNZ?\$\s?([\d,]+(?:\.\d{2})?)\s?(k|K|m|M|million|thousand)?\b/;

export function budgetFrom(body: string): number | null {
  const m = body.match(BUDGET_RE);
  if (!m) return null;
  const raw = parseFloat(m[1].replace(/,/g, ""));
  if (!Number.isFinite(raw)) return null;
  const unit = (m[2] ?? "").toLowerCase();
  if (unit === "k" || unit === "thousand") return raw * 1_000;
  if (unit === "m" || unit === "million") return raw * 1_000_000;
  return raw;
}

const RESPONSE_FORMAT_RE =
  /\b(submit(?:ted)?|respond|response)\b[^.]{0,80}?\b(via|by|through)\b[^.]{0,80}\./i;

export function responseFormatFrom(body: string): string | null {
  const m = body.match(RESPONSE_FORMAT_RE);
  return m ? m[0].trim() : null;
}

/**
 * Pull a usable rfx_id, ref_number, agency, tender_type, close_at, etc out
 * of one raw RSS item. Best-effort — every field may be null.
 */
export function extractTender(item: {
  guid?: string;
  link?: string;
  title?: string;
  contentSnippet?: string;
  content?: string;
  summary?: string;
  isoDate?: string;
  pubDate?: string;
}): ExtractedTender | null {
  const rfx_id = rfxIdFrom(item);
  if (!rfx_id) return null;

  const rawTitle = (item.title ?? "").trim();
  const body = (item.contentSnippet ?? item.summary ?? item.content ?? "").toString().trim();

  const { ref, cleaned } = refNumberFromTitle(rawTitle);

  return {
    rfx_id,
    ref_number: ref,
    title: cleaned || rawTitle || rfx_id,
    summary: body || null,
    agency: agencyFrom(rawTitle + " " + body),
    tender_type: tenderTypeFrom(rawTitle, body),
    close_at: closeAtFrom(body),
    detail_url: item.link ?? null,
    response_format: responseFormatFrom(body),
    budget_nzd_estimate: budgetFrom(body),
    published_at: item.isoDate ?? null,
  };
}
