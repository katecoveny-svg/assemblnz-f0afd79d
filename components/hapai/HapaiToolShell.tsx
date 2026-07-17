"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { InstallPwaButton } from "@/components/hapai/InstallPwaButton";
import { ShareableToolActions } from "@/components/hapai/ShareableToolActions";

type HapaiToolShellProps = {
  kicker: string;
  title: string;
  description: string;
  toolPath: string;
  shareTitle: string;
  shareText: string;
  posture: string;
  highlights?: readonly {
    title: string;
    body: string;
    icon?: ReactNode;
  }[];
  aside?: ReactNode;
  children: ReactNode;
};

export function HapaiToolShell({
  kicker,
  title,
  description,
  toolPath,
  shareTitle,
  shareText,
  posture,
  highlights = [],
  aside,
  children,
}: HapaiToolShellProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f3f5f3_54%,#ffffff_100%)] px-5 py-10 text-[#313c42] md:px-10 md:py-14">
      <div className="mx-auto max-w-[1500px]">
        <Link
          href="/hapai"
          className="inline-flex items-center gap-2 rounded-sm font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6661] transition hover:text-[#313c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#313c42] focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          SPARK library
        </Link>

        {/* Single column until there is genuinely room for two — below 1280px
            the aside stacks under the hero card instead of crowding it. */}
        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.58fr)] xl:items-stretch">
          <div className="relative overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/62 p-6 shadow-[0_28px_90px_rgba(35,33,31,0.08)] md:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(58,56,50,0.08),transparent_38%),radial-gradient(circle_at_86%_8%,rgba(184, 150, 79,0.16),transparent_30%)]" aria-hidden />
            <div className="relative">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#313c42]">
                {kicker}
              </p>
              <h1 className="mt-4 max-w-5xl font-display text-[clamp(3.4rem,7vw,7.2rem)] font-light leading-[0.88] text-[#313c42]">
                {title}
              </h1>
              <p className="mt-6 max-w-3xl text-[clamp(1.05rem,1.65vw,1.28rem)] leading-relaxed text-[#3D4250]">
                {description}
              </p>

              {highlights.length > 0 ? (
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {highlights.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#ffffff]/72 p-4 shadow-[0_18px_54px_rgba(35,33,31,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(58,56,50,0.26)] hover:shadow-[0_24px_70px_rgba(58,56,50,0.12)]"
                    >
                      <div className="text-[#313c42]">{item.icon ?? <Sparkles className="h-5 w-5" aria-hidden />}</div>
                      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#313c42]">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-[#5A5550]">{item.body}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/64 p-3 shadow-[0_34px_110px_rgba(35,33,31,0.14)]">
            <div className="relative min-h-[270px] overflow-hidden rounded-[6px] border border-[rgba(35,33,31,0.08)] bg-[radial-gradient(circle_at_70%_18%,rgba(184, 150, 79,0.24),transparent_30%),linear-gradient(145deg,#ffffff_0%,#F3E9DC_48%,#eef4f4_100%)] p-5">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(58,56,50,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(58,56,50,0.06)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" aria-hidden />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#313c42]">how it works</p>
                  <p className="mt-2 max-w-[14rem] text-sm leading-relaxed text-[#5A5550]">
                    One task. One share link. A draft you check before you use it.
                  </p>
                </div>
                <div className="rounded-full border border-[rgba(58,56,50,0.16)] bg-white/74 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#313c42] shadow-[0_14px_40px_rgba(35,33,31,0.08)]">
                  SPARK
                </div>
              </div>

              <div className="pointer-events-none absolute right-7 top-16 h-36 w-40" aria-hidden>
                <div className="absolute left-4 top-20 h-12 w-32 rounded-[50%] bg-[#313c42]/20 blur-xl" />
                <div className="absolute left-5 top-24 h-6 w-[7.5rem] rounded-[50%] border border-[#9D8C7D]/28 bg-[#F4EFE7] shadow-[0_22px_34px_rgba(35,33,31,0.14)]" />
                <div className="absolute left-4 top-[4.5rem] h-7 w-[8.5rem] rotate-[-5deg] rounded-[50%] border border-[#b8964f]/42 bg-[#b8964f]/34 backdrop-blur" />
                <div className="absolute left-2 top-12 h-8 w-36 rotate-[4deg] rounded-[50%] border border-[#313c42]/28 bg-[#EFEADC]/52 backdrop-blur" />
                <div className="absolute left-7 top-4 h-24 w-24 rotate-[12deg] rounded-[42%_58%_46%_54%] border border-white/70 bg-white/64 shadow-[inset_0_0_26px_rgba(255,255,255,0.78),0_24px_48px_rgba(35,33,31,0.16)]" />
                <div className="absolute left-[4.25rem] top-8 h-20 w-1 rotate-[22deg] rounded-full bg-[#b8964f]/70" />
              </div>

              <div className="absolute bottom-5 left-5 right-5 grid gap-2">
                {["paste or upload", "get the draft", "check and use"].map((label, index) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-[6px] border border-white/70 bg-white/66 px-3 py-2 text-xs text-[#3D4250] shadow-[0_14px_32px_rgba(35,33,31,0.08)] backdrop-blur"
                  >
                    <span>{label}</span>
                    <span className="font-mono text-[10px] text-[#313c42]">0{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-3 overflow-hidden rounded-[6px] bg-[#313c42] p-5 text-[#ffffff]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_14%,rgba(184, 150, 79,0.24),transparent_32%),linear-gradient(135deg,rgba(250,247,242,0.10),transparent_48%)]" aria-hidden />
              <div className="relative">
              {aside}
              <div className={aside ? "mt-6" : ""}>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#b8964f]">
                  share this
                </p>
                <div className="mt-4">
                  <ShareableToolActions
                    title={shareTitle}
                    text={shareText}
                    path={toolPath}
                  />
                </div>
                <div className="mt-4">
                  <InstallPwaButton label="Save to home screen" compact />
                </div>
              </div>
              <div className="mt-6 rounded-[8px] border border-[#ffffff]/16 bg-[#ffffff]/10 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#b8964f]" aria-hidden />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#b8964f]">
                      draft-only posture
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#ffffff]/82">{posture}</p>
                  </div>
                </div>
              </div>
              <Link
                href="/hapai#workflow-request"
                className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#ffffff]/82 transition hover:text-[#ffffff]"
              >
                Suggest a better workflow
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
              <p className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] leading-relaxed text-[#ffffff]/58">
                <Link href="/privacy" className="hover:text-[#ffffff]">
                  Privacy
                </Link>
                <span aria-hidden>·</span>
                <Link href="/legal/terms" className="hover:text-[#ffffff]">
                  Terms
                </Link>
                <span aria-hidden>·</span>
                <Link href="/legal/disclaimer" className="hover:text-[#ffffff]">
                  Draft-only disclaimer
                </Link>
              </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-6 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/54 p-3 shadow-[0_30px_100px_rgba(35,33,31,0.08)] transition duration-300 hover:shadow-[0_36px_120px_rgba(58,56,50,0.12)] md:mt-8 md:p-4">
          <div className="rounded-[6px] border border-[rgba(35,33,31,0.08)] bg-[#ffffff]">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
