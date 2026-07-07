import Link from 'next/link';
import {
  Wallet,
  ArrowRight,
  Mail,
  Upload,
  Landmark,
  Sparkles,
  Search,
  Bell,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { WaitlistForm } from '@/components/bills/WaitlistForm';
import { marketClaims } from '@/lib/bills/data';

export const revalidate = 300;

const display = { fontFamily: 'var(--font-bills-display), system-ui, sans-serif' } as const;

const flow = [
  { icon: Mail, title: 'It reads your bills', body: 'Connect Gmail or Outlook and Assembl Bills parses the PDFs and email bodies — provider, amount, due date, plan and usage. No manual entry.' },
  { icon: Upload, title: 'Or upload a photo', body: 'Snap a paper bill or drop a PDF. OCR + AI pull out the details and add it to your running cost log.' },
  { icon: Landmark, title: 'And watches the bank', body: 'With your consent, open banking (Akahu / CDR) surfaces the recurring charges you forgot — the quiet subscriptions and duplicate debits.' },
  { icon: Search, title: 'Then finds cheaper', body: 'An agent researches NZ-specific alternatives — power, broadband, insurance — grounded in Powerswitch and Consumer NZ, matched to your actual usage.' },
  { icon: Bell, title: 'And tells you first', body: '“We found a cheaper power plan for your address.” Loyalty traps, price rises, mortgage refix, Warmer Kiwi Homes eligibility — surfaced before you have to ask.' },
  { icon: ShieldCheck, title: 'You stay in control', body: 'Assembl Bills recommends and prepares the switch. You approve it. Nothing is switched, cancelled or paid automatically — ever.' },
];

const differentiators = [
  { k: 'Not a dashboard — an operating system', v: 'SortMe shows you what you spent. Assembl Bills acts: it researches, alerts and prepares the switch.' },
  { k: 'Email-first ingestion', v: 'No NZ product parses email bills. It’s the most frictionless path in — you don’t have to connect a bank account first.' },
  { k: 'NZ provider intelligence', v: 'Trained on Mercury, Contact, Genesis, Meridian, Spark, One NZ, AA, Tower — not a US database.' },
  { k: 'Proactive, not reactive', v: 'It surfaces the opportunity when a cheaper plan appears or your plan anniversary approaches — you don’t have to remember to check.' },
];

export default function BillsLanding() {
  return (
    <main>
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: 'var(--b-teal)' }}>
            <Wallet size={17} />
          </span>
          <span className="text-lg font-bold tracking-tight" style={{ ...display, color: 'var(--b-ink)' }}>
            Assembl Bills
          </span>
          <span className="ml-1 text-xs" style={{ color: 'var(--b-faint)' }}>by assembl</span>
        </div>
        <Link
          href="/bills/app"
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--b-teal)', ...display }}
        >
          See the demo <ArrowRight size={15} />
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-14 pt-6 md:grid-cols-[1.05fr_0.95fr] md:pt-12">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--b-teal-soft)', color: 'var(--b-teal-deep)' }}>
            <Sparkles size={13} /> Built in Aotearoa · beta waitlist open
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.06] tracking-tight sm:text-[52px]" style={{ ...display, color: 'var(--b-ink)' }}>
            Stop overpaying on your household bills.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed" style={{ color: 'var(--b-muted)' }}>
            Assembl Bills is the agentic operating system for your NZ bills. It reads them from your inbox, tracks the cost, and{' '}
            <strong style={{ color: 'var(--b-ink)' }}>proactively finds you cheaper plans</strong> — grounded in Powerswitch and Consumer NZ. It recommends; you switch.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="#waitlist" className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: 'var(--b-teal)', ...display }}>
              Join the waitlist <ArrowRight size={16} />
            </a>
            <Link href="/bills/app" className="text-sm font-semibold" style={{ color: 'var(--b-teal-deep)' }}>
              Explore the demo console →
            </Link>
          </div>
          <p className="mt-5 text-xs" style={{ color: 'var(--b-faint)' }}>
            Concept demo · sample data only. Recommends switches — never acts without your approval.
          </p>
        </div>

        {/* Claim panel */}
        <div className="rounded-3xl p-6" style={{ background: 'var(--b-surface)', border: '1px solid var(--b-line)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--b-faint)' }}>
            The NZ picture
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {marketClaims.map((c) => (
              <div key={c.stat} className="rounded-2xl p-4" style={{ background: 'var(--b-surface-alt)' }}>
                <div className="text-2xl font-bold" style={{ ...display, color: 'var(--b-teal-deep)' }}>{c.stat}</div>
                <div className="mt-1 text-xs leading-snug" style={{ color: 'var(--b-muted)' }}>{c.body}</div>
                <div className="mt-1.5 text-[10px]" style={{ color: 'var(--b-faint)' }}>{c.source}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed" style={{ color: 'var(--b-muted)' }}>
            The average household could save <strong style={{ color: 'var(--b-ink)' }}>$400–$500/year</strong> just by switching power — yet most never do, because comparison is made unnecessarily complex.{' '}
            <span style={{ color: 'var(--b-faint)' }}>Consumer NZ</span>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ ...display, color: 'var(--b-ink)' }}>
          One system, from inbox to saving
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed" style={{ color: 'var(--b-muted)' }}>
          Bill ingestion, a live cost log, agent-led price research, and honest alerts — the whole loop, in one place.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {flow.map((f) => (
            <div key={f.title} className="rounded-2xl p-6" style={{ background: 'var(--b-surface)', border: '1px solid var(--b-line)' }}>
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'var(--b-teal-soft)', color: 'var(--b-teal-deep)' }}>
                <f.icon size={20} />
              </span>
              <h3 className="text-base font-semibold" style={{ ...display, color: 'var(--b-ink)' }}>{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--b-muted)' }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why it's different */}
      <section className="py-14" style={{ background: 'var(--b-surface-alt)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-2">
            <MapPin size={18} style={{ color: 'var(--b-teal-deep)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--b-teal-deep)' }}>
              Why it’s different
            </span>
          </div>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl" style={{ ...display, color: 'var(--b-ink)' }}>
            The closest NZ tools are dashboards. This is an operating system.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {differentiators.map((d) => (
              <div key={d.k} className="rounded-2xl p-5" style={{ background: 'var(--b-surface)', border: '1px solid var(--b-line)' }}>
                <p className="font-semibold" style={{ ...display, color: 'var(--b-ink)' }}>{d.k}</p>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--b-muted)' }}>{d.v}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-2xl text-xs leading-relaxed" style={{ color: 'var(--b-faint)' }}>
            The US validated the demand: Rocket Money reached millions of users and was acquired by Rocket Companies for US$1.275B. NZ lacks a localised equivalent with NZ provider intelligence and an agentic approach. NZ’s Consumer Data Right went live for banking in December 2025 — the infrastructure is arriving.
          </p>
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="py-16">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ ...display, color: 'var(--b-ink)' }}>
            Join the Assembl Bills waitlist
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed" style={{ color: 'var(--b-muted)' }}>
            We’re opening the beta to New Zealand households and small businesses, region by region. Add your details and we’ll be in touch.
          </p>
          <div className="mt-8 rounded-2xl p-6 text-left" style={{ background: 'var(--b-surface)', border: '1px solid var(--b-line)' }}>
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row" style={{ borderColor: 'var(--b-line)', color: 'var(--b-faint)' }}>
          <span>
            <strong style={{ color: 'var(--b-ink)' }}>Assembl Bills</strong> — an assembl product · Built in Aotearoa.
          </span>
          <span>Concept · beta. Pricing shown in the demo is indicative — always verify on Powerswitch (Consumer NZ).</span>
        </div>
      </footer>
    </main>
  );
}
