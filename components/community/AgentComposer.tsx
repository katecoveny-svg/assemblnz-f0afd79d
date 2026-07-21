'use client';

/**
 * The one-screen public agent builder (/a).
 *
 * Four template cards + start blank, then: name, one sentence, tone chips,
 * an identity remix panel with a live pattern preview, and ONE primary
 * action — "Create my agent" → POST /api/a/create.
 *
 * Gating: on a 402 with capture:true the shared CaptureModal opens
 * (surface 'agent:create'); once the email lifts the limit the create is
 * retried automatically.
 */

import { useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { CaptureModal } from '@/components/gating/CaptureModal';
import { IdentityPattern } from '@/components/community/IdentityPattern';
import {
  COMMUNITY_TEMPLATES,
  DEFAULT_IDENTITY,
  communityTemplateById,
} from '@/lib/community/templates';
import type { AgentTone, PatternIdentity } from '@/lib/pilot/types';

const INK = '#313c42';
const MUTED = '#68766f';
const TEAL = '#3f7373';
const HAIRLINE = 'rgba(49, 60, 66, 0.12)';

const TONES: { id: AgentTone; label: string }[] = [
  { id: 'warm', label: 'Warm' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'formal', label: 'Formal' },
  { id: 'specialist', label: 'Specialist' },
];

export interface ComposerPrefill {
  name: string;
  sentence: string;
  tone: AgentTone;
  identity: PatternIdentity | null;
}

const cardStyle = (active: boolean): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  padding: 0,
  textAlign: 'left',
  borderRadius: 18,
  border: `1px solid ${active ? TEAL : HAIRLINE}`,
  background: '#fff',
  cursor: 'pointer',
  overflow: 'hidden',
  boxShadow: active ? `0 0 0 1px ${TEAL}` : 'none',
});

const fieldLabel: CSSProperties = {
  display: 'block',
  margin: '0 0 8px',
  color: MUTED,
  fontSize: 12,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 14,
  border: `1px solid ${HAIRLINE}`,
  background: '#fff',
  color: INK,
  fontSize: 15,
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

export function AgentComposer({ prefill }: { prefill?: ComposerPrefill | null }) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState<string>('');
  const [name, setName] = useState(prefill?.name ?? '');
  const [sentence, setSentence] = useState(prefill?.sentence ?? '');
  const [tone, setTone] = useState<AgentTone>(prefill?.tone ?? 'warm');
  const [identity, setIdentity] = useState<PatternIdentity>(
    prefill?.identity ?? DEFAULT_IDENTITY,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captureOpen, setCaptureOpen] = useState(false);
  // True when the 402 was the hand-over gate (agent built, email before the
  // link) rather than the daily limit — it swaps in the approved framing.
  const [captureReady, setCaptureReady] = useState(false);

  const pickTemplate = (id: string) => {
    setTemplateId(id);
    const t = communityTemplateById(id);
    if (!t) {
      // Start blank: keep whatever's typed; reset the identity to the default.
      setIdentity(prefill?.identity ?? DEFAULT_IDENTITY);
      return;
    }
    setTone(t.tone);
    setIdentity(t.identity);
    // Seed the sentence when it's empty or still another template's seed.
    setSentence((s) =>
      !s.trim() || COMMUNITY_TEMPLATES.some((x) => x.description === s) ? t.description : s,
    );
  };

  const setId = (patch: Partial<PatternIdentity>) =>
    setIdentity((i) => ({ ...i, ...patch }));

  const create = async () => {
    if (busy) return;
    setError(null);
    if (!name.trim()) {
      setError('Give the agent a name.');
      return;
    }
    if (!sentence.trim()) {
      setError('Say what it should handle.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/a/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: templateId, name, sentence, tone, identity }),
      });
      if (res.status === 402) {
        const data = (await res.json().catch(() => null)) as
          | { capture?: boolean; message?: string; error?: string }
          | null;
        if (data?.capture) {
          setCaptureReady(data.error === 'capture_required');
          setCaptureOpen(true);
        } else {
          setError(data?.message ?? 'Daily limit reached.');
        }
        return;
      }
      const data = (await res.json().catch(() => null)) as
        | { url?: string; message?: string }
        | null;
      if (!res.ok || !data?.url) {
        setError(data?.message ?? 'Could not create the agent — try again.');
        return;
      }
      router.push(data.url);
    } catch {
      setError('Could not create the agent — try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {/* Templates */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 14,
        }}
      >
        {COMMUNITY_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => pickTemplate(t.id)}
            style={cardStyle(templateId === t.id)}
          >
            <div style={{ height: 96, borderBottom: `1px solid ${HAIRLINE}` }}>
              <IdentityPattern identity={t.identity} />
            </div>
            <div style={{ padding: '12px 14px 14px' }}>
              <p style={{ margin: 0, color: INK, fontSize: 14, fontWeight: 700 }}>{t.label}</p>
              <p style={{ margin: '6px 0 0', color: MUTED, fontSize: 12, lineHeight: 1.5 }}>
                {t.description}
              </p>
            </div>
          </button>
        ))}
        <button
          type="button"
          onClick={() => pickTemplate('')}
          style={{
            ...cardStyle(templateId === ''),
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 180,
          }}
        >
          <span style={{ color: MUTED, fontSize: 14, fontWeight: 700 }}>Start blank</span>
        </button>
      </div>

      {/* Builder */}
      <div
        style={{
          marginTop: 28,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
          padding: 'clamp(18px, 3vw, 30px)',
          borderRadius: 22,
          border: `1px solid ${HAIRLINE}`,
          background: '#fbfaf6',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label htmlFor="agent-name" style={fieldLabel}>
              Agent name
            </label>
            <input
              id="agent-name"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              placeholder={communityTemplateById(templateId)?.label ?? 'My agent'}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="agent-sentence" style={fieldLabel}>
              What one job should it prepare?
            </label>
            <textarea
              id="agent-sentence"
              value={sentence}
              maxLength={300}
              rows={3}
              onChange={(e) => setSentence(e.target.value)}
              placeholder="One sentence describing the job and the useful draft you want back."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          <div>
            <span style={fieldLabel}>How should it sound?</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    border: `1px solid ${tone === t.id ? TEAL : HAIRLINE}`,
                    background: tone === t.id ? TEAL : '#fff',
                    color: tone === t.id ? '#fff' : INK,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Identity remix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={fieldLabel}>Visual signature</span>
          <div
            style={{
              height: 150,
              borderRadius: 16,
              border: `1px solid ${HAIRLINE}`,
              overflow: 'hidden',
              background: '#fff',
            }}
          >
            <IdentityPattern identity={identity} interactive />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {(['vortex', 'particles'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setId({ mode: m })}
                style={{
                  padding: '7px 13px',
                  borderRadius: 999,
                  border: `1px solid ${identity.mode === m ? TEAL : HAIRLINE}`,
                  background: identity.mode === m ? TEAL : '#fff',
                  color: identity.mode === m ? '#fff' : INK,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {m}
              </button>
            ))}
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: MUTED, fontSize: 12 }}>
              Colour
              <input
                type="color"
                value={identity.foregroundColor}
                onChange={(e) => setId({ foregroundColor: e.target.value })}
                aria-label="Pattern colour"
                style={{ width: 34, height: 26, border: `1px solid ${HAIRLINE}`, borderRadius: 6, padding: 1, background: '#fff', cursor: 'pointer' }}
              />
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: MUTED, fontSize: 12 }}>
              Accent
              <input
                type="color"
                value={identity.accentColor}
                onChange={(e) => setId({ accentColor: e.target.value })}
                aria-label="Pattern accent colour"
                style={{ width: 34, height: 26, border: `1px solid ${HAIRLINE}`, borderRadius: 6, padding: 1, background: '#fff', cursor: 'pointer' }}
              />
            </label>
          </div>
          <label style={{ color: MUTED, fontSize: 12 }}>
            Movement
            <input
              type="range"
              min={0}
              max={100}
              value={identity.turbulence}
              onChange={(e) => setId({ turbulence: Number(e.target.value) })}
              style={{ width: '100%', accentColor: TEAL }}
            />
          </label>
          <label style={{ color: MUTED, fontSize: 12 }}>
            Density
            <input
              type="range"
              min={20}
              max={400}
              value={identity.count}
              onChange={(e) => setId({ count: Number(e.target.value) })}
              style={{ width: '100%', accentColor: TEAL }}
            />
          </label>
        </div>
      </div>

      {error && (
        <p role="alert" style={{ margin: '16px 0 0', color: '#8a4b3c', fontSize: 13 }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => void create()}
        disabled={busy}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          marginTop: 22,
          padding: '15px 26px',
          borderRadius: 999,
          border: 'none',
          background: INK,
          color: '#fff',
          fontSize: 14,
          fontWeight: 700,
          cursor: busy ? 'default' : 'pointer',
          opacity: busy ? 0.5 : 1,
        }}
      >
        {busy ? 'Building…' : 'Build this trial agent'}
      </button>
      <p style={{ margin: '12px 0 0', color: MUTED, fontSize: 12 }}>
        You get a public page you can share. Every answer stays a draft for a person to check.
      </p>

      <CaptureModal
        open={captureOpen}
        surface="agent:create"
        // approved by Kate 2026-07-17 — hand-over framing (agent already built)
        heading={captureReady ? 'Your agent is ready.' : undefined}
        body={
          captureReady
            ? 'Add your email and we’ll hand over its page — yours to share, free.'
            : undefined
        }
        onClose={() => setCaptureOpen(false)}
        onUnlocked={() => {
          setCaptureOpen(false);
          void create();
        }}
      />
    </div>
  );
}
