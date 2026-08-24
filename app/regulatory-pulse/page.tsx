import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Database, FileClock, Radio, Scale, ShieldCheck } from 'lucide-react';
import { getParliamentBillWatch, PARLIAMENT_BILL_FEEDS } from '@/lib/parliament-bills';
import { getRegulatoryPulse } from '@/lib/regulatory-pulse';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Live New Zealand legislation watch',
  description:
    'See proposed Member’s Bills, introduced Bills and official New Zealand legislation sources moving through assembl’s regulatory watch.',
  alternates: { canonical: '/regulatory-pulse' },
};

const PIPELINE = [
  {
    number: '01',
    title: 'Proposal lodged',
    body: 'Parliament’s proposed Member’s Bill feed records the title and official proposal ID before introduction.',
  },
  {
    number: '02',
    title: 'Details confirmed',
    body: 'Parliament’s data record adds the lodged date, member in charge and whether the proposal has been drawn.',
  },
  {
    number: '03',
    title: 'Introduction checked',
    body: 'The current Bills feed is checked separately so a matching title can move from proposal to introduced Bill.',
  },
  {
    number: '04',
    title: 'Change recorded',
    body: 'Each new, updated or removed record is written to the knowledge change log for review and retrieval.',
  },
] as const;

function formatCapturedAt(iso: string): string {
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export default async function RegulatoryPulsePage() {
  const [watch, pulse] = await Promise.all([getParliamentBillWatch(), getRegulatoryPulse()]);
  const featured = watch.featured;
  const active = !watch.degraded && featured !== null;

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-[#240B21]">
      <section className="relative overflow-hidden border-b border-[#240B21]/15">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(36,11,33,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(36,11,33,.055)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(90deg,#000,transparent_82%)]"
        />
        <div className="container relative grid gap-10 py-20 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:py-28">
          <div>
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#654A4E]">
              <span className="relative flex h-2.5 w-2.5" aria-hidden>
                <span className={`absolute inset-0 rounded-full ${active ? 'animate-ping bg-[#916A70]/45' : 'bg-[#654A4E]/20'}`} />
                <span className={`relative h-2.5 w-2.5 rounded-full ${active ? 'bg-[#916A70]' : 'bg-[#654A4E]'}`} />
              </span>
              Live New Zealand legislation watch
            </div>
            <h1 className="mt-7 max-w-5xl text-[clamp(3.5rem,8vw,7.8rem)] font-medium leading-[0.82] tracking-[-0.075em]">
              From proposal
              <span className="block text-[#916A70]">to law.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-7 text-[#654A4E] md:text-lg">
              assembl watches the official Parliament proposal and current Bill feeds, then checks
              proposal details against Parliament’s own data record. This page shows the source and
              its boundary—not a prediction that a proposal will pass.
            </p>
          </div>

          <dl className="grid grid-cols-2 border border-[#240B21]/15 bg-[#F5F1F2]">
            <Metric value={watch.proposed.length} label="proposals now listed" icon={FileClock} />
            <Metric value={watch.introduced.length} label="current Bills" icon={Scale} />
            <Metric value={pulse.liveSources} label="active source checks" icon={Radio} />
            <Metric value={pulse.pcoSources} label="PCO Act sources" icon={Database} />
          </dl>
        </div>
      </section>

      <section className="border-b border-[#240B21]/15 bg-[#240B21] text-[#FFFDFB]">
        <div className="container grid gap-10 py-16 lg:grid-cols-[.76fr_1.24fr] lg:py-20">
          <div className="flex flex-col">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5F1F2]">
              Watched record · food rescue signal
            </p>
            <h2 className="mt-5 text-[clamp(2.6rem,5vw,4.8rem)] font-medium leading-[0.88] tracking-[-0.06em]">
              The July proposal is visible now.
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-6 text-[#F5F1F2]">
              It remains a proposal unless the introduced Bill feed or a later official record says
              otherwise. assembl keeps that distinction attached to the source.
            </p>
            <p className="mt-auto pt-10 font-mono text-[9px] uppercase tracking-[0.18em] text-[#F5F1F2]">
              Checked {formatCapturedAt(watch.capturedAt)} NZ time
            </p>
          </div>

          {featured ? (
            <article className="border border-[#FFFDFB]/30 bg-[#FFFDFB] p-6 text-[#240B21] shadow-[18px_18px_0_rgba(145,106,112,.35)] md:p-9">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#240B21]/20 pb-5">
                <span className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#654A4E]">
                  <ShieldCheck className="h-4 w-4 text-[#916A70]" aria-hidden />
                  {featured.statusLabel}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#654A4E]">
                  Parliament ID · {featured.id.slice(0, 8)}
                </span>
              </div>
              <h3 className="mt-7 max-w-3xl text-[clamp(2rem,4vw,4rem)] font-medium leading-[0.92] tracking-[-0.055em]">
                {featured.title}
              </h3>
              {featured.summary ? (
                <p className="mt-7 max-w-3xl text-base leading-7 text-[#654A4E]">
                  {featured.summary}
                </p>
              ) : null}
              <dl className="mt-9 grid gap-px border border-[#240B21]/15 bg-[#240B21]/15 sm:grid-cols-3">
                <EvidenceDatum label="Stage" value={featured.stage === 'proposed' ? 'Proposal lodged' : 'Introduced Bill'} />
                <EvidenceDatum label="Date" value={featured.lodgedDate ?? 'See official record'} />
                <EvidenceDatum label="Member in charge" value={featured.memberInCharge ?? 'See official record'} />
              </dl>
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-xl text-xs leading-5 text-[#654A4E]">
                  Source status is descriptive only. No supermarket obligation exists unless the Bill
                  is introduced, passed and commenced.
                </p>
                <Link
                  href={featured.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-3 rounded-full bg-[#240B21] px-5 font-mono text-[9px] uppercase tracking-[0.15em] text-[#FFFDFB] transition hover:bg-[#654A4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#916A70]"
                >
                  Open official record
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </article>
          ) : (
            <div className="border border-[#FFFDFB]/30 p-8">
              <p className="text-lg">The official feeds could not be read just now.</p>
              <p className="mt-3 text-sm text-[#F5F1F2]">The previous verified state is not substituted for a live result.</p>
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-[#240B21]/15 bg-[#F5F1F2] py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#654A4E]">
              Lifecycle path
            </p>
            <h2 className="mt-5 text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[0.9] tracking-[-0.06em]">
              One record. Four evidence steps.
            </h2>
          </div>
          <ol className="mt-12 grid border-l border-t border-[#240B21]/15 md:grid-cols-2 xl:grid-cols-4">
            {PIPELINE.map((step, index) => (
              <li key={step.number} className="min-h-64 border-b border-r border-[#240B21]/15 bg-[#FFFDFB] p-6">
                <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-[#654A4E]">
                  <span>{step.number}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-[#916A70]' : 'border border-[#916A70]'}`} aria-hidden />
                </div>
                <h3 className="mt-20 text-2xl font-medium tracking-[-0.04em]">{step.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#654A4E]">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container grid gap-12 xl:grid-cols-2">
          <BillList
            eyebrow="Proposal feed"
            title="Recently listed proposals"
            records={watch.proposed.slice(0, 8)}
          />
          <BillList
            eyebrow="Introduced feed"
            title="Current Bills"
            records={watch.introduced.slice(0, 8)}
          />
        </div>
      </section>

      <section className="border-t border-[#240B21]/15 bg-[#F5F1F2] py-14">
        <div className="container grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#654A4E]">
              Inspect the function
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-[-0.045em]">The same live result is available as JSON.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#654A4E]">
              The response includes both source sets, the featured Food Waste proposal, its current
              lifecycle stage and the exact time the sources were checked.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/api/regulatory-pulse/legislation"
              className="inline-flex h-11 items-center gap-3 rounded-full bg-[#240B21] px-5 font-mono text-[9px] uppercase tracking-[0.15em] text-[#FFFDFB]"
            >
              Open JSON endpoint
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={PARLIAMENT_BILL_FEEDS.proposed}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-3 rounded-full border border-[#240B21]/25 px-5 font-mono text-[9px] uppercase tracking-[0.15em] text-[#240B21]"
            >
              Parliament source feed
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ value, label, icon: Icon }: { value: number; label: string; icon: typeof Radio }) {
  return (
    <div className="min-h-40 border-b border-r border-[#240B21]/15 bg-[#FFFDFB] p-5">
      <Icon className="h-4 w-4 text-[#916A70]" aria-hidden />
      <dd className="mt-8 text-5xl font-medium leading-none tracking-[-0.06em]">{value || '—'}</dd>
      <dt className="mt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-[#654A4E]">{label}</dt>
    </div>
  );
}

function EvidenceDatum({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#F5F1F2] p-4">
      <dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#654A4E]">{label}</dt>
      <dd className="mt-2 text-sm font-medium leading-5">{value}</dd>
    </div>
  );
}

function BillList({
  eyebrow,
  title,
  records,
}: {
  eyebrow: string;
  title: string;
  records: Array<{ id: string; title: string; url: string }>;
}) {
  return (
    <section>
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#654A4E]">{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-medium tracking-[-0.05em]">{title}</h2>
      <ol className="mt-8 border-t border-[#240B21]/15">
        {records.map((record, index) => (
          <li key={record.id} className="grid grid-cols-[2rem_1fr_auto] items-center gap-4 border-b border-[#240B21]/15 py-5">
            <span className="font-mono text-[9px] text-[#654A4E]">{String(index + 1).padStart(2, '0')}</span>
            <span className="text-sm font-medium leading-5">{record.title}</span>
            <Link
              href={record.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open official record for ${record.title}`}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#240B21]/20 transition hover:border-[#916A70] hover:text-[#916A70]"
            >
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
