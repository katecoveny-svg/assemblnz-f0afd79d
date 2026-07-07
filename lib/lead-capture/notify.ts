/**
 * notifyLead — send every site lead to assembl@assembl.co.nz.
 *
 * Reuses the already-deployed `send-contact-email` Supabase edge function
 * (Brevo under the hood, BREVO_API_KEY lives in Supabase secrets). That path is
 * verified working in production, so this helper needs ZERO new env vars beyond
 * the Supabase URL + publishable key already set in Vercel.
 *
 * Fail-soft by contract: a lead form must NEVER break because notification
 * failed. We log loudly with a [lead-notify] tag and return a boolean so callers
 * can record `notified` state, but we never throw.
 */
import "server-only";

export type LeadFields = Record<string, unknown>;

export interface NotifyLeadInput {
  /** Human label for the surface, e.g. "Trust Pack request", "SPARK tool — turf-maintenance". */
  formName: string;
  /** The lead's own email, if the form captured one. Used as reply-to. */
  email?: string | null;
  /** The lead's name, if captured. */
  name?: string | null;
  /** Every other field on the form — rendered into the email body verbatim. */
  fields?: LeadFields;
  /** Page the lead came from. */
  sourceUrl?: string | null;
  /** Best-effort client IP. */
  ip?: string | null;
}

const NOTIFY_INBOX = "assembl@assembl.co.nz";

function nzTimestamp(): string {
  try {
    return new Intl.DateTimeFormat("en-NZ", {
      timeZone: "Pacific/Auckland",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date());
  } catch {
    return new Date().toISOString();
  }
}

function buildMessage(input: NotifyLeadInput): string {
  const lines: string[] = [
    `Form: ${input.formName}`,
    `Time: ${nzTimestamp()} (NZ)`,
  ];
  if (input.name) lines.push(`Name: ${input.name}`);
  if (input.email) lines.push(`Email: ${input.email}`);
  if (input.sourceUrl) lines.push(`Source page: ${input.sourceUrl}`);
  if (input.ip) lines.push(`IP: ${input.ip}`);

  const extras = Object.entries(input.fields ?? {}).filter(
    ([, v]) => v !== undefined && v !== null && String(v).trim() !== "",
  );
  if (extras.length) {
    lines.push("", "Details:");
    for (const [k, v] of extras) lines.push(`  ${k}: ${String(v)}`);
  }
  return lines.join("\n");
}

// The send-contact-email edge function talks to Brevo, which currently has an
// "Authorised IPs" restriction enabled. Supabase edge functions egress from a
// rotating IP pool, so a given attempt has ~50% odds of a 401 from Brevo until
// that restriction is lifted (see PR notes). Retrying a few times turns ~50%
// per-attempt odds into ~94% across 4 tries — a stopgap until Kate disables the
// Brevo IP allowlist. Each retry is cheap and the call is already fail-soft.
const MAX_ATTEMPTS = 4;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Returns true if the notification was accepted by the edge function, false on
 * any failure. Never throws.
 */
export async function notifyLead(input: NotifyLeadInput): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error("[lead-notify]", input.formName, "missing Supabase URL / publishable key — cannot notify");
    return false;
  }

  const payload = JSON.stringify({
    // Subject becomes "New Assembl Contact: <formName>" in the edge function.
    name: input.formName,
    // Reply-to: the lead if we have their email, else our own inbox.
    email: input.email?.trim() || NOTIFY_INBOX,
    message: buildMessage(input),
  });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${url}/functions/v1/send-contact-email`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${key}`,
          apikey: key,
        },
        body: payload,
      });

      if (res.ok) {
        console.log("[lead-notify]", input.formName, `delivered to ${NOTIFY_INBOX} (attempt ${attempt})`);
        return true;
      }

      const body = await res.json().catch(() => ({}));
      console.error("[lead-notify]", input.formName, `attempt ${attempt}/${MAX_ATTEMPTS} failed:`, res.status, body);
    } catch (err) {
      console.error("[lead-notify]", input.formName, `attempt ${attempt}/${MAX_ATTEMPTS} fetch error:`, err);
    }
    if (attempt < MAX_ATTEMPTS) await sleep(250 * attempt);
  }

  console.error("[lead-notify]", input.formName, `gave up after ${MAX_ATTEMPTS} attempts`);
  return false;
}
