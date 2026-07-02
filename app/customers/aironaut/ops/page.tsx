import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { TickerNumber } from '@/lib/motion';
import { ASSEMBL_GOLD, ASSEMBL_WARM_GREY } from '@/components/assembl/chrome';
import { PilotAgentChat } from '@/components/customers/PilotAgentChat';
import { EnableNotificationsButton } from '@/components/customers/EnableNotificationsButton';
import { BackendTabs } from '@/components/customers/BackendTabs';
import { DadWalkthrough, type WalkthroughStep } from '@/components/customers/aironaut/DadWalkthrough';
import {
  AIRONAUT_AGENT_GREETING,
  AIRONAUT_AGENT_NAME,
  AIRONAUT_KNOWLEDGE_SOURCES,
  AIRONAUT_TRY_ME,
  aironautPromptExcerpt,
} from '@/lib/customers/aironaut/agent';
import {
  aironautActivity,
  aironautBoatConsignments,
  aironautComms,
  aironautExoticVehicleConsignments,
  aironautFreightConsignments,
  aironautWineConsignments,
} from '@/lib/customers/aironaut/demo-data';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { classifyGoods } from '@/lib/customs/classify';
import { computeLandedCost } from '@/lib/customs/landed-cost';
import { compareFreight } from '@/lib/customs/freight';
import { buildReceiptChain } from '@/lib/customs/receipt';
import { DEMO_ENTRIES } from '@/lib/customs/demo';

const serif = "var(--font-display), 'Cormorant Garamond', Georgia, serif";

const nzd = (n: number) =>
  `NZ$${n.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const nzDate = (iso: string) =>
  new Date(iso).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland', dateStyle: 'medium', timeStyle: 'short' });

/** Flatten the evidence-ledger citation union into a display label. */
function citationLabel(c: import('@/lib/evidence/types').ReceiptCitation): {
  source: string;
  ref?: string;
} {
  if (c.type === 'hs_code' && 'code' in c) {
    return { source: 'HS classification', ref: `${c.code}${'gir' in c && c.gir ? ` · ${c.gir}` : ''}` };
  }
  if (c.type === 'statute' && 'act' in c) {
    return { source: String(c.act), ref: 'section' in c && c.section ? String(c.section) : undefined };
  }
  if (c.type === 'building_code' && 'clause' in c) {
    return { source: ('doc' in c && c.doc ? String(c.doc) : 'NZ Building Code'), ref: String(c.clause) };
  }
  if (c.type === 'privacy') {
    return { source: 'doc' in c && c.doc ? String(c.doc) : 'Privacy Act 2020', ref: 'ipp' in c && c.ipp ? String(c.ipp) : undefined };
  }
  return { source: c.type };
}

/**
 * AIRONAUT — the AI operating system for the family freight business.
 *
 * Fold 1  signature hero: the propeller photograph, the wordmark, one line.
 * Fold 2  read signals · route work · move to proof (live from demo data).
 * Fold 3  live agent chat (Pīkau) + the behind-the-scenes tabs + walkthrough.
 * Fold 4  Mana Receipt chain — the transparency piece.
 * Fold 5  next step.
 *
 * Everything computed on this page runs through the REAL Pīkau engines in
 * lib/customs — classification, landed cost, freight comparison, receipts.
 */
export default function AironautOsHome() {
  const config = getBrandConfig('aironaut');
  if (!config) notFound();
  const accent = config.colours.accent; // Burnt Orange — CTA + status dot only.

  const consignmentCount =
    aironautFreightConsignments.length +
    aironautExoticVehicleConsignments.length +
    aironautBoatConsignments.length +
    aironautWineConsignments.length;

  // ── Real Pīkau computations for the walkthrough ─────────────────────────
  const quote = compareFreight(
    [
      { carrier: 'ANL (sea LCL)', amountNzd: 1890, transitDays: 41, includesInsurance: false },
      { carrier: 'Maersk (sea LCL)', amountNzd: 2140, transitDays: 34, includesInsurance: true },
      { carrier: 'Emirates SkyCargo (air)', amountNzd: 4620, transitDays: 6, includesInsurance: true },
    ],
    'FOB',
  );
  const classification = classifyGoods('stainless steel brewing tanks, 2000 litre, food grade');
  const preferred = classification.candidates[0];
  const landed = computeLandedCost({
    fobNzd: 18400,
    freightNzd: 1890,
    insuranceNzd: 180,
    dutyRatePercent: preferred?.dutyRatePercent ?? 5,
    processingFeeNzd: 102.27,
    biosecurityLevyNzd: 26.45,
    otherFeesNzd: 0,
  });
  const receiptChain = buildReceiptChain(DEMO_ENTRIES).map((r, idx) => ({
    ...r,
    // Human label: the shipment the receipt attests, ahead of the raw UUID.
    displayId: `${DEMO_ENTRIES[idx]?.shipmentRef ?? 'entry'} · ${r.id.slice(0, 8)}`,
  }));
  const receipts = receiptChain.slice(-5).reverse();
  const latestReceipt = receipts[0];

  const walkthroughSteps: WalkthroughStep[] = [
    {
      title: 'the quote',
      lead: 'Pīkau compares carrier quotes and flags the Incoterms gaps — Rotterdam → Auckland, 2,000 L brewing tanks.',
      rows: [
        ...quote.quotes.map((q) => ({
          label: `${q.carrier}${q.cheapest ? ' · cheapest' : ''}${q.fastest ? ' · fastest' : ''}`,
          value: `${nzd(q.amountNzd)} · ${q.transitDays}d`,
        })),
        { label: 'spread', value: nzd(quote.savingsNzd) },
      ],
      footnote: quote.flags[0] ?? 'All quotes carry insurance where the incoterm requires it.',
    },
    {
      title: 'the customs draft',
      lead: 'The tariff engine returns three ranked HS candidates with the GRI reasoning — never a single unchecked code.',
      rows: (classification.candidates ?? []).slice(0, 3).map((c) => ({
        label: `${c.hsCode} · ${c.confidence}`,
        value: `${c.dutyRatePercent}% duty · ${c.griApplied.join(', ')}`,
      })),
      footnote: classification.signOffLine,
    },
    {
      title: 'the landed-cost report',
      lead: 'CIF, duty at the preferred candidate rate, import GST at 15%, fees — the real calculator, not a mock.',
      rows: [
        { label: 'customs value (CIF)', value: nzd(landed.customsValueNzd) },
        { label: `duty @ ${preferred?.dutyRatePercent ?? 5}%`, value: nzd(landed.dutyNzd) },
        { label: 'import GST 15%', value: nzd(landed.gstNzd) },
        { label: 'fees + levies', value: nzd(landed.feesNzd) },
        { label: 'total landed', value: nzd(landed.totalLandedNzd) },
        { label: 'uplift over FOB', value: `${landed.upliftPercent}%` },
      ],
      footnote: 'Indicative — the licensed broker confirms rate, concessions and valuation at lodgement.',
    },
    {
      title: 'the mana receipt',
      lead: 'Every draft carries a tamper-evident receipt: input hash, output hash, the citation trail, chained to the one before.',
      rows: latestReceipt
        ? [
            { label: 'receipt', value: latestReceipt.displayId },
            { label: 'issued', value: nzDate(latestReceipt.created_at) },
            { label: 'cites', value: latestReceipt.citations.slice(0, 2).map((c) => citationLabel(c).source).join(' · ') },
            { label: 'hash', value: `${latestReceipt.receipt_hash.slice(0, 34)}…` },
            { label: 'chained to', value: latestReceipt.prev_hash ? `${latestReceipt.prev_hash.slice(0, 24)}…` : 'chain head' },
          ]
        : [],
      footnote: 'Show this pack to NZ Customs on audit — the whole decision trail, signed and chained.',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* ── Fold 1 · signature hero — photograph, wordmark, one line ─────── */}
      <section className="relative h-[88vh] min-h-[540px] w-full overflow-hidden">
        <Image
          src="/brand/aironaut/hero-propeller-orange.png"
          alt="Chrome aircraft propeller on the AIRONAUT burnt-orange field"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute left-6 top-6 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-white/90">
            <Image src="/brand/aironaut/logo-circular-mark.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
          </span>
          <span
            className="text-sm font-semibold uppercase tracking-[0.2em] text-white"
            style={{ fontFamily: 'var(--font-brand-display)' }}
          >
            AIRONAUT
          </span>
        </div>
        <div className="absolute bottom-10 left-6 right-6 md:left-10">
          <h1
            className="max-w-3xl text-4xl lowercase leading-tight text-white md:text-6xl"
            style={{ fontFamily: serif, fontWeight: 500, textShadow: '0 1px 24px rgba(0,0,0,0.25)' }}
          >
            the operating system for your freight business
            <span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h1>
          <p
            className="mt-4 text-[10px] uppercase text-white/85"
            style={{ letterSpacing: '0.16em' }}
          >
            global trade. made simple. · concept pilot · draft-only
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-6">
        {/* Family-pilot review bar — first thing after the fold. */}
        <div
          className="mt-8 rounded-md border border-black/5 bg-white/80 p-4 text-sm backdrop-blur-sm"
          style={{ borderLeft: `4px solid ${accent}` }}
        >
          <strong>Family pilot — draft only.</strong> Nothing here sends a real
          email, nothing lodges a real customs entry. Kate&apos;s dad reviews
          everything before it leaves the workspace.
        </div>

        {/* ── Fold 2 · read signals · route work · move to proof ──────────── */}
        <section className="mt-16 grid gap-5 md:grid-cols-3">
          {[
            {
              label: 'read signals',
              body: 'The OS watches every consignment, manifest and cut-off in one place.',
              live: (
                <span className="flex items-baseline gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:animate-none" style={{ backgroundColor: accent }} />
                    <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
                  </span>
                  <span className="text-2xl font-semibold">
                    <TickerNumber value={consignmentCount} />
                  </span>
                  <span className="text-xs" style={{ color: ASSEMBL_WARM_GREY }}>consignments watched · demo</span>
                </span>
              ),
            },
            {
              label: 'route work',
              body: 'Classifications, landed costs and comms drafts queue for one human yes.',
              live: (
                <span className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold">
                    <TickerNumber value={aironautComms.length + aironautActivity.filter((a) => a.kind === 'drafted').length} />
                  </span>
                  <span className="text-xs" style={{ color: ASSEMBL_WARM_GREY }}>drafts awaiting review · demo</span>
                </span>
              ),
            },
            {
              label: 'move to proof',
              body: 'Every decision lands as a hash-chained Mana Receipt you can show Customs.',
              live: (
                <span className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold">
                    <TickerNumber value={receiptChain.length} />
                  </span>
                  <span className="text-xs" style={{ color: ASSEMBL_WARM_GREY }}>
                    receipts · head <span className="font-mono">{latestReceipt ? latestReceipt.receipt_hash.slice(7, 17) : '—'}</span>
                  </span>
                </span>
              ),
            },
          ].map((p) => (
            <div key={p.label} className="rounded-2xl border border-black/10 bg-white/85 p-5 backdrop-blur-sm">
              <p className="text-[10px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>
                {p.label}
              </p>
              <div className="mt-3">{p.live}</div>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: '#3E3C36' }}>
                {p.body}
              </p>
            </div>
          ))}
        </section>

        {/* ── Fold 3 · the live agent ─────────────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-3xl lowercase" style={{ fontFamily: serif, fontWeight: 500 }}>
            talk to {AIRONAUT_AGENT_NAME}
            <span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: '#3E3C36' }}>
            The workspace agent, live. Real tariff engine, real landed-cost maths,
            real NZ knowledge retrieval — every answer cites its sources.
          </p>
          <div className="mt-3">
            <EnableNotificationsButton slug="aironaut" />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PilotAgentChat
                apiPath="/api/customers/aironaut/chat"
                agentName={AIRONAUT_AGENT_NAME}
                greeting={AIRONAUT_AGENT_GREETING}
                tryMe={AIRONAUT_TRY_ME}
                accent={accent}
                draftNote="Draft-only: Pīkau never lodges an entry or sends a message — a licensed broker reviews everything."
              />
            </div>
            <div className="flex flex-col gap-4">
              <DadWalkthrough steps={walkthroughSteps} accent={accent} />
              <div className="rounded-2xl border border-black/10 bg-white/85 p-4 text-sm backdrop-blur-sm">
                <p className="text-[10px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>
                  service lines
                </p>
                <ul className="mt-2 space-y-1.5">
                  {(config.serviceLines ?? []).map((s) => (
                    <li key={s.href}>
                      <Link href={s.href} className="text-[13px] underline-offset-2 hover:underline">
                        {s.label} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <BackendTabs
              brain={{
                model: MODEL_TIER_TO_ANTHROPIC.mid,
                fallbackNote: 'free-fallback ladder behind it (gemini → groq → ollama)',
                temperatureNote: 'temperature: provider default',
                promptExcerpt: aironautPromptExcerpt(),
                sources: AIRONAUT_KNOWLEDGE_SOURCES,
              }}
              activity={aironautActivity}
              receipts={receipts.map((r) => ({
                id: r.displayId,
                createdAt: nzDate(r.created_at),
                citations: r.citations.map((c) => citationLabel(c)),
                receiptHash: r.receipt_hash,
                prevHash: r.prev_hash,
                hitlStatus: r.hitl?.status,
              }))}
              drafts={aironautComms.map((d) => ({
                channel: d.channel,
                audience: d.audience,
                preview: d.preview,
              }))}
            />
          </div>
        </section>

        {/* ── Fold 4 · the transparency piece ─────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-3xl lowercase" style={{ fontFamily: serif, fontWeight: 500 }}>
            the proof<span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: '#3E3C36' }}>
            Receipts and mana show the journey. The latest entry in the chain:
          </p>
          {latestReceipt ? (
            <div className="mt-5 rounded-2xl border border-black/10 bg-white/90 p-6 backdrop-blur-sm">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-mono text-sm font-semibold">{latestReceipt.displayId}</span>
                <span className="text-xs" style={{ color: ASSEMBL_WARM_GREY }}>
                  {nzDate(latestReceipt.created_at)} · issuer {latestReceipt.issuer} · agent {latestReceipt.agent}
                </span>
                <span className="ml-auto rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-amber-900">
                  {(latestReceipt.hitl?.status ?? 'pending_review').replace(/_/g, ' ')}
                </span>
              </div>
              <dl className="mt-4 grid gap-x-8 gap-y-2 text-[12px] md:grid-cols-2">
                <div>
                  <dt className="text-[10px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>input hash</dt>
                  <dd className="break-all font-mono">{latestReceipt.input_hash}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>output hash</dt>
                  <dd className="break-all font-mono">{latestReceipt.output_hash}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>receipt hash</dt>
                  <dd className="break-all font-mono">{latestReceipt.receipt_hash}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>chained to</dt>
                  <dd className="break-all font-mono">{latestReceipt.prev_hash ?? 'chain head'}</dd>
                </div>
              </dl>
              <p className="mt-4 text-[12px]" style={{ color: '#3E3C36' }}>
                cites: {latestReceipt.citations
                  .map((c) => {
                    const l = citationLabel(c);
                    return `${l.source}${l.ref ? ` · ${l.ref}` : ''}`;
                  })
                  .join(' — ')}
              </p>
            </div>
          ) : null}
        </section>

        {/* ── Fold 5 · next step ──────────────────────────────────────────── */}
        <section className="my-24 text-center">
          <h2 className="text-3xl lowercase" style={{ fontFamily: serif, fontWeight: 500 }}>
            ready when you are<span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: '#3E3C36' }}>
            The pilot runs draft-only until you say otherwise. One conversation
            starts it.
          </p>
          <a
            href="mailto:assembl@assembl.co.nz?subject=AIRONAUT%20pilot"
            className="mt-6 inline-block rounded-xl px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white"
            style={{ backgroundColor: accent }}
          >
            {config.ctaLabel ?? 'REQUEST A QUOTE'}
          </a>
        </section>
      </div>
    </div>
  );
}
