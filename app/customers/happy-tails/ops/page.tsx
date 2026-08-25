import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { TickerNumber } from '@/lib/motion';
import { ASSEMBL_GOLD, ASSEMBL_WARM_GREY } from '@/components/assembl/chrome';
import { PilotAgentChat } from '@/components/customers/PilotAgentChat';
import { EnableNotificationsButton } from '@/components/customers/EnableNotificationsButton';
import { BackendTabs } from '@/components/customers/BackendTabs';
import { FinancePanel } from '@/components/ops/widgets/FinancePanel';
import { RosterTable } from '@/components/ops/widgets/RosterTable';
import { CommsDrafts } from '@/components/ops/widgets/CommsDrafts';
import { CustomerCRM } from '@/components/ops/widgets/CustomerCRM';
import {
  happyTailsRoster,
  happyTailsFinance,
  happyTailsComms,
  happyTailsCustomers,
} from '@/lib/customers/happy-tails/demo-data';
import {
  HAPPY_TAILS_AGENT_GREETING,
  HAPPY_TAILS_AGENT_NAME,
  HAPPY_TAILS_KNOWLEDGE_SOURCES,
  HAPPY_TAILS_TRY_ME,
  happyTailsPromptExcerpt,
} from '@/lib/customers/happy-tails/agent';
import { MANA_RECEIPTS, ROSTER } from '@/lib/tenants/happy-tails/data';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { GENOME_SECTION_LABELS, type GenomeSection } from '@/lib/customers/auckland-dog-trainer/genome';
import { getGenomeFactsFor } from '@/lib/customers/auckland-dog-trainer/genome-store';
import { HAPPY_TAILS_TENANT, HAPPY_TAILS_GENOME_FACTS } from '@/lib/customers/happy-tails/genome';
import { updateGenomeFactFormAction } from './genome-actions';

export const dynamic = 'force-dynamic';

const serif = "var(--font-brand-display), 'Cormorant Garamond', Georgia, serif";

// Pearl canon (2026-07-17): ink · muted · gold · teal on a white ground.
const INK = '#313c42';
const MUTED = '#68766f';
const GOLD = '#b8964f';
const TEAL = '#3f7373';

const eyebrow: CSSProperties = { fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED };

/**
 * Happy Tails — the AI operating system for the doggy daycare.
 *
 * Fold 1  signature hero: Franklin, one line, the wordmark. Nothing else.
 * Fold 2  read signals · route work · move to proof.
 * Fold 3  live agent chat (Keeper) + behind-the-scenes tabs.
 * Console the working widgets (finance · roster · dog CRM · comms drafts).
 * Fold 4  Mana Receipts — the transparency piece (two-voice hard rules).
 * Fold 5  next step.
 *
 * The 8-photo array MUST stay in the same order as `happyTailsCustomers`:
 * Franklin first (anchor), then the 7 gallery portraits.
 */
const happyTailsAvatars = [
  '/brand/happy-tails/franklin-black-longhair-rear.png',
  '/brand/happy-tails/dog-tan-play-stance.png',
  '/brand/happy-tails/dog-dalmatian-leap.png',
  '/brand/happy-tails/dog-dalmatian-standing.png',
  '/brand/happy-tails/dog-corgi-tail.png',
  '/brand/happy-tails/dog-husky-fluffy-tail.png',
  '/brand/happy-tails/dog-terrier-tan-tail.png',
  '/brand/happy-tails/dog-poodle-curls.png',
];

type OpsSearchParams = { tab?: string | string[] };

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'genome', label: 'Genome' },
] as const;
type TabKey = (typeof TABS)[number]['key'];
const TAB_KEYS: ReadonlySet<string> = new Set(TABS.map((t) => t.key));

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function TabBar({ active }: { active: TabKey }) {
  return (
    <nav aria-label="Happy Tails sections" className="mt-8" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <Link
            key={t.key}
            href={`/customers/happy-tails/ops?tab=${t.key}`}
            scroll={false}
            aria-current={on ? 'page' : undefined}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: 999,
              textDecoration: 'none',
              color: on ? '#fff' : INK,
              background: on ? INK : '#fbfcfb',
              border: `1.5px solid ${on ? INK : `${GOLD}66`}`,
              boxShadow: on ? '0 6px 16px rgba(49,60,66,0.16)' : 'none',
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default async function HappyTailsOpsHome({ searchParams }: { searchParams?: Promise<OpsSearchParams> }) {
  const config = getBrandConfig('happy-tails');
  if (!config) notFound();
  const accent = config.colours.accent; // pearl teal — CTA + status dot only.

  const sp = await searchParams;
  const rawTab = first(sp?.tab);
  const tab: TabKey = TAB_KEYS.has(rawTab ?? '') ? (rawTab as TabKey) : 'overview';

  // The Happy Tails genome — live rows for tenant 'happy-tails' when the
  // database is reachable, the in-repo mirror otherwise. Review read: the
  // owner sees suggested/inferred facts so they can confirm them.
  const genome =
    tab === 'genome'
      ? await getGenomeFactsFor(HAPPY_TAILS_TENANT, HAPPY_TAILS_GENOME_FACTS, { includeUnverified: true })
      : null;

  const latest = MANA_RECEIPTS[0];
  const pendingDrafts =
    happyTailsComms.length + MANA_RECEIPTS.filter((r) => !r.approvedBy).length;

  // Today's activity for the transparency tab — derived from the seeded
  // receipt trail (drafted / approved / sent), newest first.
  const activity = MANA_RECEIPTS.map((r) => ({
    at: r.draftedAt.split(' ').slice(-1)[0] ?? r.draftedAt,
    kind: r.approvedBy ? (r.sentAt ? 'sent ✓' : 'approved') : 'drafted',
    note: `${r.title} — ${r.voice === 'system' ? 'Xero draft' : `${r.voice}'s voice`}`,
  }));

  return (
    <div className="flex flex-col">
      {/* ── Fold 1 · signature hero — Franklin, one line, the wordmark ───── */}
      <section
        className="relative flex h-[88vh] min-h-[540px] w-full flex-col overflow-hidden"
        style={{ backgroundColor: config.colours.bg }}
      >
        {/* tails-and-paws wash behind Franklin — Liana's brand dialled up (~16%),
            larger tile: proud, still readable behind the ops surface */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/brand/happy-tails/pattern-tails-and-paws.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '480px auto',
            opacity: 0.16,
          }}
        />
        <Image
          src="/customers/happy-tails/franklin-transparent.png"
          alt="Franklin the long-haired dachshund, lying down, photographed from behind"
          fill
          priority
          sizes="100vw"
          className="object-contain object-center"
        />
        <div className="absolute left-6 top-6">
          <span
            className="text-sm font-semibold uppercase tracking-[0.2em]"
            style={{ fontFamily: 'var(--font-brand-display)', color: config.colours.ink }}
          >
            Happy Tails
          </span>
        </div>
        <div className="absolute bottom-10 left-6 right-6 md:left-10">
          <h1
            className="max-w-2xl text-4xl lowercase leading-tight md:text-6xl"
            style={{ fontFamily: serif, fontWeight: 500, color: config.colours.ink }}
          >
            the operating system for your doggy daycare
            <span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h1>
          <p
            className="mt-4 text-[12px] uppercase"
            style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}
          >
            the daycare that runs itself · concept pilot · draft-only
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-6">
        <div
          className="mt-8 rounded-md border border-black/5 bg-white/80 p-4 text-sm backdrop-blur-sm"
          style={{ borderLeft: `4px solid ${accent}` }}
        >
          <strong>Pilot — draft only.</strong> Nothing sends without a human
          yes: Mathis approves his texts, Liana approves her emails, invoices
          stay Drafts in Xero until issued.
        </div>

        {/* ── Section tabs — the workspace overview or the genome ────────── */}
        <TabBar active={tab} />

        {tab === 'genome' && genome && (
          <section
            className="mt-8 rounded-2xl border bg-white/90 p-6 backdrop-blur-sm"
            style={{ borderColor: 'rgba(49,60,66,0.12)' }}
          >
            <div className="flex items-center gap-2">
              <span style={{ width: 8, height: 8, borderRadius: 999, background: GOLD }} />
              <p style={{ ...eyebrow, color: GOLD }}>the business genome</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                style={{
                  ...eyebrow,
                  fontSize: 12,
                  color: genome.live ? TEAL : MUTED,
                  border: `1px solid ${(genome.live ? TEAL : MUTED)}55`,
                  borderRadius: 999,
                  padding: '3px 9px',
                }}
              >
                {genome.live ? 'live' : 'mirror'}
              </span>
              <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>
                What the business runs on — one set of facts, and every surface on this console reads it.
                Change a fact once and everything that reads it follows.
                {genome.live ? '' : ' The database is out of reach right now, so this is the read-only sample mirror.'}
              </p>
            </div>
            {(Object.keys(GENOME_SECTION_LABELS) as GenomeSection[]).map((section) => {
              const facts = genome.facts.filter((f) => f.section === section);
              if (facts.length === 0) return null;
              return (
                <div key={section} style={{ marginTop: 18 }}>
                  <p style={eyebrow}>{GENOME_SECTION_LABELS[section]}</p>
                  {facts.map((f) => (
                    <div key={f.id} style={{ padding: '10px 0', borderBottom: `1px solid ${GOLD}22` }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: INK }}>{f.label}</span>
                        {f.verification && f.verification !== 'confirmed' ? (
                          <span style={{ ...eyebrow, fontSize: 12, color: TEAL }}>{f.verification}</span>
                        ) : null}
                      </div>
                      <div style={{ fontSize: 13, marginTop: 3, lineHeight: 1.55, color: INK }}>{f.value}</div>
                      {f.readBy.length > 0 ? (
                        <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>read by {f.readBy.join(' · ')}</div>
                      ) : null}
                      {genome.live ? (
                        <details style={{ marginTop: 6 }}>
                          <summary style={{ fontSize: 12, color: MUTED, cursor: 'pointer' }}>edit</summary>
                          <form action={updateGenomeFactFormAction} style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                            <input type="hidden" name="factId" value={f.id} />
                            <input
                              name="value"
                              defaultValue={f.value}
                              maxLength={300}
                              aria-label={`New value for ${f.label}`}
                              style={{ flex: '1 1 260px', borderRadius: 10, border: `1px solid ${GOLD}44`, background: '#fff', padding: '8px 11px', fontSize: 12.5, color: INK, fontFamily: 'var(--font-brand-body)' }}
                            />
                            <button
                              type="submit"
                              style={{ fontSize: 12.5, fontWeight: 600, padding: '7px 14px', borderRadius: 999, cursor: 'pointer', color: '#fff', background: INK, border: `1.5px solid ${INK}` }}
                            >
                              Save
                            </button>
                          </form>
                        </details>
                      ) : null}
                    </div>
                  ))}
                </div>
              );
            })}
            <p style={{ fontSize: 12, color: MUTED, marginTop: 14 }}>
              Edits land in the genome with a history trail; the mirror in the code never changes.
            </p>
          </section>
        )}

        {tab === 'overview' && (<>
        <section
          className="mt-8 rounded-2xl border border-black/10 bg-white/90 p-5 backdrop-blur-sm"
          style={{ borderLeft: `4px solid ${accent}` }}
        >
          <p
            className="text-[12px] uppercase"
            style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}
          >
            daycare operating system
          </p>
          <h2 className="mt-2 text-2xl lowercase" style={{ fontFamily: serif, fontWeight: 500 }}>
            Liana&apos;s week · enrolment · bus · welcome packs
            <span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: '#313c42' }}>
            Daycare command centre — enrolment, bus, welcome packs, owner support, and social —
            not a training OS. Lead triage, dog CRM, care journeys, Welcome Pack studio, time
            cockpit, and the Keeper agent mesh.
          </p>
          <Link
            href="/customers/happy-tails/ops/os"
            className="mt-4 inline-flex text-[12px] uppercase"
            style={{ letterSpacing: '0.16em', color: accent }}
          >
            open the daycare OS →
          </Link>
        </section>

        {/* ── Fold 2 · read signals · route work · move to proof ──────────── */}
        <section className="mt-16 grid gap-5 md:grid-cols-3">
          {[
            {
              label: 'read signals',
              body: 'The OS watches bookings, vaccinations, the bus route and every pup on the roster.',
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
                    <TickerNumber value={ROSTER.length} />
                  </span>
                  <span className="text-xs" style={{ color: ASSEMBL_WARM_GREY }}>
                    dogs on the roster · Franklin is #1
                  </span>
                </span>
              ),
            },
            {
              label: 'route work',
              body: 'Texts in Mathis’s voice, emails in Liana’s, invoices in the INV-3031 shape — all queued for one human yes.',
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
              body: 'Every draft carries a Mana Receipt: who drafted, who approved, which rules held.',
              live: (
                <span className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold">
                    <TickerNumber value={MANA_RECEIPTS.length} />
                  </span>
                  <span className="text-xs" style={{ color: ASSEMBL_WARM_GREY }}>
                    receipts · latest <span className="font-mono">{latest.hash}</span>
                  </span>
                </span>
              ),
            },
          ].map((p) => (
            <div key={p.label} className="rounded-2xl border border-black/10 bg-white/85 p-5 backdrop-blur-sm">
              <p className="text-[12px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>
                {p.label}
              </p>
              <div className="mt-3">{p.live}</div>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: '#313c42' }}>
                {p.body}
              </p>
            </div>
          ))}
        </section>

        {/* ── Fold 3 · the live agent ─────────────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-3xl lowercase" style={{ fontFamily: serif, fontWeight: 500 }}>
            talk to {HAPPY_TAILS_AGENT_NAME}
            <span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: '#313c42' }}>
            The workspace agent, live. Real roster, real pricing maths, the
            locked two-voice rules — every answer cites its sources.
          </p>
          <div className="mt-3">
            <EnableNotificationsButton slug="happy-tails" />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PilotAgentChat
                apiPath="/api/customers/happy-tails/chat"
                agentName={HAPPY_TAILS_AGENT_NAME}
                greeting={HAPPY_TAILS_AGENT_GREETING}
                tryMe={HAPPY_TAILS_TRY_ME}
                accent={accent}
                draftNote="Draft-only: Keeper never sends — Mathis approves his texts, Liana approves her emails."
              />
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/85 p-4 text-sm backdrop-blur-sm">
              <p className="text-[12px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>
                the two-voice rule
              </p>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: '#313c42' }}>
                Locked hard rule: texts go out in <strong>Mathis&apos;s</strong>{' '}
                voice, emails in <strong>Liana&apos;s</strong>. Keeper drafts in
                the right voice automatically — try the pickup SMS prompt and
                watch it fetch the voice model first.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <BackendTabs
              brain={{
                model: MODEL_TIER_TO_ANTHROPIC.mid,
                fallbackNote: 'free-fallback ladder behind it (gemini → groq → ollama)',
                temperatureNote: 'temperature: provider default',
                promptExcerpt: happyTailsPromptExcerpt(),
                sources: HAPPY_TAILS_KNOWLEDGE_SOURCES,
              }}
              activity={activity}
              receipts={MANA_RECEIPTS.map((r) => ({
                id: `${r.id} · ${r.title}`,
                createdAt: r.draftedAt,
                citations: r.sources.map((s) => ({ source: s })),
                receiptHash: r.hash,
                prevHash: null,
                hitlStatus: r.approvedBy ? (r.sentAt ? 'final' : 'reviewed') : 'pending_review',
              }))}
              drafts={happyTailsComms.map((d) => ({
                channel: d.channel,
                audience: d.audience,
                preview: d.preview,
              }))}
            />
          </div>
        </section>

        {/* ── Kaiako — force-free training sub-agent under Keeper ───────────── */}
        {/* Additive Alphassembl fold: Keeper now routes any training question to
            Kaiako, the force-free trainer. Nothing about the surface above
            changes — this is one extra card. */}
        <section className="mt-20">
          <div
            className="rounded-2xl border border-black/10 bg-white/85 p-6 backdrop-blur-sm"
            style={{ borderLeft: `4px solid ${accent}` }}
          >
            <p className="text-[12px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>
              now under keeper
            </p>
            <h2 className="mt-2 text-2xl lowercase" style={{ fontFamily: serif, fontWeight: 500 }}>
              meet kaiako — your force-free trainer<span style={{ color: ASSEMBL_GOLD }}>.</span>
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: '#313c42' }}>
              Keeper now routes any dog-training question to <strong>Kaiako</strong>, the newest specialist in
              the Kaitiaki bundle and the training voice behind <strong>Alphassembl</strong>. Kaiako works
              force-free — LIMA and the humane hierarchy, never a shock, prong or “dominance” fix — grounds
              every reply in the Dog Control Act 1996, SPCA NZ and Ian Dunbar, and refers a bite or real
              aggression straight to a vet or behaviourist.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['LIMA', 'Force-free only', 'Refer when in doubt'].map((b) => (
                <span
                  key={b}
                  className="rounded-full px-3 py-1 text-[12px] font-semibold"
                  style={{ backgroundColor: '#eef1ef', color: '#313c42' }}
                >
                  {b}
                </span>
              ))}
            </div>
            <Link
              href="/alphassembl/chat"
              className="mt-5 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold lowercase tracking-[0.06em] text-white"
              style={{ backgroundColor: accent }}
            >
              ask kaiako →
            </Link>
          </div>
        </section>

        {/* ── The working console — finance · roster · dog CRM · comms ───── */}
        <section className="mt-20">
          <h2 className="text-3xl lowercase" style={{ fontFamily: serif, fontWeight: 500 }}>
            the console<span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h2>
          <div className="mt-6 flex flex-col gap-6">
            <FinancePanel summary={happyTailsFinance} />
            <RosterTable rows={happyTailsRoster} />
            <CustomerCRM customers={happyTailsCustomers} avatars={happyTailsAvatars} />
            <CommsDrafts drafts={happyTailsComms} />
          </div>
        </section>

        {/* ── Fold 4 · the transparency piece ─────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-3xl lowercase" style={{ fontFamily: serif, fontWeight: 500 }}>
            the proof<span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: '#313c42' }}>
            Receipts and mana show the journey. The latest:
          </p>
          <div className="mt-5 rounded-2xl border border-black/10 bg-white/90 p-6 backdrop-blur-sm">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-sm font-semibold">{latest.title}</span>
              <span className="text-xs" style={{ color: ASSEMBL_WARM_GREY }}>
                drafted by {latest.draftedBy} · {latest.draftedAt} · voice: {latest.voice} · signed {latest.signedBy}
              </span>
              <span
                className="ml-auto rounded-full px-2.5 py-0.5 text-[12px] uppercase tracking-wider"
                style={{ backgroundColor: 'rgba(184,150,79,0.16)', color: '#7a6434' }}
              >
                {latest.sentAt ? 'sent after approval' : latest.approvedBy ? 'approved' : 'pending review'}
              </span>
            </div>
            <div className="mt-4 grid gap-x-8 gap-y-3 text-[12px] md:grid-cols-2">
              <div>
                <p className="text-[12px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>sources</p>
                <p className="mt-1">{latest.sources.join(' · ')}</p>
              </div>
              <div>
                <p className="text-[12px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>hard rules held</p>
                <p className="mt-1">{latest.hardRules.join(' · ')}</p>
              </div>
            </div>
            <p className="mt-4 break-all font-mono text-[12px]" style={{ color: ASSEMBL_WARM_GREY }}>
              {latest.hash}
            </p>
          </div>
        </section>

        {/* ── Fold 5 · next step ──────────────────────────────────────────── */}
        <section className="my-24 text-center">
          <h2 className="text-3xl lowercase" style={{ fontFamily: serif, fontWeight: 500 }}>
            ready when you are<span style={{ color: ASSEMBL_GOLD }}>.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: '#313c42' }}>
            The pilot runs draft-only until you say otherwise. One conversation
            starts it.
          </p>
          <a
            href="mailto:assembl@assembl.co.nz?subject=Happy%20Tails%20pilot"
            className="mt-6 inline-block rounded-xl px-6 py-3 text-sm font-semibold lowercase tracking-[0.08em] text-white"
            style={{ backgroundColor: accent }}
          >
            start the pilot conversation
          </a>
        </section>
        </>)}
      </div>
    </div>
  );
}
