'use client';

import { useState, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IMPROVEMENT_KIND_LABELS,
  MORNING_BRIEF,
} from '@/lib/customers/auckland-dog-trainer/morning-brief';
import { surfaceName } from '@/lib/customers/auckland-dog-trainer/genome';
import { OsHoverLift, OsReveal, OsScrollReveal, OsStagger, osStaggerItem } from '@/components/ops/shared/OsMotion';
import { TONE_PALETTES, ToneProvider, useTone, type GenomeTone, type TonePalette } from './tone';

const glass = (C: TonePalette): CSSProperties => ({
  borderRadius: 16,
  border: `1px solid ${C.ink}14`,
  background: C.card,
  boxShadow: '0 10px 28px rgba(27,42,74,0.06)',
});

const eyebrow = (C: TonePalette): CSSProperties => ({
  fontSize: 10,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: C.muted,
  fontFamily: 'var(--font-brand-mono), ui-monospace, monospace',
});

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

const approveBtn = (C: TonePalette): CSSProperties => ({
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  padding: '9px 15px',
  borderRadius: 999,
  border: 'none',
  cursor: 'pointer',
  background: C.ink,
  color: '#fff',
});

const skipBtn = (C: TonePalette): CSSProperties => ({
  ...approveBtn(C),
  background: C.card,
  color: C.ink,
  border: `1.5px solid ${C.ink}22`,
});

type Decision = 'pending' | 'approved' | 'skipped';

function Greeting() {
  const C = useTone();
  return (
    <section style={{ ...glass(C), padding: 18, background: C.headerGrad }}>
      <p style={{ ...eyebrow(C), color: C.accent }}>morning brief · improvement agent</p>
      <h2 style={{ margin: '8px 0 0', fontFamily: display, fontSize: 30, color: '#fff' }}>
        {MORNING_BRIEF.greeting}
      </h2>
      <p style={{ margin: '8px 0 0', fontSize: 14, color: C.headerSub }}>{MORNING_BRIEF.dateLine}</p>
    </section>
  );
}

function Yesterday({ liveEnquiryCount }: { liveEnquiryCount?: number | null }) {
  const C = useTone();
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
          <OsHoverLift accent={C.accent} style={{ ...glass(C), padding: '14px 16px', background: C.wash, height: '100%' }}>
            <p style={eyebrow(C)}>{s.label}</p>
            <p style={{ margin: '6px 0 0', fontFamily: display, fontSize: 26, color: C.ink }}>{s.value}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: C.muted }}>{s.note}</p>
          </OsHoverLift>
        </motion.div>
      ))}
    </OsStagger>
  );
}

/** The signature moment — the system noticed, did the work, asks for one yes. */
function NoticedCard() {
  const C = useTone();
  const [decision, setDecision] = useState<Decision>('pending');
  const approved = decision === 'approved';
  const n = MORNING_BRIEF.noticed;

  return (
    <OsReveal>
      <section
        style={{
          ...glass(C),
          padding: 18,
          borderColor: `${C.accent}88`,
          background: `linear-gradient(180deg, ${C.wash}, ${C.card})`,
        }}
      >
        <p style={{ ...eyebrow(C), color: C.accentDeep }}>{n.eyebrow}</p>
        <h3 style={{ margin: '8px 0 0', fontFamily: display, fontSize: 22, color: C.ink, maxWidth: 620 }}>
          {n.headline}
        </h3>
        <p style={{ margin: '8px 0 0', fontSize: 13.5, color: C.muted, lineHeight: 1.55, maxWidth: 620 }}>
          {n.evidence}
        </p>

        <div style={{ display: 'grid', gap: 10, marginTop: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div style={{ ...glass(C), padding: 14, opacity: approved ? 0.55 : 1, transition: 'opacity 0.4s ease' }}>
            <p style={eyebrow(C)}>the page today</p>
            <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
              {n.rebuild.before.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div style={{ ...glass(C), padding: 14, borderColor: approved ? C.gold : `${C.accent}66` }}>
            <p style={{ ...eyebrow(C), color: approved ? C.gold : C.accentDeep }}>
              {approved ? 'live now' : 'the rebuild · ready'}
            </p>
            <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: C.ink, lineHeight: 1.6 }}>
              {n.rebuild.after.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </div>

        {decision === 'pending' ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setDecision('approved')} style={approveBtn(C)}>
              Approve ✓
            </button>
            <button type="button" onClick={() => setDecision('skipped')} style={skipBtn(C)}>
              Keep the old page
            </button>
          </div>
        ) : decision === 'skipped' ? (
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: 13, color: C.muted }}>
              Keeping the old page. The rebuild stays saved — I&apos;ll keep watching the numbers and
              re-suggest if it keeps underperforming.
            </p>
            <button type="button" onClick={() => setDecision('pending')} style={skipBtn(C)}>
              Reconsider
            </button>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ marginTop: 14, padding: 14, borderRadius: 12, background: `${C.gold}22` }}
            >
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: C.ink }}>✓ {n.approvedNote}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {n.surfaces.map((s) => (
                  <span key={s} style={pill(`${C.ink}10`, C.ink)}>
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
  const C = useTone();
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const decide = (id: string, d: Decision) => setDecisions((prev) => ({ ...prev, [id]: d }));
  const approvedCount = Object.values(decisions).filter((d) => d === 'approved').length;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <p style={{ ...eyebrow(C), margin: 0 }}>also noticed overnight · your yes runs the day</p>
        {approvedCount > 0 ? (
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.gold }}>
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
              ...glass(C),
              padding: 16,
              opacity: d === 'skipped' ? 0.5 : 1,
              borderColor: d === 'approved' ? `${C.gold}88` : undefined,
              transition: 'opacity 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontFamily: display, fontSize: 19, color: C.ink }}>{item.title}</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={pill(`${C.accent}33`, C.ink)}>{IMPROVEMENT_KIND_LABELS[item.kind]}</span>
                <span style={pill(`${C.ink}10`, C.ink)}>{item.saves}</span>
              </div>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
              <span style={{ ...eyebrow(C), fontSize: 10 }}>noticed · </span>
              {item.noticed}
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 13.5, color: C.ink, lineHeight: 1.5 }}>
              <span style={{ ...eyebrow(C), fontSize: 10, color: C.accentDeep }}>already done · </span>
              {item.done}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10, alignItems: 'center' }}>
              {item.surfaces.map((s) => (
                <span key={s} style={{ fontSize: 11, color: C.accentDeep }}>
                  {surfaceName(s).toLowerCase()}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {d === 'pending' ? (
                <>
                  <button type="button" onClick={() => decide(item.id, 'approved')} style={approveBtn(C)}>
                    Approve ✓
                  </button>
                  <button type="button" onClick={() => decide(item.id, 'skipped')} style={skipBtn(C)}>
                    Not today
                  </button>
                </>
              ) : d === 'approved' ? (
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: C.gold }}>
                  ✓ Approved — sending from your drafts
                </p>
              ) : (
                <button type="button" onClick={() => decide(item.id, 'pending')} style={skipBtn(C)}>
                  Skipped · reconsider
                </button>
              )}
            </div>
          </article>
        );
      })}
      <p style={{ margin: '4px 0 0', fontSize: 12.5, color: C.muted }}>{MORNING_BRIEF.promise}</p>
    </section>
  );
}

export function MorningBrief({
  liveEnquiryCount,
  tone = 'brand',
}: {
  liveEnquiryCount?: number | null;
  /** 'brand' in the console; 'pearl' on the public tour (canon vNext). */
  tone?: GenomeTone;
}) {
  return (
    <ToneProvider value={TONE_PALETTES[tone]}>
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
    </ToneProvider>
  );
}
