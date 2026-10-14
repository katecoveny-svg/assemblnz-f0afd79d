export class HtmlResponseError extends Error {
  readonly code = "html_upstream_blocked";
  constructor() { super("Page unavailable: upstream returned an HTML access challenge"); }
}
/** Concrete challenge resource tags, not generic words or a minimum page length. */
export function assertNotHtmlChallenge(body: string, status: number, contentType: string) {
  const prefix = body.slice(0, 65_536);
  // Providers can return concrete resource tags as markdown fragments without an HTML root.
  void contentType;
  if (status === 200 && (
    /<(?:iframe|script)\b[^>]*\bsrc\s*=\s*["'][^"']*\/_Incapsula_Resource\b/i.test(prefix) ||
    /<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/cdn-cgi\/challenge-platform\//i.test(prefix) ||
    /<script\b[^>]*>[\s\S]*?\b(?:window\.)?_cf_chl_opt\s*=/i.test(prefix)
  )) throw new HtmlResponseError();
}
