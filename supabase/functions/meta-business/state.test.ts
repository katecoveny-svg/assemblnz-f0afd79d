// Verification of the security-critical primitives in meta-business/index.ts.
// These are copied verbatim from the function so we test the real logic.

function b64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(nonce: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(nonce));
  return b64url(new Uint8Array(sig));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function newNonce(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return b64url(bytes);
}

function safeRedirect(path: string | null, appUrl = "https://app.example.com"): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return `${appUrl}/agency/connections`;
  }
  return `${appUrl}${path}`;
}

const SECRET = "test-state-secret-do-not-use-in-prod";
let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { console.log(`  PASS  ${name}`); pass++; }
  else      { console.log(`  FAIL  ${name}`); fail++; }
}

console.log("\n--- state signing round trip ---");
const nonce = newNonce();
const sig = await hmac(nonce, SECRET);
const state = `${nonce}.${sig}`;
const [rxNonce, rxSig] = state.split(".");
check("valid signature verifies", timingSafeEqual(rxSig, await hmac(rxNonce, SECRET)));

console.log("\n--- forgery is rejected ---");
check("tampered nonce rejected",
  !timingSafeEqual(rxSig, await hmac(newNonce(), SECRET)));
check("wrong secret rejected",
  !timingSafeEqual(rxSig, await hmac(rxNonce, "attacker-guess")));
const flipped = rxSig.slice(0, -1) + (rxSig.at(-1) === "A" ? "B" : "A");
check("single-char signature flip rejected", !timingSafeEqual(flipped, rxSig));
check("truncated signature rejected", !timingSafeEqual(rxSig.slice(0, 10), rxSig));
check("empty signature rejected", !timingSafeEqual("", rxSig));

console.log("\n--- nonce quality ---");
const seen = new Set<string>();
for (let i = 0; i < 5000; i++) seen.add(newNonce());
check("5000 nonces all unique", seen.size === 5000);
check("nonce is 43 chars (256-bit b64url)", nonce.length === 43);
check("nonce is url-safe", /^[A-Za-z0-9_-]+$/.test(nonce));

console.log("\n--- state carries no user identity ---");
check("state is only nonce.signature", state.split(".").length === 2);
check("no uuid pattern in state",
  !/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/i.test(state));

console.log("\n--- open-redirect defence ---");
const appUrl = "https://app.example.com";
check("absolute external URL blocked",
  safeRedirect("https://evil.com/steal") === `${appUrl}/agency/connections`);
check("protocol-relative //evil.com blocked",
  safeRedirect("//evil.com") === `${appUrl}/agency/connections`);
check("null falls back to default",
  safeRedirect(null) === `${appUrl}/agency/connections`);
check("bare path without slash blocked",
  safeRedirect("agency/x") === `${appUrl}/agency/connections`);
check("legit relative path allowed",
  safeRedirect("/agency/connections?x=1") === `${appUrl}/agency/connections?x=1`);

console.log("\n--- signed_request (deletion callback) verification ---");
// Meta signs base64url(payload) with the app secret.
const payloadObj = { user_id: "1234567890", algorithm: "HMAC-SHA256" };
const payloadB64 = b64url(new TextEncoder().encode(JSON.stringify(payloadObj)));
const goodSig = await hmac(payloadB64, SECRET);
check("valid signed_request accepted",
  timingSafeEqual(goodSig, await hmac(payloadB64, SECRET)));
check("forged signed_request rejected",
  !timingSafeEqual("forged-signature-value", await hmac(payloadB64, SECRET)));
const decoded = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
check("payload decodes to correct user_id", decoded.user_id === "1234567890");

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
if (fail > 0) Deno.exit(1);
