import Link from 'next/link';
import { doOwner } from '@/apps/do/services/owner';
import { enabledPersonalDoPlan } from '@/lib/billing/personal-do-plan';
import { personalDoCustomer } from '@/lib/billing/personal-do-stripe';
import { hasPersonalDoEntitlement } from '@/lib/billing/personal-do-access';
import { BillingActions } from './BillingActions';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Personal DO subscription · assembl', robots: { index: false, follow: false } };
export default async function PersonalDoBilling() {
  const plan = enabledPersonalDoPlan();
  const owner = await doOwner();
  let subscribed = false;
  let canManage = false;
  let unavailable = false;
  if (plan && owner) {
    try { subscribed = await hasPersonalDoEntitlement(owner.id); canManage = !!(await personalDoCustomer(owner.id)); } catch { unavailable = true; }
  }
  return <main id="main-content" className="mx-auto max-w-xl px-6 py-20">
    <Link href="/do/personal">Back to Personal DO</Link>
    <p className="mt-8 font-mono text-xs uppercase tracking-widest">DO by assembl</p>
    <h1 className="my-5 text-4xl">Your Personal DO subscription</h1>
    {!plan ? <p>Personal DO subscriptions are not available yet. You can explore DO and its installation guide.</p> : <>
      <p>{new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(plan.monthlyAmountCents / 100)} per month, {plan.taxTreatment === 'inclusive' ? 'tax included' : 'plus applicable tax, shown at checkout'}.</p>
      <p className="my-5">Up to {plan.requestsPerDay} requests per UTC day and {plan.requestsPerMonth} per UTC month, with one request at a time. A provider budget may pause requests earlier. No automatic overage charges.</p>
      <p className="my-5">Replies are drafts for your review. Nothing is sent, booked or purchased for you. Manage cancellation through secure billing; access continues only while the paid period is current.</p>
      {unavailable ? <p>DO could not check your access. Please try again later.</p> : !owner ? <Link className="btn-primary" href="/login?redirect=%2Fdo%2Fbilling">Sign in to continue</Link> : <BillingActions subscribed={subscribed || canManage} />}
    </>}
  </main>;
}
