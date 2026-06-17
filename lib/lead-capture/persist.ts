/**
 * persistLead — belt-and-braces durable write of every lead to
 * public.lead_inquiries (NOT public.leads — that name belongs to the unrelated
 * CRM pipeline table).
 *
 * Additive: surfaces keep their existing per-form tables. This is the single
 * place to query "every lead, newest first". Fail-soft — a missing table or
 * service key logs and returns false; it never throws and never blocks a form.
 *
 * Uses the service-role client (bypasses RLS) so it works from any route.
 */
import "server-only";
import { getServiceClient } from "@/lib/supabase/service";
import type { NotifyLeadInput } from "./notify";

export async function persistLead(
  input: NotifyLeadInput & { notified?: boolean },
): Promise<boolean> {
  let service: ReturnType<typeof getServiceClient>;
  try {
    service = getServiceClient();
  } catch (err) {
    console.error("[lead-persist]", input.formName, "service client unavailable:", err);
    return false;
  }

  // Normalise fields to a string map so jsonb is clean and queryable.
  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries(input.fields ?? {})) {
    if (v !== undefined && v !== null && String(v).trim() !== "") fields[k] = String(v);
  }

  const { error } = await service.from("lead_inquiries").insert({
    form_name: input.formName,
    email: input.email?.trim().toLowerCase() || null,
    name: input.name?.trim() || null,
    source_url: input.sourceUrl ?? null,
    ip: input.ip ?? null,
    fields,
    notified: input.notified ?? false,
  });

  if (error) {
    console.error("[lead-persist]", input.formName, "insert failed:", error.message);
    return false;
  }
  return true;
}
