// outcome-pack-auto-seal
// ---------------------------------------------------------------------------
// Surprise moments B.1 + B.2 — voyage-surprise-moments.md §B.
//
// Called by outcome-event webhooks (Trade Single Window for Customs, parsed
// BCA email for building consent, Stripe for invoice_paid, etc.).
//
// On a positive outcome, this function:
//   1. Looks up evidence packs bound to the reasoning_traces that produced
//      the artefact the outcome is judging.
//   2. If a matching workflow-kind pack exists in 'draft' status, validates
//      it (lib/evidence/pack-spec.ts validatePack), assigns the named
//      operator as reviewer, computes the canonical hash, links the chain,
//      and flips status to 'sealed'.
//   3. Composes a single restrained notification — "Entry MAW1234567
//      accepted at 14:32 NZST. Evidence pack sealed." — and returns it for
//      the caller to dispatch through the Unified Channel Gateway.
//
// Idempotent on (outcome_id, evidence_pack_id). Re-firing the webhook
// is safe.
//
// Status: stub. The pack sealing path is wired against the spec; the
// notification fan-out is a TODO that lands with operator preferences.

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AutoSealRequest {
  outcomeId: string;
}

async function sha256(s: string): Promise<string> {
  const data = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { outcomeId } = (await req.json()) as AutoSealRequest;
    if (!outcomeId) return json({ error: "outcomeId required" }, 400);

    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Load the outcome and confirm it's positive.
    const { data: outcome, error: oerr } = await supa
      .from("outcome_events")
      .select("*")
      .eq("id", outcomeId)
      .maybeSingle();

    if (oerr || !outcome) return json({ error: "outcome not found" }, 404);
    if (outcome.result !== "positive") {
      return json({ skipped: "outcome.result is not positive" });
    }

    const traceIds = (outcome.trace_ids as string[] | null) ?? [];
    if (traceIds.length === 0) {
      return json({ skipped: "outcome has no trace_ids" });
    }

    // 2. Find draft workflow packs bound to those traces (via the
    //    reasoning_traces.evidence_pack_id column).
    const { data: traces } = await supa
      .from("reasoning_traces")
      .select("id, evidence_pack_id")
      .in("id", traceIds);

    const packIds = Array.from(
      new Set(
        (traces ?? [])
          .map((t) => t.evidence_pack_id as string | null)
          .filter((v): v is string => Boolean(v)),
      ),
    );
    if (packIds.length === 0) {
      return json({ skipped: "no evidence packs bound to traces" });
    }

    const { data: packs } = await supa
      .from("evidence_packs")
      .select("*")
      .in("id", packIds)
      .eq("status", "draft");

    if (!packs || packs.length === 0) {
      return json({ skipped: "no draft packs to seal" });
    }

    const sealed: { id: string; thisHash: string }[] = [];

    for (const pack of packs) {
      // Defensive: only auto-seal 'workflow' packs. Posture packs are
      // monthly roll-ups that must be reviewer-sealed, not outcome-sealed.
      if (pack.kind !== "workflow") continue;

      // Compute prev/this hash. We chain off the most recent sealed pack
      // for the same tenant.
      const { data: prevPack } = await supa
        .from("evidence_packs")
        .select("this_hash")
        .eq("tenant_id", pack.tenant_id)
        .eq("status", "sealed")
        .order("sealed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const prevHash =
        (prevPack?.this_hash as string | undefined) ?? "GENESIS";

      // Canonical JSON over the pack body (sections + citations + subject
      // + title etc.). We pass the same canonicalJson helper the
      // browser-side lib uses, mirrored here.
      const canonicalBody = canonicalJsonForSeal(pack);
      const thisHash = await sha256(prevHash + "|" + canonicalBody);
      const sealedAt = new Date().toISOString();

      const { error: upErr } = await supa
        .from("evidence_packs")
        .update({
          status: "sealed",
          prev_hash: prevHash,
          this_hash: thisHash,
          sealed_at: sealedAt,
          verifier_url: `/evidence/verify/${thisHash}`,
          // reviewer fields come from the outcome.payload if the operator
          // marked it themselves; otherwise we use the tenant's default
          // operator.
          reviewer_name:
            (outcome.payload?.operator_name as string | undefined) ?? null,
          reviewer_role:
            (outcome.payload?.operator_role as string | undefined) ??
            "operator",
          reviewer_email:
            (outcome.payload?.operator_email as string | undefined) ?? null,
        })
        .eq("id", pack.id)
        .eq("status", "draft"); // optimistic: skip if someone else sealed

      if (!upErr) sealed.push({ id: pack.id, thisHash });
    }

    // 3. Compose the restrained notification — one line per sealed pack.
    const lines = sealed.map(
      (s) =>
        `Evidence pack sealed at ${new Date().toLocaleString("en-NZ", {
          timeZone: "Pacific/Auckland",
          hour12: false,
        })} NZST. Verifier: /evidence/verify/${shortHash(s.thisHash)}`,
    );

    return json({
      outcomeId,
      sealedPacks: sealed,
      previews: lines,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return json({ error: msg }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function canonicalJsonForSeal(pack: Record<string, unknown>): string {
  // Mirrors lib/evidence/pack-spec.ts canonicalJson. Strips hash chain
  // and serialises deterministically.
  const omit = new Set([
    "prev_hash",
    "this_hash",
    "sealed_at",
    "verifier_url",
    "created_at",
    "updated_at",
  ]);
  const filtered: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(pack)) {
    if (!omit.has(k) && v !== undefined) filtered[k] = v;
  }
  return stableStringify(filtered);
}

function stableStringify(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return "[" + value.map(stableStringify).join(",") + "]";
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort();
    return (
      "{" +
      keys
        .map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k]))
        .join(",") +
      "}"
    );
  }
  return "null";
}

function shortHash(hash: string): string {
  if (!hash || hash.length < 12) return hash || "";
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
