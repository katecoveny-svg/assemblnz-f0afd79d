// ═══════════════════════════════════════════════════════════════
// AAAIP — Audit export API client
// Thin wrapper around the `aaaip-audit-export` Supabase edge
// function. Used by the dashboard's "Send to AAAIP" button to
// ship a complete audit-log payload to the researchers' table.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface AaaipExportPayload {
  domain: string;
  pilotLabel?: string;
  exportedAt: string;
  entries: unknown[];
  aggregates: unknown;
}

export interface AaaipExportResponse {
  ok: true;
  id: string;
  created_at: string;
  stored_entries: number;
  domain: string;
}

export interface AaaipExportError {
  ok: false;
  error: string;
  detail?: string;
}

/**
 * Submit an audit-log payload to the AAAIP researchers' archive.
 * Uses the Supabase JS client so it inherits the project's anon key
 * and CORS handling. Errors are returned, never thrown — callers
 * should surface them to the user via toast.
 */
export async function submitAaaipExport(
  payload: AaaipExportPayload,
): Promise<AaaipExportResponse | AaaipExportError> {
  try {
    const { data, error } = await supabase.functions.invoke<
      AaaipExportResponse | AaaipExportError
    >("aaaip-audit-export", {
      body: payload,
    });

    if (error) {
      return { ok: false, error: "network", detail: error.message };
    }
    if (!data) {
      return { ok: false, error: "empty_response" };
    }
    return data;
  } catch (err) {
    return {
      ok: false,
      error: "client_exception",
      detail: (err as Error).message,
    };
  }
}
