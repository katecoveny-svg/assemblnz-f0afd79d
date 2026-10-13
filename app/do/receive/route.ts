import { randomUUID } from "node:crypto";
import { doShareIntakeSchema } from "@/apps/do/shared/share-intake";
import { DO_REVIEW_HEADERS, SHARE_REVIEW_COPY, renderDoReviewPage } from "@/apps/do/shared/share-review";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const LIMIT = 48_000;
const headers = DO_REVIEW_HEADERS;

export function GET(request: Request) {
  return new Response(null, { status: 303, headers: { ...headers, Location: new URL("/do/personal", request.url).toString() } });
}

/**
 * Share-target content is untrusted intake, never an authenticated command.
 * This endpoint performs no account writes, provider calls or URL retrieval.
 */
export async function POST(request: Request) {
  const invalid = (message: string, status = 400) => new Response(message, { status, headers: { ...headers, "Content-Type": "text/plain; charset=utf-8" } });
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/x-www-form-urlencoded") return invalid("Share text or a web link. For photos, open Personal DO and choose Show.", 415);
  if (Number(request.headers.get("content-length") || 0) > LIMIT) return invalid("This share is too long. Open DO and paste a shorter excerpt.", 413);
  const reader = request.body?.getReader();
  if (!reader) return invalid("No shared text was received.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > LIMIT) { await reader.cancel(); return invalid("This share is too long. Open DO and paste a shorter excerpt.", 413); }
      chunks.push(value);
    }
  } catch { return invalid("The share could not be read. Please try again."); }
  finally { reader.releaseLock(); }
  const form = new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
  if ([...form.keys()].some(key => !["title", "text", "url"].includes(key)) || ["title", "text", "url"].some(key => form.getAll(key).length > 1)) return invalid("Use a single title, text and web link.");
  const parsed = doShareIntakeSchema.safeParse({ id: randomUUID(), title: (form.get("title") || "").trim(), text: (form.get("text") || "").trim(), url: (form.get("url") || "").trim(), receivedAt: Date.now() });
  if (!parsed.success) return invalid("Share up to 10,000 characters of text and one ordinary http or https web link. Links with sign-in details are not accepted.");
  return renderDoReviewPage(parsed.data, Buffer.from(randomUUID()).toString("base64"), SHARE_REVIEW_COPY);
}
