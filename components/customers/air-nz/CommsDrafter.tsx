'use client';

import { useState } from 'react';
import styles from '@/app/customers/air-nz/ops/ops.module.css';
import { COMMS_TEMPLATES } from '@/lib/customers/air-nz/ops-data';

export function CommsDrafter() {
  const [active, setActive] = useState(COMMS_TEMPLATES[0].id);
  const [copied, setCopied] = useState(false);
  const tpl = COMMS_TEMPLATES.find((t) => t.id === active) ?? COMMS_TEMPLATES[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tpl.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <div className={styles.tabs}>
        {COMMS_TEMPLATES.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${active === t.id ? styles.on : ''}`}
            onClick={() => setActive(t.id)}
          >
            {t.kind}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <div className={styles.cardTitle}>{tpl.title}</div>
            <div className={styles.ledgerNote}>For: {tpl.audience}</div>
          </div>
          <button className={`${styles.btn} ${copied ? styles.btnTeal : styles.btnGhost}`} onClick={copy}>
            {copied ? 'Copied ✓' : 'Copy draft'}
          </button>
        </div>
        <div className={styles.commsBody}>{tpl.body}</div>
        <p className={styles.muted} style={{ marginTop: 10 }}>
          Draft only — a starting point for the account manager. No figures leave
          the aggregate layer; edit before sending.
        </p>
      </div>
    </>
  );
}
