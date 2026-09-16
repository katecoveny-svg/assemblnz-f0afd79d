'use client';

import { useState } from 'react';
import type { OutreachGate } from '@/lib/studio/pursuit-journey';
import {
  hasUnlockedOutreach,
  outreachUnlockKey,
  saveOutreachLead,
  unlockOutreach,
} from '@/lib/studio/pursuit-journey';
import styles from './do-maker.module.css';

type EditorProps = {
  outreach: OutreachGate;
  onChange: (next: OutreachGate) => void;
};

export function OutreachGateEditor({ outreach, onChange }: EditorProps) {
  return (
    <section className={styles.panel} aria-labelledby="outreach-title">
      <div className={styles.sectionHead}>
        <span>02d</span>
        <div>
          <strong id="outreach-title">Outreach gate</strong>
          <p>
            Shareable demos can ask for interest / API-access first, then unlock the deeper walkthrough.
          </p>
        </div>
      </div>
      <label className={styles.toggleRow}>
        <input
          type="checkbox"
          checked={outreach.enabled}
          onChange={(event) => onChange({ ...outreach, enabled: event.target.checked })}
        />
        <span>Require interest capture before deeper DEMO</span>
      </label>
      {outreach.enabled ? (
        <div className={styles.fields}>
          <label>
            Gate headline
            <input
              value={outreach.headline}
              onChange={(event) => onChange({ ...outreach, headline: event.target.value })}
              maxLength={120}
            />
          </label>
          <label>
            Gate body
            <textarea
              value={outreach.body}
              onChange={(event) => onChange({ ...outreach, body: event.target.value })}
              maxLength={400}
              rows={3}
            />
          </label>
          <label>
            CTA label
            <input
              value={outreach.ctaLabel}
              onChange={(event) => onChange({ ...outreach, ctaLabel: event.target.value })}
              maxLength={60}
            />
          </label>
          <p className={styles.skinNote}>{outreach.honesty}</p>
        </div>
      ) : null}
    </section>
  );
}

type GateProps = {
  draftId: string;
  outreach: OutreachGate;
  surface?: 'creator-share' | 'playground';
  children: React.ReactNode;
};

export function OutreachGateOverlay({
  draftId,
  outreach,
  surface = 'creator-share',
  children,
}: GateProps) {
  const unlockKey = outreachUnlockKey(draftId);
  const [unlocked, setUnlocked] = useState(() =>
    typeof window !== 'undefined' ? hasUnlockedOutreach(window.localStorage, unlockKey) : false,
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [interest, setInterest] = useState('API access / deeper DEMO');
  const [error, setError] = useState('');

  if (!outreach.enabled || unlocked) {
    return <>{children}</>;
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Add a work email so we know how to follow up.');
      return;
    }
    saveOutreachLead(window.localStorage, {
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      interest: interest.trim() || 'API access',
      surface,
    });
    unlockOutreach(window.localStorage, unlockKey);
    setUnlocked(true);
    setError('');
  };

  return (
    <div className={styles.gateShell}>
      <div className={styles.gateCard}>
        <span className={styles.demoPill}>DEMO</span>
        <h2>{outreach.headline}</h2>
        <p>{outreach.body}</p>
        <form className={styles.fields} onSubmit={submit}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          </label>
          <label>
            Work email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={120}
            />
          </label>
          <label>
            Company
            <input value={company} onChange={(e) => setCompany(e.target.value)} maxLength={80} />
          </label>
          <label>
            What you want
            <input value={interest} onChange={(e) => setInterest(e.target.value)} maxLength={160} />
          </label>
          {error ? <p className={styles.gateError} role="alert">{error}</p> : null}
          <button type="submit" className={styles.primaryAction}>
            {outreach.ctaLabel}
          </button>
        </form>
        <p className={styles.skinNote}>{outreach.honesty}</p>
      </div>
      <div className={styles.gateBlur} aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
