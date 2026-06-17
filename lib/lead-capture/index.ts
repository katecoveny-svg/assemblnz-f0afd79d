/**
 * recordLead — the one call every lead surface makes.
 *
 * Does both legs of the safety net, independently and fail-soft:
 *   1. notifyLead  → emails assembl@assembl.co.nz (via the proven send-contact-email edge fn)
 *   2. persistLead → writes a durable row to public.lead_inquiries
 *
 * Neither leg can throw into the caller, and the result tells you what landed so
 * the per-form table can be enriched if needed. Existing per-form writes
 * (hapai_leads, electrify_leads, …) are left untouched — this is additive.
 */
import "server-only";
import { notifyLead, type NotifyLeadInput } from "./notify";
import { persistLead } from "./persist";

export type { NotifyLeadInput, LeadFields } from "./notify";
export { notifyLead } from "./notify";
export { persistLead } from "./persist";

export interface RecordLeadResult {
  notified: boolean;
  persisted: boolean;
}

export async function recordLead(input: NotifyLeadInput): Promise<RecordLeadResult> {
  // Notify first so we can record whether the email landed alongside the row.
  const notified = await notifyLead(input);
  const persisted = await persistLead({ ...input, notified });
  return { notified, persisted };
}

/** Best-effort client IP from standard proxy headers. */
export function clientIpFromHeaders(headers: Headers): string | null {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? headers.get("cf-connecting-ip") ?? null;
}
