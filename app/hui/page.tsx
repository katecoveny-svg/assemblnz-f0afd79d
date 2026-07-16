import type { Metadata } from "next";
import Image from "next/image";
import HuiStudio from "@/components/hui/HuiStudio";
import { PatternBackdrop } from "@/components/pattern-studio/PatternBackdrop";

export const metadata: Metadata = {
  title: "Hui — you ran the meeting, let us write it up",
  description:
    "You ran the hui. You shouldn't have to write it up too. Drop the recording and walk away with the minutes, the actions, and an evidence pack you can file — toolbox-talk minutes, shift handovers, ERO-ready notes. Built in Aotearoa, consent-first.",
  openGraph: {
    title: "Hui — walk out with the minutes already written",
    description:
      "You ran the hui; we'll write it up. Drop a recording, walk away with the minutes, the actions, and an evidence pack you can file. A meeting agent by assembl, built in Aotearoa.",
    type: "website",
    url: "https://www.assembl.co.nz/hui",
    siteName: "assembl",
  },
};

export default function HuiPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--assembl-paper)]">
        <PatternBackdrop
          className="absolute inset-0 -z-10"
          mode="halftone"
          colorRole="gold"
          opacity={0.3}
          speed={0.5}
          lazyMount={false}
        />
        <div className="relative container grid items-center gap-10 py-16 md:grid-cols-2 md:py-20">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              Hui · the meeting agent
            </p>
            <h1 className="mt-5 font-display text-4xl font-light leading-[1.05] text-[color:var(--text-primary)] md:text-6xl">
              You ran the hui.
              <br />
              Let us write it up.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[color:var(--text-secondary)]">
              The meeting's over and someone still has to type it all out. Not tonight. Drop the recording and walk
              away with the minutes, the action list, and an evidence pack ready to file — before everyone's out the
              door.
            </p>
            <div className="mt-8">
              <a
                href="#try"
                className="inline-block rounded-full bg-[#23211F] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#3A3832]"
              >
                Try it now — 1 free run
              </a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <Image
              src="/images/site/vessel-cta-motif.png"
              alt="assembl vessel motif"
              width={560}
              height={560}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      {/* Try it */}
      <section id="try" className="bg-white">
        <div className="container py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-light text-[color:var(--text-primary)] md:text-4xl">
              Bring a real meeting. Leave with a real record.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-secondary)]">
              One free run, no sign-up. Your audio is never stored. This public version is for general meetings —
              not private, employment, health, legal, or commercially sensitive ones.
            </p>
          </div>
          <div className="mt-10 mx-auto max-w-4xl">
            <HuiStudio />
          </div>
          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-[color:var(--text-secondary)]">
            Consent-first · te reo Māori + English · evidence pack on every output · Privacy Act 2020 from the ground
            up. Built by Kate Hudson in Aotearoa.
          </p>
        </div>
      </section>
    </>
  );
}
