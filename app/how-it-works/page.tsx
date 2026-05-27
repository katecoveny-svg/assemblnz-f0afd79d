import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  ClipboardCheck,
  DatabaseZap,
  FileCheck2,
  ListChecks,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';
import { heroVessel } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'How assembl turns messy inputs into grounded drafts, named human review, and evidence packs you can file, forward, or footnote.',
};

const steps = [
  {
    eyebrow: '01',
    title: 'Bring the real input.',
    body:
      'Start with the real material already on your desk: a meeting transcript, school notice, food record, customer reply, DMS export, supplier message, or council RFI.',
    example: 'One actual job beats a platform tour.',
    icon: ClipboardCheck,
  },
  {
    eyebrow: '02',
    title: 'Ground the draft.',
    body:
      'assembl uses the relevant source layer: uploaded material, live knowledge, PCO legislation, or connected tools where the workflow has permission.',
    example: 'The answer should show what it used.',
    icon: DatabaseZap,
  },
  {
    eyebrow: '03',
    title: 'Review before action.',
    body:
      'The draft names what it used, what it assumed, what is missing, and what should be checked by a person. It does not quietly send, lodge, book, or commit on your behalf.',
    example: 'Citations, assumptions, risks, and missing documents stay visible.',
    icon: ListChecks,
  },
  {
    eyebrow: '04',
    title: 'Make it repeatable.',
    body:
      'If the tool helps, the next step is a private version with your voice, your source material, scoped permissions, and the review points your team needs.',
    example: 'One useful experiment becomes a repeatable internal tool.',
    icon: UserCheck,
  },
  {
    eyebrow: '05',
    title: 'Keep the record.',
    body:
      'The final output carries the work behind the work: sources, checks, reviewer notes, timestamps, and a tamper-evident audit trail.',
    example: 'File it, forward it, footnote it, or hand it to a reviewer.',
    icon: FileCheck2,
  },
] as const;

const modes = [
  {
    title: 'HAPAI tools',
    body:
      'HAPAI comes from hāpai: to lift or support. These are small public tools for one task: study planning, meeting notes, travel planning, share cards, food logs, and more.',
  },
  {
    title: 'Pilot Sprint',
    body:
      'One workflow rebuilt against your own material. The goal is a working proof in days, not months of requirements theatre.',
  },
  {
    title: 'Kete packs',
    body:
      'Kete means basket or kit. A kete pack is a specialist operating area with agents, tools, live knowledge, workflows, and clear review rules.',
  },
] as const;

const proof = [
  'No external action without human review.',
  'Live knowledge is used where the workflow needs current source material.',
  'Connected tools are scoped to the job, not sprayed across the business.',
  'Every consequential output can end in an evidence pack.',
  'The reviewer, source material, and assumptions are visible.',
  'assembl is the layer above existing systems, not a replacement for them.',
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#FAF7F2]">
        <video
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-[0.32]"
          autoPlay
          muted
          loop
          playsInline
          poster={heroVessel.wide}
        >
          <source src={heroVessel.videoLocal} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,247,242,0.94)_0%,rgba(250,247,242,0.84)_44%,rgba(250,247,242,0.48)_100%)]" />
        <div className="relative z-10 flex min-h-[calc(92svh-72px)] items-end px-6 pb-16 pt-24 md:px-12 md:pb-20 xl:px-20">
          <div className="max-w-5xl">
            <SectionReveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#2B6B57]">
                How assembl works
              </p>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <h1 className="mt-5 max-w-5xl font-display text-[clamp(3.6rem,7vw,7.4rem)] font-normal italic leading-[0.88] text-[#0E382F] [text-shadow:0_18px_70px_rgba(43,107,87,0.14)]">
                From messy input to reviewed output.
              </h1>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <p className="mt-8 max-w-3xl text-[clamp(1.12rem,2vw,1.55rem)] leading-relaxed text-[#2F3440]">
                assembl takes a real task, grounds it in the right source
                material, drafts the work, asks a named person to review it, and
                keeps the record behind the answer.
              </p>
            </SectionReveal>
            <SectionReveal delay={0.3}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/hapai" className="cta-primary inline-flex h-12 items-center justify-center px-7 text-sm md:text-base">
                  Try a HAPAI tool
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link href="/evidence-pack" className="btn-ghost inline-flex h-12 items-center justify-center px-7 text-sm md:text-base">
                  See the evidence pack
                </Link>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      <section className="bg-[#FAF7F2] px-6 py-16 md:px-12 md:py-20 xl:px-20">
        <div className="mx-auto max-w-[1500px]">
          <SectionReveal>
            <div className="max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#2B6B57]">
                The practical loop
              </p>
              <h2 className="mt-4 font-display text-[clamp(2.6rem,5vw,5.2rem)] font-normal italic leading-[0.92] text-[#23211F]">
                The operating model.
              </h2>
            </div>
          </SectionReveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            {steps.map(({ eyebrow, title, body, example, icon: Icon }) => (
              <SectionReveal key={title}>
                <article className="group flex min-h-[360px] flex-col justify-between rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/72 p-5 shadow-[0_24px_80px_rgba(35,33,31,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(43,107,87,0.36)] hover:shadow-[0_30px_90px_rgba(43,107,87,0.14)]">
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#2B6B57]">{eyebrow}</span>
                      <Icon className="h-5 w-5 text-[#2B6B57]" aria-hidden />
                    </div>
                    <h3 className="mt-8 font-display text-3xl font-normal italic leading-[0.98] text-[#103F35]">
                      {title}
                    </h3>
                    <p className="mt-5 text-sm leading-relaxed text-[#3D4250]">{body}</p>
                  </div>
                  <p className="mt-8 border-l-2 border-[#D9A85A] pl-4 text-sm italic leading-relaxed text-[#6B6661]">
                    {example}
                  </p>
                </article>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[rgba(35,33,31,0.08)] bg-[#F7F1E9] px-6 py-16 md:px-12 md:py-20 xl:px-20">
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <SectionReveal>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#2B6B57]">
                Three ways in
              </p>
              <h2 className="mt-4 font-display text-[clamp(2.7rem,5vw,5.2rem)] font-normal italic leading-[0.9] text-[#23211F]">
                Tools, pilots, then the operating layer.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#3D4250]">
                HAPAI means lift or support: it is the shareable public tool
                library. Kete means basket or kit: each kete pack is a specialist
                operating area. Workflows are the repeatable jobs that become
                internal systems once they prove useful.
              </p>
            </div>
          </SectionReveal>
          <div className="grid gap-4 md:grid-cols-3">
            {modes.map((mode) => (
              <SectionReveal key={mode.title}>
                <article className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#FAF7F2] p-5">
                  <h3 className="font-display text-3xl font-normal italic text-[#103F35]">{mode.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-[#3D4250]">{mode.body}</p>
                </article>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#FAF7F2] px-6 py-16 md:px-12 md:py-24 xl:px-20">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionReveal>
            <div>
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#103F35] text-[#FAF7F2] shadow-[0_24px_70px_rgba(43,107,87,0.22)]">
                <ShieldCheck className="h-6 w-6" aria-hidden />
              </div>
              <h2 className="mt-7 font-display text-[clamp(2.8rem,5.4vw,5.8rem)] font-normal italic leading-[0.9] text-[#23211F]">
                The promise is simple: nothing ships quietly.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#3D4250]">
                The internal pipeline names are useful to engineers and auditors.
                Buyers need the plain version: draft, check, review, sign, record.
              </p>
            </div>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <div className="grid gap-3 sm:grid-cols-2">
              {proof.map((item) => (
                <div key={item} className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/76 p-4">
                  <p className="text-sm leading-relaxed text-[#3D4250]">{item}</p>
                </div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className="bg-[#103F35] px-6 py-16 text-[#FAF7F2] md:px-12 md:py-20 xl:px-20">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionReveal>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#D9A85A]">
                Start small
              </p>
              <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.8rem,5.6vw,6rem)] font-normal italic leading-[0.88]">
                Pick the workflow that keeps coming back.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#FAF7F2]/80">
                The best pilot is not a platform tour. It is one recurring job
                with enough pain, enough source material, and a clear human
                reviewer.
              </p>
            </div>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
              <Link href="/workflows" className="inline-flex h-12 items-center justify-center rounded-full bg-[#FAF7F2] px-7 text-sm font-medium text-[#103F35] transition hover:bg-white">
                See workflows
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link href="/evidence-pack" className="inline-flex h-12 items-center justify-center rounded-full border border-[#FAF7F2]/30 px-7 text-sm font-medium text-[#FAF7F2] transition hover:bg-[#FAF7F2]/10">
                See the evidence pack
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
