/**
 * /hapai — public landing page for the HAPAI adoption framework
 *
 * Productised John Kim playbook adapted for NZ SMEs. Coming Q3 2026 as a
 * Suite add-on. This page exists to:
 *   1. State the thesis (most NZ businesses bought intelligent tools, nobody uses them)
 *   2. Explain the 5-tier framework
 *   3. Run a self-assessment (Where does your team sit?)
 *   4. Make it easy to share (viral share buttons + OG card)
 *
 * Public, no auth required.
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Flame, LibraryBig, Trophy, UsersRound } from "lucide-react";
import HapaiAssessment from "@/components/hapai/HapaiAssessment";
import HapaiShareButtons from "@/components/hapai/HapaiShareButtons";

export const metadata: Metadata = {
  title: "hapai — the intelligent-tool adoption framework for NZ teams",
  description:
    "Most NZ teams paid for intelligent tools. Almost nobody uses them. The HAPAI framework maps where your team actually sits on the adoption curve — in 60 seconds, no email required.",
  openGraph: {
    title: "hapai — the intelligent-tool adoption framework for NZ teams",
    description:
      "Take 60 seconds to find where your team sits on the adoption curve. From akoranga to pou.",
    type: "article",
    url: "https://www.assembl.co.nz/hapai",
    siteName: "assembl",
  },
  twitter: {
    card: "summary_large_image",
    title: "hapai — the intelligent-tool adoption framework for NZ teams",
    description:
      "Most NZ teams paid for intelligent tools. Almost nobody uses them. Take 60 seconds.",
  },
};

const TIERS = [
  { slug: "akoranga", english: "Learning", min: 1, max: 10,
    description: "First contact. Some people in the team are trying things. Most aren't yet. This is where every team starts." },
  { slug: "kaimahi", english: "Working with it", min: 11, max: 30,
    description: "Becoming routine for a few. The early adopters have built a couple of helpful workflows. Now it spreads." },
  { slug: "tohunga", english: "Skilled practitioner", min: 31, max: 75,
    description: "Most of the team is using specialist agents weekly. Skills get shared. Bottlenecks get spotted." },
  { slug: "rangatira", english: "Leading", min: 76, max: 150,
    description: "Adoption is the default. New hires are recruited for curiosity. The team starts building tools for itself." },
  { slug: "pou", english: "Pillar of practice", min: 151, max: 9999,
    description: "Adoption is structural. The skills marketplace is alive. People build for the team and share the results." },
];

export default function HapaiPage() {
  return (
    <main className="bg-mist-50 text-taupe-900 font-inter">
      {/* HERO */}
      <section className="relative overflow-hidden bg-pounamu-900 px-6 py-16 text-mist-50 lg:px-10 lg:py-24">
        <div className="absolute inset-0 opacity-25">
          <Image
            src="/images/lattice-texture.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover mix-blend-screen"
            priority
          />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-pounamu-100">
              HAPAI · gamified intelligent-tool adoption for NZ teams
            </p>
            <h1 className="mt-5 max-w-5xl font-cormorant text-[clamp(3.7rem,8vw,7.5rem)] leading-[0.88] tracking-tight text-mist-50">
              Turn unused intelligent-tool licences into team momentum.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-mist-50/85 lg:text-xl">
              The tools work. The rollout fails. HAPAI gives teams a game loop:
              requests, quick wins, shared skills, visible progress, and a dashboard
              that rewards consistency.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#assessment"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-mist-50 px-6 text-sm font-medium text-pounamu-900 transition-colors hover:bg-white"
              >
                Take the assessment <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <Link
                href="/pilot-sprint"
                className="inline-flex h-12 items-center rounded-full border border-mist-50/40 px-6 text-sm font-medium text-mist-50 transition-colors hover:bg-mist-50/10"
              >
                Add to a pilot
              </Link>
            </div>
          </div>

          <div className="rounded-[8px] border border-white/15 bg-white/12 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] bg-[#23211F]">
              <Image
                src="/img/kete/ako-vessel-amber.jpg"
                alt="Amber sculptural vessel representing learning momentum"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover opacity-70"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-pounamu-900/70 via-[#23211F]/20 to-[#23211F]/85" />
              <div className="absolute inset-0 grid content-between p-5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-mist-50/90 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-pounamu-900">
                    Week 2
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-mist-50">
                    smoothness 84
                  </span>
                </div>
                <div>
                  <div className="grid grid-cols-3 gap-2">
                    <GameMetric icon={Trophy} value="tohunga" label="tier" />
                    <GameMetric icon={Flame} value="47" label="sessions" />
                    <GameMetric icon={BadgeCheck} value="9" label="wins" />
                  </div>
                  <div className="mt-3 rounded-[8px] border border-white/15 bg-white/12 p-3">
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-mist-50/75">
                      <span>adoption path</span>
                      <span>3 / 5</span>
                    </div>
                    <div className="mt-3 grid grid-cols-5 gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-2 rounded-full ${i < 3 ? "bg-[#D4A853]" : "bg-white/25"}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND STRIPE */}
      <div className="bg-pounamu-900 border-t border-pounamu-700 py-5 text-center text-sm text-mist-100">
        Built in Aotearoa. <strong className="text-mist-50 font-medium">Quiet intelligence, the trail attached.</strong>
      </div>

      {/* THE THESIS */}
      <section className="py-20 lg:py-28 bg-mist-100">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.9fr_1fr] lg:px-8">
          <div className="relative min-h-80 overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)]">
            <Image
              src="/images/brand-film-still-pipeline.jpg"
              alt="Assembl vessel pipeline showing an adoption workflow"
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
          <p className="text-xs uppercase tracking-widest text-taupe-600 mb-4">
            The thesis
          </p>
          <h2 className="font-cormorant text-4xl lg:text-5xl text-pounamu-900 leading-tight mb-6">
            Adoption is the actual problem.
          </h2>
          <div className="space-y-5 text-base lg:text-lg text-taupe-900 leading-relaxed">
            <p>
              Surveys put it at <strong>79% of Kiwi businesses</strong> not knowing
              how to use intelligent agents safely. <strong>97% of the workforce</strong> hasn't
              been trained for them. High-use, low-trust country.
            </p>
            <p>
              Most NZ small businesses bought Microsoft Copilot or ChatGPT Teams in
              2024. The licences are sitting there generating no value. The tools work.
              The rollout failed. Not because anyone did anything wrong — but because
              there was no system for what comes after the licence purchase.
            </p>
            <p>
              HAPAI is that system. It treats intelligent-tool adoption as a product you build
              internally, not a training programme you sit through. A kaupapa board
              for requests, a skills library for what works, a five-tier dashboard
              that celebrates progress instead of punishing stragglers.
            </p>
            <blockquote className="border-l-4 border-pounamu-700 pl-6 my-10 font-cormorant text-2xl lg:text-3xl text-pounamu-900 italic leading-snug">
              "We hire for curiosity, agency, and energy before we look at the years
              of experience. The team that builds for itself, beats the team that
              waits to be trained."
              <cite className="block mt-4 not-italic text-sm text-taupe-600 font-inter">
                — adapted from John Kim, Sendbird
              </cite>
            </blockquote>
          </div>
          </div>
        </div>
      </section>

      {/* THE 5 TIERS */}
      <section id="how" className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <p className="text-xs uppercase tracking-widest text-taupe-600 mb-4">
            The framework
          </p>
          <h2 className="font-cormorant text-4xl lg:text-5xl text-pounamu-900 leading-tight mb-4">
            Five tiers. Te reo names. No hype ladder.
          </h2>
          <p className="text-base lg:text-lg text-taupe-700 max-w-2xl mb-12">
            Adoption is measured in sessions per person per month. Not totals — the
            shape of the curve. A team that uses these tools thirty times every week beats
            a team that used it 800 times last Tuesday and then went quiet.
          </p>

          <ol className="space-y-6">
            {TIERS.map((tier, i) => (
              <li
                key={tier.slug}
                className="grid grid-cols-[auto_1fr] gap-6 lg:gap-8 items-start border-t border-taupe-200 pt-6"
              >
                <div className="text-right min-w-[3rem]">
                  <span className="font-cormorant text-3xl lg:text-4xl text-pounamu-700">
                    0{i + 1}
                  </span>
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
                    <h3 className="font-cormorant text-2xl lg:text-3xl text-pounamu-900 capitalize">
                      {tier.slug}
                    </h3>
                    <span className="text-sm text-taupe-600">{tier.english}</span>
                    <span className="text-xs uppercase tracking-wider text-taupe-500 ml-auto">
                      {tier.min === 151
                        ? "151+ sessions/month"
                        : `${tier.min}–${tier.max} sessions/month`}
                    </span>
                  </div>
                  <p className="text-base text-taupe-700 leading-relaxed">{tier.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* THE ASSESSMENT */}
      <section id="assessment" className="py-20 lg:py-28 bg-pounamu-50 border-y border-pounamu-100">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <p className="text-xs uppercase tracking-widest text-pounamu-700 mb-4">
            Self-assessment · 5 questions · 60 seconds
          </p>
          <h2 className="font-cormorant text-4xl lg:text-5xl text-pounamu-900 leading-tight mb-4">
            Where does your team sit?
          </h2>
          <p className="text-base lg:text-lg text-taupe-700 mb-10">
            Honest estimate. No login, no email capture. The result is shareable —
            if it lands, tag a colleague or co-founder.
          </p>
          <HapaiAssessment tiers={TIERS} />
        </div>
      </section>

      {/* WHAT HAPAI DOES */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <p className="text-xs uppercase tracking-widest text-taupe-600 mb-4">
            Three things, one platform
          </p>
          <h2 className="font-cormorant text-4xl lg:text-5xl text-pounamu-900 leading-tight mb-12">
            What HAPAI ships with.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <UsersRound className="h-8 w-8 text-pounamu-700" aria-hidden />
              <h3 className="font-cormorant text-2xl text-pounamu-900 mt-3 mb-2">
                Kaupapa Board
              </h3>
              <p className="text-base text-taupe-700 leading-relaxed">
                Every "I want a thing that does X" goes on the board. ECHO (your
                founder-shaped agent) reads it, builds it, drafts a spec, or flags
                it out of scope. XP is awarded on ship, not on submit.
              </p>
            </div>
            <div>
              <LibraryBig className="h-8 w-8 text-pounamu-700" aria-hidden />
              <h3 className="font-cormorant text-2xl text-pounamu-900 mt-3 mb-2">
                Skills Library
              </h3>
              <p className="text-base text-taupe-700 leading-relaxed">
                The agents already in your workspace, surfaced as a library with
                usage stats. "AURA was triggered 47 times last week, saved your team
                ~6 hours." Discovery is the missing layer.
              </p>
            </div>
            <div>
              <Trophy className="h-8 w-8 text-pounamu-700" aria-hidden />
              <h3 className="font-cormorant text-2xl text-pounamu-900 mt-3 mb-2">
                Adoption Dashboard
              </h3>
              <p className="text-base text-taupe-700 leading-relaxed">
                Five-tier rollup with weekly summary. Smoothness score (consistency
                beats binge). A team scoring 85+ is in real flow. CEO view shows
                where to coach, never where to punish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HARD RULES */}
      <section className="py-20 lg:py-28 bg-mist-100">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <p className="text-xs uppercase tracking-widest text-taupe-600 mb-4">
            The hard rules
          </p>
          <h2 className="font-cormorant text-4xl lg:text-5xl text-pounamu-900 leading-tight mb-10">
            Things we won't bend on.
          </h2>
          <ul className="space-y-5 text-base lg:text-lg text-taupe-900 leading-relaxed">
            <li className="flex gap-4">
              <span className="font-cormorant text-2xl text-pounamu-700 leading-none mt-1">·</span>
              <div>
                <strong className="text-pounamu-900">No punishment for low usage.</strong> The
                dashboard exists to celebrate progress, not surveil it. Three sessions
                this month is a coaching opportunity, not a performance review.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="font-cormorant text-2xl text-pounamu-700 leading-none mt-1">·</span>
              <div>
                <strong className="text-pounamu-900">Leadership leads.</strong> The
                CEO is on the leaderboard. If you won't use it, abandon the framework.
                Top-down rollouts that aren't lived from the top don't land.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="font-cormorant text-2xl text-pounamu-700 leading-none mt-1">·</span>
              <div>
                <strong className="text-pounamu-900">Secure templates, not free-form building.</strong> Marketing
                can ship a Stripe-integrated store in a day — because the auth, payments
                compliance, and Privacy Act handling are pre-built. HAPAI's templates
                are tikanga + Privacy-Act-2020 + CGA-checked by the four-pou layer.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="font-cormorant text-2xl text-pounamu-700 leading-none mt-1">·</span>
              <div>
                <strong className="text-pounamu-900">Track smoothness, not totals.</strong> Consistency
                beats heroic bursts. A team using the tools thirty times every week wins
                over a team that used it 800 times once and then went silent.
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* SHARE */}
      <section id="share" className="py-20 lg:py-28 bg-pounamu-900 text-mist-50">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <p className="text-xs uppercase tracking-widest text-pounamu-100 mb-4">
            Pass it on
          </p>
          <h2 className="font-cormorant text-4xl lg:text-5xl leading-tight mb-6">
            If a friend's team bought the tools and never landed them…
          </h2>
          <p className="text-base lg:text-lg text-mist-50/85 max-w-xl mx-auto mb-10">
            Send them this page. The thesis lands faster on a quiet read than over
            coffee. The assessment is the wedge — it makes "we should look at this"
            into "we ran the numbers."
          </p>
          <HapaiShareButtons />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-mist-100 border-t border-taupe-200">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 text-sm text-taupe-600 space-y-3">
          <p>
            <strong className="text-taupe-900 font-medium">HAPAI</strong> is built on
            the elite adoption playbook from John Kim (Sendbird / Delight.ai),
            adapted for NZ small business by Kate Hudson at assembl. Coming Q3 2026
            as an add-on to the assembl Business and Industry Suite tiers.
          </p>
          <p>
            Built in Aotearoa for Aotearoa. NZ data residency (Sydney). Privacy Act
            2020 IPP 3A honoured by default. Every output draft-mode, named-human-reviewed
            before it ships. <a href="https://www.assembl.co.nz" className="underline hover:text-pounamu-900">www.assembl.co.nz</a>
          </p>
        </div>
      </footer>
    </main>
  );
}

function GameMetric({ icon: Icon, value, label }: { icon: typeof Trophy; value: string; label: string }) {
  return (
    <div className="rounded-[8px] border border-white/15 bg-white/12 p-3 text-mist-50 backdrop-blur">
      <Icon className="h-4 w-4 text-[#D4A853]" aria-hidden />
      <p className="mt-3 font-cormorant text-3xl leading-none">{value}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mist-50/70">{label}</p>
    </div>
  );
}
