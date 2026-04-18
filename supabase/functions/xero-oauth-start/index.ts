import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Xero OAuth — Step 1: Generate auth URL
 * Body: { tenant_id: string, return_url?: string }
 * Returns: { auth_url: string }
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const userResp = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (userResp.error || !userResp.data.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userResp.data.user;

    const { tenant_id, return_url } = await req.json();
    if (!tenant_id) {
      return new Response(JSON.stringify({ error: "tenant_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user is admin/manager of this tenant
    const { data: membership } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    if (!membership || !["admin", "manager"].includes(membership.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientId = Deno.env.get("XERO_CLIENT_ID");
    if (!clientId) {
      return new Response(JSON.stringify({ error: "Xero not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate CSRF state and store
    const state = crypto.randomUUID() + "-" + crypto.randomUUID();
    await supabase.from("xero_oauth_state").insert({
      state, tenant_id, user_id: user.id, return_url: return_url || null,
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const redirectUri = `${supabaseUrl}/functions/v1/xero-oauth-callback`;

    const scopes = [
      "openid", "profile", "email", "offline_access",
      "accounting.transactions", "accounting.contacts",
      "accounting.settings.read", "accounting.reports.read",
    ].join(" ");

    const authUrl = new URL("https://login.xero.com/identity/connect/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("state", state);

    return new Response(JSON.stringify({ auth_url: authUrl.toString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("xero-oauth-start error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
