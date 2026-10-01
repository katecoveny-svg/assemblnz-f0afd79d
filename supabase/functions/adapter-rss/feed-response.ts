// Validate upstream format before XML parsing. Never interpret challenge pages as data.
export class FeedResponseError extends Error {
  constructor(public code: string, message: string, public details: Record<string, unknown>) {
    super(message);
    this.name = "FeedResponseError";
  }
}

export async function parseFeedResponse<T>(
  response: Response,
  parse: (xml: string) => Promise<T>,
): Promise<T> {
  const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ?? null;
  // Do not retain bodies, cookies, challenge tokens or URL query parameters in telemetry.
  const details = { http_status: response.status, content_type: contentType };
  if (!response.ok) throw new FeedResponseError("feed_http_error", `HTTP ${response.status} fetching feed`, details);
  const xml = await response.text();
  const prefix = xml.replace(/^\uFEFF/, "").trimStart();
  const html = contentType === "text/html" || contentType === "application/xhtml+xml" ||
    /^(?:<!doctype\s+html\b|<html\b)/i.test(prefix) || /<html\b/i.test(prefix.slice(0, 1024));
  if (html) {
    const blocked = /_Incapsula_Resource|incapsula|distil_referrer|cf-chl-/i.test(xml);
    throw new FeedResponseError(blocked ? "feed_upstream_blocked" : "feed_html_response",
      blocked ? "Feed unavailable: upstream returned an HTML access challenge" : "Expected RSS/Atom XML; upstream returned HTML", details);
  }
  if (!prefix) throw new FeedResponseError("feed_empty_response", "Feed unavailable: empty response", details);
  // XML declarations and comments are allowed, but arbitrary XML is not a feed.
  const root = prefix.replace(/^<\?xml[\s\S]*?\?>\s*/i, "").replace(/^(?:<!--[\s\S]*?-->\s*)*/, "");
  if (!/^<(?:rss\b|feed\b|rdf:RDF\b)/i.test(root)) {
    throw new FeedResponseError("feed_invalid_format", "Expected RSS/Atom XML; response has no supported feed root", details);
  }
  try {
    return await parse(xml);
  } catch {
    throw new FeedResponseError("feed_malformed_xml", "Feed unavailable: malformed RSS/Atom XML", details);
  }
}
