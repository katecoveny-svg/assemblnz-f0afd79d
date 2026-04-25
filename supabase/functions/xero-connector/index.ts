// ============================================================
// ASSEMBL XERO CONNECTOR — Edge Function
// Syncs employees, invoices, contacts from Xero into Assembl
// Deploy as: supabase/functions/xero-connector/index.ts
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const XERO_API_BASE = "https://api.xero.com/api.xro/2.0";
const XERO_PAYROLL_BASE = "https://api.xero.com/payroll.xro/2.0";

// Refresh an expired Xero token
async function refreshXeroToken(
  supabase: any,
  integration: any
): Promise<string> {
  const clientId = Deno.env.get("XERO_CLIENT_ID")!;
  const clientSecret = Deno.env.get("XERO_CLIENT_SECRET")!;

  const response = await fetch("https://identity.xero.com/connect/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: integration.refresh_token,
    }).toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Token refresh failed:", errorBody);

    // Mark integration as expired
    await supabase
      .from("assembl_integrations")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("id", integration.id);

    throw new Error("Token refresh failed — customer needs to reconnect Xero");
  }

  const tokens = await response.json();

  // Update stored tokens
  await supabase
    .from("assembl_integrations")
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(
        Date.now() + tokens.expires_in * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", integration.id);

  return tokens.access_token;
}

// Make an authenticated Xero API call
async function xeroFetch(
  url: string,
  accessToken: string,
  tenantId: string
): Promise<any> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Xero-Tenant-Id": tenantId,
      Accept: "application/json",
    },
  });

  if (response.status === 401) {
    throw new Error("NEEDS_REFRESH");
  }

  if (response.status === 429) {
    // Rate limited — Xero allows 60 calls/minute
    const retryAfter = response.headers.get("Retry-After") || "60";
    throw new Error(`RATE_LIMITED:${retryAfter}`);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Xero API error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

// Sync employees from Xero Payroll NZ
async function syncEmployees(
  supabase: any,
  integration: any,
  accessToken: string
): Promise<number> {
  const data = await xeroFetch(
    `${XERO_PAYROLL_BASE}/Employees`,
    accessToken,
    integration.external_org_id
  );

  const employees = data.Employees || [];
  let count = 0;

  for (const emp of employees) {
    await supabase.from("assembl_synced_data").upsert(
      {
        integration_id: integration.id,
        organisation_id: integration.organisation_id,
        provider_code: "xero",
        data_type: "employees",
        external_id: emp.EmployeeID,
        data: {
          name: `${emp.FirstName} ${emp.LastName}`,
          first_name: emp.FirstName,
          last_name: emp.LastName,
          email: emp.Email,
          role: emp.JobTitle || null,
          status: emp.Status,
          start_date: emp.StartDate,
          date_of_birth: emp.DateOfBirth,
          gender: emp.Gender,
          phone: emp.PhoneNumber || null,
          address: emp.Address || null,
          tax_code: emp.TaxCode || null,
          hourly_rate: emp.OrdinaryEarningsRateID ? null : null, // Would need earnings rates call
          kiwisaver_rate: emp.KiwiSaverEmployeeRate || null,
        },
        is_stale: false,
        synced_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      },
      { onConflict: "integration_id,data_type,external_id" }
    );
    count++;
  }

  return count;
}

// Sync invoices from Xero Accounting
async function syncInvoices(
  supabase: any,
  integration: any,
  accessToken: string
): Promise<number> {
  // Get recent invoices (last 90 days)
  const since = new Date(Date.now() - 90 * 24 * 3600000).toISOString();
  const data = await xeroFetch(
    `${XERO_API_BASE}/Invoices?where=UpdatedDateUTC>DateTime(${encodeURIComponent(since)})&order=UpdatedDateUTC DESC`,
    accessToken,
    integration.external_org_id
  );

  const invoices = data.Invoices || [];
  let count = 0;

  for (const inv of invoices) {
    await supabase.from("assembl_synced_data").upsert(
      {
        integration_id: integration.id,
        organisation_id: integration.organisation_id,
        provider_code: "xero",
        data_type: "invoices",
        external_id: inv.InvoiceID,
        data: {
          invoice_number: inv.InvoiceNumber,
          type: inv.Type, // ACCREC (sales) or ACCPAY (bills)
          contact_name: inv.Contact?.Name,
          contact_id: inv.Contact?.ContactID,
          status: inv.Status,
          amount: inv.Total,
          amount_due: inv.AmountDue,
          amount_paid: inv.AmountPaid,
          currency: inv.CurrencyCode || "NZD",
          date: inv.Date,
          due_date: inv.DueDate,
          reference: inv.Reference,
          line_items: inv.LineItems?.map((li: any) => ({
            description: li.Description,
            quantity: li.Quantity,
            unit_amount: li.UnitAmount,
            amount: li.LineAmount,
            account_code: li.AccountCode,
            tax_type: li.TaxType,
          })),
        },
        is_stale: false,
        synced_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      },
      { onConflict: "integration_id,data_type,external_id" }
    );
    count++;
  }

  return count;
}

// Sync contacts from Xero
async function syncContacts(
  supabase: any,
  integration: any,
  accessToken: string
): Promise<number> {
  const data = await xeroFetch(
    `${XERO_API_BASE}/Contacts?where=IsCustomer=true OR IsSupplier=true&order=Name`,
    accessToken,
    integration.external_org_id
  );

  const contacts = data.Contacts || [];
  let count = 0;

  for (const contact of contacts) {
    await supabase.from("assembl_synced_data").upsert(
      {
        integration_id: integration.id,
        organisation_id: integration.organisation_id,
        provider_code: "xero",
        data_type: "contacts",
        external_id: contact.ContactID,
        data: {
          name: contact.Name,
          email: contact.EmailAddress,
          phone: contact.Phones?.[0]?.PhoneNumber || null,
          is_customer: contact.IsCustomer,
          is_supplier: contact.IsSupplier,
          tax_number: contact.TaxNumber || null,
          default_currency: contact.DefaultCurrency || "NZD",
          outstanding_balance: contact.Balances?.AccountsReceivable?.Outstanding || 0,
          overdue_balance: contact.Balances?.AccountsReceivable?.Overdue || 0,
          address: contact.Addresses?.[0] || null,
          status: contact.ContactStatus,
        },
        is_stale: false,
        synced_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      },
      { onConflict: "integration_id,data_type,external_id" }
    );
    count++;
  }

  return count;
}

// Sync bank account balances
async function syncAccounts(
  supabase: any,
  integration: any,
  accessToken: string
): Promise<number> {
  const data = await xeroFetch(
    `${XERO_API_BASE}/Accounts?where=Type=="BANK"`,
    accessToken,
    integration.external_org_id
  );

  const accounts = data.Accounts || [];
  let count = 0;

  for (const acc of accounts) {
    await supabase.from("assembl_synced_data").upsert(
      {
        integration_id: integration.id,
        organisation_id: integration.organisation_id,
        provider_code: "xero",
        data_type: "bank_accounts",
        external_id: acc.AccountID,
        data: {
          name: acc.Name,
          code: acc.Code,
          type: acc.Type,
          bank_account_number: acc.BankAccountNumber,
          currency: acc.CurrencyCode || "NZD",
          status: acc.Status,
        },
        is_stale: false,
        synced_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      },
      { onConflict: "integration_id,data_type,external_id" }
    );
    count++;
  }

  return count;
}


// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { organisation_id, sync_types } = await req.json();
    // sync_types: array of what to sync, e.g. ['employees', 'invoices', 'contacts']
    // If empty, sync everything

    if (!organisation_id) {
      return new Response(
        JSON.stringify({ error: "organisation_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the Xero integration for this org
    const { data: integration, error: intError } = await supabase
      .from("assembl_integrations")
      .select("*")
      .eq("organisation_id", organisation_id)
      .eq("provider_code", "xero")
      .eq("status", "active")
      .single();

    if (intError || !integration) {
      return new Response(
        JSON.stringify({ error: "No active Xero connection for this organisation" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token needs refresh
    let accessToken = integration.access_token;
    const needsRefresh = integration.token_expires_at &&
      new Date(integration.token_expires_at) < new Date(Date.now() + 5 * 60000);

    if (needsRefresh) {
      accessToken = await refreshXeroToken(supabase, integration);
    }

    // Determine what to sync
    const typesToSync = sync_types && sync_types.length > 0
      ? sync_types
      : ["employees", "invoices", "contacts", "bank_accounts"];

    const startTime = Date.now();
    const results: Record<string, number> = {};
    const errors: string[] = [];

    for (const syncType of typesToSync) {
      try {
        switch (syncType) {
          case "employees":
            results.employees = await syncEmployees(supabase, integration, accessToken);
            break;
          case "invoices":
            results.invoices = await syncInvoices(supabase, integration, accessToken);
            break;
          case "contacts":
            results.contacts = await syncContacts(supabase, integration, accessToken);
            break;
          case "bank_accounts":
            results.bank_accounts = await syncAccounts(supabase, integration, accessToken);
            break;
          default:
            errors.push(`Unknown sync type: ${syncType}`);
        }
      } catch (error) {
        if (error.message === "NEEDS_REFRESH") {
          // Try refresh and retry once
          try {
            accessToken = await refreshXeroToken(supabase, integration);
            // Retry the failed sync type would go here
          } catch (refreshError) {
            errors.push(`Token refresh failed: ${refreshError.message}`);
          }
        } else if (error.message.startsWith("RATE_LIMITED")) {
          errors.push(`Rate limited on ${syncType}. Try again in ${error.message.split(":")[1]}s`);
        } else {
          errors.push(`${syncType}: ${error.message}`);
        }
      }
    }

    const durationMs = Date.now() - startTime;
    const totalRecords = Object.values(results).reduce((a, b) => a + b, 0);

    // Update integration sync status
    await supabase
      .from("assembl_integrations")
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: errors.length > 0 ? "partial" : "success",
        last_sync_error: errors.length > 0 ? errors.join("; ") : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", integration.id);

    // Log the sync
    await supabase.from("assembl_integration_logs").insert({
      integration_id: integration.id,
      organisation_id,
      provider_code: "xero",
      action: `sync_${typesToSync.join("_")}`,
      direction: "inbound",
      status: errors.length > 0 ? "partial" : "success",
      records_processed: totalRecords,
      error_message: errors.length > 0 ? errors.join("; ") : null,
      request_metadata: { types: typesToSync, results },
      duration_ms: durationMs,
    });

    return new Response(
      JSON.stringify({
        success: true,
        organisation: integration.external_org_name,
        synced: results,
        total_records: totalRecords,
        duration_ms: durationMs,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Xero connector error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
