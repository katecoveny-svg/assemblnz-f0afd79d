'use client';

import type { ReactNode } from 'react';
import { Lato, Space_Mono } from 'next/font/google';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { ShareableToolActions } from '@/components/hapai/ShareableToolActions';

/**
 * DashToolShell — the Dash-branded chrome (canary + charcoal, Lato/Space Mono)
 * for the 2026 viral HAPAI tools. Self-scopes the Dash type system via the
 * `mk-root` class (same approach as the agent marketplace) so it never touches
 * the rest of the site, and reuses the shared ShareableToolActions for share/
 * copy/embed. Existing green tools keep HapaiToolShell — this is opt-in.
 */

const lato = Lato({ subsets: ['latin'], weight: ['400', '700', '900'], variable: '--mk-display', display: 'swap' });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--mk-mono', display: 'swap' });

type DashToolShellProps = {
  eyebrow: string;
  teReo: string;
  title: string;
  intro: string;
  toolPath: string;
  shareTitle: string;
  shareText: string;
  posture: string;
  highlights?: readonly { title: string; body: string }[];
  children: ReactNode;
};

export function DashToolShell({
  eyebrow,
  teReo,
  title,
  intro,
  toolPath,
  shareTitle,
  shareText,
  posture,
  highlights = [],
  children,
}: DashToolShellProps) {
  return (
    <main
      className={`mk-root ${lato.variable} ${spaceMono.variable} min-h-screen bg-[#FFF7EC] px-5 py-10 text-[#3A3832] md:px-10 md:py-14`}
    >
      <div className="mx-auto max-w-[1320px]">
        <Link
          href="/hapai"
          className="mk-mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#8A8678] transition hover:text-[#3A3832]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          HAPAI library
        </Link>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(330px,0.56fr)] lg:items-stretch">
          {/* hero */}
          <div className="relative overflow-hidden rounded-[14px] border border-[#EFEADC] bg-white p-7 shadow-[0_24px_70px_rgba(58,56,50,0.07)] md:p-10">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(255,212,42,0.26), transparent 68%)' }}
              aria-hidden
            />
            <div className="relative">
              <p className="mk-mono text-[11px] font-bold uppercase tracking-[0.24em] text-[#C79B1F]">{eyebrow}</p>
              <p className="mk-mono mt-3 text-[12px] uppercase tracking-[0.18em] text-[#8A8678]">{teReo}</p>
              <h1 className="mt-4 max-w-3xl text-[clamp(2.6rem,5.4vw,4.6rem)] font-black leading-[0.96] tracking-[-0.02em] text-[#3A3832]">
                {title}
              </h1>
              {/* canary pill-dash */}
              <div className="mt-6 h-[10px] w-40 rounded-full bg-[#FFD42A]" aria-hidden />
              <p className="mt-6 max-w-2xl text-[clamp(1.02rem,1.5vw,1.2rem)] leading-relaxed text-[#56544B]">{intro}</p>

              {highlights.length > 0 ? (
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {highlights.map((item) => (
                    <div key={item.title} className="rounded-[10px] border border-[#EFEADC] bg-[#FFF7EC] p-4">
                      <p className="mk-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#C79B1F]">{item.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-[#56544B]">{item.body}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* aside — share + posture, charcoal panel */}
          <aside className="flex flex-col gap-4 rounded-[14px] border border-[#EFEADC] bg-white p-4 shadow-[0_24px_70px_rgba(58,56,50,0.08)]">
            <div className="rounded-[10px] bg-[#3A3832] p-6 text-white">
              <p className="mk-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#FFD42A]">share this</p>
              <p className="mt-3 text-sm leading-relaxed text-white/80">{shareText}</p>
              <div className="mt-5">
                <ShareableToolActions title={shareTitle} text={shareText} path={toolPath} />
              </div>
            </div>
            <div className="rounded-[10px] border border-[#EFEADC] bg-[#FFF7EC] p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#C79B1F]" aria-hidden />
                <div>
                  <p className="mk-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#C79B1F]">draft-only posture</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#56544B]">{posture}</p>
                </div>
              </div>
            </div>
            <p className="mk-mono flex flex-wrap gap-x-3 gap-y-1 px-1 text-[11px] text-[#8A8678]">
              <Link href="/privacy" className="hover:text-[#3A3832]">Privacy</Link>
              <span aria-hidden>·</span>
              <Link href="/legal/terms" className="hover:text-[#3A3832]">Terms</Link>
              <span aria-hidden>·</span>
              <Link href="/legal/disclaimer" className="hover:text-[#3A3832]">Draft-only disclaimer</Link>
            </p>
          </aside>
        </section>

        <section className="mt-6 rounded-[14px] border border-[#EFEADC] bg-white p-3 shadow-[0_24px_70px_rgba(58,56,50,0.06)] md:mt-8 md:p-4">
          <div className="rounded-[10px] border border-[#EFEADC] bg-[#FFF7EC]">{children}</div>
        </section>
      </div>
    </main>
  );
}
