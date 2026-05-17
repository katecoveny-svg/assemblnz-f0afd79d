import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, MessageCircle, Minus } from 'lucide-react';
import { KETES, getKete, type KeteSlug } from '@/lib/kete';
import { agentChatId, agentsForKete } from '@/lib/agents';
import {
  KETE_DETAIL,
  type IndustryKeteDetail,
  type WhanauKeteDetail,
} from '@/lib/kete-detail';
import { VesselTile } from '@/components/site/VesselTile';
import { SectionReveal } from '@/components/SectionReveal';
import { ComplianceChips } from '@/components/site/ComplianceChips';
import { TeReo } from '@/components/site/TeReo';

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
    openGraph: {
      images: [
        {
          url: `/og/og-${kete.slug}.png`,
          width: 1200,
          height: 630,
          alt: `assembl — Mahi that earns its proof, for ${kete.name}.`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`/og/og-${kete.slug}.png`],
    },
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
  const fleetAgents = agentsForKete(kete.slug);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Atmospheric layer — uses kete.heroImage (vessel still-life from
            lib/kete.ts). object-position pins the vessel to the upper third
            so it sits above the headline rather than centring under it.
            Mobile caps the section so the bottom of the vessel doesn't clip
            into the paper-cream void on tall viewports. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
          <img
            src={kete.heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-[0.22]"
            style={{ objectPosition: "50% 35%" }}
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(ellipse at 70% 20%, ${kete.accent}33 0%, transparent 55%), radial-gradient(ellipse at 20% 70%, rgba(184, 178, 168, 0.12) 0%, transparent 55%)`,
          }}
        />
        <div className="container py-24 lg:py-32">
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
                </span>
              </div>

              <h1 className="mt-6 font-display text-display-xl">
                <TeReo className="text-[color:var(--text-primary)]">{kete.name}</TeReo>{' '}
                <span className="text-gradient-hero">— {detail.heroLead}</span>
              </h1>

              <p className="mt-8 max-w-2xl text-body-lg text-[color:var(--text-body)]">
                {detail.heroBody}
              </p>

              <div className="mt-6">
                <ComplianceChips kete={kete.slug} />
              </div>

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

              <p className="mt-6 font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
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

      {/* What this kete does — description + legislation + typical workflows */}
      <section className="relative">
        <div className="container py-24 lg:py-32">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.4fr_0.9fr] lg:gap-16">
            <div>
              <SectionReveal>
                <span className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
                  What this kete does
                </span>
                <h2 className="mt-3 font-display text-display-md">
                  Scope, citations, and the workflows that come with it.
                </h2>
              </SectionReveal>
              <div className="mt-8 space-y-5 text-body-md text-[color:var(--text-body)] md:text-body-lg">
                {detail.description.map((paragraph, i) => (
                  <SectionReveal key={i} delay={i * 0.06}>
                    <p>{paragraph}</p>
                  </SectionReveal>
                ))}
              </div>

              {/* Waihanga-only ATA BIM teaser. Pre-launch — the demo lives
                  behind /pilot-sprint until the /demo/ata page ships. */}
              {kete.slug === 'waihanga' && (
                <SectionReveal delay={0.2}>
                  <div
                    className="mt-10 inline-flex items-center gap-3 rounded-card border border-[rgba(35,33,31,0.10)] bg-white/40 px-5 py-3"
                    style={{ borderColor: `${kete.accent}40` }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: kete.accent }}
                      aria-hidden
                    />
                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                      Coming soon
                    </span>
                    <span className="text-sm text-[color:var(--text-primary)]">
                      ATA BIM Demo —{' '}
                      <Link
                        href="/pilot-sprint"
                        className="text-[color:var(--assembl-pounamu)] underline-offset-2 hover:underline"
                      >
                        request a preview
                      </Link>
                    </span>
                  </div>
                </SectionReveal>
              )}
            </div>

            <aside className="space-y-8">
              <SectionReveal delay={0.1}>
                <div className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                    Grounded in
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-body)]">
                    {detail.legislation.map((law) => (
                      <li key={law} className="flex items-start gap-2">
                        <span
                          className="mt-1 font-mono text-[color:var(--assembl-gold-thread)]"
                          aria-hidden
                        >
                          §
                        </span>
                        <span>{law}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </SectionReveal>

              <SectionReveal delay={0.2}>
                <div
                  className="rounded-card border bg-white/55 p-6"
                  style={{ borderColor: `${kete.accent}33` }}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                    Typical workflows
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-body)]">
                    {detail.typicalWorkflows.map((wf) => (
                      <li key={wf} className="flex items-start gap-2">
                        <span
                          className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: kete.accent }}
                          aria-hidden
                        />
                        <span>{wf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </SectionReveal>
            </aside>
          </div>
        </div>
      </section>

      {/* Chat-explorable fleet */}
      <section className="relative">
        <div className="container pb-16 md:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <SectionReveal>
              <span className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
                Live chat agents
              </span>
              <h2 className="mt-3 font-display text-display-md">
                <TeReo>{kete.name}</TeReo> ships with {fleetAgents.length} specialist agents.
              </h2>
              <p className="mt-5 text-body-md text-[color:var(--text-body)]">
                Each one is grounded in the relevant New Zealand rules, routed through Iho, and closed with a human-reviewed evidence trail.
              </p>
            </SectionReveal>
          </div>

          <div className="mx-auto mt-12 grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fleetAgents.map((agent, i) => (
              <SectionReveal key={agent.slug} delay={i * 0.04}>
                <Link
                  href={`/app/chat?kete=${kete.slug}&agent=${agentChatId(agent)}`}
                  className="kete-card group block h-full p-6 transition-transform hover:-translate-y-0.5"
                  style={{ ['--kete-accent' as string]: `${kete.accent}59` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: kete.accent }}
                        aria-hidden
                      />
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                        {agent.phase ?? 'fleet'}
                      </span>
                    </div>
                    <MessageCircle className="h-4 w-4 text-[color:var(--assembl-pounamu)]" aria-hidden />
                  </div>
                  <h3 className="mt-3 font-display text-2xl text-[color:var(--text-primary)]">
                    {agent.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--text-secondary)]">
                    {agent.role}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                    {agent.oneLiner}
                  </p>
                  <p className="mt-4 text-xs leading-relaxed text-[color:var(--text-secondary)]">
                    Collaborates with {(agent.collaboratesWith ?? ['iho', 'signal']).join(', ')}.
                  </p>
                  <span
                    className="mt-5 inline-flex items-center font-mono text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: kete.accent }}
                  >
                    Open chat
                    <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Auaha public tool */}
      {kete.slug === 'auaha' && (
        <section className="relative">
          <div className="container pb-16 md:pb-24">
            <SectionReveal>
              <a
                href="/hapai/vessel-studio/"
                className="glass-card-elevated group relative block overflow-hidden p-8 text-left md:p-10"
                style={{
                  ['--kete-accent' as string]: '#5B4FA0',
                  borderColor: 'rgba(91,79,160,0.34)',
                  borderTop: '3px solid #5B4FA0',
                }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      'radial-gradient(ellipse at 84% 18%, rgba(91,79,160,0.16) 0%, transparent 48%), linear-gradient(135deg, rgba(91,79,160,0.08), rgba(255,255,255,0.18))',
                  }}
                />
                <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#5B4FA0]">
                      AUAHA · TOOL
                    </p>
                    <h2 className="mt-4 font-display text-display-md text-[color:var(--text-primary)]">
                      Vessel Studio
                    </h2>
                    <p className="mt-5 max-w-2xl text-body-md text-[color:var(--text-body)] md:text-body-lg">
                      Generate evidence-vessel imagery for any kete, any workflow, any campaign. Bring your own fal.ai key. Cormorant typography, pounamu palette, locked brand direction.
                    </p>
                  </div>
                  <span className="inline-flex h-12 items-center justify-center rounded-full bg-[#5B4FA0] px-7 text-sm font-medium text-white transition-transform duration-300 group-hover:translate-x-1 md:text-base">
                    Open Vessel Studio →
                  </span>
                </div>
              </a>
            </SectionReveal>
          </div>
        </section>
      )}

      {/* Workflows — only show if there are any */}
      {detail.workflows.length > 0 && (
        <section className="relative">
          <div className="container py-24 lg:py-32">
            <div className="mx-auto max-w-3xl">
              <span className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
                Sample workflows
              </span>
              <h2 className="mt-3 font-display text-display-md">
                What {kete.name} handles end-to-end
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
                        Workflow {String(i + 1).padStart(2, '0')}
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
              <h2 className="font-display text-display-md">
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

      {/* Pilot Sprint per kete */}
      <section className="relative">
        <div className="container pb-12 pt-4">
          <SectionReveal>
            <div
              className="glass-card-elevated mx-auto max-w-5xl p-8 md:p-12"
              style={{
                ['--kete-accent' as string]: kete.accent,
                borderTop: `3px solid ${kete.accent}`,
              }}
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
                <div className="lg:w-1/3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                    Pilot Sprint for {kete.name}
                  </p>
                  <p
                    className="mt-3 font-display leading-[1] text-[color:var(--text-primary)]"
                    style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 4vw, 3rem)' }}
                  >
                    NZ$5,000{' '}
                    <span className="font-mono text-base text-[color:var(--text-secondary)]">
                      + GST
                    </span>
                  </p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                    Two weeks · One workflow · Money-back if no time saved
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-body-md text-[color:var(--text-body)] md:text-body-lg">
                    {detail.pilotSprintPitch}
                  </p>
                  <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row">
                    <Link
                      href="/contact"
                      className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
                    >
                      Pilot {kete.name}
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                    </Link>
                    <Link
                      href="/pilot-sprint"
                      className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
                    >
                      How a Sprint runs
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative">
        <div className="container pb-20 pt-8">
          <div
            className="glass-card-elevated mx-auto max-w-4xl p-8 text-center md:p-12"
            style={{ ['--kete-accent' as string]: kete.accent }}
          >
            <h2 className="font-display text-display-md">
                  <>Start with <TeReo>{kete.name}</TeReo>.</>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[color:var(--text-body)]">
              The Pilot Sprint — NZ$5,000 + GST for two weeks — is the fastest way to see your mahi drafted, reviewed, and sealed with proof.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Book your pilot
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
                <Link
                  href="/pricing"
                  className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  See full pricing
                </Link>
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
  const fleetAgents = agentsForKete(kete.slug);
  const liveFleetAgents = fleetAgents.filter((agent) => agent.status === 'live');

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
            poster="/images/lattice-texture.webp"
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
        <div className="container py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.15)] bg-white/50 px-4 py-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: kete.accent }}
                aria-hidden
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                For <TeReo title="family">whānau</TeReo> · Family tier
              </span>
            </div>

            <h1 className="mt-6 font-display text-display-xl">
              <TeReo className="text-[color:var(--text-primary)]">Tōro</TeReo>{' '}
              <span className="text-gradient-hero">— {detail.heroLead}</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-body-lg text-[color:var(--text-body)]">
              {detail.heroBody}
            </p>

            <div className="mx-auto mt-6 flex max-w-2xl justify-center">
              <ComplianceChips kete={kete.slug} />
            </div>

            <div className="mt-8 inline-flex items-baseline gap-2">
              <span className="font-display text-display-lg text-[color:var(--text-primary)]">
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

      {/* What Tōro does */}
      <section className="relative">
        <div className="container py-24 lg:py-32">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.4fr_0.9fr] lg:gap-16">
            <div>
              <SectionReveal>
                <span className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
                  What this kete does
                </span>
                <h2 className="mt-3 font-display text-display-md">
                  How <TeReo>Tōro</TeReo> lives in your <TeReo title="family">whānau</TeReo>.
                </h2>
              </SectionReveal>
              <div className="mt-8 space-y-5 text-body-md text-[color:var(--text-body)] md:text-body-lg">
                {detail.description.map((paragraph, i) => (
                  <SectionReveal key={i} delay={i * 0.06}>
                    <p>{paragraph}</p>
                  </SectionReveal>
                ))}
              </div>
            </div>
            <aside>
              <SectionReveal delay={0.1}>
                <div className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                    Grounded in
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-body)]">
                    {detail.legislation.map((law) => (
                      <li key={law} className="flex items-start gap-2">
                        <span
                          className="mt-1 font-mono text-[color:var(--assembl-gold-thread)]"
                          aria-hidden
                        >
                          §
                        </span>
                        <span>{law}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </SectionReveal>
            </aside>
          </div>
        </div>
      </section>

      {/* Sub-plugins — Tōro is delivered as three distinct sub-agents under
          one Family plan. This is the primary structure of the page; the
          six feature blocks below stay as supporting context. */}
      <section className="relative">
        <div className="container pb-12 pt-4 md:pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <SectionReveal>
              <span className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
                Three sub-plugins, one Family plan
              </span>
              <h2 className="mt-3 font-display text-display-md">
                What Tōro ships with.
              </h2>
            </SectionReveal>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {detail.subAgents.map((sub, i) => (
              <SectionReveal key={sub.name} delay={i * 0.06}>
                <article
                  className="glass-card-elevated relative h-full p-7"
                  style={{
                    ['--kete-accent' as string]: kete.accent,
                    borderTop: `3px solid ${kete.accent}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        sub.status === 'live'
                          ? 'inline-flex items-center gap-1.5 rounded-full bg-[color:var(--assembl-pounamu-paper)] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu-deep)]'
                          : 'inline-flex items-center gap-1.5 rounded-full border border-[color:var(--assembl-cloud)] bg-white/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]'
                      }
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            sub.status === 'live'
                              ? 'var(--assembl-pounamu)'
                              : 'var(--assembl-sand)',
                        }}
                        aria-hidden
                      />
                      {sub.statusLabel}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl text-[color:var(--text-primary)]">
                    {sub.name}
                  </h3>
                  <p className="mt-2 text-[15px] italic leading-snug text-[color:var(--text-primary)]">
                    {sub.pitch}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                    {sub.body}
                  </p>
                </article>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Chat-explorable fleet */}
      <section className="relative">
        <div className="container pb-12 pt-4 md:pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <SectionReveal>
              <span className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
                Live chat agents
              </span>
              <h2 className="mt-3 font-display text-display-md">
                Explore Tōro&apos;s working knowledge.
              </h2>
              <p className="mt-5 text-body-md text-[color:var(--text-body)]">
                <TeReo>Tōro</TeReo>, <TeReo title="core">Iho</TeReo>, Signal, and the <TeReo title="family">whānau</TeReo> specialists are live. Each action stays consent-gated and parent-reviewed.
              </p>
            </SectionReveal>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
            {liveFleetAgents.map((agent, i) => (
              <SectionReveal key={agent.slug} delay={i * 0.04}>
                <Link
                  href={`/app/chat?kete=${kete.slug}&agent=${agentChatId(agent)}`}
                  className="glass-card group block h-full p-6"
                  style={{ ['--kete-accent' as string]: kete.accent }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                      {agent.phase ?? 'fleet'}
                    </span>
                    <MessageCircle className="h-4 w-4 text-[color:var(--assembl-pounamu)]" aria-hidden />
                  </div>
                  <h3 className="mt-3 font-display text-2xl text-[color:var(--text-primary)]">
                    {agent.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                    {agent.oneLiner}
                  </p>
                  <span
                    className="mt-5 inline-flex items-center font-mono text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: kete.accent }}
                  >
                    Open chat
                    <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features — supporting context below the three sub-plugin cards */}
      <section className="relative">
        <div className="container pb-16 md:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <SectionReveal>
              <span className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
                Inside the Family plan
              </span>
              <h2 className="mt-3 font-display text-display-md">
                The quieter habits Tōro keeps for you.
              </h2>
            </SectionReveal>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {detail.features.map((f, i) => (
              <SectionReveal key={f.name} delay={i * 0.05}>
                <div
                  className="glass-card relative h-full p-7"
                  style={{ ['--kete-accent' as string]: kete.accent }}
                >
                  <h3 className="font-display text-2xl text-[color:var(--text-primary)]">
                    {f.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                    {f.body}
                  </p>
                </div>
              </SectionReveal>
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
            <h2 className="font-display text-display-md">
              <TeReo>Tōro</TeReo> is available now at the Family tier.
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
