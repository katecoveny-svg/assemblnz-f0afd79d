import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ── helpers ── */

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

/* ── extract structured data directly from HTML before AI analysis ── */

function extractMetaFromHtml(html: string, baseUrl: string): Record<string, unknown> {
  const meta: Record<string, unknown> = {};

  // og:site_name / title
  const ogSiteName = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)?.[1];
  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
  meta.ogSiteName = ogSiteName || null;
  meta.titleTag = titleTag || null;

  // og:image / apple-touch-icon / favicon
  const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1];
  const appleTouchIcon = html.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i)?.[1];
  const favicon = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i)?.[1];
  const resolveUrl = (u: string | null | undefined) => {
    if (!u) return null;
    try { return new URL(u, baseUrl).toString(); } catch { return u; }
  };
  meta.logoUrl = resolveUrl(ogImage) || resolveUrl(appleTouchIcon) || resolveUrl(favicon) || null;

  // meta description
  const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1];
  meta.metaDescription = metaDesc || null;

  // social links
  const socialPatterns = /(https?:\/\/(?:www\.)?(?:facebook|instagram|linkedin|twitter|x|youtube|tiktok)\.com\/[^\s"'<>]+)/gi;
  const socialMatches = [...new Set((html.match(socialPatterns) || []).map(s => s.replace(/['"]+$/, "")))];
  meta.socialLinks = socialMatches.slice(0, 10);

  // headings
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean).slice(0, 5);
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean).slice(0, 8);
  meta.headings = { h1: h1s, h2: h2s };

  // extract inline CSS colours
  const colourSet = new Set<string>();
  const hexMatches = html.matchAll(/#([0-9a-fA-F]{3,8})\b/g);
  for (const m of hexMatches) {
    const hex = m[1];
    if (hex.length === 3 || hex.length === 6) colourSet.add(`#${hex.toLowerCase()}`);
  }
  // rgb/rgba
  const rgbMatches = html.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g);
  for (const m of rgbMatches) {
    const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3]);
    colourSet.add(`#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`);
  }
  // filter out super common ones
  // Filter out common framework/UI grays and near-black/white colours
  const boringColours = new Set([
    "#000000", "#ffffff", "#000", "#fff",
    "#111111", "#1a1a1a", "#222222", "#333333", "#444444", "#555555",
    "#666666", "#777777", "#888888", "#999999", "#aaaaaa", "#bbbbbb",
    "#cccccc", "#dddddd", "#eeeeee", "#f5f5f5", "#e5e5e5", "#f0f0f0",
    // Tailwind grays / zinc / slate / neutral defaults
    "#09090b", "#0a0a0b", "#0a0a14", "#09090f",
    "#18181b", "#1c1917", "#1e1b4b", "#1e293b",
    "#27272a", "#292524", "#334155",
    "#3f3f46", "#44403c", "#475569",
    "#52525b", "#57534e", "#64748b",
    "#71717a", "#78716c",
    "#a1a1aa", "#a8a29e",
    "#d4d4d8", "#d6d3d1", "#e2e8f0",
    "#e4e4e7", "#e4e4ec", "#e7e5e4", "#e5e7eb",
    "#f4f4f5", "#f5f5f4", "#f8fafc", "#fafaf9", "#fafafa",
    "#f9fafb", "#f1f5f9",
  ]);
  meta.extractedColours = [...colourSet].filter(c => !boringColours.has(c)).slice(0, 20);

  // extract font-family declarations
  const fontSet = new Set<string>();
  const fontFamilyMatches = html.matchAll(/font-family\s*:\s*([^;}"]+)/gi);
  for (const m of fontFamilyMatches) {
    const fonts = m[1].split(",").map(f => f.trim().replace(/["']/g, "")).filter(f => !["sans-serif", "serif", "monospace", "cursive", "system-ui", "inherit", "initial", "-apple-system", "BlinkMacSystemFont", "Segoe UI"].includes(f));
    fonts.forEach(f => fontSet.add(f));
  }
  // Google Fonts links
  const googleFontLinks = html.matchAll(/fonts\.googleapis\.com\/css[^"']*family=([^"'&]+)/gi);
  for (const m of googleFontLinks) {
    const families = decodeURIComponent(m[1]).split("|").map(f => f.split(":")[0].replace(/\+/g, " ").trim());
    families.forEach(f => fontSet.add(f));
  }
  meta.extractedFonts = [...fontSet].slice(0, 10);

  return meta;
}

/* ── fetch linked stylesheets and extract colours/fonts ── */

async function fetchLinkedStylesheetData(html: string, baseUrl: string): Promise<{ colours: string[]; fonts: string[] }> {
  const colours = new Set<string>();
  const fonts = new Set<string>();

  const linkMatches = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi)];
  const cssUrls = linkMatches.map(m => {
    try { return new URL(m[1], baseUrl).toString(); } catch { return null; }
  }).filter(Boolean).slice(0, 3); // limit to 3 stylesheets

  for (const cssUrl of cssUrls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const resp = await fetch(cssUrl!, { signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0 (compatible; AssemblBot/1.0)" } });
      clearTimeout(timeout);
      if (!resp.ok) continue;
      const cssText = (await resp.text()).slice(0, 50000); // limit size

      // colours
      for (const m of cssText.matchAll(/#([0-9a-fA-F]{3,6})\b/g)) {
        if (m[1].length === 3 || m[1].length === 6) colours.add(`#${m[1].toLowerCase()}`);
      }
      for (const m of cssText.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)) {
        const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3]);
        colours.add(`#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`);
      }

      // fonts
      for (const m of cssText.matchAll(/font-family\s*:\s*([^;}"]+)/gi)) {
        m[1].split(",").map(f => f.trim().replace(/["']/g, "")).filter(f => !["sans-serif", "serif", "monospace", "cursive", "system-ui", "inherit", "initial", "-apple-system", "BlinkMacSystemFont", "Segoe UI"].includes(f)).forEach(f => fonts.add(f));
      }
    } catch {
      // skip failed stylesheet
    }
  }

  const boring = new Set([
    "#000000", "#ffffff", "#000", "#fff",
    "#111111", "#1a1a1a", "#222222", "#333333", "#444444", "#555555",
    "#666666", "#777777", "#888888", "#999999", "#aaaaaa", "#bbbbbb",
    "#cccccc", "#dddddd", "#eeeeee", "#f5f5f5", "#e5e5e5", "#f0f0f0",
    "#09090b", "#0a0a0b", "#0a0a14", "#09090f",
    "#18181b", "#1c1917", "#27272a", "#292524",
    "#3f3f46", "#44403c", "#52525b", "#57534e",
    "#71717a", "#78716c", "#a1a1aa", "#a8a29e",
    "#d4d4d8", "#d6d3d1", "#e2e8f0", "#e4e4e7", "#e4e4ec",
    "#e7e5e4", "#e5e7eb", "#f4f4f5", "#f5f5f4", "#fafafa",
  ]);
  return {
    colours: [...colours].filter(c => !boring.has(c)).slice(0, 30),
    fonts: [...fonts].slice(0, 15),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { url, instagram, linkedin, fallbackContent, manualBrand } = await req.json();

    // ── MANUAL BRAND INPUT (bypass scan) ──
    if (manualBrand && typeof manualBrand === "object") {
      const brandDna = {
        business_name: manualBrand.businessName || "My Business",
        industry: manualBrand.industry || "General",
        target_audience: manualBrand.audience || "NZ businesses",
        key_products: [],
        usps: [],
        visual_identity: {
          primary_color: manualBrand.primaryColour || "#10B981",
          secondary_color: manualBrand.secondaryColour || "#6366F1",
          accent_color: manualBrand.accentColour || "#00E5FF",
          background_preference: manualBrand.backgroundPreference || "light",
          photography_style: "professional",
          visual_aesthetic: manualBrand.aesthetic || "minimalist",
        },
        typography: {
          heading_style: "sans-serif",
          heading_font: manualBrand.headingFont || "Inter",
          body_style: "sans-serif",
          body_font: manualBrand.bodyFont || "Inter",
          text_density: "moderate",
        },
        voice_tone: {
          formality: manualBrand.formality || 5,
          personality_traits: manualBrand.toneTraits || ["professional", "friendly"],
          sentence_style: "balanced",
          emoji_usage: "rarely",
          jargon_level: "light",
          cta_style: "direct",
        },
        brand_summary: `${manualBrand.businessName || "This business"} is a ${manualBrand.industry || "general"} business targeting ${manualBrand.audience || "NZ customers"}. Manually entered brand profile.`,
        brand_score: 60,
        logo_url: manualBrand.logoUrl || null,
        tagline: manualBrand.tagline || null,
      };

      // Save to DB
      const { data: existing } = await supabase.from("brand_profiles").select("id").eq("user_id", user.id).maybeSingle();
      const dbPayload = {
        brand_dna: brandDna,
        business_name: brandDna.business_name,
        industry: brandDna.industry,
        tone: brandDna.voice_tone.personality_traits.join(", "),
        audience: brandDna.target_audience,
        key_message: brandDna.tagline || null,
      };
      if (existing) {
        await supabase.from("brand_profiles").update(dbPayload).eq("id", existing.id);
      } else {
        await supabase.from("brand_profiles").insert({ user_id: user.id, ...dbPayload });
      }

      return new Response(JSON.stringify({ brandProfile: brandDna.brand_summary, brandDna, scanWarning: null }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "URL is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid URL" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const blockedPatterns = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|0\.|169\.254\.|localhost|metadata\.google|169\.254\.169\.254)/i;
    if (blockedPatterns.test(parsedUrl.hostname)) {
      return new Response(JSON.stringify({ error: "URL not allowed" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let html = "";
    let usedFallback = false;
    let pendingSetupDetected = false;

    for (const candidate of buildFetchCandidates(parsedUrl)) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const res = await fetch(candidate, {
          signal: controller.signal,
          redirect: "follow",
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-NZ,en;q=0.9",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const candidateHtml = await res.text();
        if (looksLikePendingSetup(candidateHtml)) { pendingSetupDetected = true; continue; }
        html = candidateHtml;
        break;
      } catch {
        // try next
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
        ? "This custom domain is still provisioning. Please use the manual brand input form instead."
        : "Could not reach the website. Try the full https:// address, or use the manual brand input form to enter your brand details directly.";
      return new Response(JSON.stringify({ error: message, showManualForm: true }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Extract structured data from HTML ──
    const baseUrl = parsedUrl.toString();
    const htmlMeta = extractMetaFromHtml(html, baseUrl);

    // ── Fetch linked stylesheets for additional colours/fonts ──
    let stylesheetData = { colours: [] as string[], fonts: [] as string[] };
    if (!usedFallback) {
      try {
        stylesheetData = await fetchLinkedStylesheetData(html, baseUrl);
      } catch { /* non-critical */ }
    }

    // Merge extracted data
    const allColours = [...new Set([...(htmlMeta.extractedColours as string[]), ...stylesheetData.colours])].slice(0, 30);
    const allFonts = [...new Set([...(htmlMeta.extractedFonts as string[]), ...stylesheetData.fonts])].slice(0, 15);

    const text = stripHtml(html);
    const words = text.split(/\s+/).slice(0, 3000).join(" ");

    let extraContext = "";
    if (instagram) extraContext += `\nInstagram: ${instagram}`;
    if (linkedin) extraContext += `\nLinkedIn: ${linkedin}`;

    // Provide extracted data to AI for better accuracy
    const extractedDataContext = `
EXTRACTED DATA FROM HTML:
- Site name: ${htmlMeta.ogSiteName || "not found"}
- Title tag: ${htmlMeta.titleTag || "not found"}
- Meta description: ${htmlMeta.metaDescription || "not found"}
- Logo URL: ${htmlMeta.logoUrl || "not found"}
- Social links: ${(htmlMeta.socialLinks as string[]).join(", ") || "none found"}
- H1 headings: ${((htmlMeta.headings as any)?.h1 || []).join(" | ") || "none"}
- H2 headings: ${((htmlMeta.headings as any)?.h2 || []).join(" | ") || "none"}
- Colours found in CSS: ${allColours.join(", ") || "none"}
- Fonts found: ${allFonts.join(", ") || "none"}`;

    const systemPrompt = `You are a brand analyst. Analyse the provided website text AND the pre-extracted HTML data to create an accurate Brand DNA profile. Use the EXTRACTED DATA to inform your colour and font choices — these are the ACTUAL CSS values from the site.

Return ONLY valid JSON (no markdown, no code blocks) with this structure:
{
  "business_name": "string",
  "industry": "string",
  "target_audience": "string",
  "key_products": ["top 5 products/services"],
  "usps": ["3 unique selling points"],
  "visual_identity": {
    "primary_color": "#hex (use actual extracted colour if available)",
    "secondary_color": "#hex",
    "accent_color": "#hex",
    "background_color": "#hex",
    "text_color": "#hex",
    "background_preference": "light|dark|mixed",
    "photography_style": "professional|casual|lifestyle|product|editorial|none",
    "visual_aesthetic": "minimalist|bold|elegant|playful|corporate|creative"
  },
  "typography": {
    "heading_style": "serif|sans-serif|display",
    "heading_font": "actual font from extracted data or closest Google Font match",
    "body_style": "serif|sans-serif",
    "body_font": "actual font from extracted data or closest Google Font match",
    "text_density": "sparse|moderate|dense"
  },
  "voice_tone": {
    "formality": 6,
    "personality_traits": ["5 adjectives"],
    "sentence_style": "short and punchy|balanced|long and detailed",
    "emoji_usage": "never|rarely|sometimes|frequently",
    "jargon_level": "none|light|moderate|heavy",
    "cta_style": "soft|direct|urgent",
    "tone_category": "formal|professional|friendly|casual|technical|playful"
  },
  "logo_url": "extracted logo URL or null",
  "tagline": "from meta description or h1 or null",
  "social_links": ["extracted social URLs"],
  "key_messaging": ["key messages from h1/h2 headings"],
  "brand_summary": "One paragraph brand positioning summary",
  "brand_score": 85
}
IMPORTANT COLOUR RULES:
- IGNORE common CSS framework colours (Tailwind grays, resets, skeleton colours like #09090f, #e5e7eb, #e4e4ec, #f5f5f5, etc.)
- Focus on DISTINCTIVE brand colours — vibrant, saturated, or unique hues that represent the brand identity
- If you only see gray/neutral extracted colours, infer brand colours from logos, images, or brand context instead
- The primary_color should be the most prominent BRAND colour, not a background or text gray
Be factual. Prioritise ACTUAL distinctive brand colours and fonts over guesses. brand_score = confidence 0-100.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyse this website and create a Brand DNA profile:\n\n${extractedDataContext}\n\nWEBSITE TEXT CONTENT:\n${words}${extraContext}` },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "Failed to analyse website" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "";

    let brandDna = null;
    let brandProfile = rawText;
    try {
      const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
      brandDna = JSON.parse(cleaned);
      brandProfile = brandDna.brand_summary || rawText;

      // Ensure logo_url from HTML extraction is used if AI didn't find one
      if (!brandDna.logo_url && htmlMeta.logoUrl) {
        brandDna.logo_url = htmlMeta.logoUrl;
      }
    } catch {
      // keep as text
    }

    // Store Brand DNA
    if (brandDna && user) {
      const businessName = brandDna.business_name || parsedUrl.hostname;
      const { data: existing } = await supabase.from("brand_profiles").select("id").eq("user_id", user.id).maybeSingle();
      const dbPayload = {
        brand_dna: brandDna,
        business_name: businessName,
        industry: brandDna.industry || null,
        tone: brandDna.voice_tone?.personality_traits?.join(", ") || null,
        audience: brandDna.target_audience || null,
        key_message: brandDna.tagline || brandDna.usps?.join(". ") || null,
      };
      if (existing) {
        await supabase.from("brand_profiles").update(dbPayload).eq("id", existing.id);
      } else {
        await supabase.from("brand_profiles").insert({ user_id: user.id, ...dbPayload });
      }
    }

    return new Response(
      JSON.stringify({ brandProfile, brandDna, scanWarning: usedFallback ? "Used the currently open page because the requested website could not be reached yet." : null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scan website error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
