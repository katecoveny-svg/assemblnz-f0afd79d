// escalation-policy-check
// ---------------------------------------------------------------------------
// Mana Trust Layer · Tā in-flight stage · hybrid-services escalation primitive.
//
// Called by the chat pipeline (and any agent that writes outbound) between
// model response and final delivery to the client. Reads active
// escalation_policies for the tenant, evaluates the request payload against
// each policy's trigger, and:
//
//   • If a match fires, writes an escalation_events row (idempotent on
//     trigger_hash) chained into the SIGNAL hash-chain audit log, and
//     returns a `block: true` response — the caller pauses automated
//     delivery and surfaces the event to the named human role.
//
//   • If no policy fires, returns `block: false` and the caller continues.
//
// Spec: voyage-hybrid-services.md §6.
// Schema: supabase/migrations/20260511150000_escalation_policies.sql
//
// This function intentionally has no AI / model dependency — escalation is a
// deterministic rules engine. The patterns it evaluates are configured per
// tenant via the admin dashboard (escalation_policies table).

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EscalationPolicy {
  id: string;
  tenant_id: string;
  name: string;
  trigger: Record<string, unknown>;
  severity: number;
  route_to_role: string;
  sla_seconds: number;
  block_automation: boolean;
  notify_channels: string[];
  is_active: boolean;
}

interface CheckRequest {
  tenantId: string;
  clientId: string;
  // The thing we're inspecting — usually the AI draft about to be delivered,
  // or an inbound message from the client, or a structured event (expense,
  // missed handover, mood score).
  content: {
    text?: string;
    metadata?: Record<string, unknown>;
    sourceMessageId?: string;
  };
  // Caller's role label, used only for audit.
  callerRole?: string;
}

interface MatchResult {
  policy: EscalationPolicy;
  matchedSignal: Record<string, unknown>;
  triggerHash: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Trigger evaluators — one per `kind`
// ─────────────────────────────────────────────────────────────────────────────

function evalKeyword(
  trigger: Record<string, unknown>,
  text: string,
): { matched: boolean; hit?: string } {
  const patterns = (trigger.patterns as string[] | undefined) ?? [];
  const ci = trigger.case_insensitive !== false;
  const hay = ci ? text.toLowerCase() : text;
  for (const p of patterns) {
    const needle = ci ? p.toLowerCase() : p;
    if (hay.includes(needle)) return { matched: true, hit: p };
  }
  return { matched: false };
}

function evalRegex(
  trigger: Record<string, unknown>,
  text: string,
): { matched: boolean; hit?: string } {
  const pattern = trigger.pattern as string;
  const flags = (trigger.flags as string | undefined) ?? "";
  if (!pattern) return { matched: false };
  try {
    const re = new RegExp(pattern, flags);
    const m = text.match(re);
    if (m) return { matched: true, hit: m[0] };
  } catch (_) {
    // Bad regex — treat as no match; log via prev/this hash in audit.
  }
  return { matched: false };
}

function evalAmount(
  trigger: Record<string, unknown>,
  metadata: Record<string, unknown>,
): { matched: boolean; value?: number } {
  const field = trigger.field as string;
  const gte = trigger.gte as number | undefined;
  const lte = trigger.lte as number | undefined;
  if (!field) return { matched: false };
  const value = pickField(metadata, field);
  if (typeof value !== "number") return { matched: false };
  if (gte !== undefined && value < gte) return { matched: false };
  if (lte !== undefined && value > lte) return { matched: false };
  return { matched: true, value };
}

function evalDrift(
  trigger: Record<string, unknown>,
  metadata: Record<string, unknown>,
): { matched: boolean; value?: number } {
  // Same shape as amount but semantically a running metric (missed_handovers,
  // unpaid_days, missed_check_ins) supplied by the caller.
  return evalAmount(trigger, metadata);
}

function pickField(obj: Record<string, unknown>, dotted: string): unknown {
  return dotted.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

// ─────────────────────────────────────────────────────────────────────────────
// Trigger hash — idempotency key
// ─────────────────────────────────────────────────────────────────────────────

async function triggerHash(parts: string[]): Promise<string> {
  const data = new TextEncoder().encode(parts.join("|"));
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function windowBucket(date: Date, kind: string): string {
  // Deduplicate by hour for high-frequency signals, by day for drift / amount.
  if (kind === "keyword" || kind === "regex" || kind === "tone") {
    return date.toISOString().slice(0, 13); // YYYY-MM-DDTHH
  }
  return date.toISOString().slice(0, 10);   // YYYY-MM-DD
}

// ─────────────────────────────────────────────────────────────────────────────
// Hash-chain stamp (mirrors signal-security.logWithHashChain shape)
// ─────────────────────────────────────────────────────────────────────────────

async function chainHash(prev: string, payload: string): Promise<string> {
  return triggerHash([prev, payload]);
}

async function previousHash(
  supa: ReturnType<typeof createClient>,
  tenantId: string,
): Promise<string> {
  const { data } = await supa
    .from("escalation_events")
    .select("this_hash")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.this_hash as string | undefined) ?? "GENESIS";
}

// ─────────────────────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as CheckRequest;
    const { tenantId, clientId, content } = body;

    if (!tenantId || !clientId || !content) {
      return json(
        { error: "tenantId, clientId, and content are required" },
        400,
      );
    }

    const supaUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supa = createClient(supaUrl, serviceKey);

    // Pull active policies for this tenant. Small tenants will have <20 rows,
    // so we do this cheaply and rely on Postgres caching.
    const { data: policies, error } = await supa
      .from("escalation_policies")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .returns<EscalationPolicy[]>();

    if (error) {
      return json({ error: error.message }, 500);
    }

    if (!policies || policies.length === 0) {
      return json({ block: false, fired: [] });
    }

    const text = content.text ?? "";
    const metadata = content.metadata ?? {};
    const fired: MatchResult[] = [];

    for (const policy of policies) {
      const kind = (policy.trigger.kind as string) ?? "keyword";
      let matched: { matched: boolean; hit?: string; value?: number } = {
        matched: false,
      };

      switch (kind) {
        case "keyword":
          matched = evalKeyword(policy.trigger, text);
          break;
        case "regex":
          matched = evalRegex(policy.trigger, text);
          break;
        case "amount":
          matched = evalAmount(policy.trigger, metadata);
          break;
        case "drift":
          matched = evalDrift(policy.trigger, metadata);
          break;
        case "tone":
          // Tone scoring is not implemented here — it requires a model call.
          // Callers pre-score and pass score in metadata.tone_score; we then
          // gate on score_gte.
          {
            const scoreGte = (policy.trigger.score_gte as number) ?? 0.9;
            const score = (metadata.tone_score as number | undefined) ?? 0;
            const label = metadata.tone_label as string | undefined;
            const wantLabel = policy.trigger.label as string | undefined;
            if (
              score >= scoreGte &&
              (!wantLabel || wantLabel === label)
            ) {
              matched = { matched: true, value: score };
            }
          }
          break;
        default:
          matched = { matched: false };
      }

      if (!matched.matched) continue;

      const bucket = windowBucket(new Date(), kind);
      const tHash = await triggerHash([
        policy.id,
        clientId,
        bucket,
        JSON.stringify(matched),
      ]);

      fired.push({
        policy,
        matchedSignal: {
          kind,
          ...matched,
          bucket,
        },
        triggerHash: tHash,
      });
    }

    if (fired.length === 0) {
      return json({ block: false, fired: [] });
    }

    // Write events, hash-chained. We chain in series so each event's
    // prev_hash references the previous row's this_hash.
    let prev = await previousHash(supa, tenantId);
    const writtenIds: string[] = [];
    let blockAutomation = false;

    for (const m of fired) {
      const payload = JSON.stringify({
        policy_id: m.policy.id,
        client_id: clientId,
        severity: m.policy.severity,
        matched_signal: m.matchedSignal,
      });
      const thisHash = await chainHash(prev, payload);

      const { data: inserted, error: insertErr } = await supa
        .from("escalation_events")
        .upsert(
          {
            tenant_id: tenantId,
            policy_id: m.policy.id,
            client_id: clientId,
            severity: m.policy.severity,
            matched_signal: m.matchedSignal,
            source_message_id: content.sourceMessageId ?? null,
            trigger_hash: m.triggerHash,
            status: "pending",
            blocked_at: m.policy.block_automation ? new Date().toISOString() : null,
            prev_hash: prev,
            this_hash: thisHash,
          },
          { onConflict: "policy_id,trigger_hash" },
        )
        .select("id")
        .maybeSingle();

      if (insertErr) {
        // Don't bail the whole batch — log via the audit chain on next call.
        continue;
      }

      if (inserted?.id) writtenIds.push(inserted.id);
      prev = thisHash;
      if (m.policy.block_automation) blockAutomation = true;
    }

    return json({
      block: blockAutomation,
      fired: fired.map((m) => ({
        policyId: m.policy.id,
        policyName: m.policy.name,
        severity: m.policy.severity,
        routeToRole: m.policy.route_to_role,
        slaSeconds: m.policy.sla_seconds,
        notifyChannels: m.policy.notify_channels,
        triggerHash: m.triggerHash,
        signal: m.matchedSignal,
      })),
      eventIds: writtenIds,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return json({ error: msg }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
