import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ImageIcon, Mail, Repeat2, Sparkles, Wrench } from 'lucide-react';
import { HapaiToolPreview } from '@/components/hapai/HapaiToolPreview';
import { PainfulWorkflowCapture } from '@/components/hapai/PainfulWorkflowCapture';
import { ToolLeadCapture } from '@/components/hapai/ToolLeadCapture';
import {
  HAPAI_TOOLS,
  getHapaiToolEmailHref,
  getHapaiToolShareImagePath,
} from '@/lib/hapai/shareable-tools';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'HAPAI — shareable tools for real work',
  description:
    'HAPAI means to lift or support. It is assembl’s public tool library: small shareable tools for study, meetings, travel, compliance logs, share cards, and everyday work.',
  openGraph: {
    title: 'HAPAI — shareable tools for real work',
    description:
      'Open one useful tool, run one real task, and share the result.',
    type: 'website',
    url: 'https://www.assembl.co.nz/hapai',
    siteName: 'assembl',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HAPAI — shareable tools for real work',
    description:
      'One task, one tool, one useful result.',
  },
};

const reasons = [
  {
    title: 'One task at a time',
    body:
      'Each HAPAI tool does one job clearly: turn a photo, paste, recording, note, or brief into something useful enough to review.',
  },
  {
    title: 'Useful without training',
    body:
      'No prompt course, no platform tour. Open the page, add the task in front of you, and get a draft, checklist, or plan.',
  },
  {
    title: 'Wins become internal tools',
    body:
      'When a public tool proves useful, assembl can turn it into a private tool with your data, voice, permissions, and review trail.',
  },
] as const;

const adoptionLoop = [
  {
    title: 'Pick one task',
    body: 'Use something ordinary and slightly tedious: meeting prep, a customer reply, a timetable, a food record, a share card, a brief.',
    icon: Sparkles,
  },
  {
    title: 'Run it through a tool',
    body: 'Use the tool before you rebuild the spreadsheet, rewrite the email, or stare at a blank doc.',
    icon: Wrench,
  },
  {
    title: 'Make the win repeatable',
    body: 'If the result helps, turn it into an internal tool your team can open again tomorrow, branded and reviewed like the rest of your work.',
    icon: Repeat2,
  },
] as const;

export default function HapaiPage() {
  return (
    <div className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.10)] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--assembl-pounamu)]">
              built in aotearoa · HAPAI
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(3.2rem,6vw,5.8rem)] font-light leading-[0.92]">
              Tools for the job in front of you.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[color:var(--text-body)] md:text-xl">
              assembl&apos;s public library of single-purpose tools. Upload the note, paste the
              rough text, record the meeting, photograph the notice, or choose
              the task. Get a draft, checklist, share card, plan, or next action
              you can review.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)]">
              This is how practical adoption starts: with real work, a visible
              result, and a clear path to make the useful tools private for your
              team.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="#tools" className="cta-primary inline-flex h-12 items-center gap-2 px-6">
                Open the library <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/pilot-sprint" className="btn-ghost inline-flex h-12 items-center px-6">
                Book a pilot
              </Link>
            </div>
            <div className="mt-8 max-w-md">
              <ToolLeadCapture
                toolSlug="hapai-library"
                source="hapai-library"
                title="One new free tool each fortnight"
                blurb="Get one new free tool in your inbox each fortnight. Short, useful, unsubscribe anytime."
                successMessage="Ka pai. You’re on the list — one tool each fortnight."
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/60 shadow-[0_28px_90px_rgba(35,33,31,0.12)]">
            <div className="relative aspect-[4/3]">
              <Image
                src="/img/kete/home-vessel-pounamu.jpg"
                alt="assembl evidence vessel on a warm cream background"
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2]/8 via-transparent to-[#FAF7F2]/46" />
              <div className="absolute bottom-5 left-5 right-5 rounded-[6px] border border-white/25 bg-[#FAF7F2]/88 p-4 backdrop-blur">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
                  public tool library
                </p>
                <p className="mt-2 font-display text-2xl font-light leading-tight md:text-3xl">
                  One task. One tool. One useful result.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(35,33,31,0.10)] px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {reasons.map((reason) => (
            <article key={reason.title} className="glass-card p-6">
              <CheckCircle2 className="h-5 w-5 text-[color:var(--assembl-pounamu)]" aria-hidden />
              <h2 className="mt-5 font-display text-3xl font-light">{reason.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">{reason.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-b border-[rgba(35,33,31,0.10)] bg-[#F7F1E9] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--assembl-pounamu)]">
              practical adoption
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.8rem,6vw,5rem)] font-light leading-[0.94]">
              Teams learn by trying one real task.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[color:var(--text-body)]">
              Adoption starts small: someone runs a meeting note, school notice,
              or customer reply through a tool and gets a useful first draft.
              HAPAI makes those wins visible, shareable, and easy to turn into
              private tools for the team.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {adoptionLoop.map(({ title, body, icon: Icon }) => (
              <article key={title} className="glass-card p-5">
                <Icon className="h-5 w-5 text-[color:var(--assembl-pounamu)]" aria-hidden />
                <h3 className="mt-6 font-display text-3xl font-light leading-none">{title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="tools" className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
              public library
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.8rem,6vw,4.8rem)] font-light leading-[0.94]">
              Open the library.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[color:var(--text-body)]">
              Public tools you can post, email, or send to someone with one real
              job to try. The useful ones can become private, branded tools for
              a team.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {HAPAI_TOOLS.map((tool) => (
              <article
                key={tool.name}
                className="glass-card glass-card-hover group flex min-h-[420px] flex-col overflow-hidden"
              >
                <div className="relative aspect-[16/10] border-b border-[rgba(35,33,31,0.08)]">
                  <HapaiToolPreview tool={tool} />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                      {tool.category}
                    </p>
                    <span
                      className={
                        tool.status === 'live'
                          ? 'rounded-full border border-[rgba(43,107,87,0.24)] bg-[#E8EFE9] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#2B6B57]'
                          : 'rounded-full border border-[rgba(35,33,31,0.14)] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]'
                      }
                    >
                      {tool.status}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-[2rem] font-light leading-none text-[#23211F]">
                    {tool.name}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
                    {tool.description}
                  </p>
                  {tool.href ? (
                    <div className="mt-auto pt-7">
                      <Link
                        href={tool.href}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[rgba(43,107,87,0.24)] bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(232,239,233,0.70))] px-4 text-sm font-medium text-[#103F35] shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_14px_36px_rgba(35,33,31,0.08)] transition hover:border-[rgba(43,107,87,0.44)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_18px_46px_rgba(43,107,87,0.14)]"
                      >
                        Open tool <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                        <Link
                          href={getHapaiToolShareImagePath(tool)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[color:var(--text-secondary)] transition hover:text-[color:var(--assembl-pounamu)]"
                        >
                          <ImageIcon className="h-3.5 w-3.5" aria-hidden />
                          Share image
                        </Link>
                        <a
                          href={getHapaiToolEmailHref(tool)}
                          className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[color:var(--text-secondary)] transition hover:text-[color:var(--assembl-pounamu)]"
                        >
                          <Mail className="h-3.5 w-3.5" aria-hidden />
                          Email
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-auto pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
                      shipping soon
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow-request" className="border-t border-[rgba(35,33,31,0.10)] bg-[#F7F1E9] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <PainfulWorkflowCapture />
        </div>
      </section>

      <section className="border-y border-[rgba(212,168,83,0.36)] bg-white/45 px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.86fr_1fr] lg:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
              industry pack
            </p>
            <h2 className="mt-4 font-display text-[clamp(3rem,7vw,5.5rem)] font-light leading-[0.9]">
              Bring HAPAI to your team.
            </h2>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-[color:var(--text-body)]">
              The full HAPAI library, branded to your org and available to every
              team member, is included in a kete pack at $3,500/month.
              Your wordmark, your colour, your voice, your review rules. The
              point is simple: every team should be able to create, open, and
              share small internal tools for the work they actually do.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pricing" className="cta-primary inline-flex h-12 items-center px-6">
                See pricing
              </Link>
              <Link href="/pilot-sprint" className="btn-ghost inline-flex h-12 items-center px-6">
                Book a pilot
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.72fr_1fr] lg:items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/50 shadow-[0_18px_56px_rgba(35,33,31,0.10)]">
            <Image
              src="/img/about/kate-hudson-portrait-blue-shirt.webp"
              alt="Kate Hudson, founder of assembl"
              fill
              sizes="(min-width: 1024px) 34vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--assembl-pounamu)]">
              founder note
            </p>
            <h2 className="mt-4 font-display text-5xl font-light leading-none">
              Why HAPAI exists.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[color:var(--text-body)]">
              I built HAPAI because adoption was failing for the same reason in
              every organisation I talked to: one person tries a generic chat
              tool, sees value, and cannot get the rest of the team to switch
              tools and learn prompting.
            </p>
            <p className="mt-5 text-lg leading-relaxed text-[color:var(--text-body)]">
              The tools below remove that friction. Each one is single-purpose
              and branded: the kind of thing a marketing team can open in the
              morning, an operator can open after lunch, and a manager can turn
              into a repeatable internal system by Friday.
            </p>
            <p className="mt-6 font-display text-2xl font-light text-[color:var(--text-primary)]">
              Kate Hudson, founder · assembl
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
