/** Public company pages; customer worlds, tools and account surfaces keep their own UI. */
export const CRAFTED_PUBLIC_PATHS = [
  "/agents",
  "/pricing",
  "/about",
  "/pilots",
  "/field-notes",
  "/concepts",
  "/journeys",
  "/how-it-works",
  "/contact",
  "/trust",
  "/faq",
  "/concept-studio",
  "/evidence-pack",
  "/industries",
  "/workflows",
  "/docs",
  "/hapai",
] as const;

export const DOCUMENT_PUBLIC_PATHS = [
  "/evidence-pack/preview",
  "/ai-ready",
  "/agent-schema",
  "/legal/privacy",
  "/legal/terms",
  "/legal/disclaimer",
  "/privacy",
  "/ai-use",
  "/te-tiriti",
  "/trust/soc2",
  "/press",
  "/press/motion",
  "/docs/mcp",
  "/data",
  "/notes",
  "/demos",
  "/install",
  "/mana-receipts",
  "/mana-receipts/sample",
] as const;

export function publicPageKind(
  pathname: string | null,
): "crafted" | "document" | null {
  if (!pathname) return null;
  const path = pathname.replace(/\/$/, "") || "/";
  if ((CRAFTED_PUBLIC_PATHS as readonly string[]).includes(path))
    return "crafted";
  if ((DOCUMENT_PUBLIC_PATHS as readonly string[]).includes(path))
    return "document";
  if (/^\/(docs|notes|workflows)\/[^/]+$/.test(path)) return "document";
  return null;
}
