export class JsonFeedError extends Error {
  constructor(public code: string, message: string) { super(message); this.name = "JsonFeedError"; }
}
export type JsonConfig = Record<string, unknown>;
type Item = Record<string, unknown>;
const unsafeKeys = new Set(["__proto__", "prototype", "constructor"]);

/** Explicit, bounded own-property traversal; never evaluate paths or walk prototypes. */
export function readPath(value: unknown, path: unknown): unknown {
  if (typeof path !== "string" || !path || path.length > 200) {
    throw new JsonFeedError("json_invalid_path", "Invalid configured JSON path");
  }
  const parts = path.split(".");
  if (parts.length > 8 || parts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part) || unsafeKeys.has(part))) {
    throw new JsonFeedError("json_invalid_path", "Invalid configured JSON path");
  }
  let current = value;
  for (const part of parts) {
    if (!current || typeof current !== "object" || !Object.hasOwn(current, part)) return undefined;
    current = (current as Item)[part];
  }
  return current;
}

export function collectionItems(json: unknown, cfg: JsonConfig): Item[] {
  const configuredPath = Object.hasOwn(cfg, "path") ? cfg.path : undefined;
  const items = configuredPath == null ? json : readPath(json, configuredPath);
  if (!Array.isArray(items)) throw new JsonFeedError("json_invalid_collection", "Expected JSON item array at configured collection path");
  const bounded = Array.from(items.slice(0, 50));
  if (bounded.some((item) => !item || typeof item !== "object" || Array.isArray(item))) {
    throw new JsonFeedError("json_invalid_item", "Expected JSON collection items to be objects");
  }
  return bounded as Item[];
}

function text(item: Item, paths: unknown[]): string | null {
  for (const path of paths) {
    const value = readPath(item, path);
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 5000);
  }
  return null;
}
function candidates(cfg: JsonConfig, field: string, defaults: string[]): unknown[] {
  return !Object.hasOwn(cfg, field) || cfg[field] == null ? defaults : [cfg[field]];
}
export function normalizeItem(item: Item, cfg: JsonConfig) {
  // The declared production collection paths identify these existing wire envelopes.
  const feature = cfg.path === "features" && item.type === "Feature";
  const vulnerability = cfg.path === "vulnerabilities" && !!item.cve && typeof item.cve === "object";
  const idPaths = feature ? ["properties.publicID", "id"] : vulnerability ? ["cve.id"] : ["id", "publicID", "guid", "uuid"];
  const titlePaths = feature ? ["properties.title", "properties.locality"] : vulnerability ? ["cve.id"] : ["title", "name", "summary", "headline"];
  const datePaths = feature ? ["properties.time"] : vulnerability ? ["cve.published"] : ["published", "date", "publishedDate", "pubDate", "created", "modified"];
  const linkPaths = feature ? ["properties.url", "properties.link"] : vulnerability ? ["cve.references.0.url"] : ["url", "link", "href"];
  let content = text(item, candidates(cfg, "content_field", ["description", "summary", "abstract", "body"]));
  if (!content && cfg.content_field == null && vulnerability) {
    const descriptions = readPath(item, "cve.descriptions");
    if (Array.isArray(descriptions)) {
      const english = descriptions.slice(0, 50).find((entry) => entry && typeof entry === "object" && Object.hasOwn(entry, "lang") && entry.lang === "en");
      if (english) content = text(english, ["value"]);
    }
  }
  const date = text(item, candidates(cfg, "date_field", datePaths));
  const calendarDate = date?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  const calendarInstant = calendarDate ? Date.parse(`${calendarDate}T00:00:00Z`) : null;
  if (calendarDate && (!Number.isFinite(calendarInstant) || new Date(calendarInstant!).toISOString().slice(0, 10) !== calendarDate)) {
    throw new JsonFeedError("json_invalid_date", "Invalid publisher calendar date in JSON item");
  }
  if (date && !Number.isFinite(Date.parse(date))) throw new JsonFeedError("json_invalid_date", "Invalid publisher date in JSON item");
  // A timezone-less timestamp cannot be anchored to local server time. Retain it
  // as publisher evidence, but leave the instant unknown without an explicit zone.
  const anchoredDate = date && /(?:Z|[+-]\d{2}:?\d{2})$/i.test(date) ? new Date(date).toISOString() : null;
  const url = text(item, candidates(cfg, "url_field", linkPaths));
  return {
    externalId: text(item, candidates(cfg, "id_field", idPaths)),
    title: text(item, candidates(cfg, "title_field", titlePaths)) ?? "Untitled",
    url: url && /^https?:\/\//i.test(url) ? url : null,
    publishedAt: anchoredDate,
    publisherDateRaw: date,
    content: content ?? JSON.stringify(item).slice(0, 5000),
  };
}

/** Exact old algorithm, retained only to detect an identity transition before writes. */
export function legacyExternalId(item: Record<string, unknown>, cfg: JsonConfig): string {
  for (const key of [typeof cfg.id_field === "string" ? cfg.id_field : "id", "publicID", "guid", "uuid"]) {
    const value = Object.hasOwn(item, key) ? item[key] : undefined;
    if (typeof value === "string" && value.length) return value;
  }
  return JSON.stringify(item).slice(0, 80);
}
