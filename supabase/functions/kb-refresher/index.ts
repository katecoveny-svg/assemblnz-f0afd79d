// ═══════════════════════════════════════════════════════════════
// kb-refresher — pulls a knowledge document's source via Firecrawl,
// stores content + content hash + chunk count placeholder on
// industry_knowledge_base, marks last_fetched_at + last_fetch_status.
// Auth: requires JWT, only users with the `business` role may invoke.
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

    const { data: doc, error: fetchErr } = await admin
      .from("industry_knowledge_base")
      .select("id, doc_title, doc_source_url, content_hash")
      .eq("id", documentId)
      .maybeSingle();
    if (fetchErr || !doc) {
      return new Response(JSON.stringify({ error: "Document not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!doc.doc_source_url) {
      await admin.from("industry_knowledge_base").update({
        last_fetched_at: new Date().toISOString(), last_fetch_status: "skipped: no source_url",
      }).eq("id", doc.id);
      return new Response(JSON.stringify({ ok: false, reason: "no source_url" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const fcRes = await fetch(`${FIRECRAWL_V2}/scrape`, {
      method: "POST",
      headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: doc.doc_source_url, formats: ["markdown"], onlyMainContent: true }),
    });
    const fcJson = await fcRes.json().catch(() => null) as { markdown?: string; data?: { markdown?: string }; error?: string } | null;
    if (!fcRes.ok) {
      await admin.from("industry_knowledge_base").update({
        last_fetched_at: new Date().toISOString(),
        last_fetch_status: `error ${fcRes.status}: ${(fcJson?.error || "scrape failed").slice(0, 200)}`,
      }).eq("id", doc.id);
      return new Response(JSON.stringify({ ok: false, error: fcJson?.error || "Firecrawl failed", status: fcRes.status }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const markdown = fcJson?.markdown ?? fcJson?.data?.markdown ?? "";
    const hash = markdown ? await sha256(markdown) : null;
    const now = new Date().toISOString();
    const unchanged = hash && doc.content_hash === hash;

    await admin.from("industry_knowledge_base").update({
      last_fetched_at: now,
      last_reviewed: now.slice(0, 10),
      last_fetch_status: markdown ? (unchanged ? "ok: unchanged" : "ok: updated") : "empty",
      content_hash: hash,
      content: markdown.slice(0, 50000),
      summary: markdown.slice(0, 600),
    }).eq("id", doc.id);

    return new Response(JSON.stringify({ ok: true, bytes: markdown.length, hash, unchanged }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
