'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { ShareableToolActions } from '@/components/hapai/ShareableToolActions';

/**
 * DashToolShell — now on the ONE SPARK canon (2026-07-17): the same pearl
 * ground, display-serif hero and mono eyebrows as HapaiToolShell, so the
 * config-driven tools read as the same family as every other free tool.
 * The old self-scoped Dash type system (Lato-black + Space Mono via
 * `mk-root`) is retired — that was the "totally different" look.
 */

type DashToolShellProps = {
  eyebrow: string;
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
      className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f3f5f3_54%,#ffffff_100%)] px-5 py-10 text-[#313c42] md:px-10 md:py-14"
    >
      <div className="mx-auto max-w-[1320px]">
        <Link
          href="/hapai"
          className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[#6B6661] transition hover:text-[#313c42]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          SPARK library
        </Link>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(330px,0.56fr)] lg:items-stretch">
          {/* hero */}
          <div className="relative overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white p-7 shadow-[0_24px_70px_rgba(58,56,50,0.07)] md:p-10">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(191,163,122,0.26), transparent 68%)' }}
              aria-hidden
            />
            <div className="relative">
              <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[#313c42]">{eyebrow}</p>
              <h1 className="mt-4 max-w-5xl font-display text-[clamp(3.4rem,7vw,7.2rem)] font-light leading-[0.88] text-[#313c42]">
                {title}
              </h1>
              <p className="mt-6 max-w-2xl text-[clamp(1.02rem,1.5vw,1.2rem)] leading-relaxed text-[#56544B]">{intro}</p>

              {highlights.length > 0 ? (
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {highlights.map((item) => (
                    <div key={item.title} className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#ffffff] p-4">
                      <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[#313c42]">{item.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-[#56544B]">{item.body}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* aside — share + posture, charcoal panel */}
          <aside className="flex flex-col gap-4 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white p-4 shadow-[0_24px_70px_rgba(58,56,50,0.08)]">
            <div className="rounded-[8px] bg-[#313c42] p-6 text-white">
              <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#b8964f]">share this</p>
              <p className="mt-3 text-sm leading-relaxed text-white/80">{shareText}</p>
              <div className="mt-5">
                <ShareableToolActions title={shareTitle} text={shareText} path={toolPath} />
              </div>
            </div>
            <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#ffffff] p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#b8964f]" aria-hidden />
                <div>
                  <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#b8964f]">draft-only posture</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#56544B]">{posture}</p>
                </div>
              </div>
            </div>
            <p className="flex flex-wrap gap-x-3 gap-y-1 px-1 font-mono text-[12px] text-[#6B6661]">
              <Link href="/privacy" className="hover:text-[#313c42]">Privacy</Link>
              <span aria-hidden>·</span>
              <Link href="/legal/terms" className="hover:text-[#313c42]">Terms</Link>
              <span aria-hidden>·</span>
              <Link href="/legal/disclaimer" className="hover:text-[#313c42]">Draft-only disclaimer</Link>
            </p>
          </aside>
        </section>

        <section className="mt-6 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white p-3 shadow-[0_24px_70px_rgba(58,56,50,0.06)] md:mt-8 md:p-4">
          <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#ffffff]">{children}</div>
        </section>
      </div>
    </main>
  );
}
