import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CANVA_API = "https://api.canva.com/rest/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's Canva API key from user_integrations
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminSb = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);
    const { data: integration } = await adminSb
      .from("user_integrations")
      .select("config")
      .eq("user_id", user.id)
      .eq("integration_name", "canva")
      .eq("status", "active")
      .single();

    const canvaApiKey = integration?.config?.api_key;
    if (!canvaApiKey) {
      return new Response(JSON.stringify({ error: "Canva not connected. Add your Canva API key via Integration Hub." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // ── List designs ──
    if (action === "list_designs") {
      const { query, limit = 10 } = body;
      const params = new URLSearchParams({ ownership: "owned" });
      if (query) params.set("query", query);

      const resp = await fetch(`${CANVA_API}/designs?${params}`, {
        headers: { Authorization: `Bearer ${canvaApiKey}` },
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Canva API error [${resp.status}]: ${err}`);
      }

      const data = await resp.json();
      const designs = (data.items || []).slice(0, limit).map((d: any) => ({
        id: d.id,
        title: d.title,
        thumbnail: d.thumbnail?.url,
        url: d.urls?.edit_url || d.urls?.view_url,
        created_at: d.created_at,
        updated_at: d.updated_at,
      }));

      return new Response(JSON.stringify({ designs }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Create design from template ──
    if (action === "create_design") {
      const { title, designType = "Poster", width = 1080, height = 1080 } = body;

      const resp = await fetch(`${CANVA_API}/designs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${canvaApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          design_type: { type: designType },
          title,
        }),
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Canva create design error [${resp.status}]: ${err}`);
      }

      const design = await resp.json();
      return new Response(JSON.stringify({
        success: true,
        design: {
          id: design.design?.id,
          title: design.design?.title,
          editUrl: design.design?.urls?.edit_url,
        },
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Export design ──
    if (action === "export_design") {
      const { designId, format = "png" } = body;

      const resp = await fetch(`${CANVA_API}/exports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${canvaApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          design_id: designId,
          format: { type: format.toUpperCase() },
        }),
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Canva export error [${resp.status}]: ${err}`);
      }

      const exportJob = await resp.json();
      return new Response(JSON.stringify({
        success: true,
        exportId: exportJob.job?.id,
        status: exportJob.job?.status,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Get export status ──
    if (action === "export_status") {
      const { exportId } = body;

      const resp = await fetch(`${CANVA_API}/exports/${exportId}`, {
        headers: { Authorization: `Bearer ${canvaApiKey}` },
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Canva export status error [${resp.status}]: ${err}`);
      }

      const job = await resp.json();
      return new Response(JSON.stringify({
        status: job.job?.status,
        urls: job.job?.urls,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── List templates ──
    if (action === "list_templates") {
      const { query, limit = 10 } = body;
      const params = new URLSearchParams();
      if (query) params.set("query", query);

      const resp = await fetch(`${CANVA_API}/brand-templates?${params}`, {
        headers: { Authorization: `Bearer ${canvaApiKey}` },
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Canva templates error [${resp.status}]: ${err}`);
      }

      const data = await resp.json();
      const templates = (data.items || []).slice(0, limit).map((t: any) => ({
        id: t.id,
        title: t.title,
        thumbnail: t.thumbnail?.url,
      }));

      return new Response(JSON.stringify({ templates }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use: list_designs, create_design, export_design, export_status, list_templates" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Canva API error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
