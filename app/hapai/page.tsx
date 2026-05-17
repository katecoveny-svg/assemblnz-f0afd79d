import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'hapai — agent adoption tools that lift your team',
  description:
    'hapai is assembl’s library of single-purpose agent adoption tools: no prompting required, no training, no platform switch.',
  openGraph: {
    title: 'hapai — agent adoption tools that lift your team',
    description:
      'Open a curated library of branded utilities for captions, briefs, imagery, share cards, and more.',
    type: 'website',
    url: 'https://www.assembl.co.nz/hapai',
    siteName: 'assembl',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'hapai — agent adoption tools that lift your team',
    description:
      'Single-purpose tools any team member can open and use in 30 seconds.',
  },
};

const tools = [
  {
    name: 'Vessel studio',
    status: 'live',
    description: 'Hero imagery generator',
    href: '/hapai/vessel-studio/',
    image: '/img/kete/waihanga-vessel-square.jpg',
  },
  {
    name: 'Caption composer',
    status: 'live',
    description: 'LinkedIn / IG / X / FB captions',
    href: '/hapai/caption-composer/',
    image: '/img/kete/auaha-vessel-purple-square.jpg',
  },
  {
    name: 'Brief generator',
    status: 'live',
    description: 'Creative / pitch / project briefs',
    href: '/hapai/brief-generator/',
    image: '/img/kete/ako-vessel-amber.jpg',
  },
  {
    name: 'OG card generator',
    status: 'live',
    description: 'Branded 1200×630 share cards',
    href: '/hapai/og-card-generator/',
    image: '/img/kete/hoko-vessel-violet.jpg',
  },
  {
    name: 'Tagline workshop',
    status: 'live',
    description: 'Tagline candidates in five styles',
    href: '/hapai/tagline-workshop/',
    image: '/img/kete/toro-vessel-charcoal.jpg',
  },
] as const;

const reasons = [
  {
    title: 'Frictionless on entry',
    body:
      'Each tool is one page, one purpose. No prompt engineering. No platform switch. Your team gets a usable output before the second cup of coffee.',
  },
  {
    title: 'Branded to your org',
    body:
      'Industry Pack customers get the full HAPAI library white-labelled: your wordmark, your voice, your colours. Feels native because it is.',
  },
  {
    title: 'Privacy by default',
    body:
      'Your work stays in your browser. Bring your own LLM API key. Nothing is sent to assembl. Everything generated belongs to your team.',
  },
] as const;

export default function HapaiPage() {
  return (
    <div className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.10)] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--assembl-pounamu)]">
              built in aotearoa · hapai
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(3.8rem,8vw,7.5rem)] font-light italic leading-[0.88]">
              Adoption tools that lift your team.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[color:var(--text-body)] md:text-xl">
              Hāpai (te reo): to lift up, to elevate, to support. HAPAI is a
              library of single-purpose tools that any team member can open and
              use in 30 seconds: no prompting required, no training, no platform
              switch.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="#tools" className="cta-primary inline-flex h-12 items-center gap-2 px-6">
                Open the library <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/book-a-pilot" className="btn-ghost inline-flex h-12 items-center px-6">
                Book a pilot
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/60 shadow-[0_24px_70px_rgba(35,33,31,0.10)]">
            <div className="relative aspect-[4/3]">
              <Image
                src="/img/kete/waihanga-vessel.jpg"
                alt="assembl vessel composition"
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#23211F]/50 via-transparent to-[#FAF7F2]/20" />
              <div className="absolute bottom-5 left-5 right-5 rounded-[6px] border border-white/25 bg-[#FAF7F2]/88 p-4 backdrop-blur">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
                  public hapai
                </p>
                <p className="mt-2 font-display text-3xl font-light italic leading-none">
                  single-purpose tools, ready when the work starts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(35,33,31,0.10)] px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {reasons.map((reason) => (
            <article key={reason.title} className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-6">
              <CheckCircle2 className="h-5 w-5 text-[color:var(--assembl-pounamu)]" aria-hidden />
              <h2 className="mt-5 font-display text-3xl font-light italic">{reason.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">{reason.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="tools" className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
              public library
            </p>
            <h2 className="mt-4 font-display text-[clamp(3rem,7vw,5.5rem)] font-light italic leading-[0.9]">
              Open the library.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[color:var(--text-body)]">
              Tools shipping over the next 30 days. Each is free to use with
              your own API key.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {tools.map((tool) => (
              <article
                key={tool.name}
                className="flex min-h-[360px] flex-col overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/58"
              >
                <div className="relative aspect-[4/3] border-b border-[rgba(35,33,31,0.10)]">
                  <Image
                    src={tool.image}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 18vw, (min-width: 768px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span
                    className={
                      tool.status === 'live'
                        ? 'w-fit rounded-full bg-[color:var(--assembl-pounamu)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#FAF7F2]'
                        : 'w-fit rounded-full border border-[rgba(35,33,31,0.14)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]'
                    }
                  >
                    {tool.status}
                  </span>
                  <h3 className="mt-5 font-display text-3xl font-light italic leading-none">{tool.name}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">{tool.description}</p>
                  {tool.href ? (
                    <Link
                      href={tool.href}
                      className="mt-auto inline-flex items-center gap-2 pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]"
                    >
                      Open the tool <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
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

      <section className="border-y border-[rgba(212,168,83,0.36)] bg-white/45 px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.86fr_1fr] lg:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
              industry pack
            </p>
            <h2 className="mt-4 font-display text-[clamp(3rem,7vw,5.5rem)] font-light italic leading-[0.9]">
              Bring HAPAI to your team.
            </h2>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-[color:var(--text-body)]">
              The full HAPAI library, branded to your org and available to every
              team member, is included in the Industry Pack at $5,000/month.
              White-labelled wordmark, your colour, your voice. Plus 12+
              additional tools available only to Industry Pack customers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pricing" className="cta-primary inline-flex h-12 items-center px-6">
                See pricing
              </Link>
              <Link href="/book-a-pilot" className="btn-ghost inline-flex h-12 items-center px-6">
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
            <h2 className="mt-4 font-display text-5xl font-light italic leading-none">
              Why HAPAI exists.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[color:var(--text-body)]">
              I built HAPAI because agent adoption was failing for the same
              reason in every organisation I talked to: one person tries a
              generic chat tool, sees value, and cannot get the rest of the
              team to switch tools and learn prompting.
            </p>
            <p className="mt-5 text-lg leading-relaxed text-[color:var(--text-body)]">
              The tools below remove that friction. Each one is single-purpose
              and branded: the kind of thing a marketing team can open in the
              morning and an HR team can open in the afternoon, without ever
              leaving their language.
            </p>
            <p className="mt-6 font-display text-2xl font-light italic text-[color:var(--text-primary)]">
              Kate Hudson, founder · assembl
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
