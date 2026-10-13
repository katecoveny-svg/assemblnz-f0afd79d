import type { DoShareIntake } from "./share-intake";
import { DO_SHARE_INTAKE_KEY } from "./share-intake";

export const DO_REVIEW_HEADERS = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" } as const;
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

export type DoReviewCopy = {
  /** Browser tab title. */
  title: string;
  /** Mono kicker above the heading. */
  kicker: string;
  heading: string;
  lede: string;
  /** Label for the text box when the intake carries no title. */
  defaultLabel: string;
  continueLabel: string;
  discardLabel: string;
  /** Explains what Continue does. */
  continueNote: string;
};

export const SHARE_REVIEW_COPY: DoReviewCopy = {
  title: "Review your share · DO",
  kicker: "DO BY ASSEMBL / SHARED FOR REVIEW",
  heading: "Let’s take a look.",
  lede: "This text has reached DO. Review it before taking it into your workspace. Nothing has been saved to your account, sent to a drafting provider or opened from a link. Link query details and fragments are removed to protect private access details.",
  defaultLabel: "Your shared text",
  continueLabel: "Review in Personal DO",
  discardLabel: "Discard share",
  continueNote: "Continue keeps this share in this browser tab while you open Personal DO. The handoff expires after 30 minutes and is removed when you make a checklist from it. Sign in if asked, and review before preparing work.",
};

export const ASK_REVIEW_COPY: DoReviewCopy = {
  title: "Ask DO · DO",
  kicker: "DO BY ASSEMBL / YOU ASKED",
  heading: "Here is what you asked.",
  lede: "Your words have reached DO from your phone. Check them before DO starts. Nothing has been saved to your account, sent to a drafting provider or opened from a link. Link query details and fragments are removed to protect private access details.",
  defaultLabel: "What you asked DO",
  continueLabel: "Open in Personal DO",
  discardLabel: "Discard",
  continueNote: "Open keeps your ask in this browser tab while Personal DO opens, so you can send it as the first message or make a checklist from it. The handoff expires after 30 minutes. Sign in if asked, and review before preparing work.",
};

/** Untrusted intake is rendered into a nonce-bound, script-minimal review page: it never executes, fetches or saves. */
export function renderDoReviewPage(item: DoShareIntake, nonce: string, copy: DoReviewCopy) {
  const serialised = JSON.stringify(item).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  const body = [item.text, item.url ? `Shared link (not opened or checked): ${item.url}` : ""].filter(Boolean).join("\n\n");
  const html = `<!doctype html><html lang="en-NZ"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(copy.title)}</title><style nonce="${nonce}">*{box-sizing:border-box}body{margin:0;background:#FFFDFB;color:#240B21;font:16px/1.6 system-ui,sans-serif}main{max-width:700px;margin:4vh auto;padding:26px}h1{font-size:clamp(36px,8vw,56px);letter-spacing:-.06em;line-height:1.03;font-weight:500}small{font-size:11px;letter-spacing:.08em}textarea{display:block;width:100%;height:240px;font:16px/1.6 inherit;background:#F5F1F2;border:1px solid #916A7070;border-radius:16px;padding:18px;color:inherit;resize:vertical}button,a{display:inline-block;min-height:48px;padding:12px 20px;border-radius:26px;font:inherit;margin:12px 8px 0 0}button{border:0;background:#240B21;color:#FFFDFB;cursor:pointer}a{color:#240B21}button:focus-visible,a:focus-visible,textarea:focus-visible{outline:3px solid #916A70;outline-offset:3px}p{color:#654A4E}#status{min-height:28px}label{display:block;margin-bottom:9px}</style></head><body><main><small>${escapeHtml(copy.kicker)}</small><h1>${escapeHtml(copy.heading)}</h1><p>${escapeHtml(copy.lede)}</p><label for="source">${escapeHtml(item.title || copy.defaultLabel)}</label><textarea id="source" readonly>${escapeHtml(body)}</textarea><p>${escapeHtml(copy.continueNote)}</p><button id="continue" type="button">${escapeHtml(copy.continueLabel)}</button><button id="discard" type="button">${escapeHtml(copy.discardLabel)}</button><p id="status" role="status"></p><noscript><p>JavaScript is off. Copy the text above, then <a href="/do/personal">open Personal DO</a>.</p></noscript></main><script nonce="${nonce}">const item=${serialised};document.getElementById('continue').addEventListener('click',()=>{try{sessionStorage.setItem(${JSON.stringify(DO_SHARE_INTAKE_KEY)},JSON.stringify(item));location.replace('/do/personal')}catch{document.getElementById('status').textContent='This browser cannot carry the text across. Copy it above, then open Personal DO and paste it.'}});document.getElementById('discard').addEventListener('click',()=>{try{sessionStorage.removeItem(${JSON.stringify(DO_SHARE_INTAKE_KEY)})}catch{}location.replace('/do/personal')});</script></body></html>`;
  return new Response(html, { headers: { ...DO_REVIEW_HEADERS, "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'` } });
}
