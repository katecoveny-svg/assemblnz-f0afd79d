import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { INDUSTRY_KETES } from '@/lib/kete';
import { KETE_VESSEL_IMAGES } from '@/lib/brand-tokens';
import { PatternBackdrop } from '@/components/pattern-studio/PatternBackdrop';

export const metadata: Metadata = {
  title: 'Start',
  description:
    'Pick an assembl industry pack, pay NZ$3,500/mo + GST, and start onboarding your operator fleet.',
};

const PROMISES = [
  'Tenant provisioned after checkout',
  'Kete fleet activated automatically',
  'Welcome draft lands in your inbox',
] as const;

export default function StartPage() {
  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="relative overflow-hidden border-b border-[rgba(35,33,31,0.10)]">
        <PatternBackdrop
          className="absolute inset-0"
          mode="halftone"
          colorRole="gold"
          opacity={0.3}
          speed={0.5}
          lazyMount={false}
        />
        <div className="container relative z-10 grid min-h-[92vh] items-center gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_460px] lg:py-20">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
              assembl Industry Pack
            </p>
            <h1 className="mt-6 max-w-[12ch] font-display text-[clamp(3.4rem,7vw,6.8rem)] font-light leading-[0.9]">
              Pick your kete. Pay one flat number. Run your business.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-[1.75] text-[color:var(--text-body)] md:text-xl">
              NZ$3,500/mo + GST. No setup fee. Cancel any time. Choose the
              industry kete, create your account, then checkout with Stripe.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/start/signup"
                className="cta-primary inline-flex h-12 items-center justify-center px-8"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#kete-picker"
                className="btn-ghost inline-flex h-12 items-center justify-center px-8"
              >
                Pick a kete
              </a>
            </div>
          </div>

          <aside className="rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/65 p-6 shadow-[0_18px_60px_rgba(35,33,31,0.08)]">
            <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
              Flat monthly pack
            </p>
            <p className="mt-5 font-display text-6xl font-light leading-none">
              NZ$3,500
            </p>
            <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              per month + GST
            </p>
            <div className="mt-8 space-y-3">
              {PROMISES.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-[color:var(--assembl-pounamu)]" aria-hidden />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-2 border-t border-[rgba(35,33,31,0.08)] pt-5">
              <TrustMark icon={ShieldCheck} label="Stripe" />
              <TrustMark icon={Sparkles} label="Kete" />
              <TrustMark icon={Mail} label="Inbox" />
            </div>
          </aside>
        </div>
      </section>

      <section id="kete-picker" className="py-16 md:py-24">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
                Kete picker
              </p>
              <h2 className="mt-4 font-display text-5xl font-light leading-none md:text-6xl">
                Choose your first operating loop.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[color:var(--text-secondary)]">
              Tōro is excluded here because it is the consumer product. These
              are the eight business industry kete.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INDUSTRY_KETES.map((kete) => (
              <Link
                key={kete.slug}
                href={`/start/signup?kete=${kete.slug}`}
                className="group flex min-h-[360px] flex-col overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/65 transition-colors hover:bg-white"
                style={{ '--kete-accent': kete.accent } as CSSProperties}
              >
                <div className="relative aspect-[4/3] bg-[color:var(--assembl-cloud)]">
                  <Image
                    src={KETE_VESSEL_IMAGES[kete.slug]}
                    alt={`${kete.name} vessel`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-1"
                    style={{ backgroundColor: kete.accent }}
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--kete-accent)]">
                    {kete.industry}
                  </p>
                  <h3 className="mt-3 font-display text-4xl font-light leading-none">
                    {kete.name}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-[color:var(--text-body)]">
                    {kete.tagline}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--kete-accent)]">
                    Get Started
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function TrustMark({
  icon: Icon,
  label,
}: {
  icon: typeof ShieldCheck;
  label: string;
}) {
  return (
    <div className="rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] px-3 py-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-[color:var(--assembl-pounamu)]" aria-hidden />
      <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
        {label}
      </p>
    </div>
  );
}
