'use client';

import Link from 'next/link';
import { ArrowUpRight, Plus, NotebookPen, CalendarDays } from 'lucide-react';
import { DO_ENTRY_IDEAS } from '@/apps/do/shared/entry-capabilities';
import styles from './do-capability-ideas.module.css';

export function DoCapabilityIdeas({ onChoose, disabled = false }: { onChoose: (prompt: string) => void; disabled?: boolean }) {
  const choices = (items: readonly (typeof DO_ENTRY_IDEAS)[number][]) => items.map(item => <button key={item.id} type="button" disabled={disabled} data-do-idea={item.id} onClick={() => onChoose(item.prompt)} aria-label={`${item.name}: ${item.prompt}`}>
    <span className={styles.copy}><span className={styles.name}>{item.name}</span><strong>{item.prompt}</strong><span className={styles.detail}>{item.detail}</span></span>
    <span className={styles.state}>{item.status}<ArrowUpRight size={17} aria-hidden="true" /></span>
  </button>);
  return <section className={styles.ideas} aria-label="Ideas to get started">
    <h2>Start with something useful</h2>
    <div className={styles.outcomes} aria-label="Open a working tool">
      <Link target="_blank" rel="noopener noreferrer" href="/do/shop"><span className={styles.mealPhoto} aria-hidden="true" /><strong>Plan the shop</strong><span>Dinners → pantry → aisle checklist</span><small>Working planning · no cart connection</small><b>Open Shopper DO ↗</b></Link>
      <Link target="_blank" rel="noopener noreferrer" href="/do/messages"><NotebookPen size={28} aria-hidden="true" /><strong>Prepare a reply</strong><span>Your notes → an editable message</span><small>Review before sharing</small><b>Open messages ↗</b></Link>
      <Link target="_blank" rel="noopener noreferrer" href="/do/travel"><CalendarDays size={28} aria-hidden="true" /><strong>Organise a trip</strong><span>Dates → plans → packing list</span><small>Planning · no bookings</small><b>Open Travel DO ↗</b></Link>
    </div>
    <details><summary>Draft something else <Plus size={16} aria-hidden="true" /></summary>
    <div className={styles.choices}>{choices(DO_ENTRY_IDEAS.slice(0, 3))}</div>
    <details><summary>More ways DO can help <Plus size={16} aria-hidden="true" /></summary><div className={styles.choices}>{choices(DO_ENTRY_IDEAS.slice(3))}</div></details>
    </details>
    <p>Have a bill ready? <Link target="_blank" rel="noopener noreferrer" href="/do/bills">Review a CSV or invoice</Link>, or <Link target="_blank" rel="noopener noreferrer" href="/do/bills/compare">compare NZ bill options</Link>. These tools open their own review and consent steps.</p>
    <p>Draft starters add text to your current draft. Tools open their own review steps. Nothing is sent, purchased or booked.</p>
  </section>;
}
