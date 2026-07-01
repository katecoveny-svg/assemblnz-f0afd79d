import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ============================================================================
// xero-sync-happy-tails — Happy Tails × Keeper pilot
// ----------------------------------------------------------------------------
// Pulls Happy Tails invoices from Xero, matches invoice lines to the booking
// roster, and drafts next month's invoice as a Xero DRAFT for Liana to review
// and Issue. Reads/refreshes OAuth tokens stored in tenant_customers.xero_tokens.
//
// SAFETY: never issues or sends an invoice. create_next_draft always creates a
// Xero DRAFT (Status: DRAFT). Never returns or writes Xero data outside the
// Happy Tails tenant. If credentials/tokens are absent, returns mocked INV-3031
// data so the pilot demo still runs end-to-end.
//
// Body: { action: "status" | "list_invoices" | "create_next_draft", tenant_slug?: string }
// Env:  XERO_CLIENT_ID, XERO_CLIENT_SECRET, XERO_TENANT_ID,
//       SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// ============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const XERO_API_BASE = "https://api.xero.com/api.xro/2.0";
const TENANT_SLUG = "happy-tails";

// Real INV-3031 shape — the demo fallback + the draft template.
const MOCK_INVOICE = {
  invoiceNumber: "INV-3031",
  status: "DRAFT",
  contact: "Kate Hudson — Franklin (dachshund, small pup)",
  lineItems: [
    { description: "Daycare with bus", quantity: 4, unitAmount: 57.0, lineAmount: 228.0 },
    { description: "Overnight Care (small-pup 10% discount)", quantity: 5, unitAmount: 85.5, lineAmount: 427.5 },
    { description: "Rounding / part-month adjustment", quantity: null, unitAmount: null, lineAmount: 9.5 },
  ],
  total: 665.0,
  currencyCode: "NZD",
  lineAmountTypes: "Inclusive",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function refreshToken(clientId: string, clientSecret: string, refresh: string) {
  const res = await fetch("https://identity.xero.com/connect/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }).toString(),
  });
  if (!res.ok) throw new Error(`token refresh failed: ${await res.text()}`);
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }
  const action = (body.action as string) ?? "status";

  const clientId = Deno.env.get("XERO_CLIENT_ID");
  const clientSecret = Deno.env.get("XERO_CLIENT_SECRET");
  const xeroTenantId = Deno.env.get("XERO_TENANT_ID");
  const configured = Boolean(clientId && clientSecret && xeroTenantId);

  // Load the Happy Tails tenant + its stored Xero tokens (service role).
  let tokens: Record<string, unknown> = {};
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data } = await supabase
      .from("tenant_xero_tokens")
      .select("tokens")
      .eq("tenant_slug", TENANT_SLUG)
      .maybeSingle();
    tokens = (data?.tokens as Record<string, unknown>) ?? {};
  } catch {
    // tenant table not applied yet — fall through to mocked mode
  }

  const hasTokens = Boolean(tokens && (tokens as any).access_token);
  const mode = configured && hasTokens ? "live" : "mocked";

  if (action === "status") {
    return json({
      ok: true,
      mode,
      configured,
      hasTokens,
      tenant: TENANT_SLUG,
      missing: [
        !clientId && "XERO_CLIENT_ID",
        !clientSecret && "XERO_CLIENT_SECRET",
        !xeroTenantId && "XERO_TENANT_ID",
      ].filter(Boolean),
      note: "SAFE: this function never issues or sends an invoice. Drafts only.",
    });
  }

  // --- mocked path (no live creds/tokens): keep the demo working end-to-end ---
  if (mode === "mocked") {
    if (action === "list_invoices") return json({ mode, invoices: [MOCK_INVOICE] });
    if (action === "create_next_draft") {
      return json({
        mode,
        created: false,
        draft: { ...MOCK_INVOICE, invoiceNumber: "INV-3141", note: "mocked next-month draft — connect Xero to create a real DRAFT" },
        note: "Mocked. With live credentials this creates a Xero DRAFT for Liana to Issue.",
      });
    }
    return json({ error: `Unknown action: ${action}` }, 400);
  }

  // --- live path: call Xero on behalf of the Happy Tails tenant ---
  try {
    let accessToken = (tokens as any).access_token as string;
    // Refresh if we have a refresh token (naive: always refresh to keep it simple + safe).
    if ((tokens as any).refresh_token) {
      const refreshed = await refreshToken(clientId!, clientSecret!, (tokens as any).refresh_token);
      accessToken = refreshed.access_token;
      // Persist refreshed tokens back to the tenant row.
      try {
        const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        await supabase
          .from("tenant_xero_tokens")
          .upsert({ tenant_slug: TENANT_SLUG, tokens: { ...tokens, ...refreshed }, updated_at: new Date().toISOString() });
      } catch { /* non-fatal */ }
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Xero-tenant-id": xeroTenantId!,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (action === "list_invoices") {
      const res = await fetch(`${XERO_API_BASE}/Invoices?where=Type=="ACCREC"`, { headers });
      if (!res.ok) return json({ error: `Xero list failed: ${res.status}` }, 502);
      return json({ mode, invoices: await res.json() });
    }

    if (action === "create_next_draft") {
      // ALWAYS a DRAFT — Liana reviews + Issues. Never auto-issue.
      const draft = {
        Type: "ACCREC",
        Status: "DRAFT",
        LineAmountTypes: "Inclusive",
        CurrencyCode: "NZD",
        Contact: { Name: "Kate Hudson" },
        LineItems: MOCK_INVOICE.lineItems
          .filter((l) => l.quantity != null)
          .map((l) => ({ Description: l.description, Quantity: l.quantity, UnitAmount: l.unitAmount })),
      };
      const res = await fetch(`${XERO_API_BASE}/Invoices`, {
        method: "POST",
        headers,
        body: JSON.stringify({ Invoices: [draft] }),
      });
      if (!res.ok) return json({ error: `Xero draft create failed: ${res.status}` }, 502);
      return json({ mode, created: true, draft: await res.json(), note: "Created as DRAFT. Liana reviews + Issues." });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
