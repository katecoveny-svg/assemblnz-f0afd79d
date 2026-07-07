/**
 * subscribeToBrevoList — add a captured SPARK lead to the single assembl
 * mailing list in Brevo (the ESP already running this stack — the lead-
 * notification leg in ./notify.ts also uses Brevo).
 *
 * Uses Brevo's "create a contact" endpoint with `updateEnabled` so an existing
 * contact is updated rather than erroring, and `listIds` to subscribe them.
 * Only fires when BOTH env vars are set:
 *   - BREVO_API_KEY   the Brevo v3 API key (same key the edge function uses;
 *                     must also be present in the Vercel env for this leg)
 *   - BREVO_LIST_ID   the numeric id of the target list
 *
 * Fail-soft by contract: a lead form must NEVER break because the ESP call
 * failed. We log with a [brevo-list] tag and return a boolean; we never throw.
 * When the env vars are absent this is a no-op, so leads still land in Supabase
 * and the assembl inbox via the other recordLead legs.
 *
 * Caveat (see ./notify.ts): Brevo's "Authorised IPs" setting 401s requests from
 * non-allowlisted IPs. Serverless egress (Vercel) is not allowlisted, so for
 * this direct leg to land, that restriction must be disabled in Brevo — the same
 * fix the lead pipeline needs overall.
 */
import 'server-only';

export interface BrevoLeadInput {
  email?: string | null;
  /** Whether the lead ticked the marketing-consent box. Defaults to true for
   *  the gating wall, where consent is mandatory before capture. */
  consent?: boolean;
  /** Free-form attributes stored on the Brevo contact (e.g. source, tool slug). */
  attributes?: Record<string, unknown>;
  /** Override the target list id (e.g. an Atlas-readiness segment). When unset
   *  the lead lands on the single default assembl list (BREVO_LIST_ID). */
  listId?: number | null;
}

export async function subscribeToBrevoList(input: BrevoLeadInput): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const listIdRaw = process.env.BREVO_LIST_ID;
  const email = input.email?.trim().toLowerCase();
  // A caller-supplied list id wins; otherwise fall back to the default list.
  const listId = Number.isFinite(input.listId) && (input.listId as number) > 0
    ? (input.listId as number)
    : Number(listIdRaw);

  // No-op unless fully configured with a real email, a target list and consent.
  if (!apiKey || !Number.isFinite(listId) || listId <= 0 || !email) return false;
  if (input.consent === false) return false;

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true, // update + (re)subscribe an existing contact, never 400 on dupes
        ...(input.attributes ? { attributes: input.attributes } : {}),
      }),
    });

    // 201 created, 204 updated → success.
    if (res.ok) return true;
    const detail = await res.text().catch(() => '');
    console.error('[brevo-list] subscribe failed', res.status, detail.slice(0, 300));
    return false;
  } catch (error) {
    console.error('[brevo-list] subscribe threw', error instanceof Error ? error.message : error);
    return false;
  }
}
