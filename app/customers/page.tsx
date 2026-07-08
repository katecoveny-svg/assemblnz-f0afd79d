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

// Never indexed. Layout already sets this; kept explicit for clarity.
export const metadata: Metadata = {
  title: 'assembl pilots — demo hub',
  robots: { index: false, follow: false },
};

const serif = "var(--font-display), 'Cormorant Garamond', Georgia, serif";

/**
 * Hub page at `/customers` (i.e. demo.assembl.co.nz/customers).
 *
 * Pure assembl chrome, so it follows DIRECTION-LOCKED-2026-07-01: paper
 * white, the particulate mountain-and-wave landscape, lowercase Cormorant
 * display, tracked micro-labels, cards that levitate on hover with the
 * matariki dot-cluster ornament.
 *
 * Lists every seeded tenant as a card linking through to that tenant's ops
 * console. The list is driven by `lib/customers/tenants.ts` — the canonical
 * in-code registry that mirrors the `tenant_customers` Supabase table. The
 * pilot counts shown are real counts of that registry, never invented.
 */

export default function CustomersHub() {
  const concepts = TENANTS.filter((t) => t.status === 'concept');
  const live = TENANTS.filter((t) => t.status === 'pilot');

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: ASSEMBL_PAPER, color: ASSEMBL_INK }}
    >
      {/* Landscape sits high on the page; content floats over it. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[440px]">
        <ParticulateBackdrop className="opacity-80" />
      </div>

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

        {/* Featured product — Alphassembl (the NZ dog-owner OS, Kaitiaki bundle).
            Not a /customers tenant: it's a product surface at /alphassembl that
            Happy Tails runs on, so it gets its own card linking to the product. */}
        <section className="mb-14">
          <h2
            className="mb-5 text-[10px] uppercase"
            style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}
          >
            products (1)
          </h2>
          <div
            className={[
              'group block rounded-2xl border p-6 shadow-sm',
              levitateClass,
            ].join(' ')}
            style={{ borderColor: '#1a2e4a', background: 'linear-gradient(135deg, #1a2e4a 0%, #22385a 100%)' }}
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
                <TenantCard key={t.slug} tenant={t} />
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
              <TenantCard key={t.slug} tenant={t} />
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

function TenantCard({
  tenant,
}: {
  tenant: (typeof TENANTS)[number];
}) {
  return (
    <Link
      href={`/customers/${tenant.slug}`}
      className={[
        'group block rounded-2xl border bg-white/80 p-6 shadow-sm backdrop-blur-sm hover:shadow-md',
        levitateClass,
        tenant.accentClass ?? 'border-neutral-200',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg" style={{ fontFamily: serif, fontWeight: 600 }}>
          {tenant.displayName}
        </h3>
        <MatarikiCluster size={24} gold={tenant.status === 'pilot'} />
      </div>
      {tenant.parentBrand && (
        <p className="mt-1 text-xs" style={{ color: ASSEMBL_WARM_GREY }}>
          {tenant.parentBrand}
        </p>
      )}
      <p className="mt-3 text-sm leading-relaxed" style={{ color: '#3E3C36' }}>
        {tenant.blurb}
      </p>
      <p
        className="mt-4 text-[10px] uppercase transition-colors"
        style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}
      >
        open ops console →
      </p>
    </Link>
  );
}
