import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { ASSEMBL_GOLD, ASSEMBL_WARM_GREY } from '@/components/assembl/chrome';
import { CashflowExposure } from '@/components/ops/aironaut/CashflowExposure';
import { cashflowHeadline } from '@/lib/customers/aironaut/money-data';

const serif = "var(--font-display), 'Cormorant Garamond', Georgia, serif";

/**
 * AIRONAUT · cashflow exposure — the deferred-account picture at a glance:
 * what's out to Customs, what's due back, and which week bites. Nested
 * under /ops so it inherits the workspace shell, PWA, and gate.
 */
export default function AironautCashflowPage() {
  const config = getBrandConfig('aironaut');
  if (!config) notFound();
  const accent = config.colours.accent;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
      <Link
        href="/customers/aironaut/ops"
        className="text-[12px] underline-offset-2 hover:underline"
        style={{ color: ASSEMBL_WARM_GREY }}
      >
        ← back to the dashboard
      </Link>

      <h1 className="mt-4 text-3xl md:text-4xl" style={{ fontFamily: serif, fontWeight: 500 }}>
        {cashflowHeadline.out} · {cashflowHeadline.back}
        <span style={{ color: ASSEMBL_GOLD }}>.</span>
      </h1>
      <p className="mt-2 max-w-2xl text-sm" style={{ color: '#3E3C36' }}>
        The deferred account means you bank Customs’ money before your
        customers bank yours. This is that position, week by week, a month
        out — so a short week is a plan, not a surprise.
      </p>

      <div className="mt-8">
        <CashflowExposure accent={accent} />
      </div>
    </div>
  );
}
