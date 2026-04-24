// ═══════════════════════════════════════════════════════════════
// evidence-sweep — daily readiness recalculation for AKO + WAIHANGA
// Runs every morning via pg_cron. Recomputes green/amber/red counts
// from evidence_packs, governance_gates, and architecture records,
// then writes one snapshot row per kete per day.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Bucket = "green" | "amber" | "red";

interface SweepResult {
  kete: string;
  swept_for: string;
  green_count: number;
  amber_count: number;
  red_count: number;
  total_packs: number;
  pending_gates: number;
  approved_gates: number;
  high_risk_records: number;
  readiness_score: number;
  details: Record<string, unknown>;
}

function bucketForPack(ageDays: number, signed: boolean): Bucket {
  if (!signed) return "red";
  if (ageDays > 30) return "amber";
  return "green";
}

function bucketForGate(status: string): Bucket {
  if (status === "approved" || status === "approved_with_conditions") return "green";
  if (status === "pending") return "amber";
  return "red";
}

async function sweepKete(
  admin: ReturnType<typeof createClient>,
  kete: string,
  todayISO: string,
): Promise<SweepResult> {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86_400_000).toISOString();

  const [packsRes, gatesRes, archRes] = await Promise.all([
    admin
      .from("evidence_packs")
      .select("id, signed_by, created_at")
      .eq("kete", kete)
      .gte("created_at", ninetyDaysAgo),
    admin
      .from("governance_gates")
      .select("id, status")
      .eq("kete", kete)
      .gte("created_at", ninetyDaysAgo),
    kete === "WAIHANGA"
      ? admin
          .from("architecture_workflow_records")
          .select("id, risk_rating")
          .gte("created_at", ninetyDaysAgo)
      : Promise.resolve({ data: [] as Array<{ id: string; risk_rating: string | null }>, error: null }),
  ]);

  if (packsRes.error) throw packsRes.error;
  if (gatesRes.error) throw gatesRes.error;
  if (archRes.error) throw archRes.error;

  const packs = packsRes.data ?? [];
  const gates = gatesRes.data ?? [];
  const archRecords = (archRes.data ?? []) as Array<{ id: string; risk_rating: string | null }>;

  const now = Date.now();
  const counts: Record<Bucket, number> = { green: 0, amber: 0, red: 0 };

  for (const p of packs as Array<{ signed_by: string | null; created_at: string | null }>) {
    const created = p.created_at ? new Date(p.created_at).getTime() : now;
    const ageDays = Math.floor((now - created) / 86_400_000);
    counts[bucketForPack(ageDays, !!p.signed_by)] += 1;
  }
  for (const g of gates as Array<{ status: string }>) {
    counts[bucketForGate(g.status)] += 1;
  }

  const pendingGates = (gates as Array<{ status: string }>).filter((g) => g.status === "pending").length;
  const approvedGates = (gates as Array<{ status: string }>).filter(
    (g) => g.status === "approved" || g.status === "approved_with_conditions",
  ).length;
  const highRiskRecords = archRecords.filter((r) => {
    const rr = (r.risk_rating ?? "").toLowerCase();
    return rr === "high" || rr === "critical";
  }).length;

  const total = counts.green + counts.amber + counts.red;
  const readiness = total === 0 ? 0 : Math.round((counts.green / total) * 1000) / 10;

  return {
    kete,
    swept_for: todayISO,
    green_count: counts.green,
    amber_count: counts.amber,
    red_count: counts.red,
    total_packs: packs.length,
    pending_gates: pendingGates,
    approved_gates: approvedGates,
    high_risk_records: highRiskRecords,
    readiness_score: readiness,
    details: {
      window_days: 90,
      pack_count: packs.length,
      gate_count: gates.length,
      arch_record_count: archRecords.length,
      computed_at: new Date().toISOString(),
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }
    const admin = createClient(supabaseUrl, serviceKey);

    const today = new Date().toISOString().slice(0, 10);
    const ketes = ["AKO", "WAIHANGA"];

    const results: SweepResult[] = [];
    for (const kete of ketes) {
      const result = await sweepKete(admin, kete, today);
      results.push(result);
    }

    const { error: upsertError } = await admin
      .from("evidence_sweep_snapshots")
      .upsert(results, { onConflict: "kete,swept_for" });
    if (upsertError) throw upsertError;

    return new Response(
      JSON.stringify({ ok: true, swept_for: today, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("evidence-sweep error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
