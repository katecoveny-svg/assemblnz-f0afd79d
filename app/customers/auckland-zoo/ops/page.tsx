import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { TickerNumber } from '@/lib/motion';
import { ASSEMBL_GOLD, ASSEMBL_WARM_GREY } from '@/components/assembl/chrome';
import { PilotAgentChat } from '@/components/customers/PilotAgentChat';
import { BackendTabs } from '@/components/customers/BackendTabs';
import { FinancePanel } from '@/components/ops/widgets/FinancePanel';
import { RosterTable } from '@/components/ops/widgets/RosterTable';
import { CommsDrafts } from '@/components/ops/widgets/CommsDrafts';
import { CustomerCRM } from '@/components/ops/widgets/CustomerCRM';
import {
  aucklandZooRoster,
  aucklandZooFinance,
  aucklandZooComms,
  aucklandZooCustomers,
} from '@/lib/customers/auckland-zoo/demo-data';
import {
  ZOO_ACTIVITY,
  ZOO_AGENT_GREETING,
  ZOO_AGENT_NAME,
  ZOO_KNOWLEDGE_SOURCES,
  ZOO_RECEIPTS,
  ZOO_TRY_ME,
  zooPromptExcerpt,
} from '@/lib/customers/auckland-zoo/agent';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';

const serif = "var(--font-display), 'Cormorant Garamond', Georgia, serif";

/**
 * Auckland Zoo × Keeper — the AI operating system for the keeping team.
 * (Concept pilot — not affiliated with or endorsed by Auckland Zoo.)
 *
 * Fold 1  signature hero: Freya & Fiona, one line, the wordmark.
 * Fold 2  read signals · route work · move to proof.
 * Fold 3  live agent chat (Kaitiaki) + behind-the-scenes tabs.
 * Console the working widgets (roster · animal register · comms).
 * Fold 4  Mana Receipts — the transparency piece.
 * Fold 5  next step.
 *
 * Cultural rule (kaumātua-hold): NO taonga species — kiwi, tuatara, tūī —
 * anywhere on this page, in the register, or in the agent's scope.
 *
 * The 6-photo array MUST stay in the same order as `aucklandZooCustomers`.
 */
const aucklandZooAvatars = [
  '/brand/auckland-zoo/portrait-giraffe.png',
  '/brand/auckland-zoo/portrait-red-panda.png',
  '/brand/auckland-zoo/portrait-lionesses.png',
  '/brand/auckland-zoo/portrait-squirrel-monkey.png',
  '/brand/auckland-zoo/portrait-asian-elephant.png',
  '/brand/auckland-zoo/portrait-otter.png',
];

export default function AucklandZooOpsHome() {
  const config = getBrandConfig('auckland-zoo');
  if (!config) notFound();
  const accent = config.colours.accent; // safari orange — CTA + status dot only.
  const pendingDrafts = aucklandZooComms.length + ZOO_RECEIPTS.filter((r) => r.hitlStatus === 'pending_review').length;

  return (
    <div className="flex flex-col">
      {/* ── Fold 1 · signature hero — the lionesses, one line, the wordmark ─ */}
      <section
        className="relative h-[88vh] min-h-[540px] w-full overflow-hidden"
        style={{ backgroundColor: config.colours.bg }}
      >
        <Image
          src="/brand/auckland-zoo/portrait-lionesses.png"
          alt="Freya and Fiona, the lionesses, direct gaze, on the safari-orange field"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute left-6 top-6">
          <span
            className="text-sm font-semibold uppercase tracking-[0.2em] text-white"
            style={{ fontFamily: 'var(--font-brand-display)', textShadow: '0 1px 12px rgba(0,0,0,0.3)' }}
          >
            Auckland Zoo × Keeper
          </span>
        </div>
        <div className="absolute bottom-10 left-6 right-6 md:left-10">
          <h1
            className="max-w-3xl text-4xl lowercase leading-tight text-white md:text-6xl"
            style={{ fontFamily: serif, fontWeight: 500, textShadow: '0 1px 24px rgba(0,0,0,0.35)' }}
          >
            the operating system for your keeping team
            <span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h1>
          <p
            className="mt-4 text-[12px] uppercase text-white/90"
            style={{ letterSpacing: '0.16em' }}
          >
            keeper ops concept · not affiliated with or endorsed by auckland zoo · draft-only
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-6">
        <div
          className="mt-8 rounded-md border border-black/5 bg-white/80 p-4 text-sm backdrop-blur-sm"
          style={{ borderLeft: `4px solid ${accent}` }}
        >
          <strong>Concept pilot — draft only.</strong> Nothing sends, nothing
          files. The kaumātua-hold on taonga species holds: no kiwi, tuatara or
          tūī data anywhere in this workspace until that guidance is given.
        </div>

        {/* ── Fold 2 · read signals · route work · move to proof ──────────── */}
        <section className="mt-16 grid gap-5 md:grid-cols-3">
          {[
            {
              label: 'read signals',
              body: 'The OS watches the register, keeper shifts, enrichment rotations and inspection windows.',
              live: (
                <span className="flex items-baseline gap-2">
                  <span className="relative flex h-2 w-2">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:animate-none"
                      style={{ backgroundColor: accent }}
                    />
                    <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
                  </span>
                  <span className="text-2xl font-semibold">
                    <TickerNumber value={aucklandZooCustomers.length} />
                  </span>
                  <span className="text-xs" style={{ color: ASSEMBL_WARM_GREY }}>
                    animals on the register · demo
                  </span>
                </span>
              ),
            },
            {
              label: 'route work',
              body: 'Welfare emails, enrichment logs and precinct briefs queue for a keeper’s yes.',
              live: (
                <span className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold">
                    <TickerNumber value={pendingDrafts} />
                  </span>
                  <span className="text-xs" style={{ color: ASSEMBL_WARM_GREY }}>drafts awaiting review · demo</span>
                </span>
              ),
            },
            {
              label: 'move to proof',
              body: 'Every draft lands as a Mana Receipt — who drafted, who reviewed, which rules held.',
              live: (
                <span className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold">
                    <TickerNumber value={ZOO_RECEIPTS.length} />
                  </span>
                  <span className="text-xs" style={{ color: ASSEMBL_WARM_GREY }}>receipts · demo shape</span>
                </span>
              ),
            },
          ].map((p) => (
            <div key={p.label} className="rounded-2xl border border-black/10 bg-white/85 p-5 backdrop-blur-sm">
              <p className="text-[12px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>
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
            talk to {ZOO_AGENT_NAME}
            <span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: '#3E3C36' }}>
            The keeper workspace agent, live. Real register, real welfare-record
            shapes, real NZ knowledge retrieval — every answer cites its sources.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PilotAgentChat
                apiPath="/api/customers/auckland-zoo/chat"
                agentName={ZOO_AGENT_NAME}
                greeting={ZOO_AGENT_GREETING}
                tryMe={ZOO_TRY_ME}
                accent={accent}
                draftNote="Draft-only: Kaitiaki never sends or files — a keeper reviews everything. Kaumātua-hold on taonga species."
              />
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/85 p-4 text-sm backdrop-blur-sm">
              <p className="text-[12px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>
                the kaumātua-hold
              </p>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: '#3E3C36' }}>
                Taonga species — kiwi, tuatara, tūī — are deliberately outside
                this pilot&apos;s scope. No data, no drafts, no whakapapa. That
                work waits for kaumātua guidance. Ask {ZOO_AGENT_NAME} about a
                kiwi and it will tell you exactly that.
              </p>
              <p className="mt-3">
                <Link href="/customers/auckland-zoo/keeper" className="text-[13px] underline-offset-2 hover:underline">
                  the full 7am keeper console →
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6">
            <BackendTabs
              brain={{
                model: MODEL_TIER_TO_ANTHROPIC.mid,
                fallbackNote: 'free-fallback ladder behind it (gemini → groq → ollama)',
                temperatureNote: 'temperature: provider default',
                promptExcerpt: zooPromptExcerpt(),
                sources: ZOO_KNOWLEDGE_SOURCES,
              }}
              activity={ZOO_ACTIVITY}
              receipts={ZOO_RECEIPTS}
              drafts={aucklandZooComms.map((d) => ({
                channel: d.channel,
                audience: d.audience,
                preview: d.preview,
              }))}
            />
          </div>
        </section>

        {/* ── The working console — roster · register · comms ─────────────── */}
        <section className="mt-20">
          <h2 className="text-3xl lowercase" style={{ fontFamily: serif, fontWeight: 500 }}>
            the console<span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h2>
          <div className="mt-6 flex flex-col gap-6">
            <FinancePanel summary={aucklandZooFinance} />
            <RosterTable rows={aucklandZooRoster} />
            <CustomerCRM customers={aucklandZooCustomers} avatars={aucklandZooAvatars} />
            <CommsDrafts drafts={aucklandZooComms} />
          </div>
        </section>

        {/* ── Fold 4 · the transparency piece ─────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-3xl lowercase" style={{ fontFamily: serif, fontWeight: 500 }}>
            the proof<span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: '#3E3C36' }}>
            Receipts and mana show the journey. The shape every keeper draft
            carries (demo receipts until the pilot runs live):
          </p>
          <div className="mt-5 rounded-2xl border border-black/10 bg-white/90 p-6 backdrop-blur-sm">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-sm font-semibold">{ZOO_RECEIPTS[0].id}</span>
              <span className="text-xs" style={{ color: ASSEMBL_WARM_GREY }}>
                {ZOO_RECEIPTS[0].createdAt} · drafted by {ZOO_AGENT_NAME}
              </span>
              <span className="ml-auto rounded-full bg-amber-100 px-2.5 py-0.5 text-[12px] uppercase tracking-wider text-amber-900">
                pending review
              </span>
            </div>
            <p className="mt-3 text-[12px]">
              cites: {ZOO_RECEIPTS[0].citations.map((c) => `${c.source}${c.ref ? ` · ${c.ref}` : ''}`).join(' — ')}
            </p>
            <p className="mt-3 break-all font-mono text-[12px]" style={{ color: ASSEMBL_WARM_GREY }}>
              {ZOO_RECEIPTS[0].receiptHash}
            </p>
          </div>
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
            href="mailto:assembl@assembl.co.nz?subject=Auckland%20Zoo%20%C3%97%20Keeper%20pilot"
            className="mt-6 inline-block rounded-xl px-6 py-3 text-sm font-semibold lowercase tracking-[0.08em] text-white"
            style={{ backgroundColor: accent }}
          >
            start the pilot conversation
          </a>
        </section>
      </div>
    </div>
  );
}
