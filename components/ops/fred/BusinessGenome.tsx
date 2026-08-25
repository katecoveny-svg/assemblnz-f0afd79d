'use client';

import { useState, useTransition, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { updateGenomeFactAction } from '@/app/customers/auckland-dog-trainer/ops/genome-actions';
import {
  GENOME_FACTS,
  GENOME_SECTION_LABELS,
  GENOME_SURFACES,
  RIPPLE_SCENARIOS,
  genomeFactsWith,
  surfaceName,
  type GenomeFact,
  type GenomeSection,
} from '@/lib/customers/auckland-dog-trainer/genome';
import { OsHoverLift, OsReveal, OsScrollReveal, OsStagger, osStaggerItem } from '@/components/ops/shared/OsMotion';
import { TONE_PALETTES, ToneProvider, useTone, type GenomeTone, type TonePalette } from './tone';

const glass = (C: TonePalette): CSSProperties => ({
  borderRadius: 16,
  border: `1px solid ${C.ink}14`,
  background: C.card,
  boxShadow: '0 10px 28px rgba(27,42,74,0.06)',
});

const eyebrow = (C: TonePalette): CSSProperties => ({
  fontSize: 12,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: C.muted,
  fontFamily: 'var(--font-brand-mono), ui-monospace, monospace',
});

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
  const C = useTone();
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.04em',
        padding: '3px 8px',
        borderRadius: 999,
        background: inverse ? 'rgba(255,255,255,0.14)' : `${C.ink}0C`,
        color: inverse ? '#fff' : C.ink,
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
  const C = useTone();
  const [scenarioId, setScenarioId] = useState(RIPPLE_SCENARIOS[0].id);
  const scenario = RIPPLE_SCENARIOS.find((s) => s.id === scenarioId) ?? RIPPLE_SCENARIOS[0];
  const applied = appliedIds.has(scenario.id);

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
        <p style={{ ...eyebrow(C), color: C.accentDeep }}>the living site · change once, everything updates</p>
        <h2 style={{ margin: '8px 0 0', fontFamily: display, fontSize: 22, color: C.ink }}>
          Edit the genome, not ten tools
        </h2>
        <p style={{ margin: '8px 0 0', fontSize: 13.5, color: C.muted, lineHeight: 1.5, maxWidth: 560 }}>
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
                  border: `1.5px solid ${on ? C.ink : `${C.ink}22`}`,
                  background: on ? C.ink : C.card,
                  color: on ? '#fff' : C.ink,
                }}
              >
                {s.chip}
              </button>
            );
          })}
        </div>

        <div style={{ ...glass(C), marginTop: 14, padding: 14 }}>
          <p style={eyebrow(C)}>genome fact · {scenario.factLabel}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8, alignItems: 'center' }}>
            <span
              style={{
                fontSize: 13.5,
                color: applied ? C.muted : C.ink,
                textDecoration: applied ? 'line-through' : 'none',
                padding: '8px 12px',
                borderRadius: 10,
                background: C.wash,
              }}
            >
              {scenario.before}
            </span>
            <span style={{ color: C.accentDeep, fontWeight: 700 }}>→</span>
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: applied ? '#fff' : C.ink,
                padding: '8px 12px',
                borderRadius: 10,
                background: applied ? C.ink : `${C.accent}33`,
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
                background: C.ink,
                color: '#fff',
              }}
            >
              Change it once
            </button>
          ) : (
            <p style={{ margin: '12px 0 0', fontSize: 12.5, color: C.gold, fontWeight: 700 }}>
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
                  style={{ ...glass(C), padding: 12, borderLeft: `3px solid ${C.accentDeep}` }}
                >
                  <p style={{ ...eyebrow(C), color: C.accentDeep }}>
                    ✓ {surfaceName(u.surface)}
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: 13, fontWeight: 600, color: C.ink }}>{u.where}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12.5, color: C.muted, lineHeight: 1.45 }}>{u.change}</p>
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {applied ? (
          <p style={{ margin: '14px 0 0', fontSize: 12, color: C.muted }}>
            No CMS. No duplicate editing. Draft surfaces still wait for Sam&apos;s yes before anything sends.
          </p>
        ) : null}
      </section>
    </OsReveal>
  );
}

/**
 * One editable fact row. On a real save the ripple is COMPUTED from the
 * fact's read_by list (not the curated scenarios): every listed surface
 * re-reads the genome on its next load, so that IS the update list.
 */
function FactRow({
  fact,
  updated,
  editable,
}: {
  fact: GenomeFact;
  updated: boolean;
  editable: boolean;
}) {
  const C = useTone();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(fact.value);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateGenomeFactAction(fact.id, draft);
      if (!result.ok) {
        setError(result.message ?? 'Something went wrong.');
        return;
      }
      setEditing(false);
      setSaved(true);
      router.refresh();
    });
  };

  const chipBtn: CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '4px 10px',
    borderRadius: 999,
    cursor: 'pointer',
    border: `1.5px solid ${C.ink}22`,
    background: C.card,
    color: C.ink,
  };

  return (
    <div
      style={
        updated || saved
          ? { padding: '8px 10px', borderRadius: 10, background: `${C.gold}1E` }
          : undefined
      }
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: C.ink }}>
          {fact.label}
          {fact.verification && fact.verification !== 'confirmed' ? (
            <span
              style={{
                marginLeft: 8,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#8a6d1f',
              }}
            >
              {fact.verification} — needs your confirmation
            </span>
          ) : null}
        </p>
        {editable && !editing ? (
          <button type="button" onClick={() => { setDraft(fact.value); setEditing(true); setSaved(false); }} style={chipBtn}>
            edit
          </button>
        ) : null}
      </div>

      {editing ? (
        <div style={{ marginTop: 6 }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={300}
            rows={2}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              fontSize: 13,
              padding: '8px 10px',
              borderRadius: 10,
              border: `1.5px solid ${C.ink}33`,
              background: C.card,
              color: C.ink,
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button
              type="button"
              onClick={save}
              disabled={pending}
              style={{ ...chipBtn, background: C.ink, color: '#fff', border: `1.5px solid ${C.ink}`, opacity: pending ? 0.6 : 1 }}
            >
              {pending ? 'saving…' : 'save to the genome'}
            </button>
            <button type="button" onClick={() => { setEditing(false); setError(null); }} disabled={pending} style={chipBtn}>
              cancel
            </button>
          </div>
          {error ? (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#B54A4A' }}>{error}</p>
          ) : null}
        </div>
      ) : (
        <p style={{ margin: '3px 0 0', fontSize: 12.5, color: C.muted, lineHeight: 1.45 }}>{fact.value}</p>
      )}

      {saved ? (
        <div style={{ marginTop: 8 }}>
          <p style={{ margin: 0, fontSize: 12, color: C.gold, fontWeight: 700 }}>
            ✓ saved — {fact.readBy.length} surface{fact.readBy.length === 1 ? '' : 's'} re-read this
            fact on their next load:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
            {fact.readBy.map((s) => (
              <SurfaceChip key={s} label={surfaceName(s).toLowerCase()} />
            ))}
          </div>
        </div>
      ) : (
        <p style={{ margin: '4px 0 0', fontSize: 12, color: updated ? C.gold : C.accentDeep, fontWeight: updated ? 700 : undefined }}>
          {updated ? '✓ updated just now · ' : ''}
          read by {fact.readBy.length} surface{fact.readBy.length === 1 ? '' : 's'}
        </p>
      )}
    </div>
  );
}

function GenomeBrowser({
  appliedIds,
  baseFacts,
  editable,
}: {
  appliedIds: ReadonlySet<string>;
  baseFacts: GenomeFact[];
  editable: boolean;
}) {
  const C = useTone();
  const facts = genomeFactsWith(appliedIds, baseFacts);
  const updatedFactIds = new Set(
    RIPPLE_SCENARIOS.filter((s) => appliedIds.has(s.id)).map((s) => s.applies.factId),
  );

  return (
    <section>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <p style={{ ...eyebrow(C), margin: 0 }}>
          the genome · {facts.length} facts, one place
        </p>
        {editable ? (
          <p style={{ ...eyebrow(C), margin: 0, color: C.gold }}>
            editable · a save here rewrites every surface
          </p>
        ) : null}
      </div>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {SECTION_ORDER.map((section) => {
          const sectionFacts = facts.filter((f) => f.section === section);
          if (sectionFacts.length === 0) return null;
          return (
            <div key={section} style={{ ...glass(C), padding: 14 }}>
              <p style={{ ...eyebrow(C), color: C.accentDeep }}>{GENOME_SECTION_LABELS[section]}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                {sectionFacts.map((f) => (
                  <FactRow key={f.id} fact={f} updated={updatedFactIds.has(f.id)} editable={editable} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SurfacesStrip() {
  const C = useTone();
  return (
    <section style={{ ...glass(C), padding: 16 }}>
      <p style={eyebrow(C)}>every surface reads the genome · none of them is “the website”</p>
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
            <OsHoverLift accent={C.accent} style={{ padding: 12, borderRadius: 12, background: C.wash, height: '100%' }}>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.ink }}>{s.name}</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: C.muted, lineHeight: 1.45 }}>{s.reads}</p>
            </OsHoverLift>
          </motion.div>
        ))}
      </OsStagger>
    </section>
  );
}

export function BusinessGenome({
  facts = GENOME_FACTS,
  live = false,
  editable = false,
  tone = 'brand',
}: {
  /** Base genome — live DB rows when available, in-repo sample otherwise. */
  facts?: GenomeFact[];
  live?: boolean;
  /** Gated ops console only — turns each fact into an edit-in-place row. */
  editable?: boolean;
  /** 'brand' in the console; 'pearl' on the public tour (canon vNext). */
  tone?: GenomeTone;
}) {
  return (
    <ToneProvider value={TONE_PALETTES[tone]}>
      <BusinessGenomeInner facts={facts} live={live} editable={editable} />
    </ToneProvider>
  );
}

function BusinessGenomeInner({
  facts,
  live,
  editable,
}: {
  facts: GenomeFact[];
  live: boolean;
  editable: boolean;
}) {
  const C = useTone();
  const [appliedIds, setAppliedIds] = useState<ReadonlySet<string>>(new Set());
  const applyScenario = (id: string) =>
    setAppliedIds((prev) => new Set(prev).add(id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <OsScrollReveal>
        <section
          style={{
            ...glass(C),
            padding: 18,
            background: C.headerGrad,
          }}
        >
          <p style={{ ...eyebrow(C), color: C.accent }}>
            business genome · single source of truth{live ? ' · reading live from the database' : ''}
          </p>
          <h2 style={{ margin: '8px 0 0', fontFamily: display, fontSize: 26, color: '#fff' }}>
            The business, written down once
          </h2>
          <p style={{ margin: '10px 0 0', fontSize: 14, color: C.headerSub, maxWidth: 560, lineHeight: 1.55 }}>
            Every fact, written down once. Every surface reads it. Change it once —
            everything stays in sync.
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
        <GenomeBrowser appliedIds={appliedIds} baseFacts={facts} editable={editable && live} />
      </OsScrollReveal>
      <OsScrollReveal delay={0.05}>
        <SurfacesStrip />
      </OsScrollReveal>
    </div>
  );
}
