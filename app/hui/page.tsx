import type { Metadata } from "next";
import Image from "next/image";
import { Languages, Lock, ShieldCheck, Sparkles, Stamp } from "lucide-react";
import HuiStudio from "@/components/hui/HuiStudio";

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

const DIFFERENTIATORS = [
  {
    icon: Languages,
    title: "te reo, by design",
    body: "Hui is built to work in te reo Māori and English. If your hui is in te reo, ours is the meeting tool that doesn't need an asterisk. (Te reo transcription lands next, with human verification.)",
  },
  {
    icon: ShieldCheck,
    title: "Privacy Act, not a checkbox",
    body: "Consent before the mic goes on. We transcribe your audio, then it's gone — we never keep the recording. Record a hard kōrero and never wonder where it ended up. That's the Privacy Act 2020 (IPP 3 & 3A), doing its job.",
  },
  {
    icon: Stamp,
    title: "an evidence pack, not just a doc",
    body: "Every record ends in a downloadable evidence pack. Each pack carries a Mana Receipt — a verifiable hash — so once a named person seals it, an auditor can check it. They hand you a Word doc; we hand you proof.",
  },
  {
    icon: Sparkles,
    title: "regulated outputs, not generic minutes",
    body: "A Waihanga toolbox-talk record under HSWA. A Manaaki shift handover. Mātauranga ERO-prep notes. Outputs that cite the actual NZ framework — not a prettier note.",
  },
  {
    icon: Lock,
    title: "draft-only, with a name behind it",
    body: "Nothing leaves with your name on it until a person signs. Hui is draft-by-default, built by a named founder, Kate Hudson, who stands behind it.",
  },
];

const STEPS = [
  { n: "01", t: "Hand it over", d: "Hit record, drop in an audio file, or paste the transcript. However the meeting reached you." },
  { n: "02", t: "Say what you need", d: "Toolbox-talk minutes. A shift handover. ERO-ready notes. Pick the record for your world." },
  { n: "03", t: "Walk away with proof", d: "Read it, tweak it, file it — an evidence pack you'd put your name to." },
];

export default function HuiPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--assembl-paper)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(43,107,87,0.10) 0%, transparent 65%)" }}
        />
        <div className="relative container grid items-center gap-10 py-20 md:grid-cols-2 md:py-28">
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
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#try"
                className="rounded-full bg-[#23211F] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#2B6B57]"
              >
                Try it now — 1 free run
              </a>
              <a
                href="#how"
                className="rounded-full border border-[rgba(35,33,31,0.18)] px-6 py-3 text-sm font-medium text-[color:var(--text-primary)] hover:border-[#2B6B57]"
              >
                How it works
              </a>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-[color:var(--text-secondary)]">
              Consent first, always. Your audio is transcribed, then gone — we never keep the recording. Built in
              Aotearoa.
            </p>
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

      {/* Differentiators */}
      <section className="bg-white">
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              Why Hui is different
            </p>
            <h2 className="mt-4 font-display text-3xl font-light text-[color:var(--text-primary)] md:text-4xl">
              Other tools stop at the note. Hui hands you the record you can stand behind.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {DIFFERENTIATORS.map((d) => (
              <div key={d.title} className="rounded-[12px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] p-6">
                <d.icon className="h-6 w-6 text-[#2B6B57]" aria-hidden />
                <h3 className="mt-4 font-display text-xl font-normal text-[color:var(--text-primary)]">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-[color:var(--assembl-paper)]">
        <div className="container py-20 md:py-24">
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-[12px] border border-[rgba(35,33,31,0.10)] bg-white p-6">
                <p className="font-mono text-sm tracking-[0.2em] text-[#2B6B57]">{s.n}</p>
                <h3 className="mt-3 font-display text-2xl font-normal text-[color:var(--text-primary)]">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Try it */}
      <section id="try" className="bg-white">
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              Try Hui
            </p>
            <h2 className="mt-4 font-display text-3xl font-light text-[color:var(--text-primary)] md:text-4xl">
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
        </div>
      </section>
    </>
  );
}
