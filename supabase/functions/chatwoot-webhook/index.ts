/**
 * Tōro · Chatwoot inbound webhook
 * ================================
 * Receives Chatwoot webhook events for the Hudson household pilot inbox,
 * validates the HMAC signature against the per-inbox `hmac_token`, and
 * inserts a draft reply into `public.toro_drafts` with status
 * `pending_approval`. A whānau member then reviews + sends from the
 * Tōro inbox UI (`/app/toro/inbox`).
 *
 * Hard rules (Plugin Canon §1):
 *   - No auto-send. Ever. Drafts always wait for an explicit human click.
 *   - Skip outgoing/echoed messages and system events.
 *   - Tenant isolation: this function is locked to the pilot tenant for now.
 *     Multi-tenant routing lands once the tenants/tenant_members migration
 *     is applied (spec §7 step 3).
 *
 * Spec: outputs/TORO-MULTI-TENANT-CHATWOOT-ARCHITECTURE-2026-05-09.md (§5).
 *
 * Deploy notes (do NOT auto-deploy from this PR):
 *   supabase functions deploy chatwoot-webhook --no-verify-jwt
 *
 * Env (set in Supabase project settings → Edge Functions → secrets):
 *   SUPABASE_URL                  (auto-injected)
 *   SUPABASE_SERVICE_ROLE_KEY     (auto-injected)
 *   CHATWOOT_HMAC_TOKEN           (per-inbox hmac_token; pilot value lives
 *                                  in Supabase Vault — never commit)
 *
 * Webhook URL pattern (after deploy):
 *   https://<project-ref>.functions.supabase.co/chatwoot-webhook
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Hardcoded pilot constants — Hudson whānau test inbox.
// Replace with per-tenant lookup once the tenants/tenant_members migration
// applies. See spec §5 ("Tenant isolation enforced at API key").
// ---------------------------------------------------------------------------
const PILOT_CHATWOOT_ACCOUNT_ID = 164366;
const PILOT_CHATWOOT_INBOX_ID = 108583; // Tōro — Hudson Whānau Test (Channel::Api)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-chatwoot-signature, x-chatwoot-hmac-sha256",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Constant-time HMAC-SHA256 verification.
 *
 * Chatwoot signs the raw request body with the inbox `hmac_token` and
 * delivers the hex digest in `X-Chatwoot-Signature` (older deployments use
 * `X-Chatwoot-Hmac-Sha256`). We accept either.
 */
async function verifyHmac(
  rawBody: string,
  signature: string,
  hmacToken: string,
): Promise<boolean> {
  if (!signature || !hmacToken) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(hmacToken),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time compare to avoid timing oracle.
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Stub draft generator. Replaced by the real Tōro plugin call once the
 * draft pipeline lands (spec §5, "Draft is stored in our own toro_drafts
 * table"). Intentionally simple and te-reo-correct so the pilot UI has
 * something readable to review.
 */
function generateDraftBody(incomingBody: string): {
  draft: string;
  confidence: number;
} {
  const trimmed = incomingBody.trim().slice(0, 280);
  const draft =
    `Kia ora — Tōro got your message: "${trimmed}". ` +
    `A whānau member will review and reply soon. Ngā mihi.`;
  return { draft, confidence: 0.5 };
}

interface ChatwootSender {
  id?: number;
  name?: string;
  email?: string;
  identifier?: string;
  phone_number?: string;
  type?: string; // "contact" | "user" (agent)
}

interface ChatwootMessage {
  id?: number;
  content?: string;
  message_type?: number | string; // 0=incoming, 1=outgoing, 2=activity, 3=template
  private?: boolean;
  sender?: ChatwootSender;
  conversation?: { id?: number };
  account?: { id?: number };
  inbox?: { id?: number };
}

interface ChatwootWebhookPayload {
  event?: string;
  account?: { id?: number };
  inbox?: { id?: number };
  conversation?: { id?: number };
  sender?: ChatwootSender;
  message_type?: number | string;
  content?: string;
  id?: number;
  // `message_created` payloads sometimes nest the message, sometimes flatten it.
  message?: ChatwootMessage;
}

function isIncomingContactMessage(p: ChatwootWebhookPayload): boolean {
  if (p.event !== "message_created") return false;

  const msg: ChatwootMessage = p.message ?? {
    id: p.id,
    content: p.content,
    message_type: p.message_type,
    sender: p.sender,
    conversation: p.conversation,
  };

  // message_type: 0 = incoming, 1 = outgoing (our own send echoes back), 2 = activity, 3 = template
  const t = msg.message_type;
  const isIncoming = t === 0 || t === "incoming";
  if (!isIncoming) return false;

  // Skip private notes and empty bodies.
  if (msg.private) return false;
  if (!msg.content || msg.content.trim().length === 0) return false;

  // Belt and braces — confirm sender is a contact, not an agent user.
  const senderType = msg.sender?.type?.toLowerCase();
  if (senderType && senderType !== "contact") return false;

  return true;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const hmacToken = Deno.env.get("CHATWOOT_HMAC_TOKEN");

  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: "supabase env not configured" }, 500);
  }
  if (!hmacToken) {
    // Fail closed — without the HMAC token we cannot verify the signature
    // and must reject the request.
    return jsonResponse({ error: "hmac token not configured" }, 500);
  }

  // Read raw body BEFORE parsing so the HMAC matches Chatwoot's signing input.
  const rawBody = await req.text();

  const signature =
    req.headers.get("x-chatwoot-signature") ??
    req.headers.get("X-Chatwoot-Signature") ??
    req.headers.get("x-chatwoot-hmac-sha256") ??
    req.headers.get("X-Chatwoot-Hmac-Sha256") ??
    "";

  const ok = await verifyHmac(rawBody, signature, hmacToken);
  if (!ok) {
    return jsonResponse({ error: "invalid signature" }, 401);
  }

  let payload: ChatwootWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as ChatwootWebhookPayload;
  } catch {
    return jsonResponse({ error: "invalid json" }, 400);
  }

  // Tenant isolation guard: this function only handles the pilot inbox.
  const accountId = payload.account?.id ?? payload.message?.account?.id;
  const inboxId = payload.inbox?.id ?? payload.message?.inbox?.id;
  if (accountId && accountId !== PILOT_CHATWOOT_ACCOUNT_ID) {
    return jsonResponse({ skipped: "account_id mismatch" }, 200);
  }
  if (inboxId && inboxId !== PILOT_CHATWOOT_INBOX_ID) {
    return jsonResponse({ skipped: "inbox_id mismatch" }, 200);
  }

  if (!isIncomingContactMessage(payload)) {
    return jsonResponse({ skipped: "not an incoming contact message" }, 200);
  }

  const msg: ChatwootMessage = payload.message ?? {
    id: payload.id,
    content: payload.content,
    message_type: payload.message_type,
    sender: payload.sender,
    conversation: payload.conversation,
  };

  const conversationId = msg.conversation?.id ?? payload.conversation?.id;
  if (!conversationId) {
    return jsonResponse({ skipped: "missing conversation id" }, 200);
  }

  const incomingBody = (msg.content ?? "").trim();
  const { draft, confidence } = generateDraftBody(incomingBody);

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("toro_drafts")
    .insert({
      chatwoot_account_id: PILOT_CHATWOOT_ACCOUNT_ID,
      chatwoot_inbox_id: PILOT_CHATWOOT_INBOX_ID,
      chatwoot_conversation_id: conversationId,
      chatwoot_message_id: msg.id ?? null,
      contact_name: msg.sender?.name ?? null,
      contact_identifier:
        msg.sender?.identifier ?? msg.sender?.phone_number ?? msg.sender?.email ?? null,
      incoming_body: incomingBody,
      draft_body: draft,
      confidence,
      status: "pending_approval",
      created_by_agent: "toro",
    })
    .select("id")
    .single();

  if (error) {
    return jsonResponse({ error: "db insert failed", detail: error.message }, 500);
  }

  return jsonResponse({ ok: true, draft_id: data?.id ?? null }, 200);
});
