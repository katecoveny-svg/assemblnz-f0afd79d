// ============================================================
// META BUSINESS — OAuth layer for assembl
//
// One function, four routes:
//   GET  /meta-business/start     -> begin OAuth (returns auth_url)
//   GET  /meta-business/callback  -> Meta redirects here  <-- REGISTER THIS URI
//   GET  /meta-business/status    -> non-secret connection health
//   POST /meta-business/deletion  -> Meta data-deletion callback
//
// Security posture (deliberate departures from the older
// google-calendar flow, which this supersedes):
//   * state = base64url(nonce).HMAC-SHA256(nonce, META_STATE_SECRET)
//     Verified by constant-time compare, then single-use burned.
//   * No user id in state. The nonce maps to the user server-side.
//   * Tokens are written to meta_credentials (service-role only).
//     meta_connections carries non-secret metadata for the UI.
//   * Redirects are restricted to an allow-list of origins.
//     No postMessage(..., '*').
//
// Required secrets:
//   META_APP_ID, META_APP_SECRET, META_STATE_SECRET,
//   APP_URL, (optional) META_ALLOWED_ORIGINS  comma-separated
// ============================================================

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const GRAPH = "https://graph.facebook.com/v21.0";
const OAUTH_DIALOG = "https://www.facebook.com/v21.0/dialog/oauth";

// Least-privilege default. ads_management / instagram_content_publish /
// pages_manage_posts / leads_retrieval are added only when the
// corresponding product feature is switched on.
const DEFAULT_SCOPES = [
  "public_profile",
  "business_management",
  "ads_read",
  "pages_show_list",
  "pages_read_engagement",
  "instagram_basic",
];

const ALLOWED_EXTRA_SCOPES = new Set([
  "instagram_manage_insights",
  "instagram_content_publish",
  "pages_manage_posts",
  "ads_management",
  "leads_retrieval",
]);

interface MetaConnectionSummary {
  business_name: string | null;
  page_name: string | null;
  instagram_username: string | null;
  ad_account_name: string | null;
  scopes: string[] | null;
  status: string;
  capability: Record<string, boolean> | null;
  token_expires_at: string | null;
  last_verified_at: string | null;
  last_error: string | null;
}

function corsHeaders(origin: string | null) {
  const allowed = allowedOrigins();
  const ok = origin && allowed.includes(origin) ? origin : allowed[0] ?? "";
  return {
    "Access-Control-Allow-Origin": ok,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };
}

function allowedOrigins(): string[] {
  const raw = Deno.env.get("META_ALLOWED_ORIGINS") ?? "";
  const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
  const appUrl = Deno.env.get("APP_URL");
  if (appUrl && !list.includes(appUrl)) list.unshift(appUrl);
  return list;
}

function json(body: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

// ---------- state signing ----------

function b64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(nonce: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(nonce),
  );
  return b64url(new Uint8Array(sig));
}

// Constant-time string compare — avoids leaking the signature by timing.
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

function safeRedirect(path: string | null): string {
  const appUrl = Deno.env.get("APP_URL") ?? "https://assembl.co.nz";
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return `${appUrl}/agency/connections`;
  }
  return `${appUrl}${path}`;
}

function callbackUri(): string {
  return `${Deno.env.get("SUPABASE_URL")}/functions/v1/meta-business/callback`;
}

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}

// ---------- routes ----------

async function handleStart(req: Request, origin: string | null) {
  const supabase = admin();

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Not authenticated" }, 401, origin);

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );
  if (authError || !user) return json({ error: "Invalid token" }, 401, origin);

  const appId = Deno.env.get("META_APP_ID");
  const stateSecret = Deno.env.get("META_STATE_SECRET");
  if (!appId || !stateSecret) {
    return json({ error: "Meta app not configured" }, 503, origin);
  }

  const url = new URL(req.url);
  const extra = (url.searchParams.get("scopes") ?? "")
    .split(",").map((s) => s.trim()).filter((s) => ALLOWED_EXTRA_SCOPES.has(s));
  const scopes = [...new Set([...DEFAULT_SCOPES, ...extra])];

  const nonce = newNonce();
  const sig = await hmac(nonce, stateSecret);
  const state = `${nonce}.${sig}`;

  const { error: insErr } = await supabase.from("meta_oauth_states").insert({
    nonce,
    user_id: user.id,
    organisation_id: url.searchParams.get("organisation_id"),
    redirect_after: url.searchParams.get("redirect_after"),
    requested_scopes: scopes,
  });
  if (insErr) {
    console.error("state insert failed:", insErr.message);
    return json({ error: "Could not start connection" }, 500, origin);
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: callbackUri(),
    state,
    scope: scopes.join(","),
    response_type: "code",
  });

  return json(
    { auth_url: `${OAUTH_DIALOG}?${params}`, scopes, redirect_uri: callbackUri() },
    200,
    origin,
  );
}

async function handleCallback(req: Request) {
  const supabase = admin();
  const url = new URL(req.url);

  const denied = url.searchParams.get("error");
  if (denied) {
    return Response.redirect(
      `${safeRedirect(null)}?meta_error=${encodeURIComponent(denied)}`,
      302,
    );
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return new Response("Missing code or state", { status: 400 });

  const stateSecret = Deno.env.get("META_STATE_SECRET");
  const appId = Deno.env.get("META_APP_ID");
  const appSecret = Deno.env.get("META_APP_SECRET");
  if (!stateSecret || !appId || !appSecret) {
    return new Response("Meta app not configured", { status: 503 });
  }

  // 1. verify signature before touching the database
  const [nonce, sig] = state.split(".");
  if (!nonce || !sig) return new Response("Malformed state", { status: 400 });
  const expected = await hmac(nonce, stateSecret);
  if (!timingSafeEqual(sig, expected)) {
    return new Response("Bad state signature", { status: 400 });
  }

  // 2. burn the nonce (single use, unexpired)
  const { data: stateRow, error: stateErr } = await supabase
    .from("meta_oauth_states")
    .update({ used_at: new Date().toISOString() })
    .eq("nonce", nonce)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .select()
    .maybeSingle();

  if (stateErr || !stateRow) {
    return new Response("Invalid or expired state", { status: 400 });
  }

  // 3. short-lived token
  const tokenRes = await fetch(
    `${GRAPH}/oauth/access_token?` + new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: callbackUri(),
      code,
    }),
  );
  if (!tokenRes.ok) {
    console.error("token exchange failed:", await tokenRes.text());
    return Response.redirect(
      `${safeRedirect(stateRow.redirect_after)}?meta_error=token_exchange_failed`,
      302,
    );
  }
  const shortToken = await tokenRes.json();

  // 4. upgrade to a long-lived token (~60 days)
  let accessToken: string = shortToken.access_token;
  let expiresIn: number = shortToken.expires_in ?? 3600;
  const llRes = await fetch(
    `${GRAPH}/oauth/access_token?` + new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: accessToken,
    }),
  );
  if (llRes.ok) {
    const ll = await llRes.json();
    if (ll.access_token) {
      accessToken = ll.access_token;
      expiresIn = ll.expires_in ?? expiresIn;
    }
  }

  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  // 5. read back granted scopes — never assume we got what we asked for
  let grantedScopes: string[] = [];
  try {
    const permRes = await fetch(`${GRAPH}/me/permissions?access_token=${accessToken}`);
    const perms = await permRes.json();
    grantedScopes = (perms.data ?? [])
      .filter((p: { status: string }) => p.status === "granted")
      .map((p: { permission: string }) => p.permission);
  } catch (e) {
    console.error("permission read failed:", e);
  }

  const capability = {
    pursuit_read: grantedScopes.includes("ads_read"),
    studio_organic_publish:
      grantedScopes.includes("instagram_content_publish") ||
      grantedScopes.includes("pages_manage_posts"),
    // Stays false until Kate explicitly turns paid activation on.
    paid_activation: false,
  };

  // 6. connection row (no secrets), then credentials (service-role only)
  const { data: conn, error: connErr } = await supabase
    .from("meta_connections")
    .upsert({
      user_id: stateRow.user_id,
      organisation_id: stateRow.organisation_id,
      scopes: grantedScopes,
      status: "connected",
      capability,
      token_expires_at: expiresAt,
      last_verified_at: new Date().toISOString(),
      last_error: null,
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (connErr || !conn) {
    console.error("connection upsert failed:", connErr?.message);
    return Response.redirect(
      `${safeRedirect(stateRow.redirect_after)}?meta_error=save_failed`,
      302,
    );
  }

  const { error: credErr } = await supabase.from("meta_credentials").upsert({
    connection_id: conn.id,
    access_token: accessToken,
    token_type: "bearer",
    expires_at: expiresAt,
    rotated_at: new Date().toISOString(),
  }, { onConflict: "connection_id" });

  if (credErr) {
    console.error("credential write failed:", credErr.message);
    return Response.redirect(
      `${safeRedirect(stateRow.redirect_after)}?meta_error=save_failed`,
      302,
    );
  }

  // Asset selection (business / page / instagram / ad account) happens
  // next, in the app UI — deliberately not auto-picked here.
  return Response.redirect(
    `${safeRedirect(stateRow.redirect_after)}?meta_connected=1`,
    302,
  );
}

async function handleStatus(req: Request, origin: string | null) {
  const supabase = admin();
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Not authenticated" }, 401, origin);

  const { data: { user }, error } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );
  if (error || !user) return json({ error: "Invalid token" }, 401, origin);

  const { data: conn } = await supabase
    .from("meta_connections")
    .select(
      "business_name, page_name, instagram_username, ad_account_name, " +
      "scopes, status, capability, token_expires_at, last_verified_at, last_error",
    )
    .eq("user_id", user.id)
    .maybeSingle<MetaConnectionSummary>();

  if (!conn) return json({ connected: false }, 200, origin);

  const expiring = conn.token_expires_at
    ? new Date(conn.token_expires_at).getTime() - Date.now() < 7 * 864e5
    : false;

  return json({ connected: conn.status === "connected", expiring, ...conn }, 200, origin);
}

// Meta calls this when a user removes the app. Required by Platform Terms.
async function handleDeletion(req: Request, origin: string | null) {
  const supabase = admin();
  const appSecret = Deno.env.get("META_APP_SECRET");
  if (!appSecret) return json({ error: "not configured" }, 503, origin);

  const form = await req.formData().catch(() => null);
  const signed = form?.get("signed_request")?.toString();
  if (!signed) return json({ error: "missing signed_request" }, 400, origin);

  const [encSig, payload] = signed.split(".");
  if (!encSig || !payload) return json({ error: "malformed" }, 400, origin);

  const expected = await hmac(payload, appSecret);
  if (!timingSafeEqual(encSig, expected)) {
    return json({ error: "bad signature" }, 401, origin);
  }

  const decoded = JSON.parse(
    atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
  );
  const metaUserId = decoded.user_id as string;

  const confirmationCode = newNonce().slice(0, 24);
  await supabase.from("meta_deletion_requests").insert({
    confirmation_code: confirmationCode,
    meta_user_id: metaUserId,
    status: "received",
  });

  const appUrl = Deno.env.get("APP_URL") ?? "https://assembl.co.nz";
  return json({
    url: `${appUrl}/legal/meta-data-deletion?code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  }, 200, origin);
}

serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  const path = new URL(req.url).pathname.replace(/\/+$/, "").split("/").pop();

  try {
    switch (path) {
      case "start":    return await handleStart(req, origin);
      case "callback": return await handleCallback(req);
      case "status":   return await handleStatus(req, origin);
      case "deletion": return await handleDeletion(req, origin);
      default:
        return json({
          error: "Unknown route",
          routes: ["start", "callback", "status", "deletion"],
          callback_uri: callbackUri(),
        }, 404, origin);
    }
  } catch (e) {
    console.error("meta-business error:", e);
    return json({ error: "Internal error" }, 500, origin);
  }
});
