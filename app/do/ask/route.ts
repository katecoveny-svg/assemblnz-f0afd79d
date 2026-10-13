import { randomUUID } from "node:crypto";
import { doShareIntakeSchema } from "@/apps/do/shared/share-intake";
import { ASK_REVIEW_COPY, DO_REVIEW_HEADERS, renderDoReviewPage } from "@/apps/do/shared/share-review";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const QUERY_LIMIT = 16_000;
const KEYS = ["q", "text", "title", "url"] as const;

/**
 * "Ask DO" from a phone: a Siri Shortcut, Spotlight entry or home-screen shortcut opens
 * `/do/ask?q=...`. The words are untrusted intake, never an authenticated command: they are
 * shown for review and only reach Personal DO when the person taps Open. No account write,
 * provider call or link retrieval happens here. Without a question it just opens DO.
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const invalid = (message: string, status = 400) => new Response(message, { status, headers: { ...DO_REVIEW_HEADERS, "Content-Type": "text/plain; charset=utf-8" } });
  const open = () => new Response(null, { status: 303, headers: { ...DO_REVIEW_HEADERS, Location: new URL("/do/personal", request.url).toString() } });
  if (url.search.length > QUERY_LIMIT) return invalid("This ask is too long. Open DO and type a shorter version.", 413);
  const params = url.searchParams;
  if (KEYS.some(key => params.getAll(key).length > 1)) return invalid("Use a single question, title and web link.");
  const text = (params.get("q") ?? params.get("text") ?? "").trim();
  const link = (params.get("url") ?? "").trim();
  if (!text && !link) return open();
  const parsed = doShareIntakeSchema.safeParse({ id: randomUUID(), title: (params.get("title") ?? "").trim(), text, url: link, receivedAt: Date.now() });
  if (!parsed.success) return invalid("Ask DO in up to 10,000 characters, with at most one ordinary http or https web link. Links with sign-in details are not accepted.");
  return renderDoReviewPage(parsed.data, Buffer.from(randomUUID()).toString("base64"), ASK_REVIEW_COPY);
}
