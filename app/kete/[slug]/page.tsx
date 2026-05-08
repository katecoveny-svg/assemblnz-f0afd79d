import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, Minus } from 'lucide-react';
import { KETES, getKete, type KeteSlug } from '@/lib/kete';
import {
  KETE_DETAIL,
  type IndustryKeteDetail,
  type WhanauKeteDetail,
} from '@/lib/kete-detail';
import { ketes as keteImagery } from '@/lib/site-config';
import { VesselTile } from '@/components/site/VesselTile';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return KETES.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kete = KETES.find((k) => k.slug === slug);
  if (!kete) return {};
  const detail = KETE_DETAIL[kete.slug as KeteSlug];
  return {
    title: `${kete.name} — ${kete.industry}`,
    description: detail.heroBody,
  };
}

export default async function KetePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const valid = KETES.find((k) => k.slug === slug);
  if (!valid) notFound();

  const kete = getKete(slug as KeteSlug);
  const detail = KETE_DETAIL[kete.slug];

  if (detail.slug === 'toro') {
    return <ToroPage kete={kete} detail={detail as WhanauKeteDetail} />;
  }

  return <IndustryKetePage kete={kete} detail={detail as IndustryKeteDetail} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Industry kete layout
// ─────────────────────────────────────────────────────────────────────────────

function IndustryKetePage({
  kete,
  detail,
}: {
  kete: ReturnType<typeof getKete>;
  detail: IndustryKeteDetail;
}) {
  const isComingSoon = kete.status === 'coming-soon' || kete.status === 'mothballed';

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Atmospheric layer — locked 16:9 vessel hero, dimmed for legibility */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
          <img
            src={keteImagery[kete.slug].wide}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-[0.22]"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(ellipse at 70% 20%, ${kete.accent}33 0%, transparent 55%), radial-gradient(ellipse at 20% 70%, rgba(184, 178, 168, 0.12) 0%, transparent 55%)`,
          }}
        />
        <div className="container py-20 md:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div>
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: kete.accent }}
                  aria-hidden
                />
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  {kete.industry} · {kete.accentName}
                  {isComingSoon && ' · Coming soon'}
                </span>
              </div>

              <h1 className="mt-6 font-display text-5xl md:text-7xl">
                <span className="text-[color:var(--text-primary)]">{kete.name}</span>{' '}
                <span className="text-gradient-hero">— {detail.heroLead}</span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg text-[color:var(--text-body)] md:text-xl">
                {detail.heroBody}
              </p>

            {!isComingSoon && (
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  Start your pilot
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/pricing"
                  className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  See pricing
                </Link>
              </div>
            )}

            {isComingSoon && (
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  Register your interest
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </div>
            )}

              <p className="mt-6 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                {detail.availableOn}
              </p>
            </div>

            {/* Per-kete vessel — locked render where available, named placeholder otherwise */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <VesselTile
                  slug={kete.slug}
                  name={kete.name}
                  accent={kete.accent}
                  aspect="4/5"
                  priority
                  sizes="(min-width: 1024px) 32vw, (min-width: 640px) 60vw, 90vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflows — only show if there are any */}
      {detail.workflows.length > 0 && (
        <section className="relative">
          <div className="container py-16 md:py-24">
            <div className="mx-auto max-w-3xl">
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                Agents
              </span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">
                What {kete.name} handles
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {detail.workflows.map((wf, i) => (
                <article
                  key={wf.name}
                  className="glass-card relative p-7"
                  style={{ ['--kete-accent' as string]: kete.accent }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[11px] text-[color:var(--text-secondary)]">
                        Agent {String(i + 1).padStart(2, '0')}
                      </p>
                      <h3 className="mt-2 font-display text-2xl text-[color:var(--text-primary)]">
                        {wf.name}
                      </h3>
                    </div>
                    <span
                      className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: kete.accent }}
                      aria-hidden
                    />
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
                    {wf.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {wf.compliance.map((c) => (
                      <span
                        key={c}
                        className="rounded-chip border border-[rgba(35,33,31,0.14)] bg-white/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--text-secondary)]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Comparison */}
      {detail.comparison.length > 0 && (
        <section className="relative">
          <div className="container py-16">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-4xl md:text-5xl">
                {kete.name} vs {detail.comparisonLegacyLabel}
              </h2>
            </div>

            <div className="glass-card mt-10 overflow-x-auto p-2 md:p-4">
              <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">Capability</th>
                    <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-primary)]">{kete.name}</th>
                    <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">{detail.comparisonLegacyLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.comparison.map((row) => (
                    <tr key={row.capability} className="border-t border-[rgba(35,33,31,0.10)]">
                      <td className="px-4 py-4 text-[color:var(--text-primary)]">{row.capability}</td>
                      <td className="px-4 py-4">
                        {row.assembl === true ? (
                          <Check className="h-5 w-5 text-[color:var(--assembl-sage-mist)]" aria-hidden />
                        ) : (
                          <span className="text-sm text-[color:var(--text-body)]">{row.assembl}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-[color:var(--text-secondary)]">
                        {row.legacy === false ? (
                          <Minus className="h-5 w-5" aria-hidden />
                        ) : (
                          <span className="text-sm">{row.legacy}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative">
        <div className="container pb-20 pt-8">
          <div
            className="glass-card-elevated mx-auto max-w-4xl p-8 text-center md:p-12"
            style={{ ['--kete-accent' as string]: kete.accent }}
          >
            <h2 className="font-display text-3xl md:text-4xl">
              {isComingSoon ? `Register your interest in ${kete.name}.` : `Start with ${kete.name}.`}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[color:var(--text-body)]">
              {isComingSoon
                ? 'We will be in touch when this kete is ready for your industry.'
                : 'The Pilot Sprint — NZ$5,000 + GST for two weeks — is the fastest way to see what assembl does for your team.'}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                {isComingSoon ? 'Register interest' : 'Book your pilot'}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              {!isComingSoon && (
                <Link
                  href="/pricing"
                  className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  See full pricing
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tōro (whānau) layout
// ─────────────────────────────────────────────────────────────────────────────

function ToroPage({
  kete,
  detail,
}: {
  kete: ReturnType<typeof getKete>;
  detail: WhanauKeteDetail;
}) {
  return (
    <>
      <section className="relative overflow-hidden">
        {/* Atmospheric layer — sits behind the radial gradient and content */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/lattice-texture.jpg"
            className="absolute inset-0 h-full w-full object-cover opacity-[0.18] motion-reduce:hidden"
          >
            <source src="/video/kete-hero-lattice.mp4" type="video/mp4" />
          </video>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${kete.accent}33 0%, transparent 60%)`,
          }}
        />
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.15)] bg-white/50 px-4 py-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: kete.accent }}
                aria-hidden
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                For whānau · Family tier
              </span>
            </div>

            <h1 className="mt-6 font-display text-5xl md:text-7xl">
              <span className="text-[color:var(--text-primary)]">Tōro</span>
              <br />
              <span className="text-gradient-hero">{detail.heroLead}</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg text-[color:var(--text-body)] md:text-xl">
              {detail.heroBody}
            </p>

            <div className="mt-8 inline-flex items-baseline gap-2">
              <span className="font-display text-5xl text-[color:var(--text-primary)]">
                {detail.price.monthly}
              </span>
              <span className="text-base text-[color:var(--text-secondary)]">
                / month
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              No setup · GST excl. · Cancel any time
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Get started for NZ$29/month
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/pricing"
                className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                See all tiers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              What Tōro does
            </span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Your family&apos;s quiet assistant.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {detail.features.map((f) => (
              <div
                key={f.name}
                className="glass-card relative p-7"
                style={{ ['--kete-accent' as string]: kete.accent }}
              >
                <h3 className="font-display text-2xl text-[color:var(--text-primary)]">
                  {f.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative">
        <div className="container pb-20 pt-8">
          <div
            className="glass-card-elevated mx-auto max-w-4xl p-8 text-center md:p-12"
            style={{ ['--kete-accent' as string]: kete.accent }}
          >
            <h2 className="font-display text-3xl md:text-4xl">
              Tōro is available now at the Family tier.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[color:var(--text-body)]">
              Self-serve via Stripe. NZ$29/month, no setup fee. Cancel any time.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Get started for NZ$29/month
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
