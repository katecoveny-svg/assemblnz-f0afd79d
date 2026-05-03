// TEMPORARY — delete immediately after use.
// Returns Deno.env values for the requested secret names.
// Gated by SUPABASE_SERVICE_ROLE_KEY in Authorization: Bearer <key>.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

const ALLOWED = new Set([
  "LOVABLE_API_KEY",
  "ANTHROPIC_API_KEY",
  "BREVO_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "TNZ_AUTH_TOKEN",
  "TNZ_API_BASE",
  "TNZ_FROM_NUMBER",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_WHATSAPP_FROM",
  "TWILIO_PHONE_NUMBER",
  "XERO_CLIENT_ID",
  "XERO_CLIENT_SECRET",
  "VITE_MAPBOX_TOKEN",
  "ADMIN_EMAIL",
  "ELEVENLABS_API_KEY",
  "OPENAI_API_KEY",
  "GEMINI_API_KEY",
  "PERPLEXITY_API_KEY",
  "RESEND_API_KEY",
  "FAL_KEY",
  "RUNWAY_API_KEY",
  "BUFFER_ACCESS_TOKEN",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ANON_KEY",
  "SUPABASE_URL",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const ONE_TIME = "rb_8f3a91c4e7d2_TEMP_DELETE_ME";
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${ONE_TIME}`) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let names: string[] = [];
  try {
    const body = await req.json();
    names = Array.isArray(body?.names) ? body.names : [];
  } catch {
    names = Array.from(ALLOWED);
  }
  if (names.length === 0) names = Array.from(ALLOWED);

  const out: Record<string, string | null> = {};
  for (const n of names) {
    if (!ALLOWED.has(n)) { out[n] = "NOT_ALLOWED"; continue; }
    const v = Deno.env.get(n);
    out[n] = v ?? null;
  }

  return new Response(JSON.stringify({ secrets: out, warning: "Delete this function immediately." }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
