// ═══════════════════════════════════════════════════════════════
// kb-refresher — pulls a KB priority document's source via Firecrawl,
// stores an excerpt + content hash on kb_priority_documents, marks
// last_refreshed_at + last_refresh_status. Auth: requires JWT, only
// users with the `business` role may invoke.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";

async function sha256(text: string) {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing bearer token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(JSON.stringify({ error: "FIRECRAWL_API_KEY is not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userResp } = await userClient.auth.getUser();
    if (!userResp?.user) {
      return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await admin.from("user_roles").select("role").eq("user_id", userResp.user.id).eq("role", "business").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { documentId } = await req.json().catch(() => ({}));
    if (!documentId || typeof documentId !== "string") {
      return new Response(JSON.stringify({ error: "documentId is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: doc, error: fetchErr } = await admin.from("kb_priority_documents").select("id, title, source_url").eq("id", documentId).maybeSingle();
    if (fetchErr || !doc) {
      return new Response(JSON.stringify({ error: "Document not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!doc.source_url) {
      await admin.from("kb_priority_documents").update({
        last_refreshed_at: new Date().toISOString(), last_refresh_status: "skipped: no source_url",
      }).eq("id", doc.id);
      return new Response(JSON.stringify({ ok: false, reason: "no source_url" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const fcRes = await fetch(`${FIRECRAWL_V2}/scrape`, {
      method: "POST",
      headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: doc.source_url, formats: ["markdown"], onlyMainContent: true }),
    });
    const fcJson = await fcRes.json().catch(() => null) as { markdown?: string; data?: { markdown?: string }; error?: string } | null;
    if (!fcRes.ok) {
      await admin.from("kb_priority_documents").update({
        last_refreshed_at: new Date().toISOString(),
        last_refresh_status: `error ${fcRes.status}: ${(fcJson?.error || "scrape failed").slice(0, 200)}`,
      }).eq("id", doc.id);
      return new Response(JSON.stringify({ ok: false, error: fcJson?.error || "Firecrawl failed", status: fcRes.status }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const markdown = fcJson?.markdown ?? fcJson?.data?.markdown ?? "";
    const hash = markdown ? await sha256(markdown) : null;
    const excerpt = markdown.slice(0, 1500);
    const now = new Date().toISOString();

    await admin.from("kb_priority_documents").update({
      last_verified_at: now,
      last_refreshed_at: now,
      last_refresh_status: markdown ? "ok" : "empty",
      content_hash: hash,
      content_excerpt: excerpt,
    }).eq("id", doc.id);

    return new Response(JSON.stringify({ ok: true, bytes: markdown.length, hash }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
