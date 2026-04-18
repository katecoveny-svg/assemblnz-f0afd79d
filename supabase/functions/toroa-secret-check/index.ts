import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Tōro Secret Check — reports which runtime secrets are configured.
 * Returns { name: string, set: boolean } for each key the Tōro
 * workflow depends on. No secret values are ever exposed.
 */

const REQUIRED_SECRETS = [
  "TNZ_AUTH_TOKEN",
  "TNZ_API_BASE",
  "TNZ_FROM_NUMBER",
  "STRIPE_SECRET_KEY",
  "BREVO_API_KEY",
  "LOVABLE_API_KEY",
  "AT_API_KEY",
  "OPENWEATHERMAP_API_KEY",
  "ELEVENLABS_API_KEY",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const results = REQUIRED_SECRETS.map((name) => ({
    name,
    set: !!Deno.env.get(name),
  }));

  const allSet = results.every((r) => r.set);

  return new Response(
    JSON.stringify({ ok: allSet, secrets: results }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
