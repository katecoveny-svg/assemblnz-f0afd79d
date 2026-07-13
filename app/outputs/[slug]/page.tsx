import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, Minus } from 'lucide-react';
import {
  OUTPUTS,
  OUTPUT_CHANNELS,
  OUTPUT_GROUPS,
  getOutput,
  outputsForGroup,
  type OutputChannel,
} from '@/lib/outputs/catalogue';
import { SectionReveal } from '@/components/SectionReveal';

type Params = { slug: string };

export function generateStaticParams() {
  return OUTPUTS.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const output = getOutput(slug);
  if (!output) return {};
  const url = `https://www.assembl.co.nz/outputs/${output.slug}`;
  return {
    title: `${output.name} — assembl output`,
    description: output.oneLiner,
    openGraph: {
      title: `${output.name} — assembl output`,
      description: output.oneLiner,
      type: 'article',
      url,
      siteName: 'assembl',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${output.name} — assembl output`,
      description: output.oneLiner,
    },
    alternates: { canonical: url },
  };
}

export default async function OutputDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const output = getOutput(slug);
  if (!output) notFound();

  const meta = OUTPUT_GROUPS[output.group];
  const accent = meta.accent;
  const isKete = output.group !== 'cross-cutting';
  const keteHref = isKete ? `/kete/${output.group}` : '/kete';

  // Related outputs from the same group (excluding this one).
  const related = outputsForGroup(output.group)
    .filter((o) => o.slug !== output.slug)
    .slice(0, 3);

  // schema.org/Service structured data — helps the output page surface in
  // search and gives a clean direct-share preview.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: output.name,
    description: output.oneLiner,
    serviceType: output.type,
    provider: {
      '@type': 'Organization',
      name: 'assembl',
      url: 'https://www.assembl.co.nz',
    },
    areaServed: { '@type': 'Country', name: 'New Zealand' },
    category: `${meta.label} — ${meta.sublabel}`,
    url: `https://www.assembl.co.nz/outputs/${output.slug}`,
    ...(output.frameworks.length
      ? { termsOfService: output.frameworks.join('; ') }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(ellipse at 75% 12%, ${accent}26 0%, transparent 55%)`,
          }}
        />
        <div className="container py-16 lg:py-20">
          <div className="mx-auto max-w-4xl">
            <nav className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              <Link href="/outputs" className="transition hover:text-[color:var(--assembl-pounamu)]">
                Outputs
              </Link>
              <span aria-hidden>/</span>
              <Link
                href={`/outputs?kete=${output.group}`}
                className="transition hover:text-[color:var(--assembl-pounamu)]"
              >
                {meta.label}
              </Link>
            </nav>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span
                className="inline-flex items-center gap-1.5 rounded-chip border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em]"
                style={{ borderColor: `${accent}55`, color: accent }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: accent }}
                  aria-hidden
                />
                {output.type}
              </span>
              {output.toolHref ? (
                <span className="inline-flex items-center gap-1.5 rounded-chip bg-[color:var(--assembl-pounamu-paper)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu-deep)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--assembl-pounamu)]" aria-hidden />
                  Live tool
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 font-display text-display-lg text-[color:var(--text-primary)]">
              {output.name}
            </h1>
            <p className="mt-5 max-w-2xl text-body-lg text-[color:var(--text-body)]">
              {output.oneLiner}
            </p>

            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Produced by{' '}
              <Link
                href={isKete ? keteHref : '/hapai'}
                className="text-[color:var(--text-primary)] underline-offset-2 hover:underline"
              >
                {output.producedBy}
              </Link>
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {output.toolHref ? (
                <>
                  <Link
                    href={output.toolHref}
                    className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
                  >
                    Run this output
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                  <Link
                    href="/pilot-sprint"
                    className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
                  >
                    Run it on your own work
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/pilot-sprint"
                    className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
                  >
                    Run this output in a Pilot Sprint
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                  <Link
                    href={keteHref}
                    className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
                  >
                    See the {meta.label} pack
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Detail body */}
      <section className="relative">
        <div className="container pb-16">
          <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
            <div className="space-y-10">
              <SectionReveal>
                <div>
                  <span className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
                    What it is
                  </span>
                  <p className="mt-4 text-body-md text-[color:var(--text-body)] md:text-body-lg">
                    {output.description}
                  </p>
                </div>
              </SectionReveal>

              {/* What's in the output — honest preview in place of a fabricated sample */}
              <SectionReveal delay={0.05}>
                <div
                  className="rounded-card border bg-white/55 p-6 md:p-7"
                  style={{ borderColor: `${accent}33` }}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                    What&apos;s in the output
                  </span>
                  <ul className="mt-4 space-y-3 text-sm text-[color:var(--text-body)] md:text-[15px]">
                    {output.whatsInside.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Check
                          className="mt-0.5 h-4 w-4 flex-shrink-0"
                          style={{ color: accent }}
                          aria-hidden
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 border-t border-[rgba(35,33,31,0.10)] pt-4 text-[13px] leading-relaxed text-[color:var(--text-secondary)]">
                    Drafted for a named reviewer on your team. Nothing is filed, sent, or
                    lodged until a person approves it.
                  </p>
                </div>
              </SectionReveal>
            </div>

            {/* Sidebar — frameworks + channel matrix */}
            <aside className="space-y-8">
              {output.frameworks.length > 0 ? (
                <SectionReveal delay={0.1}>
                  <div className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 p-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                      Built on
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-body)]">
                      {output.frameworks.map((law) => (
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
              ) : null}

              <SectionReveal delay={0.15}>
                <div className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                    Where it lands
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {OUTPUT_CHANNELS.map((channel) => {
                      const on = output.channels.includes(channel as OutputChannel);
                      return (
                        <li
                          key={channel}
                          className="flex items-center justify-between gap-2 border-b border-[rgba(35,33,31,0.07)] pb-2 last:border-0 last:pb-0"
                        >
                          <span
                            className={
                              on
                                ? 'text-[color:var(--text-primary)]'
                                : 'text-[color:var(--text-secondary)]/60'
                            }
                          >
                            {channel}
                          </span>
                          {on ? (
                            <Check
                              className="h-4 w-4"
                              style={{ color: accent }}
                              aria-label="available"
                            />
                          ) : (
                            <Minus
                              className="h-4 w-4 text-[color:var(--text-secondary)]/40"
                              aria-label="not available"
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </SectionReveal>
            </aside>
          </div>
        </div>
      </section>

      {/* Related outputs */}
      {related.length > 0 ? (
        <section className="relative">
          <div className="container pb-16">
            <div className="mx-auto max-w-4xl">
              <h2 className="font-display text-3xl text-[color:var(--text-primary)] md:text-4xl">
                More from {meta.label}
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/outputs/${r.slug}`}
                    className="kete-card group flex h-full flex-col p-5 transition-transform hover:-translate-y-0.5"
                    style={{ ['--kete-accent' as string]: `${accent}59` }}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
                      {r.type}
                    </span>
                    <h3 className="mt-2 font-display text-xl leading-tight text-[color:var(--text-primary)]">
                      {r.name}
                    </h3>
                    <span
                      className="mt-4 inline-flex items-center font-mono text-[10px] uppercase tracking-[0.18em]"
                      style={{ color: accent }}
                    >
                      View
                      <ArrowRight
                        className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="relative">
        <div className="container pb-24">
          <div
            className="glass-card-elevated mx-auto max-w-4xl p-8 text-center md:p-12"
            style={{ ['--kete-accent' as string]: accent }}
          >
            <h2 className="font-display text-display-md">
              See {output.name.toLowerCase()} drafted on your work.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[color:var(--text-body)]">
              A Founding Pilot Sprint — NZ$1,500 + GST for ten working days — produces this output from your
              real records, reviewed and sealed with an evidence pack.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/pilot-sprint"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Book a Founding Pilot Sprint
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/outputs"
                className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Back to all outputs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
