// ═══════════════════════════════════════════════════════════════
// tick — master scheduler for the Knowledge Brain.
// Runs every minute via pg_cron. Picks active sources whose
// last_checked_at + cadence_minutes is in the past, and dispatches
// each to the right adapter edge function.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADAPTER_FOR: Record<string, string> = {
  rss: "adapter-rss",
  json_api: "adapter-jsonapi",
  html_scrape: "adapter-html",
  csv: "adapter-jsonapi",
  sdmx: "adapter-jsonapi",
  arcgis: "adapter-jsonapi",
};

function adapterForSource(source: {
  name?: string;
  type: string;
  url?: string;
  config?: Record<string, unknown> | null;
}) {
  if (source.config?.adapter === "pco") return "adapter-pco";
  if (source.config?.adapter === "parliament") return "adapter-parliament";

  // Bootstrap the May source row without waiting for a new migration. The
  // Parliament adapter normalises this historical row on its first successful
  // run. The old source name pointed at committee advice, not a Bills feed.
  if (source.name === "NZ Parliament — Bills RSS" || source.name === "NZ Parliament — Bills API") {
    return "adapter-parliament";
  }

  return ADAPTER_FOR[source.type];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Sources that are due: never_checked OR (now - last_checked) > cadence
    const { data: due, error } = await admin
      .from("kb_sources")
      .select("id, name, type, url, cadence_minutes, last_checked_at, config")
      .eq("active", true)
      .order("last_checked_at", { ascending: true, nullsFirst: true })
      .limit(20);
    if (error) throw error;

    const now = Date.now();
    const dispatched: { id: string; adapter: string; ok: boolean; status?: number; error?: string }[] = [];
    const dispatches: Promise<void>[] = [];

    for (const src of due ?? []) {
      const last = src.last_checked_at ? new Date(src.last_checked_at).getTime() : 0;
      const dueAt = last + src.cadence_minutes * 60_000;
      if (last && dueAt > now) continue;

      const adapter = adapterForSource(src as {
        name?: string;
        type: string;
        url?: string;
        config?: Record<string, unknown> | null;
      });
      if (!adapter) continue;

      dispatches.push(
        fetch(`${supabaseUrl}/functions/v1/${adapter}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ source_id: src.id }),
        })
          .then(async (res) => {
            dispatched.push({ id: src.id, adapter, ok: res.ok, status: res.status });
            if (!res.ok) console.error(`dispatch ${adapter} returned ${res.status}`, await res.text());
          })
          .catch((e) => {
            const error = e instanceof Error ? e.message : "unknown";
            dispatched.push({ id: src.id, adapter, ok: false, error });
            console.error(`dispatch ${adapter} failed:`, error);
          }),
      );
    }

    await Promise.allSettled(dispatches);

    return new Response(JSON.stringify({ ok: true, dispatched }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("tick error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});