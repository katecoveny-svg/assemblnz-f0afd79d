import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, CircleDashed, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Launch readiness',
  description: 'Operator-facing checklist of what is functioning, degraded, and still needs proof before public launch claims are repeated.',
  robots: { index: false, follow: false },
};

type Status = 'working' | 'degraded' | 'needs-proof';

const checks: Array<{
  area: string;
  status: Status;
  route: string;
  claim: string;
  notes: string;
}> = [
  {
    area: 'Homepage positioning',
    status: 'working',
    route: '/',
    claim: 'Mahi that earns its proof; nine kete; evidence-pack contract.',
    notes: 'Public copy and kete catalogue are present. This supports launch positioning.',
  },
  {
    area: 'Kete catalogue',
    status: 'working',
    route: '/kete',
    claim: 'Nine Kete to start across NZ operating domains.',
    notes: 'All nine kete render with public agent links and industry descriptions.',
  },
  {
    area: 'Agent demo pages',
    status: 'degraded',
    route: '/agents/gateway',
    claim: 'Run a demo from specialist-agent cards.',
    notes: 'Public detail pages now exist. Full chat execution still requires authenticated /app/chat verification.',
  },
  {
    area: 'Authenticated chat',
    status: 'needs-proof',
    route: '/app/chat',
    claim: 'User can talk to a selected kete specialist.',
    notes: 'Route correctly gates to login. Needs magic-link round trip and a real signed-in prompt test.',
  },
  {
    area: 'Evidence pack preview',
    status: 'working',
    route: '/evidence-pack/preview',
    claim: 'Work can be rendered as a fileable, forwardable, footnotable evidence pack.',
    notes: 'Preview renders sealed Waihanga/Tōro packs and a draft Pīkau pack with citations and hash-chain fields.',
  },
  {
    area: 'Electrify calculator',
    status: 'working',
    route: '/hapai/electrify',
    claim: 'Free energy-cost tool works end-to-end without auth.',
    notes: 'Calculator now falls back to a secure short-lived result snapshot if lead persistence fails.',
  },
  {
    area: 'SPARK agent adoption score',
    status: 'working',
    route: '/hapai',
    claim: 'Gamified adoption assessment is visible and interactive.',
    notes: 'Assessment runs client-side and creates a shareable result URL.',
  },
  {
    area: 'PDF email capture',
    status: 'needs-proof',
    route: '/api/capture-lead',
    claim: 'User can request an emailed PDF.',
    notes: 'Needs live POST test after an electrify result; current UI is present but mail delivery is not verified here.',
  },
];

const statusCopy: Record<Status, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  working: {
    label: 'Working',
    className: 'bg-[rgba(43,107,87,0.10)] text-[color:var(--assembl-pounamu)] border-[rgba(43,107,87,0.25)]',
    icon: CheckCircle2,
  },
  degraded: {
    label: 'Degraded',
    className: 'bg-[rgba(212,168,83,0.13)] text-[#7A5C1E] border-[rgba(212,168,83,0.35)]',
    icon: AlertTriangle,
  },
  'needs-proof': {
    label: 'Needs proof',
    className: 'bg-[rgba(35,33,31,0.06)] text-[color:var(--text-secondary)] border-[rgba(35,33,31,0.15)]',
    icon: CircleDashed,
  },
};

export default function LaunchReadinessPage() {
  const working = checks.filter((check) => check.status === 'working').length;
  const degraded = checks.filter((check) => check.status === 'degraded').length;
  const needsProof = checks.filter((check) => check.status === 'needs-proof').length;

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-14 text-[color:var(--text-primary)] md:px-10 md:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
          Internal launch readiness
        </p>
        <h1 className="mt-5 max-w-4xl font-display text-[clamp(4rem,10vw,8rem)] font-light leading-[0.85]">
          What works, what needs proof.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[color:var(--text-body)]">
          This is the operator checklist behind the launch claims. Green means the surface works.
          Yellow means the page exists but the full promise depends on another gated step.
          Grey means it still needs an authenticated or delivery proof test.
        </p>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <Metric label="Working" value={String(working)} />
          <Metric label="Degraded" value={String(degraded)} />
          <Metric label="Needs proof" value={String(needsProof)} />
        </section>

        <section className="mt-10 overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/60">
          {checks.map((check) => {
            const status = statusCopy[check.status];
            const Icon = status.icon;
            return (
              <article key={check.area} className="grid gap-5 border-b border-[rgba(35,33,31,0.08)] p-5 last:border-b-0 lg:grid-cols-[0.72fr_0.52fr_1fr]">
                <div>
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[12px] uppercase tracking-[0.14em] ${status.className}`}>
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {status.label}
                  </div>
                  <h2 className="mt-3 font-display text-3xl font-light">{check.area}</h2>
                </div>
                <Link href={check.route} className="inline-flex items-center gap-2 self-start font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--assembl-pounamu)]">
                  {check.route}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <div>
                  <p className="text-sm font-medium leading-relaxed">{check.claim}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">{check.notes}</p>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/60 p-5">
      <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">{label}</p>
      <p className="mt-3 font-display text-5xl font-light">{value}</p>
    </div>
  );
}
