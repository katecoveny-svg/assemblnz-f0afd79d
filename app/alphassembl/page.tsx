import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  HeartHandshake,
  MessageCircle,
  BookOpenCheck,
  MapPin,
  Lock,
  ArrowRight,
  PawPrint,
  Sparkles,
} from 'lucide-react';
import { WaitlistForm } from '@/components/alphassembl/WaitlistForm';
import { ALPHASSEMBL_INTEGRATIONS } from '@/lib/registry/alphassembl-integrations';

export const revalidate = 300;

const display = { fontFamily: 'var(--font-alpha-display), system-ui, sans-serif' } as const;

const whatItDoes = [
  {
    icon: MessageCircle,
    title: 'A trainer in your pocket',
    body: 'Ask Kaiako anything — leash pulling, puppy biting, recall, crate training. You get a calm, force-free plan you can actually follow at home.',
  },
  {
    icon: BookOpenCheck,
    title: 'Grounded, and it shows',
    body: 'Every answer is grounded in real NZ sources and carries a Trust score, so you can see where the advice comes from — never made up.',
  },
  {
    icon: ShieldCheck,
    title: 'Knows when to step back',
    body: 'Anything with a bite or real aggression, Kaiako stops and points you to a vet or a certified behaviourist. Safety first, every time.',
  },
];

const badges = [
  { label: 'LIMA', sub: 'Least Intrusive, Minimally Aversive' },
  { label: 'Humane Hierarchy', sub: 'Health → antecedents → reward → referral' },
  { label: 'Force-free only', sub: 'No shock, prong, choke or “dominance”' },
  { label: 'Refer when in doubt', sub: 'Bites & aggression go to a professional' },
];

export default function AlphassemblLanding() {
  return (
    <main>
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
            style={{ background: 'var(--a-navy)' }}
          >
            <PawPrint size={18} />
          </span>
          <span className="text-lg font-bold tracking-tight" style={{ ...display, color: 'var(--a-navy)' }}>
            Alphassembl
          </span>
          <span className="ml-1 text-xs" style={{ color: 'var(--a-muted)' }}>by assembl</span>
        </div>
        <Link
          href="/alphassembl/chat"
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--a-navy)', ...display }}
        >
          Try Kaiako <ArrowRight size={15} />
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-8 md:grid-cols-2 md:pt-14">
        <div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: '#fef3c7', color: 'var(--a-amber-600)' }}
          >
            <Sparkles size={13} /> Built in Aotearoa · beta
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl" style={{ ...display, color: 'var(--a-navy)' }}>
            One system.
            <br />
            Every part of your dog’s life.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed" style={{ color: 'var(--a-muted)' }}>
            Alphassembl is the operating system for New Zealand dog owners. It starts with{' '}
            <strong style={{ color: 'var(--a-navy)' }}>Kaiako</strong> — a force-free trainer, grounded in NZ advice,
            that gives you a plan you can trust.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/alphassembl/chat"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: 'var(--a-amber)', color: '#3b2400', ...display }}
            >
              Ask Kaiako a question <ArrowRight size={16} />
            </Link>
            <a href="#waitlist" className="text-sm font-semibold" style={{ color: 'var(--a-navy)' }}>
              Join the waitlist →
            </a>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs" style={{ color: 'var(--a-muted)' }}>
            <PawPrint size={14} /> Meet Franklin, our dachshund — low, bold, curious, tenacious.
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute inset-0 -z-10 rounded-[2rem]"
            style={{ background: 'linear-gradient(135deg, var(--a-navy) 0%, var(--a-navy-800) 100%)' }}
          />
          <div className="overflow-hidden rounded-[2rem] p-6">
            <Image
              src="/alphassembl/franklin-transparent.png"
              alt="Franklin, the Alphassembl dachshund"
              width={1122}
              height={1402}
              priority
              className="mx-auto h-auto w-full max-w-sm drop-shadow-2xl"
            />
          </div>
          <div
            className="absolute -bottom-4 left-6 rounded-xl px-4 py-2 text-xs font-semibold shadow-lg"
            style={{ background: 'var(--a-amber)', color: '#3b2400', ...display }}
          >
            Force-free, always.
          </div>
        </div>
      </section>

      {/* What it does */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ ...display, color: 'var(--a-navy)' }}>
          What it does
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {whatItDoes.map((f) => (
            <div key={f.title} className="rounded-2xl border p-6" style={{ borderColor: '#eceef1', background: 'var(--a-grey)' }}>
              <span
                className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: 'var(--a-navy)', color: 'var(--a-amber)' }}
              >
                <f.icon size={20} />
              </span>
              <h3 className="text-lg font-semibold" style={{ ...display, color: 'var(--a-navy)' }}>{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--a-muted)' }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Methodology */}
      <section className="py-14" style={{ background: 'var(--a-navy)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-2">
            <HeartHandshake size={18} style={{ color: 'var(--a-amber)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--a-amber)' }}>
              Our methodology
            </span>
          </div>
          <h2 className="mt-3 max-w-xl text-2xl font-bold tracking-tight text-white sm:text-3xl" style={display}>
            The best trainers agree on one thing: no fear, no force, no pain.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: '#c7d0dd' }}>
            Kaiako follows the international force-free standard — the same principles used by the IAABC and CCPDT —
            and never recommends aversive tools or “dominance” methods.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {badges.map((b) => (
              <div key={b.label} className="rounded-2xl p-5" style={{ background: 'var(--a-navy-800)', border: '1px solid #33445f' }}>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} style={{ color: 'var(--a-amber)' }} />
                  <span className="font-semibold text-white" style={display}>{b.label}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed" style={{ color: '#c7d0dd' }}>{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NZ-first */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <MapPin size={18} style={{ color: 'var(--a-amber-600)' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--a-amber-600)' }}>
                NZ-first
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl" style={{ ...display, color: 'var(--a-navy)' }}>
              Built for dogs and owners in Aotearoa.
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--a-muted)' }}>
              Kaiako knows the <strong style={{ color: 'var(--a-navy)' }}>Dog Control Act 1996</strong> — registration,
              mandatory microchipping since 2006, control in public, and dangerous- and menacing-dog rules. It knows our
              working breeds too — the <strong style={{ color: 'var(--a-navy)' }}>Huntaway</strong> and{' '}
              <strong style={{ color: 'var(--a-navy)' }}>Heading Dog</strong> — and their high drive and stamina.
            </p>
          </div>
          <div className="rounded-2xl border p-6" style={{ borderColor: '#eceef1', background: 'var(--a-grey)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--a-muted)' }}>Grounded in</p>
            <ul className="mt-3 space-y-2.5 text-sm" style={{ color: 'var(--a-navy)' }}>
              {[
                'Dog Control Act 1996 (legislation.govt.nz)',
                'SPCA New Zealand — advice (spca.nz/advice)',
                'Ian Dunbar — Before/After You Get Your Puppy',
              ].map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 shrink-0 items-center rounded px-1.5 text-[10px] font-bold text-white" style={{ background: 'var(--a-success)' }}>
                    Trust A
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Privacy Act notice */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl border p-5" style={{ borderColor: '#e5e7eb', background: 'var(--a-paper)' }}>
          <Lock size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--a-muted)' }} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--a-muted)' }}>
            <strong style={{ color: 'var(--a-navy)' }}>Your privacy (NZ Privacy Act 2020, IPP 12).</strong>{' '}
            Kaiako inference runs on Anthropic’s US infrastructure during beta. We’re moving to NZ-region inference for
            full launch. Your data is stored in Supabase Sydney (ANZ). We handle it under the NZ Privacy Act 2020,
            including IPP 12 on overseas storage — we don’t sell your data, and you can ask us to delete it at any time.
          </p>
        </div>
      </section>

      {/* Works with */}
      <section className="mx-auto max-w-6xl px-6 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} style={{ color: 'var(--a-amber-600)' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--a-amber-600)' }}>
            Works with
          </span>
        </div>
        <h2 className="mt-3 max-w-xl text-2xl font-bold tracking-tight sm:text-3xl" style={{ ...display, color: 'var(--a-navy)' }}>
          Built for NZ dogs and the people who look after them
        </h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {ALPHASSEMBL_INTEGRATIONS.map((i) => (
            <div
              key={i.slug}
              className="flex items-center gap-2.5 rounded-xl border px-4 py-3"
              style={{ borderColor: '#eceef1', background: 'var(--a-grey)' }}
            >
              <span className="text-sm font-semibold" style={{ ...display, color: 'var(--a-navy)' }}>{i.name}</span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={
                  i.status === 'live'
                    ? { background: '#ecfdf3', color: '#17663a' }
                    : { background: '#fef3c7', color: 'var(--a-amber-600)' }
                }
              >
                {i.status === 'live' ? 'Live' : 'Roadmap'}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs" style={{ color: 'var(--a-muted)' }}>
          Draft-only during beta — nothing takes payment or posts to your books without a human saying yes.
        </p>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="py-16" style={{ background: 'var(--a-grey)' }}>
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ ...display, color: 'var(--a-navy)' }}>
            Join the Alphassembl waitlist
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed" style={{ color: 'var(--a-muted)' }}>
            We’re opening the beta to New Zealand dog owners, region by region. Add your details and we’ll be in touch.
          </p>
          <div className="mt-8 rounded-2xl border bg-white p-6 text-left shadow-sm" style={{ borderColor: '#e5e7eb' }}>
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row" style={{ borderColor: '#eceef1', color: 'var(--a-muted)' }}>
          <span>
            <strong style={{ color: 'var(--a-navy)' }}>Alphassembl</strong> — an assembl product · Built in Aotearoa.
          </span>
          <span>
            Kaiako gives guidance, not veterinary treatment. Concept · beta — nothing here is a substitute for your vet.
          </span>
        </div>
      </footer>
    </main>
  );
}
