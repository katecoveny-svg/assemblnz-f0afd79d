'use client';

import { useState, useTransition, type CSSProperties, type ReactNode } from 'react';
import {
  transformSessionNotes,
  DEFAULT_NOTE,
  type NotesPlan,
} from '@/lib/customers/auckland-dog-trainer/notes-engine';

const NAVY = '#1B2A4A';
const PINK = '#D4A5B0';
const PINK_DEEP = '#B87A8A';
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

function OutputCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div style={{ ...glass, padding: '14px 16px' }}>
      <p style={eyebrow}>{label}</p>
      <div style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.55, color: NAVY, whiteSpace: 'pre-wrap' }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Hero interaction — paste or edit a voice-note transcript, get the six
 * Session Notes → Client Plan outputs. Local/deterministic for the pitch.
 */
export function SessionNotesEngine({ initialNote = DEFAULT_NOTE }: { initialNote?: string }) {
  const [note, setNote] = useState(initialNote);
  const [plan, setPlan] = useState<NotesPlan | null>(() => transformSessionNotes(initialNote));
  const [pending, startTransition] = useTransition();

  function run() {
    startTransition(() => {
      setPlan(transformSessionNotes(note));
    });
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ ...glass, padding: '18px 18px 16px', borderColor: `${PINK}66` }}>
        <p style={eyebrow}>killer feature · session notes → client plan</p>
        <h2
          style={{
            margin: '8px 0 0',
            fontFamily: 'var(--font-brand-display), Georgia, serif',
            fontSize: 26,
            fontWeight: 500,
            color: NAVY,
            lineHeight: 1.2,
          }}
        >
          Record two minutes. Get the week.
        </h2>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: MUTED, lineHeight: 1.5, maxWidth: 520 }}>
          Fred finishes a session, drops a voice note, and assembl drafts the client summary,
          homework, CRM notes, course match, follow-up, and trainer handover — ready for one human yes.
        </p>

        <label htmlFor="fred-voice-note" style={{ ...eyebrow, display: 'block', marginTop: 16 }}>
          voice note transcript
        </label>
        <textarea
          id="fred-voice-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
          style={{
            marginTop: 8,
            width: '100%',
            resize: 'vertical',
            borderRadius: 12,
            border: `1.5px solid ${NAVY}22`,
            background: '#fff',
            padding: '12px 14px',
            fontSize: 14,
            lineHeight: 1.5,
            color: NAVY,
            fontFamily: 'var(--font-brand-body), system-ui, sans-serif',
          }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12, alignItems: 'center' }}>
          <button
            type="button"
            onClick={run}
            disabled={pending}
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '10px 18px',
              borderRadius: 999,
              border: 'none',
              cursor: pending ? 'wait' : 'pointer',
              background: NAVY,
              color: '#fff',
              opacity: pending ? 0.7 : 1,
            }}
          >
            {pending ? 'Drafting…' : 'Turn notes into a plan'}
          </button>
          <button
            type="button"
            onClick={() => {
              setNote(DEFAULT_NOTE);
              setPlan(transformSessionNotes(DEFAULT_NOTE));
            }}
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              padding: '9px 14px',
              borderRadius: 999,
              cursor: 'pointer',
              background: 'transparent',
              color: NAVY,
              border: `1.5px solid ${NAVY}33`,
            }}
          >
            Reset Bruno sample
          </button>
          <span style={{ fontSize: 11.5, color: MUTED }}>demo transform · draft-only · nothing sends</span>
        </div>
      </div>

      {plan ? (
        <div
          style={{
            display: 'grid',
            gap: 10,
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          }}
        >
          <OutputCard label="client summary">
            {plan.clientSummary}
          </OutputCard>
          <OutputCard label="dog profile · CRM">
            <strong>{plan.dogProfile.name}</strong>
            {' · '}
            {plan.dogProfile.age}
            {' · '}
            {plan.dogProfile.breed}
            {'\n'}
            Issues: {plan.dogProfile.issues.join(', ')}
          </OutputCard>
          <OutputCard label="weekly homework">
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {plan.weeklyHomework.map((h) => (
                <li key={h} style={{ marginBottom: 6 }}>
                  {h}
                </li>
              ))}
            </ol>
          </OutputCard>
          <OutputCard label="risk notes">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {plan.riskNotes.map((r) => (
                <li key={r} style={{ marginBottom: 6 }}>
                  {r}
                </li>
              ))}
            </ul>
          </OutputCard>
          <OutputCard label="course match">
            <strong style={{ color: PINK_DEEP }}>{plan.courseMatch.module}</strong>
            {'\n'}
            {plan.courseMatch.reason}
          </OutputCard>
          <OutputCard label="next booking prompt">
            <strong>{plan.nextBooking.offer}</strong>
            {'\n'}
            {plan.nextBooking.reason}
          </OutputCard>
          <OutputCard label="trainer handover">
            {plan.trainerHandover}
          </OutputCard>
          <OutputCard label="follow-up · content">
            <strong>{plan.followUp.when}</strong>
            {'\n'}
            {plan.followUp.message}
            {'\n\n'}
            <span style={{ color: GOLD }}>Content idea · </span>
            {plan.contentIdea}
          </OutputCard>
        </div>
      ) : null}
    </section>
  );
}
