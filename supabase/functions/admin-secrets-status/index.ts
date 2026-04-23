// Admin Secrets Status — returns presence (NOT values) of all known agent secrets.
// Admin-only: requires caller to be authenticated AND have role 'admin' in user_roles.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Catalogue of every secret the platform may use, grouped by agent / capability.
// `required` = blocking for that agent's core flow. Optional = nice-to-have / fallback.
const CATALOGUE: Array<{
  group: string;
  group_label: string;
  description: string;
  secrets: Array<{
    name: string;
    label: string;
    purpose: string;
    required: boolean;
    docs_url?: string;
    test_supported?: boolean;
  }>;
}> = [
  {
    group: "auaha",
    group_label: "Auaha — Creative & Media",
    description: "Adobe, Runway, fal.ai, stock photos, scheduling, 3D",
    secrets: [
      { name: "ADOBE_CLIENT_ID", label: "Adobe Client ID", purpose: "Adobe Creative Cloud (After Effects, Illustrator)", required: false, docs_url: "https://developer.adobe.com/console" },
      { name: "ADOBE_CLIENT_SECRET", label: "Adobe Client Secret", purpose: "Adobe Creative Cloud OAuth", required: false, test_supported: true },
      { name: "RUNWAY_API_KEY", label: "Runway ML", purpose: "AI video generation & motion design", required: false, docs_url: "https://dev.runwayml.com", test_supported: true },
      { name: "FAL_API_KEY", label: "fal.ai", purpose: "Flux / Midjourney-style image generation", required: false, docs_url: "https://fal.ai/dashboard/keys", test_supported: true },
      { name: "UNSPLASH_ACCESS_KEY", label: "Unsplash", purpose: "Stock photo automation", required: false, docs_url: "https://unsplash.com/oauth/applications", test_supported: true },
      { name: "PEXELS_API_KEY", label: "Pexels", purpose: "Stock photo automation (fallback)", required: false, docs_url: "https://www.pexels.com/api/", test_supported: true },
      { name: "BUFFER_ACCESS_TOKEN", label: "Buffer", purpose: "Social scheduling automation", required: false, docs_url: "https://buffer.com/developers/api", test_supported: true },
      { name: "SPLINE_API_KEY", label: "Spline", purpose: "3D design integration (optional)", required: false },
    ],
  },
  {
    group: "ai_models",
    group_label: "AI Model Providers",
    description: "LLM gateways for chat routing across all 23 agents",
    secrets: [
      { name: "LOVABLE_API_KEY", label: "Lovable AI Gateway", purpose: "Google Gemini routing (8 agents)", required: true },
      { name: "ANTHROPIC_API_KEY", label: "Anthropic", purpose: "Claude Opus 4.6 — compliance agents (8 agents)", required: true, docs_url: "https://console.anthropic.com", test_supported: true },
      { name: "OPENROUTER_API_KEY", label: "OpenRouter (Perplexity)", purpose: "Sonar Pro — research agents (3 agents)", required: false, docs_url: "https://openrouter.ai/keys", test_supported: true },
      { name: "GEMINI_API_KEY", label: "Gemini Direct", purpose: "Direct Google Gemini fallback", required: false, test_supported: true },
    ],
  },
  {
    group: "messaging",
    group_label: "Messaging — SMS / WhatsApp / Email",
    description: "Twilio, TNZ, Brevo for unified channel gateway",
    secrets: [
      { name: "TWILIO_ACCOUNT_SID", label: "Twilio Account SID", purpose: "SMS + WhatsApp send/receive", required: false },
      { name: "TWILIO_AUTH_TOKEN", label: "Twilio Auth Token", purpose: "Twilio API auth", required: false, test_supported: true },
      { name: "TWILIO_PHONE_NUMBER", label: "Twilio Phone Number", purpose: "Default SMS sender", required: false },
      { name: "TWILIO_WHATSAPP_NUMBER", label: "Twilio WhatsApp Number", purpose: "Default WhatsApp sender", required: false },
      { name: "TNZ_API_BASE", label: "TNZ API Base URL", purpose: "TNZ unified messaging gateway", required: false },
      { name: "TNZ_AUTH_TOKEN", label: "TNZ Auth Token", purpose: "TNZ gateway auth", required: false },
      { name: "TNZ_FROM_NUMBER", label: "TNZ From Number", purpose: "TNZ default sender", required: false },
      { name: "BREVO_API_KEY", label: "Brevo (email)", purpose: "Transactional email", required: false, test_supported: true },
    ],
  },
  {
    group: "voice_audio",
    group_label: "Voice & Audio",
    description: "ElevenLabs voice synthesis",
    secrets: [
      { name: "ELEVENLABS_API_KEY", label: "ElevenLabs", purpose: "Voice synthesis for 'Brain' chat", required: false, test_supported: true },
    ],
  },
  {
    group: "data_iot",
    group_label: "Data & IoT",
    description: "Weather, agromonitoring, AIS, mapping",
    secrets: [
      { name: "OPENWEATHERMAP_API_KEY", label: "OpenWeatherMap", purpose: "iot-weather feeds", required: false, test_supported: true },
      { name: "AGROMONITORING_API_KEY", label: "Agromonitoring", purpose: "Soil & crop satellite data", required: false },
      { name: "AISSTREAM_API_KEY", label: "AIS Stream", purpose: "Vessel AIS tracking", required: false },
      { name: "AT_API_KEY", label: "Auckland Transport", purpose: "Public transport data", required: false },
      { name: "VITE_MAPBOX_TOKEN", label: "Mapbox", purpose: "Maps for Voyage / Command", required: false },
    ],
  },
  {
    group: "integrations",
    group_label: "Business Integrations",
    description: "Stripe, Xero, Firecrawl, Stitch, Meshy, Flint",
    secrets: [
      { name: "STRIPE_SECRET_KEY", label: "Stripe", purpose: "Payments & subscriptions", required: false, test_supported: true },
      { name: "XERO_CLIENT_ID", label: "Xero Client ID", purpose: "Accounting integration", required: false },
      { name: "XERO_CLIENT_SECRET", label: "Xero Client Secret", purpose: "Xero OAuth", required: false },
      { name: "FIRECRAWL_API_KEY", label: "Firecrawl", purpose: "Web scraping for compliance scanner", required: false, test_supported: true },
      { name: "STITCH_API_KEY", label: "Stitch (image gen)", purpose: "Stitch image router", required: false },
      { name: "MESHY_API_KEY", label: "Meshy (3D)", purpose: "3D mesh generation", required: false },
      { name: "FLINT_API_KEY", label: "Flint", purpose: "ABM proposal templates", required: false },
    ],
  },
  {
    group: "platform",
    group_label: "Platform Internals",
    description: "Supabase, admin notifications",
    secrets: [
      { name: "SUPABASE_URL", label: "Supabase URL", purpose: "Backend URL (auto-managed)", required: true },
      { name: "SUPABASE_ANON_KEY", label: "Supabase Anon Key", purpose: "Client publishable key (auto-managed)", required: true },
      { name: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase Service Role", purpose: "Server-side privileged key (auto-managed)", required: true },
      { name: "SUPABASE_JWKS", label: "Supabase JWKS", purpose: "JWT verification (auto-managed)", required: true },
      { name: "ADMIN_EMAIL", label: "Admin Email", purpose: "Where admin alerts are sent", required: false },
    ],
  },
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Admin auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return json({ error: "unauthorized" }, 401);

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) return json({ error: "forbidden — admin role required" }, 403);

    // Build status snapshot — presence only, never values
    const groups = CATALOGUE.map((g) => {
      const secrets = g.secrets.map((s) => {
        const value = Deno.env.get(s.name);
        const present = !!value && value.length > 0;
        return {
          name: s.name,
          label: s.label,
          purpose: s.purpose,
          required: s.required,
          docs_url: s.docs_url,
          test_supported: s.test_supported ?? false,
          present,
          length: present ? value!.length : 0,
          masked: present ? `${value!.slice(0, 4)}…${value!.slice(-2)}` : null,
        };
      });
      const required_total = secrets.filter((s) => s.required).length;
      const required_present = secrets.filter((s) => s.required && s.present).length;
      const optional_total = secrets.filter((s) => !s.required).length;
      const optional_present = secrets.filter((s) => !s.required && s.present).length;
      return {
        group: g.group,
        group_label: g.group_label,
        description: g.description,
        secrets,
        required_total,
        required_present,
        optional_total,
        optional_present,
        status: required_total === 0
          ? (optional_present > 0 ? "partial" : "empty")
          : required_present === required_total
            ? "ready"
            : required_present === 0 ? "missing" : "partial",
      };
    });

    const total_secrets = groups.reduce((n, g) => n + g.secrets.length, 0);
    const total_present = groups.reduce(
      (n, g) => n + g.secrets.filter((s) => s.present).length,
      0,
    );

    return json({
      ok: true,
      generated_at: new Date().toISOString(),
      total_secrets,
      total_present,
      groups,
    });
  } catch (e) {
    console.error("admin-secrets-status error:", e);
    return json({ error: e instanceof Error ? e.message : "internal" }, 500);
  }
});
