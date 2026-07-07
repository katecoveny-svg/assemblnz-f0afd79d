import Link from 'next/link';
import { ArrowRight, Mail, Upload, Landmark, Sparkles, Search, Bell, ShieldCheck } from 'lucide-react';
import { WaitlistForm } from '@/components/bills/WaitlistForm';
import { WordMark, HeroSavingsCard, ProviderMarquee } from '@/components/bills/HeroFx';
import { Reveal } from '@/components/bills/motion';
import { marketClaims, savingsTotal, hiddenCostsTotal } from '@/lib/bills/data';

export const revalidate = 300;

const display = { fontFamily: 'var(--font-bills-display), system-ui, sans-serif' } as const;
const totalFound = savingsTotal + hiddenCostsTotal;

const flow = [
  { icon: Mail, title: 'It reads your bills', body: 'Connect Gmail or Outlook — or just drop a PDF or photo. Claude Vision pulls out provider, amount, due date and plan. No manual entry.' },
  { icon: Upload, title: 'Live extraction', body: 'Drop a real bill and watch it parse in seconds — the same engine runs whether it comes from your inbox or your camera roll.' },
  { icon: Landmark, title: 'Watches the bank', body: 'Drop a bank CSV (parsed in your browser) or connect open banking — it surfaces the recurring charges you forgot.' },
  { icon: Search, title: 'Finds cheaper', body: 'An agent researches NZ providers — power, broadband, insurance — from a live price book, matched to your actual usage.' },
  { icon: Bell, title: 'Tells you first', body: 'Loyalty traps, price rises, mortgage refix, Warmer Kiwi Homes eligibility — surfaced before you have to ask.' },
  { icon: ShieldCheck, title: 'You stay in control', body: 'It recommends and prepares the switch. You approve it. Nothing is switched, cancelled or paid automatically — ever.' },
];

const differentiators = [
  { k: 'Not a dashboard — an operating system', v: 'SortMe shows what you spent. Assembl Bills acts: researches, alerts and prepares the switch.' },
  { k: 'Email-first ingestion', v: 'No NZ product parses email bills. The most frictionless path in — no bank account required first.' },
  { k: 'NZ provider intelligence', v: 'A live price book of real NZ plans — Mercury, Contact, Spark, One NZ, AA — not a US database.' },
  { k: 'Proactive, not reactive', v: 'It surfaces the opportunity the moment a cheaper plan appears or your plan anniversary nears.' },
];

export default function BillsLanding() {
  return (
    <main>
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5 sm:px-6">
        <span className="min-w-0 shrink"><WordMark size={17} /></span>
        <Link
          href="/bills/app"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #5AADA0, #3A7D6E)', boxShadow: '0 0 24px -6px rgba(90,173,160,0.7)', ...display }}
        >
          <span className="hidden sm:inline">See the demo</span>
          <span className="sm:hidden">Demo</span>
          <ArrowRight size={15} />
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-8 pt-6 md:grid-cols-[1.05fr_0.95fr] md:pt-12">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ background: 'var(--b-teal-soft)', color: 'var(--b-teal)', border: '1px solid var(--b-teal-line)' }}>
              <Sparkles size={12} /> Built in Aotearoa · beta waitlist open
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-5 font-extrabold leading-[1.03] tracking-tight" style={{ ...display, color: 'var(--b-ink)', letterSpacing: '-0.02em', fontSize: 'clamp(2.35rem, 7.2vw, 3.9rem)' }}>
              Stop overpaying on your{' '}
              <span style={{ background: 'linear-gradient(90deg, #5AADA0, #E9C46A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 22px rgba(90,173,160,0.4))' }}>
                household bills.
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-lg text-lg leading-relaxed" style={{ color: 'var(--b-muted)' }}>
              The agentic operating system for your NZ bills. It reads them from your inbox, tracks the cost, and{' '}
              <strong style={{ color: 'var(--b-ink)' }}>proactively finds you cheaper plans</strong> — grounded in Powerswitch and Consumer NZ. It recommends; you switch.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#waitlist" className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: 'linear-gradient(135deg, #5AADA0, #3A7D6E)', boxShadow: '0 0 30px -6px rgba(90,173,160,0.7)', ...display }}>
                Join the waitlist <ArrowRight size={16} />
              </a>
              <Link href="/bills/app" className="inline-flex items-center gap-1.5 rounded-xl px-5 py-3.5 text-sm font-semibold transition hover:bg-white/5" style={{ color: 'var(--b-teal)', border: '1px solid var(--b-teal-line)' }}>
                Explore the live console →
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 text-xs" style={{ color: 'var(--b-faint)' }}>
              Live console · sample household. Recommends switches — never acts without your approval.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <HeroSavingsCard found={totalFound} />
        </Reveal>
      </section>

      {/* Provider marquee */}
      <div className="mx-auto max-w-6xl px-6 pb-14">
        <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--b-faint)' }}>Knows every NZ provider</p>
        <ProviderMarquee />
      </div>

      {/* Claim stats */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {marketClaims.map((c, i) => (
            <Reveal key={c.stat} delay={i * 0.06}>
              <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid var(--b-line)', backdropFilter: 'blur(8px)' }}>
                <div className="text-3xl font-extrabold" style={{ ...display, color: 'var(--b-teal)', filter: 'drop-shadow(0 0 14px rgba(90,173,160,0.35))' }}>{c.stat}</div>
                <div className="mt-1.5 text-xs leading-snug" style={{ color: 'var(--b-muted)' }}>{c.body}</div>
                <div className="mt-1.5 text-[10px]" style={{ color: 'var(--b-faint)' }}>{c.source}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <Reveal>
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ ...display, color: 'var(--b-ink)', letterSpacing: '-0.02em' }}>
            One system, inbox to saving
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed" style={{ color: 'var(--b-muted)' }}>
            Bill ingestion, a live cost log, agent-led price research, and honest alerts — the whole loop, in one place.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {flow.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <div className="group h-full rounded-2xl p-6 transition duration-300 hover:-translate-y-1" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid var(--b-line)', backdropFilter: 'blur(8px)' }}>
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl transition group-hover:scale-110" style={{ background: 'var(--b-teal-soft)', color: 'var(--b-teal)', border: '1px solid var(--b-teal-line)', boxShadow: '0 0 20px -6px rgba(90,173,160,0.6)' }}>
                  <f.icon size={20} />
                </span>
                <h3 className="text-base font-bold" style={{ ...display, color: 'var(--b-ink)' }}>{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--b-muted)' }}>{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why different */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--b-teal)' }}>Why it’s different</span>
              <span className="h-px flex-1" style={{ background: 'linear-gradient(90deg, var(--b-teal-line), transparent)' }} />
            </div>
            <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ ...display, color: 'var(--b-ink)', letterSpacing: '-0.02em' }}>
              The closest NZ tools are dashboards. This is an operating system.
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {differentiators.map((d, i) => (
              <Reveal key={d.k} delay={(i % 2) * 0.08}>
                <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid var(--b-line)', backdropFilter: 'blur(8px)' }}>
                  <p className="font-bold" style={{ ...display, color: 'var(--b-ink)' }}>{d.k}</p>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--b-muted)' }}>{d.v}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-xs leading-relaxed" style={{ color: 'var(--b-faint)' }}>
              The US validated the demand: Rocket Money reached millions of users and was acquired by Rocket Companies for US$1.275B. NZ lacks a localised equivalent with NZ provider intelligence and an agentic approach. NZ’s Consumer Data Right went live for banking in December 2025.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="py-16">
        <div className="mx-auto max-w-xl px-6 text-center">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ ...display, color: 'var(--b-ink)', letterSpacing: '-0.02em' }}>
              Join the waitlist
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed" style={{ color: 'var(--b-muted)' }}>
              We’re opening the beta to New Zealand households and small businesses, region by region.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-8 rounded-2xl p-6 text-left" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', border: '1px solid var(--b-teal-line)', boxShadow: 'var(--b-glow-teal)', backdropFilter: 'blur(10px)' }}>
              <WaitlistForm />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row" style={{ borderColor: 'var(--b-line)', color: 'var(--b-faint)' }}>
          <span>
            <strong style={{ color: 'var(--b-ink)' }}>Assembl Bills</strong> — an assembl product · Built in Aotearoa.
          </span>
          <span>Live console · beta. Pricing shown is indicative — always verify on Powerswitch (Consumer NZ).</span>
        </div>
      </footer>
    </main>
  );
}
