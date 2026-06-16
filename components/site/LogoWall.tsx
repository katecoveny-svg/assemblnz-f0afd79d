'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { approvedCustomers, type Customer } from '@/lib/customers/customer-permissions';

/**
 * LogoWall — the home-page "trusted by" social-proof band.
 *
 * Data comes only from `approvedCustomers()`, so the wall can show nothing it
 * doesn't have written permission for. Three states, all honest:
 *   • 0 approved  → an invitation ("yours could be the first logo here")
 *   • 1–2 approved → a centred, un-padded row (no filler logos)
 *   • 3+ approved → 3 visible, expandable to 6; a no-autoplay carousel on mobile
 *
 * Brand: cream paper, pounamu accent, logos desaturated at 60% → full colour on
 * hover so the cards read "trusted by", not "endorsed by".
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, margin: '-12% 0px -12% 0px' } as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const GLASS =
  'rounded-[22px] border border-white/65 bg-[linear-gradient(160deg,rgba(255,255,255,0.55),rgba(255,255,255,0.28))] ' +
  'backdrop-blur-xl shadow-[0_18px_50px_rgba(40,30,18,0.07),inset_0_1px_0_rgba(255,255,255,0.6)]';

function Eyebrow({ label }: { label: string }) {
  return (
    <motion.div variants={item} className="mb-5 flex items-center gap-3">
      <span className="h-[2px] w-9 rounded-full bg-[color:var(--assembl-pounamu)]" aria-hidden />
      <span className="font-mono text-eyebrow uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
        {label}
      </span>
    </motion.div>
  );
}

/** A customer's mark: their supplied logo, or a clean text logotype fallback. */
function Logotype({ customer }: { customer: Customer }) {
  if (customer.redacted) {
    return (
      <span className="font-display text-xl font-light text-[color:var(--text-secondary)]">
        Pilot partner
        <span className="ml-2 align-middle font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          name withheld · NDA
        </span>
      </span>
    );
  }
  if (customer.logoSrc) {
    return (
      <Image
        src={customer.logoSrc}
        alt={`${customer.name} logo`}
        width={150}
        height={44}
        className="h-11 w-auto object-contain grayscale opacity-60 transition duration-500 group-hover:grayscale-0 group-hover:opacity-100"
      />
    );
  }
  // Honest text logotype — used until a real logo file is supplied.
  return (
    <span className="font-display text-2xl font-light tracking-[-0.01em] text-[color:var(--text-secondary)] transition-colors duration-500 group-hover:text-[color:var(--text-body)]">
      {customer.name}
    </span>
  );
}

function CustomerCard({ customer }: { customer: Customer }) {
  const inner = (
    <>
      <div className="flex h-12 items-center">
        <Logotype customer={customer} />
      </div>
      {customer.quote && (
        <p className="mt-5 text-body-md leading-[1.55] text-[color:var(--text-body)]">
          “{customer.quote}”
        </p>
      )}
      {(customer.spokesperson || customer.spokespersonTitle) && (
        <p className="mt-4 text-[13px] text-[color:var(--text-secondary)]">
          {customer.spokesperson && (
            <span className="font-medium text-[color:var(--text-body)]">{customer.spokesperson}</span>
          )}
          {customer.spokesperson && customer.spokespersonTitle && ' · '}
          {customer.spokespersonTitle}
        </p>
      )}
      {customer.outcome && (
        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--assembl-pounamu-paper)] px-3.5 py-1.5 text-[12px] font-medium text-[color:var(--assembl-pounamu-deep)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--assembl-pounamu)]" aria-hidden />
          {customer.outcome}
        </p>
      )}
      {customer.hasCaseStudy && !customer.redacted && (
        <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)] transition-all group-hover:gap-2.5">
          Read the story <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      )}
    </>
  );

  const className = `group flex h-full flex-col p-7 ${GLASS}`;

  if (customer.hasCaseStudy && !customer.redacted) {
    return (
      <Link href={`/customers/${customer.slug}`} className={`${className} transition-shadow hover:shadow-[0_34px_80px_rgba(40,30,18,0.14)]`}>
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
}

/** Empty state — confident invitation, not an apology. Doubles as a CTA. */
function Invitation() {
  return (
    <motion.div
      variants={item}
      className={`mx-auto flex max-w-3xl flex-col items-center gap-5 p-9 text-center sm:p-11 ${GLASS}`}
    >
      <h3 className="font-display text-display-md font-light leading-[1.06]">
        We’re shipping our first cohort.
        <span className="block text-[color:var(--assembl-pounamu)]">Yours could be the first logo here.</span>
      </h3>
      <p className="max-w-xl text-body-md text-[color:var(--text-body)]">
        assembl is new and we don’t put up logos we haven’t earned. A Pilot Sprint is a
        two-week, money-back run on your own data — if it proves out, your name goes here, with
        your numbers.
      </p>
      <Link href="/pilot-sprint" className="cta-primary mt-1 inline-flex h-12 items-center gap-2 px-7">
        Book a Pilot Sprint <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </motion.div>
  );
}

export function LogoWall() {
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(false);

  const customers = approvedCustomers();
  const hasCustomers = customers.length > 0;
  const visible = expanded ? customers.slice(0, 6) : customers.slice(0, 3);
  const canExpand = customers.length > 3 && !expanded;

  return (
    <section
      aria-label="Customers and pilot partners"
      className="border-b border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] py-24 lg:py-32"
    >
      <div className="container">
        <motion.div
          variants={container}
          initial={reduce ? false : 'hidden'}
          whileInView={reduce ? undefined : 'show'}
          viewport={VIEWPORT}
        >
          <Eyebrow label={hasCustomers ? 'Trusted by' : 'First cohort'} />
          <motion.h2 variants={item} className="max-w-3xl font-display text-display-lg font-light leading-[1.02]">
            {hasCustomers ? (
              <>
                Real NZ teams,{' '}
                <span className="text-[color:var(--assembl-pounamu)]">real receipts.</span>
              </>
            ) : (
              <>
                Proof you can{' '}
                <span className="text-[color:var(--assembl-pounamu)]">check.</span>
              </>
            )}
          </motion.h2>
          <motion.p variants={item} className="mt-6 max-w-2xl text-body-lg text-[color:var(--text-body)]">
            {hasCustomers
              ? 'Each logo is a customer who gave us written permission to name them — with a quote they approved and a number we can stand behind.'
              : 'We only show customers who’ve told us, in writing, that we can. Right now that list is empty — and we’d rather say so than pad it.'}
          </motion.p>

          {!hasCustomers ? (
            <div className="mt-12">
              <Invitation />
            </div>
          ) : (
            <>
              {/* Mobile: no-autoplay snap carousel. Desktop: grid. */}
              <motion.div
                variants={container}
                className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3"
              >
                {visible.map((c) => (
                  <motion.div
                    key={c.slug}
                    variants={item}
                    className="min-w-[80%] snap-start sm:min-w-[60%] md:min-w-0"
                  >
                    <CustomerCard customer={c} />
                  </motion.div>
                ))}
              </motion.div>

              {canExpand && (
                <motion.div variants={item} className="mt-8">
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    aria-expanded={expanded}
                    className="btn-ghost inline-flex h-11 items-center gap-2 px-6"
                  >
                    See more customers
                  </button>
                </motion.div>
              )}

              <motion.div variants={item} className="mt-10">
                <Link
                  href="/customers"
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)] transition-all hover:gap-2.5"
                >
                  See all customers <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
