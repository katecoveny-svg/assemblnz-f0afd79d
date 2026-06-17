/**
 * subscribeToKlaviyo — push a captured lead onto the single assembl mailing list.
 *
 * Uses Klaviyo's consent-aware "subscribe profiles" bulk job so the opt-in is
 * recorded against the profile (required for marketing email under the Privacy
 * Act / Klaviyo's own consent rules). Only fires when BOTH env vars are set:
 *   - KLAVIYO_API_KEY   private API key (pk_…)
 *   - KLAVIYO_LIST_ID   the target list id
 *
 * Fail-soft by contract: a lead form must NEVER break because the ESP call
 * failed. We log with a [klaviyo] tag and return a boolean; we never throw. When
 * the env vars are absent this is a no-op, so leads still land in Supabase and
 * the assembl inbox via the other recordLead legs.
 */
import 'server-only';

// Pin the API revision so Klaviyo schema changes can't silently break us.
const KLAVIYO_REVISION = '2024-10-15';

export interface KlaviyoLeadInput {
  email?: string | null;
  /** Whether the lead ticked the marketing-consent box. Defaults to true for
   *  the gating wall, where consent is mandatory before capture. */
  consent?: boolean;
  /** Free-form properties stored on the Klaviyo profile (e.g. tool slug). */
  properties?: Record<string, unknown>;
}

export async function subscribeToKlaviyo(input: KlaviyoLeadInput): Promise<boolean> {
  const apiKey = process.env.KLAVIYO_API_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;
  const email = input.email?.trim().toLowerCase();

  // No-op unless fully configured with a real email and granted consent.
  if (!apiKey || !listId || !email) return false;
  if (input.consent === false) return false;

  const profile: Record<string, unknown> = {
    type: 'profile',
    attributes: {
      email,
      subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } },
      ...(input.properties ? { properties: input.properties } : {}),
    },
  };

  try {
    const res = await fetch(
      'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs',
      {
        method: 'POST',
        headers: {
          Authorization: `Klaviyo-API-Key ${apiKey}`,
          revision: KLAVIYO_REVISION,
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            type: 'profile-subscription-bulk-create-job',
            attributes: {
              custom_source: 'HAPAI tool',
              profiles: { data: [profile] },
            },
            relationships: { list: { data: { type: 'list', id: listId } } },
          },
        }),
      },
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[klaviyo] subscribe failed', res.status, detail.slice(0, 300));
      return false;
    }
    return true;
  } catch (error) {
    console.error('[klaviyo] subscribe threw', error instanceof Error ? error.message : error);
    return false;
  }
}
