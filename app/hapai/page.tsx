import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'HAPAI — adoption tools that lift your team · assembl',
  description:
    'Hāpai (te reo: to lift up). HAPAI is a library of single-purpose tools that any team member can open and use in 30 seconds. No prompting required. Built in Aotearoa.',
  openGraph: {
    title: 'HAPAI — adoption tools that lift your team',
    description:
      'Specialist agents. Human review. Evidence packs. The adoption layer for NZ teams.',
    images: ['/og/og-assembl.png'],
  },
};

type Tool = {
  slug: string;
  name: string;
  description: string;
  status: 'live' | 'soon';
  og?: string;
};

const TOOLS: Tool[] = [
  {
    slug: 'vessel-studio',
    name: 'Vessel studio.',
    description:
      'A quiet prompt builder for hero imagery. Flux 1.1 pro via fal.ai, your API key.',
    status: 'live',
    og: '/og/og-assembl.png',
  },
  {
    slug: 'caption-composer',
    name: 'Caption composer.',
    description:
      'LinkedIn · Instagram · X · Facebook captions in your voice. Variants on tap.',
    status: 'live',
    og: '/og/og-assembl.png',
  },
  {
    slug: 'brief-generator',
    name: 'Brief generator.',
    description: 'Creative · pitch · project briefs. Single-page PDF in your voice.',
    status: 'live',
    og: '/og/og-assembl.png',
  },
  {
    slug: 'og-card-generator',
    name: 'OG card generator.',
    description:
      'Branded 1200×630 social share cards. Headline, accent, kete vessel.',
    status: 'soon',
  },
  {
    slug: 'tagline-workshop',
    name: 'Tagline workshop.',
    description:
      'Generate tagline candidates in your voice. Statement, question, promise, verb-led.',
    status: 'soon',
  },
];

export default function HapaiPage() {
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.10)] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--assembl-pounamu)]">
              BUILT IN AOTEAROA · HAPAI
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(3.8rem,8vw,7.5rem)] font-light italic leading-[0.88] text-[color:var(--assembl-pounamu)]">
              Adoption tools that lift your team.
            </h1>
            <p className="mt-7 max-w-2xl font-display text-[28px] font-light leading-tight text-[color:var(--text-secondary)]">
              Hāpai (te reo Māori): to lift up, to elevate, to support.
            </p>
            <p className="mt-5 max-w-[620px] text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
              HAPAI is a library of single-purpose tools your team can open in 30
              seconds — no prompting, no training, no platform switch. Each tool
              is branded to your organisation, runs in your browser, and produces
              work in your voice. Use them free; bring HAPAI to your whole team
              with an Industry Pack.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="#tools"
                className="cta-primary inline-flex h-12 items-center rounded-full px-6"
              >
                Open the library →
              </Link>
              <Link
                href="/book-a-pilot"
                className="btn-ghost inline-flex h-12 items-center rounded-full px-6"
              >
                Book a pilot
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/60 shadow-[0_24px_70px_rgba(35,33,31,0.10)]">
            <div className="relative aspect-[31/39]">
              <Image
                src="/img/about/kate-hudson-portrait-tan-blazer-art.png"
                alt="Kate Hudson, founder of assembl"
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(35,33,31,0.10)] px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-[720px]">
            <h2 className="font-display text-[clamp(3rem,7vw,5.5rem)] font-light italic leading-[0.9]">
              Why HAPAI works where other tools stall.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
              Most teams have one person playing with chatbots and the rest still
              on email. The tool sits in someone&apos;s tab, isolated. HAPAI is
              different — every tool is single-purpose, branded to your org, and
              immediately useful without a prompt.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <article className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
                FRICTIONLESS ON ENTRY
              </p>
              <h3 className="mt-5 font-display text-4xl font-light italic leading-none">
                One page. One purpose.
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
                Each HAPAI tool is a single page with one job. No prompt
                engineering. No platform switch. Your team gets a usable output
                before the second cup of coffee.
              </p>
            </article>

            <article className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
                BRANDED TO YOUR ORG
              </p>
              <h3 className="mt-5 font-display text-4xl font-light italic leading-none">
                Feels native because it is.
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
                Industry Pack customers get the full HAPAI library
                white-labelled — your wordmark, your voice, your colours. The
                tools live at your domain. Your team uses them as your tools, not
                another vendor&apos;s.
              </p>
            </article>

            <article className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
                PRIVACY BY DEFAULT
              </p>
              <h3 className="mt-5 font-display text-4xl font-light italic leading-none">
                Your work stays with you.
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
                Every HAPAI tool runs in your browser. Bring your own LLM API key.
                Nothing is sent to assembl. Every output belongs to your team —
                sealed against the work they did.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="tools" className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-[720px]">
            <h2 className="font-display text-[clamp(3rem,7vw,5.5rem)] font-light italic leading-[0.9]">
              Open the library.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
              Five tools shipping over the next 30 days. Each is free to use with
              your own API key. Each will be available white-labelled inside the
              Industry Pack.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {TOOLS.map((tool) => (
              <ToolCard key={tool.slug} {...tool} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[rgba(212,168,83,0.36)] bg-white/45 px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.86fr_1fr] lg:items-start">
          <div>
            <h2 className="font-display text-[clamp(3rem,7vw,5.5rem)] font-light italic leading-[0.9]">
              Bring HAPAI to your whole team.
            </h2>
          </div>
          <div>
            <p className="max-w-[680px] text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
              The free HAPAI tools are great for one person. The Industry Pack
              brings the full library to your whole team — white-labelled to your
              organisation, hosted at your domain, with 12+ additional tools
              available only to paying customers. JD composer, meeting notes,
              vendor risk, evidence pack composer, Privacy Act 2020 summary —
              your team&apos;s adoption layer, in your voice.
            </p>

            <dl className="mt-8 grid gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-primary)]">
              <div className="grid gap-1 border-t border-[rgba(35,33,31,0.12)] pt-3 sm:grid-cols-[1fr_0.8fr_1.25fr]">
                <dt>PILOT SPRINT</dt>
                <dd>$5,000 + GST</dd>
                <dd>one workflow, one team, one proof</dd>
              </div>
              <div className="grid gap-1 border-t border-[rgba(35,33,31,0.12)] pt-3 sm:grid-cols-[1fr_0.8fr_1.25fr]">
                <dt>INDUSTRY PACK</dt>
                <dd>$5,000 / month</dd>
                <dd>full HAPAI library + agent fleet</dd>
              </div>
              <div className="grid gap-1 border-t border-[rgba(35,33,31,0.12)] pt-3 sm:grid-cols-[1fr_0.8fr_1.25fr]">
                <dt>OUTCOME PRICING</dt>
                <dd>from $5,000+</dd>
                <dd>custom multi-kete engagements</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/pricing"
                className="cta-primary inline-flex h-12 items-center rounded-full px-6"
              >
                See pricing →
              </Link>
              <Link
                href="/book-a-pilot"
                className="btn-ghost inline-flex h-12 items-center rounded-full px-6"
              >
                Book a pilot
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-[clamp(3rem,7vw,5.5rem)] font-light italic leading-[0.9]">
            Why HAPAI exists.
          </h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-[360px_1fr] lg:items-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.22)] bg-white/50">
              <Image
                src="/img/about/kate-hudson-portrait-blue-shirt.png"
                alt="Kate Hudson, founder of assembl"
                fill
                sizes="(min-width: 1024px) 360px, 100vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                I built HAPAI because agent adoption was failing for the same
                reason in every NZ organisation I talked to: one person plays
                with chatbots, sees value, can&apos;t get the rest of the team to
                switch tools and learn prompting. The tools below remove that
                friction. Each one is single-purpose and branded to your team —
                the kind of thing a marketing person can open in the morning and
                an HR person can open in the afternoon, without ever leaving their
                language.
              </p>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--assembl-pounamu)]">
                KATE HUDSON · FOUNDER · ASSEMBL
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ToolCard({ slug, name, description, status, og }: Tool) {
  const live = status === 'live';
  const body = (
    <>
      <div className="relative aspect-[1200/630] border-b border-[rgba(35,33,31,0.10)] bg-[#F1ECE3]">
        {og ? (
          <Image
            src={og}
            alt={`${name} thumbnail`}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-4xl font-light italic text-[color:var(--assembl-pounamu)]">
            hapai
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span
          className={
            live
              ? 'w-fit rounded-full bg-[color:var(--assembl-pounamu)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#FAF7F2]'
              : 'w-fit rounded-full border border-[rgba(35,33,31,0.14)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]'
          }
        >
          {live ? 'LIVE' : 'COMING SOON'}
        </span>
        <h3 className="mt-5 font-display text-4xl font-light italic leading-none">{name}</h3>
        <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
          {description}
        </p>
        {live ? (
          <span className="mt-auto pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
            Open the tool →
          </span>
        ) : null}
      </div>
    </>
  );

  if (live) {
    return (
      <Link
        href={`/hapai/${slug}/`}
        className="flex min-h-[380px] flex-col overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/58 transition hover:-translate-y-0.5 hover:border-[rgba(43,107,87,0.42)]"
      >
        {body}
      </Link>
    );
  }

  return (
    <article className="flex min-h-[380px] flex-col overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/58 opacity-85">
      {body}
    </article>
  );
}
