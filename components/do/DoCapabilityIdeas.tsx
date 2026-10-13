'use client';

import Link from 'next/link';
import { ArrowUpRight, Plus } from 'lucide-react';
import { DO_ENTRY_IDEAS } from '@/apps/do/shared/entry-capabilities';
import styles from './do-capability-ideas.module.css';

export function DoCapabilityIdeas({ onChoose, disabled = false }: { onChoose: (prompt: string) => void; disabled?: boolean }) {
  const choices = (items: readonly (typeof DO_ENTRY_IDEAS)[number][]) => items.map(item => <button key={item.id} type="button" disabled={disabled} data-do-idea={item.id} onClick={() => onChoose(item.prompt)} aria-label={`${item.name}: ${item.prompt}`}>
    <span className={styles.copy}><span className={styles.name}>{item.name}</span><strong>{item.prompt}</strong><span className={styles.detail}>{item.detail}</span></span>
    <span className={styles.state}>{item.status}<ArrowUpRight size={17} aria-hidden="true" /></span>
  </button>);
  return <section className={styles.ideas} aria-label="Ideas to get started">
    <h2>Start with something useful</h2>
    <div className={styles.choices}>{choices(DO_ENTRY_IDEAS.slice(0, 3))}</div>
    <details><summary>More ways DO can help <Plus size={16} aria-hidden="true" /></summary><div className={styles.choices}>{choices(DO_ENTRY_IDEAS.slice(3))}</div></details>
    <p>Have a bill ready? <Link href="/do/bills">Review a CSV or invoice</Link>, or <Link href="/do/bills/compare">compare NZ bill options</Link>. These tools open their own review and consent steps.</p>
    <p>These are draft starters, not connected services. Choose one to add to your draft. Nothing is sent, purchased or booked.</p>
  </section>;
}
