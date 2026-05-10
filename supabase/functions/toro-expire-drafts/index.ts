// toro-expire-drafts — scheduled cron job that auto-expires unreviewed Tōro
// drafts.
//
// Spec: outputs/TORO-V0.1-ARCHITECTURE-SPEC-2026-05-11.md §4.4
// Hard rule §22: every state change writes a toro_draft_transitions row.
//
// Scope: finds rows in `pending_approval` older than 48 hours, transitions
// each to `expired` with reason='auto_expired_48h'. The transition is
// performed in the same pattern as the in-app state machine — UPDATE
// toro_drafts then INSERT toro_draft_transitions — so the audit chain is
// preserved.
//
// Cron schedule (NOT auto-applied — register manually via Supabase Studio
// or the pg_cron migration that documents it):
//
//     select cron.schedule(
//       'toro-expire-drafts-hourly',
//       '17 * * * *',                      -- every hour at minute 17
//       $$select net.http_post(
//           url := 'https://<project>.functions.supabase.co/toro-expire-drafts',
//           headers := jsonb_build_object(
//             'Authorization', 'Bearer ' || current_setting('app.toro_cron_secret', true)
//           )
//         ) as request_id$$
//     );
//
// Invocation: any HTTP request triggers a sweep. The function is idempotent
// — running it twice in the same minute moves zero additional rows on the
// second call.

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

interface ExpireSummary {
  found: number;
  expired: number;
  errors: Array<{ draft_id: string; message: string }>;
}

const EXPIRY_HOURS = 48;
const REASON = "auto_expired_48h";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return json({ error: "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY required" }, 500);
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    const cutoffIso = new Date(
      Date.now() - EXPIRY_HOURS * 3_600_000,
    ).toISOString();

    const { data: candidates, error: selErr } = await supabase
      .from("toro_drafts")
      .select("id, chatwoot_account_id, created_at")
      .eq("status", "pending_approval")
      .lt("created_at", cutoffIso);

    if (selErr) {
      return json({ error: `select failed: ${selErr.message}` }, 500);
    }

    const summary: ExpireSummary = {
      found: candidates?.length ?? 0,
      expired: 0,
      errors: [],
    };

    for (const row of candidates ?? []) {
      const draftId = row.id as string;

      // Resolve a tenant_id for the audit row. The pilot is single-tenant —
      // pick the first row in the toro pilot `tenants` table. Once toro_drafts
      // grows a real tenant_id column this lookup is replaced with row.tenant_id.
      const { data: pilotTenant } = await supabase
        .from("tenants")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      const tenantId = pilotTenant?.id as string | undefined;
      if (!tenantId) {
        summary.errors.push({
          draft_id: draftId,
          message: "no tenant row available to attribute expiry audit",
        });
        continue;
      }

      // Conditional UPDATE — only expire if still pending_approval. Guards
      // against a race with a human approval happening in the same minute.
      const { data: updated, error: updErr } = await supabase
        .from("toro_drafts")
        .update({ status: "expired" })
        .eq("id", draftId)
        .eq("status", "pending_approval")
        .select("id")
        .maybeSingle();

      if (updErr) {
        summary.errors.push({ draft_id: draftId, message: updErr.message });
        continue;
      }

      if (!updated) {
        // Lost the race — someone reviewed or already-expired this draft.
        // Idempotent skip, no error.
        continue;
      }

      const { error: auditErr } = await supabase
        .from("toro_draft_transitions")
        .insert({
          draft_id: draftId,
          tenant_id: tenantId,
          from_state: "pending_approval",
          to_state: "expired",
          transitioned_by: null,
          reason: REASON,
          metadata: { source: "toro-expire-drafts", expiry_hours: EXPIRY_HOURS },
        });

      if (auditErr) {
        summary.errors.push({
          draft_id: draftId,
          message: `expired but audit failed: ${auditErr.message}`,
        });
        continue;
      }

      summary.expired += 1;
    }

    return json({ ok: true, summary, cutoff: cutoffIso }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return json({ ok: false, error: message }, 500);
  }
});

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
