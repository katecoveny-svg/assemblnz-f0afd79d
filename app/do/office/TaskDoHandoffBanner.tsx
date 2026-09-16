'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import type { AgentSpec } from '@/apps/do/shared/types';
import { TASK_DO_HANDOFF_KEY } from '@/lib/studio/task-do-maker';
import styles from './office.module.css';

type Handoff = {
  version: 1;
  savedAt: string;
  brand?: { displayName?: string };
  spec: AgentSpec;
};

function readHandoff(): Handoff | null {
  try {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    if (params.get('from') !== 'task-do-maker') return null;
    const raw = sessionStorage.getItem(TASK_DO_HANDOFF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Handoff;
    if (parsed?.version !== 1 || !parsed.spec?.id || !parsed.spec?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

function subscribe() {
  return () => undefined;
}

/**
 * Honest intake for Task DO Maker → Office.
 * Session handoff only — does not invent durable cloud save.
 */
export function TaskDoHandoffBanner() {
  const handoff = useSyncExternalStore(subscribe, readHandoff, () => null);
  if (!handoff) return null;

  const brand = handoff.brand?.displayName || 'partner';
  return (
    <section className={styles.column} aria-labelledby="task-do-handoff">
      <header className={styles.columnHeader}>
        <div>
          <h2 id="task-do-handoff">Task DO handoff</h2>
          <p>From Assembl Studio · session draft only</p>
        </div>
        <span>1</span>
      </header>
      <div className={styles.cardStack}>
        <article className={styles.card}>
          <div className={styles.cardTop}>
            <div className={styles.identity}>
              <div className={styles.avatar} aria-hidden>TD</div>
              <div>
                <h3>{handoff.spec.name}</h3>
                <p>{brand} · {handoff.spec.primitive}</p>
              </div>
            </div>
            <span className={styles.state} data-state="needs_you">needs you</span>
          </div>
          <p className={styles.task}>{handoff.spec.brief}</p>
          <p className={styles.note}>
            This AgentSpec arrived from the Task DO Maker in this browser session.
            It is not yet a durable Office row — export the JSON from the maker, or keep building with Builder DO once signed in.
          </p>
          <div className={styles.cardFooter}>
            <span>parked {new Date(handoff.savedAt).toLocaleString('en-NZ', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            <Link href="/studio/do-maker">reopen maker</Link>
          </div>
        </article>
      </div>
    </section>
  );
}
