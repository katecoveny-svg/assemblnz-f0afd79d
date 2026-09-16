const RETURN_BASE = "https://www.assembl.co.nz";
/** Keep login returns on this origin, including when URL parsing normalises a path. */
export function safeReturnPath(raw: unknown, fallback = "/app"): string {
  if (
    typeof raw !== "string" ||
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    /[\\\u0000-\u0020]/.test(raw)
  )
    return fallback;
  try {
    const url = new URL(raw, RETURN_BASE);
    return url.origin === RETURN_BASE
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
/** Older email templates nested an assembl confirmation URL inside `next`. */
export function resolveAuthReturn(raw: string | null): string {
  const direct = safeReturnPath(raw, "");
  if (direct) return direct;
  try {
    const url = new URL(raw || "");
    if (
      url.protocol !== "https:" ||
      !(
        url.hostname === "assembl.co.nz" ||
        url.hostname.endsWith(".assembl.co.nz")
      )
    )
      return "/app";
    const inner = safeReturnPath(url.searchParams.get("next"), "");
    if (inner) return inner;
    if (!url.pathname.startsWith("/auth"))
      return safeReturnPath(`${url.pathname}${url.search}`);
  } catch {
    /* Invalid return destinations use the normal app landing. */
  }
  return "/app";
}
export function isDoReturn(raw: string | null): boolean {
  const path = resolveAuthReturn(raw);
  return /^\/do(?:\/|\?|#|$)/.test(path);
}
