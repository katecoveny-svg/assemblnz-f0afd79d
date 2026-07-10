'use client';

import { useState, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GENOME_SECTION_LABELS,
  GENOME_SURFACES,
  RIPPLE_SCENARIOS,
  genomeFactsWith,
  surfaceName,
  type GenomeSection,
} from '@/lib/customers/auckland-dog-trainer/genome';
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

const SECTION_ORDER: GenomeSection[] = [
  'identity',
  'services',
  'team',
  'knowledge',
  'proof',
  'operations',
];

function SurfaceChip({ label, inverse }: { label: string; inverse?: boolean }) {
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: '0.04em',
        padding: '3px 8px',
        borderRadius: 999,
        background: inverse ? 'rgba(255,255,255,0.14)' : `${NAVY}0C`,
        color: inverse ? '#fff' : NAVY,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

/** The killer interaction — edit one fact, watch every surface update. */
function RippleDemo({
  appliedIds,
  onApply,
}: {
  appliedIds: ReadonlySet<string>;
  onApply: (scenarioId: string) => void;
}) {
  const [scenarioId, setScenarioId] = useState(RIPPLE_SCENARIOS[0].id);
  const scenario = RIPPLE_SCENARIOS.find((s) => s.id === scenarioId) ?? RIPPLE_SCENARIOS[0];
  const applied = appliedIds.has(scenario.id);

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
        <p style={{ ...eyebrow, color: PINK_DEEP }}>the living site · change once, everything updates</p>
        <h2 style={{ margin: '8px 0 0', fontFamily: display, fontSize: 22, color: NAVY }}>
          Edit the genome, not ten tools
        </h2>
        <p style={{ margin: '8px 0 0', fontSize: 13.5, color: MUTED, lineHeight: 1.5, maxWidth: 560 }}>
          {scenario.narrative}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {RIPPLE_SCENARIOS.map((s) => {
            const on = s.id === scenarioId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenarioId(s.id)}
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  padding: '7px 12px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  border: `1.5px solid ${on ? NAVY : `${NAVY}22`}`,
                  background: on ? NAVY : CREAM,
                  color: on ? '#fff' : NAVY,
                }}
              >
                {s.chip}
              </button>
            );
          })}
        </div>

        <div style={{ ...glass, marginTop: 14, padding: 14 }}>
          <p style={eyebrow}>genome fact · {scenario.factLabel}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8, alignItems: 'center' }}>
            <span
              style={{
                fontSize: 13.5,
                color: applied ? MUTED : NAVY,
                textDecoration: applied ? 'line-through' : 'none',
                padding: '8px 12px',
                borderRadius: 10,
                background: BLUSH,
              }}
            >
              {scenario.before}
            </span>
            <span style={{ color: PINK_DEEP, fontWeight: 700 }}>→</span>
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: applied ? '#fff' : NAVY,
                padding: '8px 12px',
                borderRadius: 10,
                background: applied ? NAVY : `${PINK}33`,
                transition: 'background 0.4s ease, color 0.4s ease',
              }}
            >
              {scenario.after}
            </span>
          </div>
          {!applied ? (
            <button
              type="button"
              onClick={() => onApply(scenario.id)}
              style={{
                marginTop: 12,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '10px 16px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: NAVY,
                color: '#fff',
              }}
            >
              Change it once
            </button>
          ) : (
            <p style={{ margin: '12px 0 0', fontSize: 12.5, color: GOLD, fontWeight: 700 }}>
              ✓ Genome updated — {scenario.updates.length} surfaces rewrote themselves. Scroll down:
              the fact itself has changed too.
            </p>
          )}
        </div>

        <AnimatePresence>
          {applied ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: 12,
                display: 'grid',
                gap: 10,
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              }}
            >
              {scenario.updates.map((u, i) => (
                <motion.div
                  key={`${scenario.id}-${u.surface}`}
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.12 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{ ...glass, padding: 12, borderLeft: `3px solid ${PINK_DEEP}` }}
                >
                  <p style={{ ...eyebrow, color: PINK_DEEP }}>
                    ✓ {surfaceName(u.surface)}
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: 13, fontWeight: 600, color: NAVY }}>{u.where}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12.5, color: MUTED, lineHeight: 1.45 }}>{u.change}</p>
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {applied ? (
          <p style={{ margin: '14px 0 0', fontSize: 12, color: MUTED }}>
            No CMS. No duplicate editing. Draft surfaces still wait for Fred&apos;s yes before anything sends.
          </p>
        ) : null}
      </section>
    </OsReveal>
  );
}

function GenomeBrowser({ appliedIds }: { appliedIds: ReadonlySet<string> }) {
  const facts = genomeFactsWith(appliedIds);
  const updatedFactIds = new Set(
    RIPPLE_SCENARIOS.filter((s) => appliedIds.has(s.id)).map((s) => s.applies.factId),
  );

  return (
    <section>
      <p style={{ ...eyebrow, marginBottom: 10 }}>
        the genome · {facts.length} facts, one place
      </p>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {SECTION_ORDER.map((section) => {
          const sectionFacts = facts.filter((f) => f.section === section);
          if (sectionFacts.length === 0) return null;
          return (
            <div key={section} style={{ ...glass, padding: 14 }}>
              <p style={{ ...eyebrow, color: PINK_DEEP }}>{GENOME_SECTION_LABELS[section]}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                {sectionFacts.map((f) => {
                  const updated = updatedFactIds.has(f.id);
                  return (
                    <div
                      key={f.id}
                      style={
                        updated
                          ? { padding: '8px 10px', borderRadius: 10, background: `${GOLD}1E` }
                          : undefined
                      }
                    >
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: NAVY }}>{f.label}</p>
                      <p style={{ margin: '3px 0 0', fontSize: 12.5, color: MUTED, lineHeight: 1.45 }}>{f.value}</p>
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: updated ? GOLD : PINK_DEEP, fontWeight: updated ? 700 : undefined }}>
                        {updated ? '✓ updated just now · ' : ''}
                        read by {f.readBy.length} surface{f.readBy.length === 1 ? '' : 's'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SurfacesStrip() {
  return (
    <section style={{ ...glass, padding: 16 }}>
      <p style={eyebrow}>every surface reads the genome · none of them is “the website”</p>
      <OsStagger
        style={{
          display: 'grid',
          gap: 8,
          marginTop: 10,
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        }}
      >
        {GENOME_SURFACES.map((s) => (
          <motion.div key={s.id} variants={osStaggerItem}>
            <OsHoverLift accent={PINK} style={{ padding: 12, borderRadius: 12, background: BLUSH, height: '100%' }}>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: NAVY }}>{s.name}</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: MUTED, lineHeight: 1.45 }}>{s.reads}</p>
            </OsHoverLift>
          </motion.div>
        ))}
      </OsStagger>
    </section>
  );
}

export function BusinessGenome() {
  const [appliedIds, setAppliedIds] = useState<ReadonlySet<string>>(new Set());
  const applyScenario = (id: string) =>
    setAppliedIds((prev) => new Set(prev).add(id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <OsScrollReveal>
        <section
          style={{
            ...glass,
            padding: 18,
            background: `linear-gradient(135deg, ${NAVY}, #2a3d5c)`,
          }}
        >
          <p style={{ ...eyebrow, color: PINK }}>business genome · single source of truth</p>
          <h2 style={{ margin: '8px 0 0', fontFamily: display, fontSize: 26, color: '#fff' }}>
            The business, written down once
          </h2>
          <p style={{ margin: '10px 0 0', fontSize: 14, color: '#D8DEE9', maxWidth: 560, lineHeight: 1.55 }}>
            Services, pricing, FAQs, policies, testimonials, booking rules — one genome.{' '}
            The website, booking flow, proposals, agents, and emails are surfaces that read it.
            Change a fact once and everything stays in sync.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            {GENOME_SURFACES.map((s) => (
              <SurfaceChip key={s.id} label={s.name.toLowerCase()} inverse />
            ))}
          </div>
        </section>
      </OsScrollReveal>

      <RippleDemo appliedIds={appliedIds} onApply={applyScenario} />
      <OsScrollReveal delay={0.05}>
        <GenomeBrowser appliedIds={appliedIds} />
      </OsScrollReveal>
      <OsScrollReveal delay={0.05}>
        <SurfacesStrip />
      </OsScrollReveal>
    </div>
  );
}
