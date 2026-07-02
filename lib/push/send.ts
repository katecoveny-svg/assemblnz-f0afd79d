/**
 * Web-push sender for the pilot workspace PWAs.
 *
 * Notifications are POINTERS, never content: "new draft reply waiting" plus a
 * URL into the workspace. The draft-only send rules are untouched — a push
 * fires when a draft is QUEUED, and nothing here can send the draft itself.
 *
 * Requires (Vercel env at go-live; see PR body):
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY — also used by the browser to subscribe
 *   VAPID_PRIVATE_KEY            — server-side only
 *   VAPID_SUBJECT                — mailto: contact (defaults to assembl inbox)
 *
 * Missing keys → no-op (never throws): push is best-effort infrastructure.
 */
import 'server-only';
import webpush from 'web-push';
import { getServiceClient } from '@/lib/supabase/service';

export type PushPayload = {
  title: string;
  body: string;
  /** Workspace-relative URL the notification opens. */
  url?: string;
  /** Collapse key so repeat notifications replace, not stack. */
  tag?: string;
};

function vapidConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

let vapidApplied = false;
function ensureVapid(): boolean {
  if (!vapidConfigured()) return false;
  if (!vapidApplied) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:assembl@assembl.co.nz',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
      process.env.VAPID_PRIVATE_KEY as string,
    );
    vapidApplied = true;
  }
  return true;
}

type SubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

/**
 * Send `payload` to every subscription registered for `tenantSlug`.
 * Dead endpoints (404/410) are pruned as we go. Best-effort: returns the
 * number delivered, 0 when push is unconfigured.
 */
export async function sendPushToTenant(tenantSlug: string, payload: PushPayload): Promise<number> {
  if (!ensureVapid()) return 0;

  let rows: SubscriptionRow[] = [];
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('pwa_push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('tenant_slug', tenantSlug);
    if (error || !data) return 0;
    rows = data as SubscriptionRow[];
  } catch {
    return 0; // service creds absent (e.g. local dev without Supabase)
  }
  if (rows.length === 0) return 0;

  const body = JSON.stringify(payload);
  let delivered = 0;
  const dead: string[] = [];

  await Promise.all(
    rows.map(async (row) => {
      try {
        await webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
          body,
        );
        delivered += 1;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) dead.push(row.id);
      }
    }),
  );

  if (dead.length > 0) {
    try {
      await getServiceClient().from('pwa_push_subscriptions').delete().in('id', dead);
    } catch {
      /* pruning is best-effort */
    }
  }

  return delivered;
}
