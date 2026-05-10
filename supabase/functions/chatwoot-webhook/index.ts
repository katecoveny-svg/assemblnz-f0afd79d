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
 * Plugin dispatch (canon §6.2):
 *   - Loads Tōro's assembled definition from `agent_prompts` cache via
 *     `_shared/load-cached-plugin.ts`.
 *   - Prepends TORO_HARD_RULES (canon §10) and calls `_shared/llm-call.ts`
 *     with the resolved model (anthropic/claude-haiku-4-5-20251001 by
 *     default per agent.yaml).
 *   - On any failure (cache miss, LLM error, missing key) falls back to a
 *     warm canned reply so the pilot doesn't 500 — but logs the fallback
 *     so we can see degraded behaviour in console output.
 *
 * Deploy notes (do NOT auto-deploy from this PR):
 *   supabase functions deploy chatwoot-webhook --no-verify-jwt
 *
 * Env (set in Supabase project settings → Edge Functions → secrets):
 *   SUPABASE_URL                  (auto-injected)
 *   SUPABASE_SERVICE_ROLE_KEY     (auto-injected)
 *   CHATWOOT_HMAC_TOKEN           (per-inbox hmac_token; pilot value lives
 *                                  in Supabase Vault — never commit)
 *   ANTHROPIC_API_KEY             (project-wide; used by _shared/llm-call.ts)
 *
 * Webhook URL pattern (after deploy):
 *   https://<project-ref>.functions.supabase.co/chatwoot-webhook
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { callLlm, type ChatMessage } from "../_shared/llm-call.ts";
import { loadCachedPlugin, TORO_HARD_RULES } from "../_shared/load-cached-plugin.ts";

// ---------------------------------------------------------------------------
// Hardcoded pilot constants — Hudson whānau test inbox.
// Replace with per-tenant lookup once the tenants/tenant_members migration
// applies. See spec §5 ("Tenant isolation enforced at API key").
// ---------------------------------------------------------------------------
const PILOT_CHATWOOT_ACCOUNT_ID = 164366;
const PILOT_CHATWOOT_INBOX_ID = 108583; // Tōro — Hudson Whānau Test (Channel::Api)

// Default tenant UUID for cost-logging until tenant_members lookup wires
// through. Matches the demo tenant on assembl-prod (memory m32).
const PILOT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

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

interface DraftResult {
  draft: string;
  confidence: number;
  source: "plugin" | "fallback_stub";
  model?: string;
  promptVersion?: number;
}

/**
 * Fallback stub — same warm canned reply that's been live since PR #83.
 * Used when (a) the toro plugin isn't in the agent_prompts cache yet,
 * (b) the LLM call fails, or (c) ANTHROPIC_API_KEY is missing. Logs
 * the fallback reason to console so degraded paths are visible.
 */
function fallbackStub(incomingBody: string, reason: string): DraftResult {
  console.warn(`[chatwoot-webhook] using fallback stub: ${reason}`);
  const trimmed = incomingBody.trim().slice(0, 280);
  const draft =
    `Kia ora — Tōro got your message: "${trimmed}". ` +
    `A whānau member will review and reply soon. Ngā mihi.`;
  return { draft, confidence: 0.5, source: "fallback_stub" };
}

/**
 * Plugin-driven draft generator. Reads Tōro's cached system prompt from
 * agent_prompts, prepends TORO_HARD_RULES, and asks the model for a warm
 * draft reply staged for the parent's review.
 */
async function generateDraftBody(
  sb: ReturnType<typeof createClient>,
  incomingBody: string,
  contact: { name?: string; identifier?: string },
  conversationId: number,
  requestId: string,
): Promise<DraftResult> {
  const plugin = await loadCachedPlugin(sb, "toro", "toro");
  if (!plugin) {
    return fallbackStub(incomingBody, "no toro plugin row in agent_prompts cache");
  }

  if (!Deno.env.get("ANTHROPIC_API_KEY")) {
    return fallbackStub(incomingBody, "ANTHROPIC_API_KEY env var missing");
  }

  const systemPrompt = `${TORO_HARD_RULES}\n\n${plugin.systemPrompt}`;

  const contactLabel = contact.name?.trim() || contact.identifier?.trim() || "the whānau member";
  const userPrompt =
    `Inbound Chatwoot message from ${contactLabel} (Hudson household pilot, conversation #${conversationId}):\n\n` +
    `"""\n${incomingBody.trim()}\n"""\n\n` +
    `Draft a short, warm, te-reo-correct reply for a whānau member to review and send. ` +
    `Acknowledge the message, take whatever next step the message asks for as a draft only ` +
    `(roster, reminder, packing list, suggested reply to a school, etc.) and stage it for review. ` +
    `Do NOT send anything yourself. End the draft with "— Tōro draft, ready for your review." ` +
    `If the message asks Tōro to do something it must NOT do (per the named-prohibited-actions list ` +
    `in your system prompt), refuse politely and suggest the appropriate next step the whānau ` +
    `member can take.`;

  const messages: ChatMessage[] = [
    { role: "user", content: userPrompt },
  ];

  try {
    const response = await callLlm({
      model: plugin.model,
      systemPrompt,
      messages,
      maxTokens: 600,
      meta: {
        tenantId: PILOT_TENANT_ID,
        agentCode: "toro",
        requestId,
      },
    });

    if (!response.ok) {
      return fallbackStub(
        incomingBody,
        `callLlm returned ${response.status}`,
      );
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const draft = data?.choices?.[0]?.message?.content?.trim();
    if (!draft) {
      return fallbackStub(incomingBody, "callLlm returned empty content");
    }

    return {
      draft,
      confidence: 0.85,
      source: "plugin",
      model: plugin.model,
      promptVersion: plugin.version,
    };
  } catch (err) {
    return fallbackStub(
      incomingBody,
      `callLlm threw: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
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
  const requestId = crypto.randomUUID();

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Generate the draft via plugin-driven path with stub fallback.
  const result = await generateDraftBody(
    supabase,
    incomingBody,
    {
      name: msg.sender?.name,
      identifier: msg.sender?.identifier
        ?? msg.sender?.phone_number
        ?? msg.sender?.email,
    },
    conversationId,
    requestId,
  );

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
      draft_body: result.draft,
      confidence: result.confidence,
      status: "pending_approval",
      created_by_agent: "toro",
    })
    .select("id")
    .single();

  if (error) {
    return jsonResponse({ error: "db insert failed", detail: error.message }, 500);
  }

  return jsonResponse({
    ok: true,
    draft_id: data?.id ?? null,
    source: result.source,
    model: result.model ?? null,
    prompt_version: result.promptVersion ?? null,
    request_id: requestId,
  }, 200);
});
