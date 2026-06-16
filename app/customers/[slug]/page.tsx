import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import {
  getCustomer,
  caseStudySlugs,
} from '@/lib/customers/customer-permissions';

type Params = { slug: string };

export function generateStaticParams() {
  return caseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const customer = getCustomer(slug);
  if (!customer) return {};
  return {
    title: `${customer.name} — assembl customer story`,
    description: customer.outcome ?? `How ${customer.name} runs assembl.`,
  };
}

export default async function CustomerStoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const customer = getCustomer(slug);
  // Only approved, non-redacted, case-study customers get a page.
  if (!customer || !customer.hasCaseStudy || customer.redacted) notFound();

  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      {/* Headline outcome */}
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container max-w-4xl">
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--assembl-pounamu)]"
          >
            ← All customers
          </Link>
          <div className="mt-8 flex h-12 items-center">
            {customer.logoSrc ? (
              <Image
                src={customer.logoSrc}
                alt={`${customer.name} logo`}
                width={180}
                height={48}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <span className="font-display text-3xl font-light">{customer.name}</span>
            )}
          </div>
          {customer.outcome && (
            <h1 className="mt-7 font-display text-[clamp(2.4rem,4.5vw,3.6rem)] font-light leading-[1.04]">
              {customer.outcome}
            </h1>
          )}
          {customer.tool && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--assembl-pounamu-paper)] px-4 py-2 text-[13px] font-medium text-[color:var(--assembl-pounamu-deep)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--assembl-pounamu)]" aria-hidden />
              {customer.tool}
            </p>
          )}
        </div>
      </section>

      {/* Spokesperson quote */}
      {customer.quote && (
        <section className="border-b border-[rgba(35,33,31,0.08)] py-20 lg:py-24">
          <div className="container max-w-4xl">
            <blockquote className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-light leading-[1.3]">
              “{customer.quote}”
            </blockquote>
            {(customer.spokesperson || customer.spokespersonTitle) && (
              <div className="mt-6 flex items-center gap-4">
                {customer.photoSrc && (
                  <Image
                    src={customer.photoSrc}
                    alt={customer.spokesperson ?? customer.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                )}
                <p className="text-body-md text-[color:var(--text-secondary)]">
                  {customer.spokesperson && (
                    <span className="font-medium text-[color:var(--text-body)]">{customer.spokesperson}</span>
                  )}
                  {customer.spokesperson && customer.spokespersonTitle && <br />}
                  {customer.spokespersonTitle}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* The evidence pack — plain-English first, Mana Receipt as depth detail */}
      <section className="border-b border-[rgba(35,33,31,0.08)] py-20 lg:py-24">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-9 rounded-full bg-[color:var(--assembl-pounamu)]" aria-hidden />
            <span className="font-mono text-eyebrow uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
              The receipt
            </span>
          </div>
          <h2 className="mt-5 font-display text-display-md font-light leading-[1.06]">
            Every output ends in an evidence pack.
          </h2>
          <p className="mt-5 max-w-2xl text-body-lg text-[color:var(--text-body)]">
            That’s a downloadable bundle of files — the sources used, the assumptions made, and the
            named person who signed it off — so {customer.name} can show a regulator, an auditor, or a
            client exactly how an output was reached. (Under the hood we call it a Mana Receipt:
            Ed25519-signed and tamper-evident.)
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="container max-w-4xl text-center">
          <h2 className="font-display text-display-md font-light leading-[1.06]">
            Run a Pilot Sprint like {customer.name}.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-body-md text-[color:var(--text-body)]">
            Two weeks, money-back, proven on your own data. If it works, you’re next on this page.
          </p>
          <Link href="/pilot-sprint" className="cta-primary mt-8 inline-flex h-12 items-center gap-2 px-7">
            Book a Pilot Sprint <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  );
}
