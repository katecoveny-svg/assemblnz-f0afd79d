// ═══════════════════════════════════════════════════════════════
// AAAIP — audit export edge function
// Receives an audit-log payload from the AAAIP demo dashboard,
// validates the shape, and persists it into aaaip_audit_exports.
// Designed to be the seam where AAAIP researchers, Lovable
// connectors (Slack / S3) and downstream analysis pipelines tap in.
// ═══════════════════════════════════════════════════════════════

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface IncomingAggregate {
  total?: number;
  allowed?: number;
  needsHuman?: number;
  blocked?: number;
  applied?: number;
  policyHits?: Record<string, number>;
  complianceRate?: number;
  humanApprovalRate?: number;
}

interface IncomingPayload {
  domain?: string;
  pilotLabel?: string;
  exportedAt?: string;
  entries?: unknown[];
  aggregates?: IncomingAggregate;
}

const ALLOWED_DOMAINS = new Set(["clinic", "robot", "science", "community"]);
const MAX_ENTRIES = 1000;
const MAX_BODY_BYTES = 1_000_000; // 1 MB

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  try {
    // Hard cap on body size to prevent runaway payloads.
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
      return json({ error: "payload_too_large" }, 413);
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ error: "payload_too_large" }, 413);
    }

    let payload: IncomingPayload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return json({ error: "invalid_json" }, 400);
    }

    const domain = payload.domain;
    if (!domain || !ALLOWED_DOMAINS.has(domain)) {
      return json({ error: "invalid_domain", allowed: [...ALLOWED_DOMAINS] }, 400);
    }

    const exportedAt = payload.exportedAt ?? new Date().toISOString();
    if (Number.isNaN(Date.parse(exportedAt))) {
      return json({ error: "invalid_exportedAt" }, 400);
    }

    const entries = Array.isArray(payload.entries) ? payload.entries : [];
    if (entries.length > MAX_ENTRIES) {
      return json({ error: "too_many_entries", max: MAX_ENTRIES }, 413);
    }

    const agg = payload.aggregates ?? {};
    const row = {
      domain,
      pilot_label: payload.pilotLabel ?? null,
      exported_at: exportedAt,
      entry_count: entries.length,
      total_decisions: numOr0(agg.total),
      allowed: numOr0(agg.allowed),
      needs_human: numOr0(agg.needsHuman),
      blocked: numOr0(agg.blocked),
      applied: numOr0(agg.applied),
      compliance_rate: clamp01(agg.complianceRate),
      human_approval_rate: clamp01(agg.humanApprovalRate),
      policy_hits: agg.policyHits ?? {},
      entries,
      user_agent: req.headers.get("user-agent"),
      source_ip:
        req.headers.get("x-forwarded-for") ??
        req.headers.get("cf-connecting-ip") ??
        null,
    };

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("aaaip-audit-export: missing SUPABASE_URL or SERVICE_ROLE_KEY");
      return json({ error: "server_misconfigured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from("aaaip_audit_exports")
      .insert(row)
      .select("id, created_at")
      .single();

    if (error) {
      console.error("aaaip-audit-export insert error:", error);
      return json({ error: "insert_failed", detail: error.message }, 500);
    }

    return json({
      ok: true,
      id: data.id,
      created_at: data.created_at,
      stored_entries: entries.length,
      domain,
    });
  } catch (err) {
    console.error("aaaip-audit-export unexpected error:", err);
    return json({ error: "unexpected", detail: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function numOr0(n: unknown): number {
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

function clamp01(n: unknown): number | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return Math.max(0, Math.min(1, n));
}
