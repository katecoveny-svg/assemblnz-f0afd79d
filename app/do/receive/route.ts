import { randomUUID } from "node:crypto";
import { DO_SHARE_INTAKE_KEY, doShareIntakeSchema } from "@/apps/do/shared/share-intake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const LIMIT = 48_000;
const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" };
const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

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
  const item = parsed.data;
  const nonce = Buffer.from(randomUUID()).toString("base64");
  const serialised = JSON.stringify(item).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  const html = `<!doctype html><html lang="en-NZ"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Review your share · DO</title><style nonce="${nonce}">*{box-sizing:border-box}body{margin:0;background:#FFFDFB;color:#240B21;font:16px/1.6 system-ui,sans-serif}main{max-width:700px;margin:4vh auto;padding:26px}h1{font-size:clamp(36px,8vw,56px);letter-spacing:-.06em;line-height:1.03;font-weight:500}small{font-size:11px;letter-spacing:.08em}textarea{display:block;width:100%;height:240px;font:16px/1.6 inherit;background:#F5F1F2;border:1px solid #916A7070;border-radius:16px;padding:18px;color:inherit;resize:vertical}button,a{display:inline-block;min-height:48px;padding:12px 20px;border-radius:26px;font:inherit;margin:12px 8px 0 0}button{border:0;background:#240B21;color:#FFFDFB;cursor:pointer}a{color:#240B21}button:focus-visible,a:focus-visible,textarea:focus-visible{outline:3px solid #916A70;outline-offset:3px}p{color:#654A4E}#status{min-height:28px}label{display:block;margin-bottom:9px}</style></head><body><main><small>DO BY ASSEMBL / SHARED FOR REVIEW</small><h1>Let’s take a look.</h1><p>This text has reached DO. Review it before taking it into your workspace. Nothing has been saved to your account, sent to a drafting provider or opened from a link. Link query details and fragments are removed to protect private access details.</p><label for="source">${escape(item.title || "Your shared text")}</label><textarea id="source" readonly>${escape([item.text, item.url ? `Shared link (not opened or checked): ${item.url}` : ""].filter(Boolean).join("\n\n"))}</textarea><p>Continue keeps this share in this browser tab while you open Personal DO. The handoff expires after 30 minutes and is removed when you make a checklist from it. Sign in if asked, and review before preparing work.</p><button id="continue" type="button">Review in Personal DO</button><button id="discard" type="button">Discard share</button><p id="status" role="status"></p><noscript><p>JavaScript is off. Copy the text above, then <a href="/do/personal">open Personal DO</a>.</p></noscript></main><script nonce="${nonce}">const item=${serialised};document.getElementById('continue').addEventListener('click',()=>{try{sessionStorage.setItem(${JSON.stringify(DO_SHARE_INTAKE_KEY)},JSON.stringify(item));location.replace('/do/personal')}catch{document.getElementById('status').textContent='This browser cannot carry the share across. Copy the text above, then open Personal DO and paste it.'}});document.getElementById('discard').addEventListener('click',()=>{try{sessionStorage.removeItem(${JSON.stringify(DO_SHARE_INTAKE_KEY)})}catch{}location.replace('/do/personal')});</script></body></html>`;
  return new Response(html, { headers: { ...headers, "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'` } });
}
