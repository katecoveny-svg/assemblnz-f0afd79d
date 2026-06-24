import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FLINT_MCP_URL = "https://mcp.tryflint.com/mcp";

// ── Page manifest (embedded subset for guard checks) ──────────
const LOCKED_REGIONS = ["kete-name", "wananga-quote", "nav", "footer-legal", "hero-tagline"];
const BLOCKED_ROUTES = ["/aaaip", "/toroa", "/waihanga/", "/manaaki/", "/auaha/", "/arataki/", "/pikau/"];
const RETIRED_NAMES = ["Hanga", "Pakihi", "Waka", "Hangarau", "Hauora", "Te Kāhui Reo"];

const PAGES: Record<string, { route: string; editableRegions: string[]; keteTokens: Record<string, string> }> = {
  homepage: { route: "/", editableRegions: ["hero-subheadline", "feature-cards", "social-proof", "cta-copy"], keteTokens: { primary: "#0F172A", accent: "#3A7D6E" } },
  "manaaki-landing": { route: "/manaaki", editableRegions: ["hero-subheadline", "feature-list", "use-cases", "cta-copy"], keteTokens: { primary: "#D4A843" } },
  "waihanga-landing": { route: "/waihanga", editableRegions: ["hero-subheadline", "feature-list", "use-cases", "cta-copy"], keteTokens: { primary: "#3A7D6E" } },
  "auaha-landing": { route: "/auaha", editableRegions: ["hero-subheadline", "feature-list", "use-cases", "cta-copy"], keteTokens: { primary: "#F0D078" } },
  "arataki-landing": { route: "/arataki", editableRegions: ["hero-subheadline", "feature-list", "use-cases", "cta-copy"], keteTokens: { primary: "#C65D4E" } },
  "pikau-landing": { route: "/pikau", editableRegions: ["hero-subheadline", "feature-list", "use-cases", "cta-copy"], keteTokens: { primary: "#5AADA0" } },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const FLINT_API_KEY = Deno.env.get("FLINT_API_KEY");
    if (!FLINT_API_KEY) throw new Error("FLINT_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, pageId, region, currentContent, instructions, seoTarget } = await req.json();

    // ── Action: list-pages ─────────────────────────────────────
    if (action === "list-pages") {
      return new Response(JSON.stringify({ pages: PAGES }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Action: generate — Ask Flint for copy/SEO suggestions ──
    if (action === "generate") {
      if (!pageId || !region) throw new Error("pageId and region are required");

      const page = PAGES[pageId];
      if (!page) throw new Error(`Unknown page: ${pageId}`);
      if (LOCKED_REGIONS.includes(region)) throw new Error(`Region "${region}" is locked and cannot be edited`);
      if (!page.editableRegions.includes(region)) throw new Error(`Region "${region}" is not editable on ${pageId}`);

      // Call Flint MCP
      const flintPayload = {
        jsonrpc: "2.0",
        id: `assembl-${Date.now()}`,
        method: "tools/call",
        params: {
          name: "generate_copy",
          arguments: {
            page_url: `https://www.assembl.co.nz${page.route}`,
            page_id: pageId,
            region: region,
            current_content: currentContent || "",
            instructions: instructions || "Improve this copy for conversion and SEO",
            seo_target: seoTarget || "",
            brand_context: `Assembl is a NZ SaaS platform providing policy-governed AI agents for Aotearoa businesses. Brand colours: ${JSON.stringify(page.keteTokens)}. Tone: professional, grounded, NZ-first. Never use retired names: ${RETIRED_NAMES.join(", ")}.`,
            constraints: JSON.stringify({
              lockedRegions: LOCKED_REGIONS,
              retiredNames: RETIRED_NAMES,
              maxLength: region === "hero-subheadline" ? 120 : 500,
            }),
          },
        },
      };

      const flintResp = await fetch(FLINT_MCP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          Authorization: `Bearer ${FLINT_API_KEY}`,
        },
        body: JSON.stringify(flintPayload),
      });

      let flintResult: any;
      if (flintResp.ok) {
        flintResult = await flintResp.json();
      } else {
        const errText = await flintResp.text();
        console.error("Flint MCP error:", flintResp.status, errText);
        // Fallback: use Lovable AI to generate copy instead
        flintResult = await generateFallbackCopy(pageId, region, currentContent, instructions, seoTarget, page);
      }

      // Run compliance guard check
      const guardResult = runGuardCheck(pageId, region, flintResult);

      // Store proposal in DB
      await supabase.from("flint_proposals").insert({
        page_id: pageId,
        region: region,
        current_content: currentContent || "",
        proposed_content: typeof flintResult?.result?.content === "string" 
          ? flintResult.result.content 
          : JSON.stringify(flintResult),
        instructions: instructions || "",
        seo_target: seoTarget || "",
        verdict: guardResult.verdict,
        audit_id: guardResult.auditId,
        guard_details: guardResult,
        status: guardResult.verdict === "allow" ? "approved" : guardResult.verdict === "block" ? "rejected" : "pending_review",
      });

      return new Response(JSON.stringify({
        proposal: flintResult,
        guard: guardResult,
        pageId,
        region,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Action: seo-audit — Analyse page SEO via Flint ─────────
    if (action === "seo-audit") {
      if (!pageId) throw new Error("pageId is required");
      const page = PAGES[pageId];
      if (!page) throw new Error(`Unknown page: ${pageId}`);

      const flintPayload = {
        jsonrpc: "2.0",
        id: `assembl-seo-${Date.now()}`,
        method: "tools/call",
        params: {
          name: "seo_audit",
          arguments: {
            url: `https://www.assembl.co.nz${page.route}`,
            target_keywords: seoTarget || "",
            locale: "en-NZ",
          },
        },
      };

      const flintResp = await fetch(FLINT_MCP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          Authorization: `Bearer ${FLINT_API_KEY}`,
        },
        body: JSON.stringify(flintPayload),
      });

      let seoResult: any;
      if (flintResp.ok) {
        seoResult = await flintResp.json();
      } else {
        // Fallback SEO audit using Lovable AI
        seoResult = await generateFallbackSeoAudit(pageId, page, seoTarget);
      }

      return new Response(JSON.stringify({ seoAudit: seoResult, pageId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (e) {
    console.error("flint-mcp error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ── Guard check (simplified version for edge function) ─────────
function runGuardCheck(pageId: string, region: string, flintResult: any) {
  const auditId = `flint-audit-${Date.now()}`;
  const content = typeof flintResult?.result?.content === "string" ? flintResult.result.content : JSON.stringify(flintResult);

  // Check for retired names
  const hasRetiredName = RETIRED_NAMES.some((name) => content.toLowerCase().includes(name.toLowerCase()));
  if (hasRetiredName) {
    return { auditId, verdict: "block" as const, reason: "Contains retired Kete name", evaluatedAt: new Date().toISOString() };
  }

  // Check locked regions
  if (LOCKED_REGIONS.includes(region)) {
    return { auditId, verdict: "block" as const, reason: "Attempted edit to locked region", evaluatedAt: new Date().toISOString() };
  }

  // Default: allow
  return { auditId, verdict: "allow" as const, reason: "All checks passed", evaluatedAt: new Date().toISOString() };
}

// ── Fallback: Lovable AI copy generation ──────────────────────
async function generateFallbackCopy(pageId: string, region: string, currentContent: string, instructions: string, seoTarget: string, page: any) {
  const LOVABLE_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return { result: { content: "Flint unavailable and no fallback AI configured" } };

  const prompt = `You are an expert NZ marketing copywriter for Assembl (assembl.co.nz), a SaaS platform providing AI agents for NZ businesses.

Page: ${pageId} (${page.route})
Region: ${region}
Current content: ${currentContent || "None"}
Instructions: ${instructions}
SEO target keywords: ${seoTarget || "None specified"}

Write compelling, conversion-focused copy for this region. Requirements:
- NZ English spelling (organisation, licence, colour)
- Professional but approachable tone
- Never use these retired names: ${RETIRED_NAMES.join(", ")}
- Max length: ${region === "hero-subheadline" ? "120 chars" : "500 chars"}
- Include SEO target keywords naturally if provided

Return ONLY the copy text, no explanations.`;

  const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!resp.ok) return { result: { content: "AI fallback failed", source: "fallback" } };
  const data = await resp.json();
  return { result: { content: data.choices?.[0]?.message?.content || "", source: "lovable-ai-fallback" } };
}

// ── Fallback: Lovable AI SEO audit ────────────────────────────
async function generateFallbackSeoAudit(pageId: string, page: any, seoTarget: string) {
  const LOVABLE_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return { error: "No AI configured for fallback" };

  const prompt = `You are an SEO expert. Audit this NZ SaaS landing page for SEO performance.

Page: ${pageId} at https://www.assembl.co.nz${page.route}
Target keywords: ${seoTarget || "NZ business software, AI agents, compliance automation"}
Locale: en-NZ

Provide a JSON object with:
- overallScore (0-100)
- titleAnalysis: { current, suggested, score }
- metaDescription: { current, suggested, score }
- headingStructure: { issues: string[], score }
- keywordDensity: { score, suggestions: string[] }
- technicalSeo: { issues: string[], score }
- recommendations: string[] (top 5 actionable items)`;

  const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!resp.ok) return { error: "SEO audit fallback failed" };
  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content || "";
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { rawAnalysis: content, source: "lovable-ai-fallback" };
  } catch {
    return { rawAnalysis: content, source: "lovable-ai-fallback" };
  }
}
