import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { INDUSTRY_KETES } from "@/lib/kete";

export const metadata: Metadata = {
  title: "Welcome to assembl",
  description: "Your self-serve plan is active. Open your industry’s specialist chats and start with a real task.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-static";

export default function WelcomePage() {
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="container py-20 lg:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-eyebrow uppercase text-[color:var(--assembl-pounamu)]">
            You’re in · self-serve
          </p>
          <h1 className="mt-5 font-display text-display-lg font-light">
            Kia ora — your plan is active.
          </h1>
          <p className="mt-6 text-body-lg text-[color:var(--text-body)]">
            You now have direct access to the specialist chats for your industry. Pick your
            kete below and start with the job in front of you — every reply is a draft for a
            named person to review before anything leaves.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {INDUSTRY_KETES.map((kete) => (
              <Link
                key={kete.slug}
                href={`/c/${kete.slug}`}
                className="group flex items-center justify-between gap-4 rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/55 px-5 py-4 transition hover:border-[color:var(--assembl-pounamu)] hover:bg-white"
              >
                <span>
                  <span className="block font-display text-xl font-light">{kete.industry}</span>
                  <span className="block font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
                    {kete.name}
                  </span>
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5"
                  style={{ color: kete.accent }}
                  aria-hidden
                />
              </Link>
            ))}
          </div>

          <div className="mt-10 rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/55 p-6">
            <h2 className="font-display text-2xl font-light">What happens next</h2>
            <ul className="mt-4 space-y-3 text-body-md text-[color:var(--text-body)]">
              <li>1. Open a kete chat above and run a real task — a draft RFI, a customs entry, a roster note.</li>
              <li>2. Review the draft. Nothing is sent, filed, or lodged for you.</li>
              <li>3. Your receipt and a private access link arrive by email. Manage or cancel anytime from <Link href="/app/billing" className="underline underline-offset-2">billing</Link>.</li>
            </ul>
          </div>

          <p className="mt-6 flex items-start gap-2 text-body-sm text-[color:var(--text-secondary)]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--assembl-pounamu)]" aria-hidden />
            Every output is a draft for a named reviewer. No plan auto-lodges, auto-files, or auto-sends anything.
          </p>
        </div>
      </section>
    </main>
  );
}
