'use client';

import { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { throwItInAction } from '@/app/customers/family/ops/actions';
import { InkMic } from '@/app/customers/family/ops/visuals/ink';

/**
 * "Throw it in" — the persistent drop box at the top of Family OS. Any family
 * member can drop a note from any device — typed or spoken. It routes to the
 * right tab and lands as a proposed item, attributed to whoever dropped it.
 * Draft-only: Kate approves. Voice records in the browser and transcribes via
 * the app's approved en-NZ transcription (no new third-party provider).
 */

const INK = '#1A1918';
const MUTED = '#8A8272';
const GOLD = '#BFA37A';
const CORAL = '#E08A6B';
const SAGE = '#7A8B6F';

const FAMILY = ['Kate', 'Jack', 'Mila', 'Dad'];

function DropButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} style={{
      fontSize: 12.5, fontWeight: 600, color: '#fff', border: 'none', borderRadius: 999,
      padding: '9px 16px', cursor: pending ? 'wait' : 'pointer',
      background: `linear-gradient(180deg, #e79a82, ${CORAL})`, opacity: pending ? 0.8 : 1, whiteSpace: 'nowrap',
    }}>{pending ? 'adding…' : 'throw it in'}</button>
  );
}

export function ThrowItIn() {
  const [from, setFrom] = useState('Kate');
  const [text, setText] = useState('');
  const [channel, setChannel] = useState<'text' | 'voice'>('text');
  const [rec, setRec] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  // A brief inline confirmation after submit — so Kate SEES her drop landed
  // instead of the form silently clearing. Server action still owns the save;
  // this is UX truth-in-the-moment. Auto-clears after ~4s.
  const [landed, setLanded] = useState<{ text: string; from: string } | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function toggleRecord() {
    if (rec) { mediaRef.current?.stop(); return; }
    setNote(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRec(false);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (!blob.size) return;
        setNote('transcribing…');
        try {
          const fd = new FormData();
          fd.append('audio', blob, 'drop.webm');
          const res = await fetch('/api/agents/transcribe', { method: 'POST', body: fd });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.transcript) {
            setText((t) => (t ? `${t} ${data.transcript}` : data.transcript));
            setChannel('voice');
            setNote(null);
          } else {
            setNote(data.error || 'Voice is coming online — type it for now.');
          }
        } catch {
          setNote('Could not transcribe — type it for now.');
        }
      };
      mediaRef.current = mr;
      mr.start();
      setRec(true);
    } catch {
      setNote('Mic permission needed — or just type it.');
    }
  }

  return (
    <form action={throwItInAction} onSubmit={() => {
      // Snapshot what Kate just dropped so the confirmation reads back the real
      // words she typed — not a generic "sent". Clear the input on the next
      // tick so React's controlled input plays nicely with the server action.
      if (text.trim()) {
        const snapshot = { text: text.trim(), from };
        setLanded(snapshot);
        window.setTimeout(() => {
          setLanded((cur) => (cur === snapshot ? null : cur));
        }, 4500);
      }
      setTimeout(() => { setText(''); setChannel('text'); }, 0);
    }}
      style={{ borderRadius: 16, border: `1px solid ${GOLD}44`, background: 'linear-gradient(180deg,#ffffff,#fffdf9)', padding: '10px 12px', boxShadow: '0 8px 24px rgba(154,123,58,0.08)' }}>
      <input type="hidden" name="from" value={from} />
      <input type="hidden" name="channel" value={channel} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED }}>throw it in</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {FAMILY.map((p) => (
            <button key={p} type="button" onClick={() => setFrom(p)} style={{
              fontSize: 11, fontWeight: 600, borderRadius: 999, padding: '3px 9px', cursor: 'pointer',
              border: `1px solid ${from === p ? CORAL : GOLD}55`, color: from === p ? '#fff' : INK,
              background: from === p ? CORAL : 'transparent',
            }}>{p}</button>
          ))}
        </div>
        <input
          name="text" value={text} onChange={(e) => { setText(e.target.value); setChannel('text'); }}
          placeholder="“Mila’s netball moved to Saturday 10am” · anyone, any device"
          style={{ flex: 1, minWidth: 180, fontSize: 13, color: INK, border: 'none', outline: 'none', background: 'transparent', padding: '6px 2px' }} />
        <button type="button" onClick={toggleRecord} aria-label={rec ? 'stop recording' : 'record a voice note'} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
          borderRadius: 999, padding: '6px 10px', border: `1px solid ${rec ? CORAL : GOLD}66`,
          color: rec ? '#fff' : INK, background: rec ? CORAL : 'transparent',
        }}>
          <InkMic size={15} /> {rec ? 'stop' : 'speak'}
        </button>
        <DropButton />
      </div>
      <div style={{ fontSize: 10.5, color: landed ? SAGE : note ? CORAL : MUTED, marginTop: 6 }} aria-live="polite">
        {landed
          ? <><strong style={{ color: SAGE }}>landed</strong> — “{landed.text}” routed to the right tab · waiting for <strong style={{ color: SAGE }}>Kate</strong> in Approvals</>
          : note ?? <>routes to the right tab · lands for <strong style={{ color: SAGE }}>Kate</strong> to approve · nothing sent</>}
      </div>
    </form>
  );
}
