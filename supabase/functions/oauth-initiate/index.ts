// ============================================================
// ASSEMBL OAUTH INITIATE — Edge Function
// Starts the OAuth flow for any provider
// Deploy as: supabase/functions/oauth-initiate/index.ts
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64url } from "https://deno.land/std@0.168.0/encoding/base64url.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate cryptographically random string
function generateRandom(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64url(array);
}

// Generate PKCE code verifier and challenge
async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifier = generateRandom(32);
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const challenge = base64url(new Uint8Array(digest));
  return { verifier, challenge };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify the user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { provider_code, organisation_id } = await req.json();

    if (!provider_code || !organisation_id) {
      return new Response(
        JSON.stringify({ error: "provider_code and organisation_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get provider config
    const { data: provider, error: providerError } = await supabase
      .from("assembl_integration_providers")
      .select("*")
      .eq("code", provider_code)
      .eq("is_active", true)
      .single();

    if (providerError || !provider) {
      return new Response(
        JSON.stringify({ error: `Provider '${provider_code}' not found or inactive` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (provider.auth_type !== "oauth2") {
      return new Response(
        JSON.stringify({ error: `Provider '${provider_code}' uses ${provider.auth_type}, not OAuth` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate state and PKCE
    const state = generateRandom(32);
    const pkce = await generatePKCE();

    // Store state for verification during callback
    await supabase.from("assembl_oauth_states").insert({
      state,
      user_id: user.id,
      organisation_id,
      provider_code,
      code_verifier: pkce.verifier,
      redirect_after: `/settings/integrations?connected=${provider_code}`,
    });

    // Build the redirect URL
    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/oauth-callback`;

    // Get client ID from secrets (provider-specific)
    const clientId = Deno.env.get(`${provider_code.toUpperCase()}_CLIENT_ID`);
    if (!clientId) {
      return new Response(
        JSON.stringify({ error: `${provider_code} client ID not configured` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build authorization URL
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: provider.scopes.join(" "),
      state,
    });

    // Add PKCE for providers that support it (Xero, Google)
    if (["xero", "google"].includes(provider_code)) {
      params.set("code_challenge", pkce.challenge);
      params.set("code_challenge_method", "S256");
    }

    // Provider-specific params
    if (provider_code === "google") {
      params.set("access_type", "offline");
      params.set("prompt", "consent");
    }

    const authUrl = `${provider.auth_url}?${params.toString()}`;

    return new Response(
      JSON.stringify({ auth_url: authUrl, state }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("OAuth initiate error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
