'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Download, Loader2, RotateCcw, Share2 } from 'lucide-react';
import { renderAgentCard } from '@/lib/home-intake/agent-card';
import styles from './one-minute-business.module.css';

/**
 * The homepage front-door agent. The visitor describes their REAL business in
 * their own words; the general analyst reads it and prepares a genuinely
 * useful first answer, which they can download or share as an assembl-branded
 * card, or make their own (name + look). Every submission emails Kate a lead.
 */

type Phase = 'ready' | 'thinking' | 'answered' | 'named';

const DEFAULT_NAME = 'your assembl agent';
const DEFAULT_ROLE = 'business analyst';

const LOOKS: Array<{ id: string; label: string; from: string; to: string }> = [
  { id: 'sea', label: 'Sea glass', from: '#86aaa3', to: '#2d3d3a' },
  { id: 'brass', label: 'Brass', from: '#d8c184', to: '#8a6a2f' },
  { id: 'ink', label: 'Ink', from: '#5a6b76', to: '#182226' },
  { id: 'coral', label: 'Coral', from: '#e0a58c', to: '#7d3f2f' },
];

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function HeroIntakeAgent({ seedBusiness }: { seedBusiness?: string }) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [business, setBusiness] = useState('');
  const [answer, setAnswer] = useState('');
  const [agentName, setAgentName] = useState(DEFAULT_NAME);
  const [role, setRole] = useState(DEFAULT_ROLE);
  const [name, setName] = useState('');
  const [look, setLook] = useState(LOOKS[0]);
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep in sync with the left-column description until they type their own.
  const touched = useRef(false);
  useEffect(() => {
    if (!touched.current && phase === 'ready' && typeof seedBusiness === 'string') {
      setBusiness(seedBusiness);
    }
  }, [seedBusiness, phase]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [phase, answer]);

  async function ask() {
    const text = business.trim();
    if (text.length < 12) return;
    setPhase('thinking');
    setAnswer('');
    try {
      const res = await fetch('/api/home-intake', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ business: text }),
      });
      const data = await res.json();
      if (data?.answer) {
        setAgentName(data.agentName ?? DEFAULT_NAME);
        setRole(data.role ?? DEFAULT_ROLE);
        setAnswer(data.answer);
        setPhase('answered');
      } else {
        setAnswer(data?.error ?? 'Our chat is taking a short break. Email hello@assembl.co.nz.');
        setPhase('answered');
      }
    } catch {
      setAnswer('Our chat is taking a short break. Email hello@assembl.co.nz.');
      setPhase('answered');
    }
  }

  const shownName = name.trim() || agentName;
  const initial = (name.trim() ? name.trim() : 'assembl').replace(/^the /i, '').charAt(0).toUpperCase();

  async function makeCard(): Promise<Blob | null> {
    return renderAgentCard({ agentName: shownName, role, business: business.trim(), answer });
  }

  async function downloadCard() {
    setBusy(true);
    try {
      const blob = await makeCard();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${shownName.replace(/\s+/g, '-').toLowerCase()}-assembl.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  async function shareCard() {
    setBusy(true);
    try {
      const blob = await makeCard();
      if (!blob) return;
      const file = new File([blob], 'assembl-agent.png', { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: 'My assembl agent', text: 'A first agent for my business, from assembl.' });
      } else {
        // No file-share support — fall back to a download.
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'assembl-agent.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      /* user dismissed the share sheet — no-op */
    } finally {
      setBusy(false);
    }
  }

  async function saveLead(e: React.FormEvent) {
    e.preventDefault();
    const addr = email.trim();
    if (!EMAIL_RE.test(addr)) return;
    setSending(true);
    try {
      await fetch('/api/home-intake', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ leadOnly: true, business: business.trim(), email: addr, agentName: shownName, answer }),
      });
      setSaved(true);
    } catch {
      setSaved(true);
    } finally {
      setSending(false);
    }
  }

  function restart() {
    setPhase('ready');
    setAnswer('');
    setName('');
    setEmail('');
    setSaved(false);
  }

  return (
    <div className={styles.agentPanel}>
      <div className={styles.agentTopline}>
        <span>live agent · draft only</span>
        <span>your business</span>
      </div>

      <div className={styles.agentBody} ref={scrollRef}>
        <div className={styles.agentHead}>
          <span className={styles.agentMark} style={{ background: `linear-gradient(150deg, ${look.from}, ${look.to})` }} aria-hidden>{initial}</span>
          <div>
            <strong>{shownName}</strong>
            <em>{role}</em>
          </div>
        </div>

        {phase === 'ready' ? (
          <div className={styles.agentIntro}>
            <p>Tell me about your business — what you do, who you serve, and the admin that eats your week. I’ll show you the first agent I’d build.</p>
          </div>
        ) : null}

        {phase !== 'ready' ? (
          <div className={styles.agentBubbleUser}>{business.trim()}</div>
        ) : null}

        {phase === 'thinking' ? (
          <div className={styles.agentBubbleThinking}><Loader2 aria-hidden className={styles.spin} /> reading your business…</div>
        ) : null}

        {answer ? (
          <div className={styles.agentBubbleAgent}>
            {answer.split('\n').filter(Boolean).map((line, i) => <p key={i}>{line}</p>)}
            <span className={styles.agentProvenance}><Check aria-hidden /> draft · you approve before anything happens</span>
          </div>
        ) : null}

        {phase === 'named' ? (
          <div className={styles.agentCard} style={{ borderColor: look.to }}>
            <span className={styles.agentCardMark} style={{ background: `linear-gradient(150deg, ${look.from}, ${look.to})` }} aria-hidden>{initial}</span>
            <strong>{shownName}</strong>
            <em>{role}</em>
            <span className={styles.agentCardBrand}>made with assembl</span>
          </div>
        ) : null}
      </div>

      {phase === 'ready' ? (
        <form className={styles.agentTextRow} onSubmit={(e) => { e.preventDefault(); ask(); }}>
          <textarea
            value={business}
            onChange={(e) => { touched.current = true; setBusiness(e.target.value); }}
            placeholder="e.g. I run a small architecture practice in Auckland. We lose hours qualifying enquiries and writing client updates…"
            rows={3}
            aria-label="Describe your business"
          />
          <button type="submit" className={styles.agentPrimary} disabled={business.trim().length < 12}>
            show me the first agent <ArrowRight aria-hidden />
          </button>
        </form>
      ) : null}

      {phase === 'answered' ? (
        <div className={styles.agentAfter}>
          <button type="button" className={styles.agentPrimary} onClick={() => setPhase('named')}>make it yours <ArrowRight aria-hidden /></button>
          <button type="button" className={styles.agentGhost} onClick={downloadCard} disabled={busy}><Download aria-hidden /> download</button>
          <button type="button" className={styles.agentGhost} onClick={shareCard} disabled={busy}><Share2 aria-hidden /> share</button>
          <button type="button" className={styles.agentGhost} onClick={restart}><RotateCcw aria-hidden /> again</button>
        </div>
      ) : null}

      {phase === 'named' ? (
        <div className={styles.agentNameStep}>
          <label>
            <span>name your agent</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={agentName} maxLength={28} />
          </label>
          <div className={styles.agentLooks} role="group" aria-label="Pick a look">
            {LOOKS.map((l) => (
              <button key={l.id} type="button" aria-pressed={look.id === l.id} aria-label={l.label} onClick={() => setLook(l)} style={{ background: `linear-gradient(150deg, ${l.from}, ${l.to})` }} />
            ))}
          </div>
          {saved ? (
            <p className={styles.agentSaved}><Check aria-hidden /> On its way — we’ll be in touch about building {shownName} for real.</p>
          ) : (
            <form className={styles.agentEmailRow} onSubmit={saveLead}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email to keep it (optional)" aria-label="Your email" />
              <button type="submit" disabled={sending || !EMAIL_RE.test(email.trim())}>{sending ? '…' : 'send'}</button>
            </form>
          )}
          <div className={styles.agentAfter}>
            <button type="button" className={styles.agentGhost} onClick={downloadCard} disabled={busy}><Download aria-hidden /> download</button>
            <button type="button" className={styles.agentGhost} onClick={shareCard} disabled={busy}><Share2 aria-hidden /> share</button>
            <Link href="/studio/build" className={styles.agentGhost}>build it for real <ArrowRight aria-hidden /></Link>
          </div>
          {saved ? null : <small className={styles.agentFoot}>No sign-up. Nothing is published without you.</small>}
        </div>
      ) : null}
    </div>
  );
}
