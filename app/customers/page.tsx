import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { approvedCustomers } from '@/lib/customers/customer-permissions';

export const metadata: Metadata = {
  title: 'Customers — assembl',
  description:
    'NZ teams running assembl in regulated, high-evidence work. Every name here is shown with written permission.',
};

export const revalidate = 30;

export default function CustomersPage() {
  const customers = approvedCustomers();
  const hasCustomers = customers.length > 0;

  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-9 rounded-full bg-[color:var(--assembl-pounamu)]" aria-hidden />
            <span className="font-mono text-eyebrow uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
              {hasCustomers ? 'Trusted by' : 'First cohort'}
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.6rem,5vw,4rem)] font-light leading-[1.02]">
            Real NZ teams,{' '}
            <span className="text-[color:var(--assembl-pounamu)]">real receipts.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-body-lg text-[color:var(--text-body)]">
            assembl is built for regulated, high-evidence work — construction, hospitality, freight,
            education, the public sector. Every customer named here gave us written permission, with a
            quote they approved and a number we can stand behind. No padding.
          </p>
        </div>
      </section>

      {hasCustomers ? (
        <section className="py-20 lg:py-28">
          <div className="container grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {customers.map((c) => {
              const card = (
                <article className="group flex h-full flex-col rounded-[22px] border border-white/65 bg-[linear-gradient(160deg,rgba(255,255,255,0.55),rgba(255,255,255,0.28))] p-7 backdrop-blur-xl shadow-[0_18px_50px_rgba(40,30,18,0.07),inset_0_1px_0_rgba(255,255,255,0.6)] transition-shadow hover:shadow-[0_34px_80px_rgba(40,30,18,0.14)]">
                  <div className="flex h-12 items-center">
                    {c.redacted ? (
                      <span className="font-display text-xl font-light text-[color:var(--text-secondary)]">
                        Pilot partner
                        <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.18em]">name withheld · NDA</span>
                      </span>
                    ) : c.logoSrc ? (
                      <Image
                        src={c.logoSrc}
                        alt={`${c.name} logo`}
                        width={150}
                        height={44}
                        className="h-11 w-auto object-contain grayscale opacity-60 transition duration-500 group-hover:grayscale-0 group-hover:opacity-100"
                      />
                    ) : (
                      <span className="font-display text-2xl font-light text-[color:var(--text-secondary)] transition-colors group-hover:text-[color:var(--text-body)]">
                        {c.name}
                      </span>
                    )}
                  </div>
                  {c.quote && (
                    <p className="mt-5 text-body-md leading-[1.55] text-[color:var(--text-body)]">“{c.quote}”</p>
                  )}
                  {(c.spokesperson || c.spokespersonTitle) && (
                    <p className="mt-4 text-[13px] text-[color:var(--text-secondary)]">
                      {c.spokesperson && <span className="font-medium text-[color:var(--text-body)]">{c.spokesperson}</span>}
                      {c.spokesperson && c.spokespersonTitle && ' · '}
                      {c.spokespersonTitle}
                    </p>
                  )}
                  {c.outcome && (
                    <p className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-[color:var(--assembl-pounamu-paper)] px-3.5 py-1.5 text-[12px] font-medium text-[color:var(--assembl-pounamu-deep)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--assembl-pounamu)]" aria-hidden />
                      {c.outcome}
                    </p>
                  )}
                  {c.hasCaseStudy && !c.redacted && (
                    <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)] transition-all group-hover:gap-2.5">
                      Read the story <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  )}
                </article>
              );
              return c.hasCaseStudy && !c.redacted ? (
                <Link key={c.slug} href={`/customers/${c.slug}`}>
                  {card}
                </Link>
              ) : (
                <div key={c.slug}>{card}</div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="py-20 lg:py-28">
          <div className="container">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-[22px] border border-white/65 bg-[linear-gradient(160deg,rgba(255,255,255,0.55),rgba(255,255,255,0.28))] p-9 text-center backdrop-blur-xl shadow-[0_18px_50px_rgba(40,30,18,0.07),inset_0_1px_0_rgba(255,255,255,0.6)] sm:p-11">
              <h2 className="font-display text-display-md font-light leading-[1.06]">
                We’re shipping our first cohort.
                <span className="block text-[color:var(--assembl-pounamu)]">Yours could be the first logo here.</span>
              </h2>
              <p className="max-w-xl text-body-md text-[color:var(--text-body)]">
                We don’t put up logos we haven’t earned. A Pilot Sprint is a two-week, money-back run on
                your own data — if it proves out, your name goes here, with your numbers.
              </p>
              <Link href="/pilot-sprint" className="cta-primary mt-1 inline-flex h-12 items-center gap-2 px-7">
                Book a Pilot Sprint <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
