'use client';

import Link from 'next/link';
import { useMemo, useState, type CSSProperties } from 'react';
import {
  DAYCARE_AGENTS,
  DAYCARE_CARERS,
  DAYCARE_CHALLENGES,
  DAYCARE_FAQ,
  DAYCARE_JOURNEY,
  DAYCARE_LEADS,
  DAYCARE_PATHS,
  DAYCARE_TIME,
  DAYCARE_WEEK,
  type DaycarePath,
} from '@/lib/customers/happy-tails/daycare-os-data';
import { PRICING, ROSTER } from '@/lib/tenants/happy-tails/data';
import { motion } from 'framer-motion';
import {
  OsHoverLift,
  OsReveal,
  OsScrollReveal,
  OsStagger,
  osStaggerItem,
} from '@/components/ops/shared/OsMotion';
import { SocialStudio } from '@/components/ops/shared/SocialStudio';
import {
  HT_OS_TABS,
  type HtOsTab,
} from '@/lib/customers/happy-tails/tabs';

export type { HtOsTab };
export { HT_OS_TABS };

const INK = '#313c42';
const MUTED = '#68766f';
const ACCENT = '#3f7373';
const CREAM = '#ffffff';
const PAPER = '#fbfcfb';
const GOLD = '#b8964f';

const glass: CSSProperties = {
  borderRadius: 16,
  border: `1px solid ${INK}14`,
  background: CREAM,
  boxShadow: '0 10px 28px rgba(49,60,66,0.06)',
};

const eyebrow: CSSProperties = {
  fontSize: 12,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: MUTED,
  fontFamily: 'var(--font-brand-mono), ui-monospace, monospace',
};

const display = 'var(--font-brand-display), Georgia, serif';

function TabBar({ active }: { active: HtOsTab }) {
  return (
    <nav aria-label="Happy Tails Daycare OS" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {HT_OS_TABS.map((t) => {
        const on = t.key === active;
        return (
          <motion.div key={t.key} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              href={`/customers/happy-tails/ops/os?tab=${t.key}`}
              scroll={false}
              aria-current={on ? 'page' : undefined}
              style={{
                display: 'inline-block',
                fontSize: 12.5,
                fontWeight: 600,
                padding: '8px 14px',
                borderRadius: 999,
                textDecoration: 'none',
                color: on ? '#fff' : INK,
                background: on ? INK : CREAM,
                border: `1.5px solid ${on ? INK : `${INK}22`}`,
                boxShadow: on ? '0 8px 20px rgba(49,60,66,0.2)' : 'none',
              }}
            >
              {t.label}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}

function KillerDemo() {
  const lead = DAYCARE_LEADS[0];
  const [played, setPlayed] = useState(false);
  return (
    <OsReveal>
      <section style={{ ...glass, padding: 18, borderColor: `${ACCENT}55`, background: `linear-gradient(180deg, ${PAPER}, ${CREAM})` }}>
        <p style={{ ...eyebrow, color: ACCENT }}>killer demo moment · daycare</p>
        <h2 style={{ margin: '8px 0 0', fontFamily: display, fontSize: 22, color: INK }}>
          Enrolment in → operations out
        </h2>
        <p style={{ margin: '8px 0 0', fontSize: 13.5, color: MUTED, lineHeight: 1.5 }}>
          A new enquiry arrives. Keeper reads it, creates the dog profile, recommends a trial + daycare
          path, drafts the Welcome Pack and Mathis SMS, and queues Liana&apos;s yes.
        </p>
        <button
          type="button"
          onClick={() => setPlayed(true)}
          style={{
            marginTop: 14,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '10px 16px',
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            background: ACCENT,
            color: '#fff',
          }}
        >
          {played ? 'Replay flow' : 'Run the enrolment flow'}
        </button>
        {played ? (
          <div style={{ marginTop: 14, display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
            {[
              { step: '1 · Enrolment', body: `${lead.dog} · ${lead.breed} · ${lead.suburb}` },
              { step: '2 · Pathway', body: DAYCARE_PATHS[lead.recommended].label },
              { step: '3 · Risk', body: `${lead.riskLevel} · vaccinations OK` },
              { step: '4 · Drafts', body: 'Welcome Pack + Mathis SMS' },
              { step: '5 · CRM', body: 'Dog on roster (pending trial)' },
              { step: '6 · Pack', body: lead.packMatch ?? '—' },
            ].map((s, i) => (
              <OsReveal key={s.step} delay={0.05 * i}>
                <div style={{ ...glass, padding: 12 }}>
                  <p style={{ ...eyebrow, color: ACCENT }}>{s.step}</p>
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: INK, lineHeight: 1.45 }}>{s.body}</p>
                </div>
              </OsReveal>
            ))}
          </div>
        ) : null}
      </section>
    </OsReveal>
  );
}

function WeekTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <KillerDemo />
      <OsStagger style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
        {[
          { k: 'capacity', v: `${DAYCARE_TIME.capacityPct}%`, s: 'Riverhead today' },
          { k: 'roster', v: String(DAYCARE_TIME.dogsOnRoster), s: 'dogs · Franklin #1' },
          { k: 'bus runs', v: String(DAYCARE_TIME.busRunsToday), s: 'today' },
          { k: 'follow-ups', v: String(DAYCARE_TIME.followUpsDue), s: 'due' },
          { k: 'admin debt', v: `${DAYCARE_TIME.adminDebtMins}m`, s: 'unpaid load' },
        ].map((i) => (
          <motion.div key={i.k} variants={osStaggerItem}>
            <OsHoverLift accent={ACCENT} style={{ ...glass, padding: '14px 16px', background: PAPER }}>
              <p style={eyebrow}>{i.k}</p>
              <p style={{ margin: '6px 0 0', fontFamily: display, fontSize: 26, color: INK }}>{i.v}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: MUTED }}>{i.s}</p>
            </OsHoverLift>
          </motion.div>
        ))}
      </OsStagger>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div style={{ ...glass, padding: 16 }}>
          <p style={eyebrow}>today · bus & ops</p>
          <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DAYCARE_WEEK.map((b) => (
              <li key={b.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, color: INK }}>
                <span>
                  <strong>{b.when}</strong> · {b.title}
                </span>
                <span style={{ color: MUTED }}>{b.mins}m</span>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ ...glass, padding: 16 }}>
          <p style={eyebrow}>next best action</p>
          <ol style={{ margin: '10px 0 0', paddingLeft: 18, color: INK, fontSize: 13.5, lineHeight: 1.55 }}>
            {DAYCARE_TIME.nextBestActions.map((a) => (
              <li key={a} style={{ marginBottom: 6 }}>
                {a}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function LandingTab() {
  const [path, setPath] = useState<DaycarePath | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ ...glass, padding: 18, background: `linear-gradient(135deg, ${INK}, #3e4a51)` }}>
        <p style={{ ...eyebrow, color: GOLD }}>public landing hub · daycare</p>
        <h2 style={{ margin: '8px 0 0', fontFamily: display, fontSize: 24, color: '#fff' }}>
          Not sure what care your pup needs? Find the right Happy Tails path.
        </h2>
      </div>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        {DAYCARE_CHALLENGES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setPath(c.mapsTo)}
            style={{ ...glass, padding: 14, textAlign: 'left', cursor: 'pointer', borderColor: path === c.mapsTo ? ACCENT : `${INK}14` }}
          >
            <h3 style={{ margin: 0, fontFamily: display, fontSize: 17, color: INK }}>{c.title}</h3>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: MUTED, lineHeight: 1.45 }}>{c.blurb}</p>
          </button>
        ))}
      </div>
      {path ? (
        <div style={{ ...glass, padding: 14, background: PAPER }}>
          <p style={eyebrow}>recommended</p>
          <p style={{ margin: '6px 0 0', fontFamily: display, fontSize: 20, color: INK }}>
            {DAYCARE_PATHS[path].label}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: MUTED }}>
            {DAYCARE_PATHS[path].priceSample} · lead drafted for Liana&apos;s yes
          </p>
        </div>
      ) : null}
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {(['trial', 'daycare-bus', 'overnight', 'boarding'] as DaycarePath[]).map((p) => (
          <div key={p} style={{ ...glass, padding: 14 }}>
            <h3 style={{ margin: 0, fontFamily: display, fontSize: 17, color: INK }}>{DAYCARE_PATHS[p].label}</h3>
            <p style={{ margin: '6px 0 0', fontSize: 13, fontWeight: 700, color: ACCENT }}>{DAYCARE_PATHS[p].priceSample}</p>
          </div>
        ))}
      </div>
      <div style={{ ...glass, padding: 16 }}>
        <p style={eyebrow}>video-first FAQ</p>
        <div style={{ display: 'grid', gap: 8, marginTop: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          {DAYCARE_FAQ.map((f) => (
            <div key={f.id} style={{ padding: 12, borderRadius: 12, background: PAPER }}>
              <div style={{ height: 56, borderRadius: 8, background: `${INK}12`, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, color: INK }}>
                ▶ {f.dur}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: INK }}>{f.q}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeadsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {DAYCARE_LEADS.map((lead) => (
        <article key={lead.id} style={{ ...glass, padding: 16, borderColor: lead.id === 'ht-killer' ? `${ACCENT}66` : undefined }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: display, fontSize: 20, color: INK }}>
                {lead.dog}
                <span style={{ fontSize: 13, color: MUTED, marginLeft: 8 }}>
                  {lead.breed} · {lead.sizeTier} · {lead.suburb}
                </span>
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: MUTED }}>
                {lead.owner} · {lead.source} · {lead.receivedAt}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', padding: '5px 10px', borderRadius: 999, background: `${INK}10`, color: INK }}>
                {lead.urgency}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 999, background: `${ACCENT}22`, color: INK }}>
                → {DAYCARE_PATHS[lead.recommended].short}
              </span>
            </div>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 13.5, color: INK, lineHeight: 1.5 }}>{lead.triage}</p>
          {lead.draftReply ? (
            <p style={{ margin: '10px 0 0', fontSize: 13, color: MUTED, lineHeight: 1.5, padding: 12, background: PAPER, borderRadius: 10 }}>
              <span style={eyebrow}>draft · </span>
              {lead.draftReply}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function DogsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {ROSTER.slice(0, 6).map((d) => (
        <article key={d.slug} style={{ ...glass, padding: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: display, fontSize: 20, color: INK }}>
                {d.name}
                {d.record === 1 ? <span style={{ marginLeft: 8, fontSize: 12, color: ACCENT }}>#1 Franklin</span> : null}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: MUTED }}>
                {d.breed} · {d.sizeTier} · {d.ownerName}
              </p>
            </div>
            <span style={eyebrow}>{d.weeklySchedule}</span>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 13, color: INK }}>{d.behaviour}</p>
          <p style={{ margin: '6px 0 0', fontSize: 12.5, color: MUTED }}>
            Vaccinations · {d.vaccinations.map((v) => `${v.name.split(' ')[0]}:${v.status}`).join(' · ') || 'on file'}
            {d.latestInvoice ? ` · ${d.latestInvoice.number} ${d.latestInvoice.total}` : ''}
          </p>
        </article>
      ))}
    </div>
  );
}

function JourneyTab() {
  return (
    <div style={{ ...glass, padding: 16 }}>
      <p style={eyebrow}>care journey · week-by-week (not training)</p>
      <p style={{ margin: '6px 0 12px', fontSize: 13.5, color: MUTED }}>
        Enrolment → settle → bus rhythm → pack fit. Pricing: daycare {PRICING.currency}
        {PRICING.daycareWithBus} · overnight {PRICING.currency}
        {PRICING.overnight}.
      </p>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        {DAYCARE_JOURNEY.map((w) => (
          <div key={w.week} style={{ padding: 12, borderRadius: 12, background: PAPER, borderLeft: `3px solid ${ACCENT}` }}>
            <p style={eyebrow}>week {w.week}</p>
            <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600, color: INK }}>{w.title}</p>
            <p style={{ margin: '6px 0 0', fontSize: 12.5, color: MUTED }}>Owner · {w.ownerTask}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PacksTab() {
  return (
    <div style={{ ...glass, padding: 16 }}>
      <p style={eyebrow}>welcome studio · Liana voice</p>
      <h3 style={{ margin: '8px 0 0', fontFamily: display, fontSize: 22, color: INK }}>
        Welcome Pack · Biscuit
      </h3>
      <ol style={{ margin: '12px 0 0', paddingLeft: 18, color: INK, fontSize: 13.5, lineHeight: 1.55 }}>
        <li>Cover — Happy Tails family</li>
        <li>Welcome letter (Liana voice)</li>
        <li>How the daycare bus works</li>
        <li>Helpful info · 6 steps</li>
        <li>Services + thank you</li>
      </ol>
      <p style={{ margin: '12px 0 0', fontSize: 13, color: MUTED, lineHeight: 1.5, padding: 12, background: PAPER, borderRadius: 10 }}>
        Two-voice rule locked: email = Liana · SMS = Mathis. Nothing sends without a human yes.
      </p>
    </div>
  );
}

function SupportTab() {
  const items = [
    { from: 'Kate', dog: 'Franklin', preview: 'Can we shift Thursday pickup to Kohimarama this week?', bucket: 'needs Liana' },
    { from: 'Sam', dog: 'Biscuit', preview: 'What should we pack for the trial day?', bucket: 'Welcome Pack FAQ' },
    { from: 'New', dog: 'Rex', preview: 'Reactive with other dogs — can he still come?', bucket: 'urgent · escalate' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((m) => (
        <article key={m.preview} style={{ ...glass, padding: 14 }}>
          <p style={{ margin: 0, fontSize: 12, color: MUTED }}>
            {m.from} · {m.dog}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: INK }}>{m.preview}</p>
          <p style={{ ...eyebrow, marginTop: 8, color: ACCENT }}>{m.bucket}</p>
        </article>
      ))}
    </div>
  );
}

function TimeTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ ...glass, padding: 16 }}>
        <p style={eyebrow}>capacity meter</p>
        <div style={{ marginTop: 10, height: 14, borderRadius: 999, background: `${INK}12`, overflow: 'hidden' }}>
          <div style={{ width: `${DAYCARE_TIME.capacityPct}%`, height: '100%', background: ACCENT, borderRadius: 999 }} />
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: INK }}>
          {DAYCARE_TIME.capacityPct}% · admin debt {DAYCARE_TIME.adminDebtMins}m · unpaid comms {DAYCARE_TIME.unpaidCommsMins}m
        </p>
      </div>
      <div style={{ ...glass, padding: 16 }}>
        <p style={eyebrow}>time leakage → content / automation</p>
        {DAYCARE_TIME.timeLeakage.map((t) => (
          <div key={t.label} style={{ marginTop: 10, fontSize: 13.5, color: INK }}>
            <strong>{t.mins}m</strong> · {t.label}
            <div style={{ color: ACCENT, fontSize: 12.5 }}>→ {t.action}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HiringTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {DAYCARE_CARERS.map((c) => (
        <article key={c.id} style={{ ...glass, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: display, fontSize: 18, color: INK }}>{c.name}</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: MUTED }}>{c.experience}</p>
            </div>
            <p style={{ margin: 0, fontFamily: display, fontSize: 24, color: INK }}>{c.score}</p>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 13.5, color: INK }}>{c.fit}</p>
          <p style={{ ...eyebrow, marginTop: 8, color: ACCENT }}>stage · {c.stage}</p>
        </article>
      ))}
    </div>
  );
}

function AgentsTab() {
  return (
    <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
      {DAYCARE_AGENTS.map((a) => (
        <div key={a.id} style={{ ...glass, padding: 14 }}>
          <p style={{ ...eyebrow, color: a.status === 'live' ? GOLD : ACCENT }}>{a.status}</p>
          <h3 style={{ margin: '6px 0 0', fontSize: 15, color: INK }}>{a.name}</h3>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: MUTED, lineHeight: 1.45 }}>{a.job}</p>
        </div>
      ))}
    </div>
  );
}

export function HappyTailsDaycareOS({ tab }: { tab: HtOsTab }) {
  const safeTab = useMemo(() => (HT_OS_TABS.some((t) => t.key === tab) ? tab : 'week'), [tab]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'var(--font-brand-body), system-ui, sans-serif', color: INK }}>
      <OsScrollReveal>
        <section style={{ padding: '2px 0 0' }}>
          <p style={{ ...eyebrow, color: GOLD }}>happy tails · daycare operating system</p>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: MUTED, maxWidth: 480, lineHeight: 1.5 }}>
            Enrolment, bus, welcome packs, invoices, owner support, and capacity — daycare ops, not
            training. Draft-only · two-voice rule locked.
          </p>
        </section>
      </OsScrollReveal>
      <TabBar active={safeTab} />
      <OsScrollReveal key={safeTab} delay={0.04}>
        {safeTab === 'week' ? <WeekTab /> : null}
        {safeTab === 'landing' ? <LandingTab /> : null}
        {safeTab === 'leads' ? <LeadsTab /> : null}
        {safeTab === 'dogs' ? <DogsTab /> : null}
        {safeTab === 'journey' ? <JourneyTab /> : null}
        {safeTab === 'packs' ? <PacksTab /> : null}
        {safeTab === 'social' ? <SocialStudio pilot="happy-tails" /> : null}
        {safeTab === 'support' ? <SupportTab /> : null}
        {safeTab === 'time' ? <TimeTab /> : null}
        {safeTab === 'hiring' ? <HiringTab /> : null}
        {safeTab === 'agents' ? <AgentsTab /> : null}
      </OsScrollReveal>
    </div>
  );
}
