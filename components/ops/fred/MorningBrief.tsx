'use client';

import { useState, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IMPROVEMENT_KIND_LABELS,
  MORNING_BRIEF,
} from '@/lib/customers/auckland-dog-trainer/morning-brief';
import { surfaceName } from '@/lib/customers/auckland-dog-trainer/genome';
import { OsHoverLift, OsReveal, OsScrollReveal, OsStagger, osStaggerItem } from '@/components/ops/shared/OsMotion';

const NAVY = '#1B2A4A';
const PINK = '#D4A5B0';
const PINK_DEEP = '#B87A8A';
const BLUSH = '#F7EEF1';
const CREAM = '#FFFCFB';
const MUTED = '#6B7389';
const GOLD = '#C4A574';

const glass: CSSProperties = {
  borderRadius: 16,
  border: `1px solid ${NAVY}14`,
  background: CREAM,
  boxShadow: '0 10px 28px rgba(27,42,74,0.06)',
};

const eyebrow: CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: MUTED,
  fontFamily: 'var(--font-brand-mono), ui-monospace, monospace',
};

const display = 'var(--font-brand-display), Georgia, serif';

const pill = (bg: string, color: string): CSSProperties => ({
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  padding: '5px 10px',
  borderRadius: 999,
  background: bg,
  color,
});

const approveBtn: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  padding: '9px 15px',
  borderRadius: 999,
  border: 'none',
  cursor: 'pointer',
  background: NAVY,
  color: '#fff',
};

const skipBtn: CSSProperties = {
  ...approveBtn,
  background: CREAM,
  color: NAVY,
  border: `1.5px solid ${NAVY}22`,
};

type Decision = 'pending' | 'approved' | 'skipped';

function Greeting() {
  return (
    <section style={{ ...glass, padding: 18, background: `linear-gradient(135deg, ${NAVY}, #2a3d5c)` }}>
      <p style={{ ...eyebrow, color: PINK }}>morning brief · improvement agent</p>
      <h2 style={{ margin: '8px 0 0', fontFamily: display, fontSize: 30, color: '#fff' }}>
        {MORNING_BRIEF.greeting}
      </h2>
      <p style={{ margin: '8px 0 0', fontSize: 14, color: '#D8DEE9' }}>{MORNING_BRIEF.dateLine}</p>
    </section>
  );
}

function Yesterday({ liveEnquiryCount }: { liveEnquiryCount?: number | null }) {
  // When the ops page hands us the real living_site_enquiries count, the
  // enquiries tile stops being sample copy and reports the actual database.
  const stats =
    typeof liveEnquiryCount === 'number'
      ? MORNING_BRIEF.yesterday.map((s) =>
          s.id === 'enquiries'
            ? { ...s, value: String(liveEnquiryCount), note: 'on your desk · live from the website' }
            : s,
        )
      : MORNING_BRIEF.yesterday;
  return (
    <OsStagger style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
      {stats.map((s) => (
        <motion.div key={s.id} variants={osStaggerItem}>
          <OsHoverLift accent={PINK} style={{ ...glass, padding: '14px 16px', background: BLUSH, height: '100%' }}>
            <p style={eyebrow}>{s.label}</p>
            <p style={{ margin: '6px 0 0', fontFamily: display, fontSize: 26, color: NAVY }}>{s.value}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: MUTED }}>{s.note}</p>
          </OsHoverLift>
        </motion.div>
      ))}
    </OsStagger>
  );
}

/** The signature moment — the system noticed, did the work, asks for one yes. */
function NoticedCard() {
  const [decision, setDecision] = useState<Decision>('pending');
  const approved = decision === 'approved';
  const n = MORNING_BRIEF.noticed;

  return (
    <OsReveal>
      <section
        style={{
          ...glass,
          padding: 18,
          borderColor: `${PINK}88`,
          background: `linear-gradient(180deg, ${BLUSH}, ${CREAM})`,
        }}
      >
        <p style={{ ...eyebrow, color: PINK_DEEP }}>{n.eyebrow}</p>
        <h3 style={{ margin: '8px 0 0', fontFamily: display, fontSize: 22, color: NAVY, maxWidth: 620 }}>
          {n.headline}
        </h3>
        <p style={{ margin: '8px 0 0', fontSize: 13.5, color: MUTED, lineHeight: 1.55, maxWidth: 620 }}>
          {n.evidence}
        </p>

        <div style={{ display: 'grid', gap: 10, marginTop: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div style={{ ...glass, padding: 14, opacity: approved ? 0.55 : 1, transition: 'opacity 0.4s ease' }}>
            <p style={eyebrow}>the page today</p>
            <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
              {n.rebuild.before.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div style={{ ...glass, padding: 14, borderColor: approved ? GOLD : `${PINK}66` }}>
            <p style={{ ...eyebrow, color: approved ? GOLD : PINK_DEEP }}>
              {approved ? 'live now' : 'the rebuild · ready'}
            </p>
            <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: NAVY, lineHeight: 1.6 }}>
              {n.rebuild.after.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </div>

        {decision === 'pending' ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setDecision('approved')} style={approveBtn}>
              Approve ✓
            </button>
            <button type="button" onClick={() => setDecision('skipped')} style={skipBtn}>
              Keep the old page
            </button>
          </div>
        ) : decision === 'skipped' ? (
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
              Keeping the old page. The rebuild stays saved — I&apos;ll keep watching the numbers and
              re-suggest if it keeps underperforming.
            </p>
            <button type="button" onClick={() => setDecision('pending')} style={skipBtn}>
              Reconsider
            </button>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ marginTop: 14, padding: 14, borderRadius: 12, background: `${GOLD}22` }}
            >
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: NAVY }}>✓ {n.approvedNote}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {n.surfaces.map((s) => (
                  <span key={s} style={pill(`${NAVY}10`, NAVY)}>
                    ✓ {surfaceName(s)}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </OsReveal>
  );
}

function Queue() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const decide = (id: string, d: Decision) => setDecisions((prev) => ({ ...prev, [id]: d }));
  const approvedCount = Object.values(decisions).filter((d) => d === 'approved').length;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <p style={{ ...eyebrow, margin: 0 }}>also noticed overnight · your yes runs the day</p>
        {approvedCount > 0 ? (
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: GOLD }}>
            {approvedCount} approved — the desk is on it
          </p>
        ) : null}
      </div>
      {MORNING_BRIEF.queue.map((item) => {
        const d = decisions[item.id] ?? 'pending';
        return (
          <article
            key={item.id}
            style={{
              ...glass,
              padding: 16,
              opacity: d === 'skipped' ? 0.5 : 1,
              borderColor: d === 'approved' ? `${GOLD}88` : undefined,
              transition: 'opacity 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontFamily: display, fontSize: 19, color: NAVY }}>{item.title}</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={pill(`${PINK}33`, NAVY)}>{IMPROVEMENT_KIND_LABELS[item.kind]}</span>
                <span style={pill(`${NAVY}10`, NAVY)}>{item.saves}</span>
              </div>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
              <span style={{ ...eyebrow, fontSize: 10 }}>noticed · </span>
              {item.noticed}
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 13.5, color: NAVY, lineHeight: 1.5 }}>
              <span style={{ ...eyebrow, fontSize: 10, color: PINK_DEEP }}>already done · </span>
              {item.done}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10, alignItems: 'center' }}>
              {item.surfaces.map((s) => (
                <span key={s} style={{ fontSize: 11, color: PINK_DEEP }}>
                  {surfaceName(s).toLowerCase()}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {d === 'pending' ? (
                <>
                  <button type="button" onClick={() => decide(item.id, 'approved')} style={approveBtn}>
                    Approve ✓
                  </button>
                  <button type="button" onClick={() => decide(item.id, 'skipped')} style={skipBtn}>
                    Not today
                  </button>
                </>
              ) : d === 'approved' ? (
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: GOLD }}>
                  ✓ Approved — sending from your drafts
                </p>
              ) : (
                <button type="button" onClick={() => decide(item.id, 'pending')} style={skipBtn}>
                  Skipped · reconsider
                </button>
              )}
            </div>
          </article>
        );
      })}
      <p style={{ margin: '4px 0 0', fontSize: 12.5, color: MUTED }}>{MORNING_BRIEF.promise}</p>
    </section>
  );
}

export function MorningBrief({ liveEnquiryCount }: { liveEnquiryCount?: number | null }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <OsScrollReveal>
        <Greeting />
      </OsScrollReveal>
      <Yesterday liveEnquiryCount={liveEnquiryCount} />
      <NoticedCard />
      <OsScrollReveal delay={0.05}>
        <Queue />
      </OsScrollReveal>
    </div>
  );
}
