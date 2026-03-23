import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function stripHtml(html: string): string {
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  text = text.replace(/<footer[\s\S]*?<\/footer>/gi, "");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

function buildFetchCandidates(parsedUrl: URL): string[] {
  const candidates = [parsedUrl.toString()];

  if (parsedUrl.protocol === "https:") {
    candidates.push(`http://${parsedUrl.host}${parsedUrl.pathname}${parsedUrl.search}`);
  }

  if (!parsedUrl.hostname.startsWith("www.")) {
    const wwwHost = `www.${parsedUrl.hostname}`;
    candidates.push(`${parsedUrl.protocol}//${wwwHost}${parsedUrl.pathname}${parsedUrl.search}`);
    if (parsedUrl.protocol === "https:") {
      candidates.push(`http://${wwwHost}${parsedUrl.pathname}${parsedUrl.search}`);
    }
  }

  return [...new Set(candidates)];
}

function looksLikePendingSetup(html: string): boolean {
  const normalized = html.replace(/\s+/g, " ").trim();
  return normalized.includes("Setting up") && normalized.includes("This may take a few minutes");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { data: { user: u } } = await supabase.auth.getUser();
    const user = u;

    const { url, instagram, linkedin, fallbackContent } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const blockedPatterns = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|0\.|169\.254\.|localhost|metadata\.google|169\.254\.169\.254)/i;
    if (blockedPatterns.test(parsedUrl.hostname)) {
      return new Response(
        JSON.stringify({ error: "URL not allowed" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let html = "";
    let usedFallback = false;
    let pendingSetupDetected = false;

    for (const candidate of buildFetchCandidates(parsedUrl)) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        const res = await fetch(candidate, {
          signal: controller.signal,
          redirect: "follow",
          headers: { "User-Agent": "Mozilla/5.0 (compatible; AssemblBot/1.0)" },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const candidateHtml = await res.text();
        if (looksLikePendingSetup(candidateHtml)) {
          pendingSetupDetected = true;
          continue;
        }

        html = candidateHtml;
        break;
      } catch {
        // Try next candidate URL variant
      } finally {
        clearTimeout(timeout);
      }
    }

    if (!html && typeof fallbackContent === "string" && fallbackContent.trim()) {
      html = fallbackContent;
      usedFallback = true;
    }

    if (!html) {
      const message = pendingSetupDetected
        ? "This custom domain is still provisioning. Open the live preview or published site and try the scan again there."
        : "Could not reach the website. Try the full https:// address, or scan from the live preview/published site if this domain is still updating.";

      return new Response(
        JSON.stringify({ error: message }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const text = stripHtml(html);
    const words = text.split(/\s+/).slice(0, 3000).join(" ");

    let extraContext = "";
    if (instagram) extraContext += `\nThe business Instagram handle is: ${instagram}. Consider this for social media tone analysis.`;
    if (linkedin) extraContext += `\nThe business LinkedIn page is: ${linkedin}. Consider this for professional positioning.`;

    const systemPrompt = `You are a brand analyst. Analyse the provided website text and extract a comprehensive Brand DNA profile. Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "business_name": "string",
  "industry": "string",
  "target_audience": "string",
  "key_products": ["top 5 products/services"],
  "usps": ["3 unique selling points"],
  "visual_identity": {
    "primary_color": "#hex",
    "secondary_color": "#hex",
    "accent_color": "#hex",
    "background_preference": "light|dark|mixed",
    "photography_style": "professional|casual|lifestyle|product|editorial|none",
    "visual_aesthetic": "minimalist|bold|elegant|playful|corporate|creative"
  },
  "typography": {
    "heading_style": "serif|sans-serif|display",
    "heading_font": "closest Google Font match",
    "body_style": "serif|sans-serif",
    "body_font": "closest Google Font match",
    "text_density": "sparse|moderate|dense"
  },
  "voice_tone": {
    "formality": 6,
    "personality_traits": ["5 adjectives"],
    "sentence_style": "short and punchy|balanced|long and detailed",
    "emoji_usage": "never|rarely|sometimes|frequently",
    "jargon_level": "none|light|moderate|heavy",
    "cta_style": "soft|direct|urgent"
  },
  "brand_summary": "One paragraph brand positioning summary",
  "brand_score": 85
}
Be factual and specific. Infer colours from the website aesthetic if not explicitly visible. The brand_score is your confidence in the analysis (0-100).`;

    // Use Lovable AI Gateway instead of Anthropic
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyse this website content and create a Brand DNA profile:\n\n${words}${extraContext}` },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({ error: "Failed to analyse website" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "";

    let brandDna = null;
    let brandProfile = rawText;
    try {
      const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
      brandDna = JSON.parse(cleaned);
      brandProfile = brandDna.brand_summary || rawText;
    } catch {
      // If JSON parsing fails, keep as text
    }

    // Store Brand DNA if user is authenticated
    if (brandDna && user) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader! } } }
      );
      const businessName = brandDna.business_name || parsedUrl.hostname;
      const { data: existing } = await supabase.from("brand_profiles").select("id").eq("user_id", user.id).maybeSingle();
      if (existing) {
        await supabase.from("brand_profiles").update({
          brand_dna: brandDna,
          business_name: businessName,
          industry: brandDna.industry || null,
          tone: brandDna.voice_tone?.personality_traits?.join(", ") || null,
          audience: brandDna.target_audience || null,
          key_message: brandDna.usps?.join(". ") || null,
        }).eq("id", existing.id);
      } else {
        await supabase.from("brand_profiles").insert({
          user_id: user.id,
          brand_dna: brandDna,
          business_name: businessName,
          industry: brandDna.industry || null,
          tone: brandDna.voice_tone?.personality_traits?.join(", ") || null,
          audience: brandDna.target_audience || null,
          key_message: brandDna.usps?.join(". ") || null,
        });
      }
    }

    return new Response(
      JSON.stringify({
        brandProfile,
        brandDna,
        scanWarning: usedFallback ? "Used the currently open page because the requested website could not be reached yet." : null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scan website error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
