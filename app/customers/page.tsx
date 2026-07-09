import type { Metadata } from 'next';
import Link from 'next/link';
import { TENANTS } from '@/lib/customers/tenants';
import {
  ASSEMBL_GOLD,
  ASSEMBL_INK,
  ASSEMBL_PAPER,
  ASSEMBL_WARM_GREY,
  AssemblMotto,
  AssemblWordmark,
  MatarikiCluster,
  ParticulateBackdrop,
  levitateClass,
} from '@/components/assembl/chrome';
import { HubTenantCard } from '@/components/ops/shared/HubTenantCard';
import { OsMotionField } from '@/components/ops/shared/OsMotion';

// Never indexed. Layout already sets this; kept explicit for clarity.
export const metadata: Metadata = {
  title: 'assembl pilots — demo hub',
  robots: { index: false, follow: false },
};

const serif = "var(--font-display), 'Cormorant Garamond', Georgia, serif";

export default function CustomersHub() {
  const concepts = TENANTS.filter((t) => t.status === 'concept');
  const live = TENANTS.filter((t) => t.status === 'pilot');

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: ASSEMBL_PAPER, color: ASSEMBL_INK }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[440px]">
        <ParticulateBackdrop className="opacity-80" />
      </div>
      <OsMotionField accent={ASSEMBL_GOLD} secondary="#D4A5B0" intensity="soft" />

      <div className="relative mx-auto max-w-5xl px-6 py-20">
        <header className="mb-14">
          <p
            className="text-[10px] uppercase"
            style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}
          >
            <span className="lowercase">assembl</span> · demo
          </p>
          <h1
            className="mt-4 text-5xl lowercase"
            style={{ fontFamily: serif, fontWeight: 500, letterSpacing: '0.01em' }}
          >
            pilot workspaces<span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h1>
          <p
            className="mt-5 max-w-xl text-[15px] leading-relaxed"
            style={{ color: ASSEMBL_WARM_GREY }}
          >
            Private pitch surfaces for named partners. Everything is draft-only.
            Pick a pilot to open its console.
          </p>
        </header>

        {/* Featured products — not /customers tenants: product OSes that pilots
            run on (Alphassembl) or that sit beside the partner demos (Bills). */}
        <section className="mb-14">
          <h2
            className="mb-5 text-[10px] uppercase"
            style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}
          >
            products (2)
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div
              className={['group block rounded-2xl border p-6 shadow-sm', levitateClass].join(' ')}
              style={{
                borderColor: '#1a2e4a',
                background: 'linear-gradient(135deg, #1a2e4a 0%, #22385a 100%)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg" style={{ fontFamily: serif, fontWeight: 600, color: '#fff' }}>
                    Alphassembl
                  </h3>
                  <p className="mt-1 text-xs" style={{ color: '#f59e0b' }}>
                    Kaitiaki bundle · the NZ dog-owner OS
                  </p>
                </div>
                <MatarikiCluster size={24} gold />
              </div>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: '#c7d0dd' }}>
                One system for every part of your dog’s life — Kaiako the force-free trainer,
                grounded in NZ law and welfare. Happy Tails runs on it.
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Link
                  href="/alphassembl"
                  className="text-[10px] uppercase"
                  style={{ letterSpacing: '0.16em', color: '#fff' }}
                >
                  open the landing →
                </Link>
                <Link
                  href="/alphassembl/chat"
                  className="text-[10px] uppercase"
                  style={{ letterSpacing: '0.16em', color: '#f59e0b' }}
                >
                  ask Kaiako →
                </Link>
              </div>
            </div>

            <div
              className={['group block rounded-2xl border p-6 shadow-sm', levitateClass].join(' ')}
              style={{
                borderColor: '#3A7D6E',
                background: 'linear-gradient(135deg, #1F3D38 0%, #2A5A4F 55%, #3A7D6E 100%)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg" style={{ fontFamily: serif, fontWeight: 600, color: '#fff' }}>
                    assembl bills
                  </h3>
                  <p className="mt-1 text-xs" style={{ color: '#9FE0D2' }}>
                    household OS · live parse · NZ price book
                  </p>
                </div>
                <MatarikiCluster size={24} gold />
              </div>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: '#D5E8E3' }}>
                Reads bills, watches the bank, finds cheaper NZ plans, and prepares the switch —
                you approve. Live upload parse + advisor chat on a live provider price book.
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Link
                  href="/bills"
                  className="text-[10px] uppercase"
                  style={{ letterSpacing: '0.16em', color: '#fff' }}
                >
                  open the landing →
                </Link>
                <Link
                  href="/bills/app"
                  className="text-[10px] uppercase"
                  style={{ letterSpacing: '0.16em', color: '#9FE0D2' }}
                >
                  open the console →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {live.length > 0 && (
          <section className="mb-14">
            <h2
              className="mb-5 text-[10px] uppercase"
              style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}
            >
              live pilots ({live.length})
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {live.map((t) => (
                <HubTenantCard key={t.slug} tenant={t} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2
            className="mb-5 text-[10px] uppercase"
            style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}
          >
            concept pilots ({concepts.length})
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {concepts.map((t) => (
              <HubTenantCard key={t.slug} tenant={t} />
            ))}
          </div>
        </section>

        <footer
          className="mt-20 flex flex-col items-center gap-3 border-t pt-8 text-center"
          style={{ borderColor: '#E7E4DA' }}
        >
          <AssemblMotto />
          <p className="text-[11px]" style={{ color: ASSEMBL_WARM_GREY }}>
            powered by <AssemblWordmark /> · {new Date().getFullYear()} · not
            for public distribution
          </p>
        </footer>
      </div>
    </main>
  );
}
