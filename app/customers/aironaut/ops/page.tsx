import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { KnowledgeSyncPill } from '@/components/ops/KnowledgeSyncPill';
import { ASSEMBL_GOLD, ASSEMBL_WARM_GREY } from '@/components/assembl/chrome';
import { PilotAgentChat } from '@/components/customers/PilotAgentChat';
import { EnableNotificationsButton } from '@/components/customers/EnableNotificationsButton';
import { BackendTabs } from '@/components/customers/BackendTabs';
import { DadWalkthrough, type WalkthroughStep } from '@/components/customers/aironaut/DadWalkthrough';
import { ARChasePanel } from '@/components/ops/aironaut/ARChasePanel';
import { CreditCheckPanel } from '@/components/ops/aironaut/CreditCheckPanel';
import { IntegrationMap } from '@/components/ops/aironaut/IntegrationMap';
import { cashflowHeadline, cashflowSqueeze, cashflowWeeks } from '@/lib/customers/aironaut/money-data';
import {
  AIRONAUT_AGENT_GREETING,
  AIRONAUT_AGENT_NAME,
  AIRONAUT_KNOWLEDGE_SOURCES,
  AIRONAUT_TRY_ME,
  aironautPromptExcerpt,
} from '@/lib/customers/aironaut/agent';
import { aironautActivity, aironautComms } from '@/lib/customers/aironaut/demo-data';
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
 * Fold 1  signature hero: the yacht-bow photograph on the branded hull, one line.
 * Fold 2  live agent chat (Pīkau) + the behind-the-scenes tabs + walkthrough.
 * Fold 3  the money work — AR chase, credit check, cashflow exposure.
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
      title: 'The quote',
      lead: 'The agent compares carrier quotes and flags the Incoterms gaps — Rotterdam → Auckland, 2,000 L brewing tanks.',
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
      title: 'The customs draft',
      lead: 'The tariff engine returns three ranked HS candidates with the GRI reasoning — never a single unchecked code.',
      rows: (classification.candidates ?? []).slice(0, 3).map((c) => ({
        label: `${c.hsCode} · ${c.confidence}`,
        value: `${c.dutyRatePercent}% duty · ${c.griApplied.join(', ')}`,
      })),
      footnote: classification.signOffLine,
    },
    {
      title: 'The landed-cost report',
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
      title: 'The audit receipt',
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
      {/* ── Fold 1 · dashboard backdrop — photograph, wordmark, one line ──
          Backdrop scale, not a marketing takeover: the money work must be
          visible without scrolling (Kate, 2026-07-04). */}
      <section className="relative h-[56vh] min-h-[420px] w-full overflow-hidden">
        {/* Slow Ken Burns drift on the still — reduced-motion users get a
            static frame. */}
        <style>{`
          @keyframes aironaut-hero-kenburns {
            from { transform: scale(1); }
            to { transform: scale(1.05); }
          }
          .aironaut-hero-kenburns {
            animation: aironaut-hero-kenburns 20s ease-in-out infinite alternate;
          }
          @media (prefers-reduced-motion: reduce) {
            .aironaut-hero-kenburns { animation: none; }
          }
        `}</style>
        <Image
          src="/brand/aironaut/hero-yacht-bow-v2.png"
          alt="Navy yacht bow against the AIRONAUT propeller-globe wordmark painted on the branded hull, orange stripe below"
          fill
          priority
          sizes="100vw"
          className="aironaut-hero-kenburns object-cover"
          // Portrait frame in a landscape hero: bias the crop up and right so
          // the painted AIRONAUT wordmark stays in view at every viewport.
          style={{ objectPosition: '62% 30%' }}
        />
        {/* Navy scrim behind the chrome + headline — keeps white type legible
            where the crop puts the pale hull under it (375px). */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(11,31,58,0.5) 0%, rgba(11,31,58,0.18) 38%, rgba(11,31,58,0) 60%)',
          }}
        />
        <div className="absolute left-6 top-6 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white/90">
            {/* The mark PNG is square with a white ground — clip it circular
                too, or its corners poke past the round chip. */}
            <Image src="/brand/aironaut/logo-mark-official.png" alt="" width={40} height={40} className="h-10 w-10 rounded-full object-contain" />
          </span>
          <span
            className="text-sm font-semibold uppercase tracking-[0.2em] text-white"
            style={{ fontFamily: 'var(--font-brand-display)' }}
          >
            AIRONAUT
          </span>
        </div>
        <div className="absolute right-6 top-7">
          <KnowledgeSyncPill />
        </div>
        {/* Headline sits high on the navy hull, clear of the chrome and the
            painted wordmark, so it stays legible. Lowercase per site canon
            (Kate, 2026-07-04). */}
        <div className="absolute left-6 right-6 md:left-10" style={{ top: '18%' }}>
          <h1
            className="max-w-3xl text-3xl leading-tight text-white md:text-5xl"
            style={{ fontFamily: serif, fontWeight: 500, textShadow: '0 1px 24px rgba(0,0,0,0.35)' }}
          >
            the operating system for your freight business
            <span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h1>
          <p
            className="mt-4 text-[10px] uppercase text-white/85"
            style={{ letterSpacing: '0.16em' }}
          >
            global trade. made simple.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* Draft-mode bar — first thing after the fold. */}
        <div
          className="mt-8 rounded-md border border-black/5 bg-white/80 p-4 text-sm backdrop-blur-sm"
          style={{ borderLeft: `4px solid ${accent}` }}
        >
          <strong>Draft only.</strong> Nothing here sends a real email, nothing
          lodges a real customs entry. You review everything before it leaves
          the workspace.
        </div>

        {/* ── Fold 2 · the live agent — the crown jewel, straight after the fold */}
        <section className="mt-16">
          <h2 className="text-3xl" style={{ fontFamily: serif, fontWeight: 500 }}>
            talk to your customs{' '}
            <span className="whitespace-nowrap">
              broker<span style={{ color: ASSEMBL_GOLD }}>.</span>
            </span>
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
                composerPlaceholder="Ask your customs broker anything about the workspace…"
                greeting={AIRONAUT_AGENT_GREETING}
                tryMe={AIRONAUT_TRY_ME}
                accent={accent}
                draftNote="Draft-only: the agent never lodges an entry or sends a message — a licensed broker reviews everything."
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
                      {/* Absolute path — a bare relative href resolved to
                          /customers/aironaut/<line> and 404'd. */}
                      <Link
                        href={`/customers/aironaut/ops/${s.href}`}
                        className="text-[13px] underline-offset-2 hover:underline"
                      >
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
              receiptsTabLabel="audit receipts"
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

        {/* ── Fold 3 · the money work — chase, check, cashflow ────────────── */}
        <section className="mt-20">
          <h2 className="text-3xl" style={{ fontFamily: serif, fontWeight: 500 }}>
            the money work
            <span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: '#3E3C36' }}>
            Overdue invoices chased on a steady cadence, new customers
            credit-checked before terms, and the deferred-account squeeze seen
            a month out. Sample data; every send needs your approval.
          </p>

          <div className="mt-6 grid items-start gap-5 md:grid-cols-3">
            <ARChasePanel accent={accent} />
            <CreditCheckPanel accent={accent} />

            {/* Cashflow exposure — glance tile → the full page */}
            <div className="rounded-2xl border border-black/10 bg-white/85 p-5 backdrop-blur-sm">
              <p className="text-[10px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>
                cashflow exposure
              </p>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: '#3E3C36' }}>
                {cashflowHeadline.out} · {cashflowHeadline.back}.
              </p>
              <div className="mt-3 flex items-end gap-1.5" aria-hidden>
                {cashflowWeeks.map((w) => (
                  <span
                    key={w.label}
                    className="w-7 rounded-t-sm"
                    style={{
                      height: Math.max(8, Math.abs(w.netK) * 0.6),
                      backgroundColor:
                        w.status === 'positive' ? '#2E6B34' : w.status === 'tight' ? '#C8622A' : '#8F2D2D',
                      opacity: 0.9,
                    }}
                    title={`${w.label}: ${w.netK >= 0 ? '+' : '−'}$${Math.abs(w.netK)}k`}
                  />
                ))}
              </div>
              <p className="mt-3 text-[12px]" style={{ color: '#8F2D2D' }}>
                {cashflowSqueeze.line}
              </p>
              <Link
                href="/customers/aironaut/ops/cashflow"
                className="mt-3 inline-block rounded-full px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white transition hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                Open the full picture
              </Link>
            </div>
          </div>
        </section>

        {/* ── Fold 3b · how it plugs into what you already use ────────────── */}
        <section className="mt-20">
          <h2 className="text-3xl" style={{ fontFamily: serif, fontWeight: 500 }}>
            how it plugs in
            <span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: '#3E3C36' }}>
            customs broker reads and writes to these tools daily. it also draws
            on these signal sources.
          </p>
          <div className="mt-6">
            <IntegrationMap />
          </div>
        </section>

        {/* ── Fold 4 · the transparency piece ─────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-3xl" style={{ fontFamily: serif, fontWeight: 500 }}>
            the proof<span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: '#3E3C36' }}>
            Every draft is backed by a tamper-evident audit receipt. The latest entry in the chain:
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
          <h2 className="text-3xl" style={{ fontFamily: serif, fontWeight: 500 }}>
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
