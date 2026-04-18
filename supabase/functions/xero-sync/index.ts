import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Xero Sync — calls the Xero API on behalf of a tenant.
 * Auto-refreshes tokens. Body: { tenant_id, action, params? }
 * Actions: get_organisation, list_invoices, list_contacts, create_draft_invoice
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

    const { tenant_id, action, params } = await req.json();
    if (!tenant_id || !action) {
      return new Response(JSON.stringify({ error: "tenant_id and action required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify membership
    const { data: membership } = await supabase
      .from("tenant_members").select("role")
      .eq("user_id", userResp.data.user.id).eq("tenant_id", tenant_id).maybeSingle();
    if (!membership) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Xero token (first org for now)
    const { data: token } = await supabase.from("xero_tokens")
      .select("*").eq("tenant_id", tenant_id).limit(1).maybeSingle();
    if (!token) {
      return new Response(JSON.stringify({ error: "Xero not connected" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Refresh if expired
    let accessToken = token.access_token;
    if (new Date(token.expires_at) <= new Date(Date.now() + 60_000)) {
      const refreshResp = await fetch("https://identity.xero.com/connect/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${Deno.env.get("XERO_CLIENT_ID")}:${Deno.env.get("XERO_CLIENT_SECRET")}`)}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: token.refresh_token,
        }),
      });
      if (!refreshResp.ok) {
        return new Response(JSON.stringify({ error: "token_refresh_failed" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const refreshed = await refreshResp.json();
      accessToken = refreshed.access_token;
      await supabase.from("xero_tokens").update({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
      }).eq("id", token.id);
    }

    const xeroHeaders = {
      Authorization: `Bearer ${accessToken}`,
      "xero-tenant-id": token.xero_tenant_id,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    let result;
    switch (action) {
      case "get_organisation": {
        const r = await fetch("https://api.xero.com/api.xro/2.0/Organisation", { headers: xeroHeaders });
        result = await r.json();
        break;
      }
      case "list_invoices": {
        const where = params?.status ? `?where=Status%3D%3D%22${params.status}%22` : "";
        const r = await fetch(`https://api.xero.com/api.xro/2.0/Invoices${where}`, { headers: xeroHeaders });
        result = await r.json();
        break;
      }
      case "list_contacts": {
        const r = await fetch("https://api.xero.com/api.xro/2.0/Contacts", { headers: xeroHeaders });
        result = await r.json();
        break;
      }
      case "create_draft_invoice": {
        const r = await fetch("https://api.xero.com/api.xro/2.0/Invoices", {
          method: "POST",
          headers: xeroHeaders,
          body: JSON.stringify({ Invoices: [{ ...params, Status: "DRAFT", Type: "ACCREC" }] }),
        });
        result = await r.json();
        break;
      }
      default:
        return new Response(JSON.stringify({ error: `unknown action: ${action}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ ok: true, data: result, org: token.xero_org_name }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("xero-sync error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
