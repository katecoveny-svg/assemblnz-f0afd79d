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
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#FAF7F2_0%,#F7F1E9_54%,#FAF7F2_100%)] px-5 py-10 text-[#23211F] md:px-10 md:py-14">
      <div className="mx-auto max-w-[1500px]">
        <Link
          href="/hapai"
          className="inline-flex items-center gap-2 rounded-sm font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6661] transition hover:text-[#2B6B57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B6B57] focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          HAPAI library
        </Link>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.98fr)_minmax(360px,0.62fr)] lg:items-stretch">
          <div className="relative overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/62 p-6 shadow-[0_28px_90px_rgba(35,33,31,0.08)] md:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(43,107,87,0.08),transparent_38%),radial-gradient(circle_at_86%_8%,rgba(217,168,90,0.16),transparent_30%)]" aria-hidden />
            <div className="relative">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#2B6B57]">
                {kicker}
              </p>
              <h1 className="mt-4 max-w-5xl font-display text-[clamp(3.4rem,7vw,7.2rem)] font-light leading-[0.88] text-[#103F35]">
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
                      className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#FAF7F2]/72 p-4 shadow-[0_18px_54px_rgba(35,33,31,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(43,107,87,0.26)] hover:shadow-[0_24px_70px_rgba(43,107,87,0.12)]"
                    >
                      <div className="text-[#2B6B57]">{item.icon ?? <Sparkles className="h-5 w-5" aria-hidden />}</div>
                      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#2B6B57]">
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
            <div className="relative min-h-[270px] overflow-hidden rounded-[6px] border border-[rgba(35,33,31,0.08)] bg-[radial-gradient(circle_at_70%_18%,rgba(217,168,90,0.24),transparent_30%),linear-gradient(145deg,#FAF7F2_0%,#F3E9DC_48%,#E8EFEA_100%)] p-5">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(43,107,87,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(43,107,87,0.06)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" aria-hidden />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#2B6B57]">how it works</p>
                  <p className="mt-2 max-w-[14rem] text-sm leading-relaxed text-[#5A5550]">
                    One task. One share link. A draft you check before you use it.
                  </p>
                </div>
                <div className="rounded-full border border-[rgba(43,107,87,0.16)] bg-white/74 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#2B6B57] shadow-[0_14px_40px_rgba(35,33,31,0.08)]">
                  HAPAI
                </div>
              </div>

              <div className="pointer-events-none absolute right-7 top-16 h-36 w-40" aria-hidden>
                <div className="absolute left-4 top-20 h-12 w-32 rounded-[50%] bg-[#2B6B57]/20 blur-xl" />
                <div className="absolute left-5 top-24 h-6 w-[7.5rem] rounded-[50%] border border-[#9D8C7D]/28 bg-[#F4EFE7] shadow-[0_22px_34px_rgba(35,33,31,0.14)]" />
                <div className="absolute left-4 top-[4.5rem] h-7 w-[8.5rem] rotate-[-5deg] rounded-[50%] border border-[#D9A85A]/42 bg-[#D9A85A]/34 backdrop-blur" />
                <div className="absolute left-2 top-12 h-8 w-36 rotate-[4deg] rounded-[50%] border border-[#2B6B57]/28 bg-[#C9DAD2]/52 backdrop-blur" />
                <div className="absolute left-7 top-4 h-24 w-24 rotate-[12deg] rounded-[42%_58%_46%_54%] border border-white/70 bg-white/64 shadow-[inset_0_0_26px_rgba(255,255,255,0.78),0_24px_48px_rgba(35,33,31,0.16)]" />
                <div className="absolute left-[4.25rem] top-8 h-20 w-1 rotate-[22deg] rounded-full bg-[#D9A85A]/70" />
              </div>

              <div className="absolute bottom-5 left-5 right-5 grid gap-2">
                {["paste or upload", "get the draft", "check and use"].map((label, index) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-[6px] border border-white/70 bg-white/66 px-3 py-2 text-xs text-[#3D4250] shadow-[0_14px_32px_rgba(35,33,31,0.08)] backdrop-blur"
                  >
                    <span>{label}</span>
                    <span className="font-mono text-[10px] text-[#2B6B57]">0{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-3 overflow-hidden rounded-[6px] bg-[#103F35] p-5 text-[#FAF7F2]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_14%,rgba(217,168,90,0.24),transparent_32%),linear-gradient(135deg,rgba(250,247,242,0.10),transparent_48%)]" aria-hidden />
              <div className="relative">
              {aside}
              <div className={aside ? "mt-6" : ""}>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#D9A85A]">
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
              <div className="mt-6 rounded-[8px] border border-[#FAF7F2]/16 bg-[#FAF7F2]/10 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#D9A85A]" aria-hidden />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#D9A85A]">
                      draft-only posture
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#FAF7F2]/82">{posture}</p>
                  </div>
                </div>
              </div>
              <Link
                href="/hapai#workflow-request"
                className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#FAF7F2]/82 transition hover:text-[#FAF7F2]"
              >
                Suggest a better workflow
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
              <p className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] leading-relaxed text-[#FAF7F2]/58">
                <Link href="/privacy" className="hover:text-[#FAF7F2]">
                  Privacy
                </Link>
                <span aria-hidden>·</span>
                <Link href="/legal/terms" className="hover:text-[#FAF7F2]">
                  Terms
                </Link>
                <span aria-hidden>·</span>
                <Link href="/legal/disclaimer" className="hover:text-[#FAF7F2]">
                  Draft-only disclaimer
                </Link>
              </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-6 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/54 p-3 shadow-[0_30px_100px_rgba(35,33,31,0.08)] transition duration-300 hover:shadow-[0_36px_120px_rgba(43,107,87,0.12)] md:mt-8 md:p-4">
          <div className="rounded-[6px] border border-[rgba(35,33,31,0.08)] bg-[#FAF7F2]">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
