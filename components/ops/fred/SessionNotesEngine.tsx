'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
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

const pillButton = (filled: boolean): CSSProperties => ({
  fontSize: 12.5,
  fontWeight: filled ? 700 : 600,
  letterSpacing: filled ? '0.04em' : undefined,
  textTransform: filled ? 'uppercase' : undefined,
  padding: filled ? '10px 18px' : '9px 14px',
  borderRadius: 999,
  cursor: 'pointer',
  background: filled ? NAVY : 'transparent',
  color: filled ? '#fff' : NAVY,
  border: filled ? 'none' : `1.5px solid ${NAVY}33`,
});

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

type Transcriber = 'idle' | 'recording' | 'transcribing';

/**
 * The session scribe — record a voice note (or upload one, or paste the
 * transcript) and the agent drafts the client summary, homework, CRM notes,
 * course match, follow-up, and trainer handover. Draft-only.
 */
export function SessionNotesEngine({ initialNote = DEFAULT_NOTE }: { initialNote?: string }) {
  const [note, setNote] = useState(initialNote);
  const [plan, setPlan] = useState<NotesPlan | null>(() => transformSessionNotes(initialNote));
  const [engine, setEngine] = useState<'model' | 'local' | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [voiceState, setVoiceState] = useState<Transcriber>('idle');
  const [notice, setNotice] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function draftPlan(text: string) {
    setDrafting(true);
    setNotice(null);
    try {
      const res = await fetch('/api/customers/auckland-dog-trainer/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: text }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        plan?: NotesPlan;
        engine?: 'model' | 'local';
        error?: string;
      };
      if (j.plan) {
        if (!mountedRef.current) return;
        setPlan(j.plan);
        setEngine(j.engine ?? 'local');
        return;
      }
      if (j.error) setNotice(j.error);
      setPlan(transformSessionNotes(text));
      setEngine('local');
    } catch {
      if (!mountedRef.current) return;
      setPlan(transformSessionNotes(text));
      setEngine('local');
    } finally {
      if (mountedRef.current) setDrafting(false);
    }
  }

  async function transcribe(audio: Blob, fileName: string) {
    setVoiceState('transcribing');
    setNotice(null);
    try {
      const form = new FormData();
      form.append('audio', audio, fileName);
      const res = await fetch('/api/agents/transcribe', { method: 'POST', body: form });
      const j = (await res.json().catch(() => ({}))) as {
        transcript?: string;
        error?: string;
      };
      if (!mountedRef.current) return;
      if (j.transcript) {
        setNote(j.transcript);
        await draftPlan(j.transcript);
      } else if (res.status === 503) {
        // transcription key not configured — keep the message in Fred's world
        setNotice(
          'Voice transcription is coming online shortly — paste or type the note instead and the scribe will still draft the plan.',
        );
      } else {
        setNotice(
          j.error ??
            'Transcription is offline right now — paste or type the note instead and the scribe will still draft the plan.',
        );
      }
    } catch {
      if (mountedRef.current) {
        setNotice('Transcription failed — paste or type the note instead.');
      }
    } finally {
      if (mountedRef.current) setVoiceState('idle');
    }
  }

  async function startRecording() {
    setNotice(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (blob.size > 0) void transcribe(blob, 'session-note.webm');
        else setVoiceState('idle');
      };
      recorderRef.current = recorder;
      recorder.start();
      setVoiceState('recording');
    } catch {
      setNotice('Microphone unavailable — upload a voice memo file or paste the note instead.');
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ ...glass, padding: '18px 18px 16px', borderColor: `${PINK}66` }}>
        <p style={eyebrow}>session scribe · notes → client plan</p>
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
          Finish a session, record or drop a voice note, and the scribe drafts the client summary,
          homework, CRM notes, course match, follow-up, and trainer handover — ready for one yes
          from you.
        </p>

        {/* voice in — record or upload */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16, alignItems: 'center' }}>
          {voiceState === 'recording' ? (
            <button type="button" onClick={stopRecording} style={{ ...pillButton(true), background: '#B54A4A' }}>
              ■ Stop &amp; transcribe
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void startRecording()}
              disabled={voiceState === 'transcribing'}
              style={{ ...pillButton(true), background: PINK_DEEP, opacity: voiceState === 'transcribing' ? 0.6 : 1 }}
            >
              ● Record voice note
            </button>
          )}
          <label style={{ ...pillButton(false), display: 'inline-block' }}>
            <input
              type="file"
              accept="audio/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void transcribe(f, f.name);
                e.target.value = '';
              }}
            />
            Upload voice memo
          </label>
          {voiceState === 'recording' ? (
            <span style={{ fontSize: 12.5, color: '#B54A4A', fontWeight: 600 }}>recording…</span>
          ) : voiceState === 'transcribing' ? (
            <span style={{ fontSize: 12.5, color: MUTED }}>transcribing…</span>
          ) : null}
        </div>

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
            onClick={() => void draftPlan(note)}
            disabled={drafting}
            style={{ ...pillButton(true), cursor: drafting ? 'wait' : 'pointer', opacity: drafting ? 0.7 : 1 }}
          >
            {drafting ? 'Drafting…' : 'Turn notes into a plan'}
          </button>
          <button
            type="button"
            onClick={() => {
              setNote(DEFAULT_NOTE);
              setPlan(transformSessionNotes(DEFAULT_NOTE));
              setEngine(null);
            }}
            style={pillButton(false)}
          >
            Reset Bruno sample
          </button>
          <span style={{ fontSize: 11.5, color: MUTED }}>draft-only · nothing sends without your yes</span>
        </div>
        {notice ? (
          <p style={{ margin: '10px 0 0', fontSize: 12.5, color: PINK_DEEP, lineHeight: 1.5 }}>{notice}</p>
        ) : null}
        {engine ? (
          <p style={{ ...eyebrow, marginTop: 10, color: engine === 'model' ? PINK_DEEP : MUTED }}>
            {engine === 'model'
              ? 'drafted by the scribe agent · live model'
              : 'drafted locally · model key offline — same six outputs'}
          </p>
        ) : null}
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
