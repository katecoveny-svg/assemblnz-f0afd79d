import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APP_URL = "https://assembl.co.nz";

/**
 * Xero OAuth — Step 2: Exchange code for tokens, store, redirect.
 * Called by Xero with ?code=...&state=...
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  const redirect = (path: string) => Response.redirect(`${APP_URL}${path}`, 302);

  if (errorParam) return redirect(`/workspace/connections?xero=error&reason=${errorParam}`);
  if (!code || !state) return redirect("/workspace/connections?xero=error&reason=missing_params");

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Validate state
    const { data: stateRow } = await supabase
      .from("xero_oauth_state")
      .select("*")
      .eq("state", state)
      .maybeSingle();

    if (!stateRow || new Date(stateRow.expires_at) < new Date()) {
      return redirect("/workspace/connections?xero=error&reason=invalid_state");
    }

    // Cleanup state (one-time use)
    await supabase.from("xero_oauth_state").delete().eq("state", state);

    const clientId = Deno.env.get("XERO_CLIENT_ID")!;
    const clientSecret = Deno.env.get("XERO_CLIENT_SECRET")!;
    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/xero-oauth-callback`;

    // Exchange code for tokens
    const tokenResp = await fetch("https://identity.xero.com/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResp.ok) {
      console.error("Xero token exchange failed:", await tokenResp.text());
      return redirect("/workspace/connections?xero=error&reason=token_exchange");
    }

    const tokens = await tokenResp.json();
    // tokens: { access_token, refresh_token, expires_in, scope, ... }

    // Fetch the connected Xero organisations
    const orgsResp = await fetch("https://api.xero.com/connections", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const orgs = await orgsResp.json();

    if (!Array.isArray(orgs) || orgs.length === 0) {
      return redirect("/workspace/connections?xero=error&reason=no_orgs");
    }

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    const scopes = (tokens.scope || "").split(" ").filter(Boolean);

    // Store one row per Xero org connected to this Assembl tenant
    for (const org of orgs) {
      await supabase.from("xero_tokens").upsert({
        tenant_id: stateRow.tenant_id,
        xero_tenant_id: org.tenantId,
        xero_org_name: org.tenantName,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        scopes,
        connected_by: stateRow.user_id,
      }, { onConflict: "tenant_id,xero_tenant_id" });
    }

    // Update tenant_tool_connections
    await supabase.from("tenant_tool_connections").upsert({
      tenant_id: stateRow.tenant_id,
      provider: "xero",
      provider_label: "Xero",
      status: "connected",
      scopes,
      connected_at: new Date().toISOString(),
      metadata: { orgs: orgs.map((o: any) => ({ id: o.tenantId, name: o.tenantName })) },
    }, { onConflict: "tenant_id,provider" });

    return redirect("/workspace/connections?xero=connected");
  } catch (e) {
    console.error("xero-oauth-callback error:", e);
    return redirect("/workspace/connections?xero=error&reason=server_error");
  }
});
