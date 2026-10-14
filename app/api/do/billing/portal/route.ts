import { doOwner, privateDoHeaders, sameDoOrigin } from '@/apps/do/services/owner';
import { personalDoCustomer, personalDoStripePlan } from '@/lib/billing/personal-do-stripe';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const json = (body: unknown, status: number) => Response.json(body, { status, headers: privateDoHeaders });
  if (!sameDoOrigin(request)) return json({ error: 'origin_not_allowed' }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: 'sign_in_required' }, 401);
  try {
    const { stripe } = await personalDoStripePlan();
    const customer = await personalDoCustomer(owner.id);
    if (!customer) return json({ error: 'billing_account_missing' }, 404);
    const session = await stripe.billingPortal.sessions.create({ customer, return_url: `${new URL(request.url).origin}/do/personal` });
    return json({ url: session.url }, 200);
  } catch { return json({ error: 'billing_unavailable' }, 503); }
}
