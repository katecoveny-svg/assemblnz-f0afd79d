import { redirect } from 'next/navigation';

// One canonical pricing page. /pricing now points at the marketplace ladder
// (Free / $9.99 / $199 / $250 all-access) at /agents/pricing — the single source
// of truth. The old Pilot Sprint / Pack / Outcome page is retired (2026-06-27
// pricing sweep).
export default function PricingPage() {
  redirect('/agents/pricing');
}
