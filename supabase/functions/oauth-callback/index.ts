// ============================================================
// ASSEMBL OAUTH CALLBACK — Edge Function
// Handles the redirect after user authorizes in Xero/Google/etc
// Deploy as: supabase/functions/oauth-callback/index.ts
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Handle denial
    if (error) {
      const appUrl = Deno.env.get("APP_URL") || "https://assembl.co.nz";
      return Response.redirect(
        `${appUrl}/settings/integrations?error=${encodeURIComponent(error)}`,
        302
      );
    }

    if (!code || !state) {
      return new Response("Missing code or state parameter", { status: 400 });
    }

    // Validate state — prevents CSRF
    const { data: oauthState, error: stateError } = await supabase
      .from("assembl_oauth_states")
      .select("*")
      .eq("state", state)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (stateError || !oauthState) {
      return new Response("Invalid or expired OAuth state", { status: 400 });
    }

    // Mark state as used immediately
    await supabase
      .from("assembl_oauth_states")
      .update({ used: true })
      .eq("id", oauthState.id);

    // Get provider config
    const { data: provider } = await supabase
      .from("assembl_integration_providers")
      .select("*")
      .eq("code", oauthState.provider_code)
      .single();

    if (!provider) {
      return new Response("Provider not found", { status: 500 });
    }

    // Exchange code for tokens
    const clientId = Deno.env.get(`${oauthState.provider_code.toUpperCase()}_CLIENT_ID`);
    const clientSecret = Deno.env.get(`${oauthState.provider_code.toUpperCase()}_CLIENT_SECRET`);
    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/oauth-callback`;

    const tokenParams: Record<string, string> = {
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    };

    // PKCE providers send code_verifier instead of client_secret in body
    if (["xero", "google"].includes(oauthState.provider_code) && oauthState.code_verifier) {
      tokenParams.code_verifier = oauthState.code_verifier;
      tokenParams.client_id = clientId!;
    }

    // Build token request
    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    // Most providers want client credentials in Authorization header
    if (clientId && clientSecret) {
      headers["Authorization"] = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
    }

    // Some providers want client_id in body too
    if (!tokenParams.client_id) {
      tokenParams.client_id = clientId!;
      tokenParams.client_secret = clientSecret!;
    }

    const tokenResponse = await fetch(provider.token_url, {
      method: "POST",
      headers,
      body: new URLSearchParams(tokenParams).toString(),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error("Token exchange failed:", errorBody);

      await supabase.from("assembl_integration_logs").insert({
        organisation_id: oauthState.organisation_id,
        provider_code: oauthState.provider_code,
        action: "oauth_token_exchange",
        direction: "inbound",
        status: "error",
        error_message: errorBody,
      });

      const appUrl = Deno.env.get("APP_URL") || "https://assembl.co.nz";
      return Response.redirect(
        `${appUrl}/settings/integrations?error=token_exchange_failed`,
        302
      );
    }

    const tokens = await tokenResponse.json();

    // Extract provider-specific org info
    let externalOrgId = null;
    let externalOrgName = null;

    // Xero: get tenant (organisation) info from connections endpoint
    if (oauthState.provider_code === "xero") {
      try {
        const connectionsRes = await fetch(
          "https://api.xero.com/connections",
          { headers: { Authorization: `Bearer ${tokens.access_token}` } }
        );
        const connections = await connectionsRes.json();
        if (connections.length > 0) {
          externalOrgId = connections[0].tenantId;
          externalOrgName = connections[0].tenantName;
        }
      } catch (e) {
        console.error("Failed to get Xero connections:", e);
      }
    }

    // Google: get user info for org name
    if (oauthState.provider_code === "google") {
      try {
        const userInfoRes = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          { headers: { Authorization: `Bearer ${tokens.access_token}` } }
        );
        const userInfo = await userInfoRes.json();
        externalOrgName = userInfo.name || userInfo.email;
        externalOrgId = userInfo.id;
      } catch (e) {
        console.error("Failed to get Google user info:", e);
      }
    }

    // Calculate token expiry
    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    // Upsert the integration
    await supabase.from("assembl_integrations").upsert(
      {
        organisation_id: oauthState.organisation_id,
        user_id: oauthState.user_id,
        provider_code: oauthState.provider_code,
        status: "active",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt,
        external_org_id: externalOrgId,
        external_org_name: externalOrgName,
        scopes_granted: provider.scopes,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organisation_id,provider_code" }
    );

    // Log success
    await supabase.from("assembl_integration_logs").insert({
      organisation_id: oauthState.organisation_id,
      provider_code: oauthState.provider_code,
      action: "oauth_connected",
      direction: "inbound",
      status: "success",
      request_metadata: {
        external_org_id: externalOrgId,
        external_org_name: externalOrgName,
        scopes: provider.scopes,
      },
    });

    // Redirect back to the app
    const appUrl = Deno.env.get("APP_URL") || "https://assembl.co.nz";
    const redirectPath = oauthState.redirect_after || "/settings/integrations";
    return Response.redirect(`${appUrl}${redirectPath}`, 302);

  } catch (error) {
    console.error("OAuth callback error:", error);
    const appUrl = Deno.env.get("APP_URL") || "https://assembl.co.nz";
    return Response.redirect(
      `${appUrl}/settings/integrations?error=${encodeURIComponent(error.message)}`,
      302
    );
  }
});
