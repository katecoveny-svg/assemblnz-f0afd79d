"use client";

import { useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { lifeAdminLane, type LifeAdminPlan } from '@/apps/do/personal/life-admin/engine';
import { ArrowUpRight, Check, EyeOff, Plus } from 'lucide-react';
import styles from './TodayTasks.module.css';
import { DoMiniatureList } from '@/components/do/DoMiniatureList';

export type PersonalTaskIntent = { id: string; title: string; detail: string; href?: string; action?: string };
type Props = {
  /** Actual open checklists. Nothing here is read from an inbox or calendar. */
  plans?: LifeAdminPlan[]; savedControls?: ReactNode; onOpenPlan?: (plan: LifeAdminPlan) => void; disabled?: boolean;
  today: number; needsYou: number; done: number;
  onReview: () => void; onWrite: (intent?: PersonalTaskIntent) => void;
};

export function TodayTasks({ plans = [], savedControls, onOpenPlan, disabled = false, today, needsYou, done, onReview, onWrite }: Props) {
  // Empty on the server, the visitor's own date in the browser, so time zones never disagree at hydration.
  const date = useSyncExternalStore(noSubscription, todayLabel, noDate);
  const total = today + needsYou + done;
  return <section className={styles.home} aria-labelledby="personal-today-heading">
    <header className={styles.heading}>
      <h2 id="personal-today-heading" tabIndex={-1}>Today</h2>
      <span className={styles.date} aria-hidden={!date}>{date}</span>
    </header>

    {!total && <DoMiniatureList disabled={disabled} onChoose={onWrite} />}
    <div className={styles.todayWrap}><div className={styles.today} data-empty={!total || undefined}>
      <div className={styles.sheet}>
        <h3>{total ? `${needsYou} ${needsYou === 1 ? 'thing needs' : 'things need'} you` : 'Your own list'}</h3>
        {total ? <>
          {plans.length > 0 && <ul className={styles.rows} aria-label="Your task list">
            {plans.map((plan, index) => {
              const next = plan.tasks.find(task => task.status !== 'done' && task.status !== 'cancelled');
              const lane = lifeAdminLane(plan);
              return <li key={plan.id} style={{ '--i': Math.min(index, 6) } as CSSProperties}>
                <button type="button" className={styles.row} data-lane={lane} disabled={disabled} onClick={() => onOpenPlan?.(plan)} aria-label={`Review ${plan.title}`}>
                  <span className={styles.tick} aria-hidden="true">{!next && <Check size={14} strokeWidth={3} />}</span>
                  <span className={styles.rowCopy}><span className={styles.rowTitle}>{plan.title}</span><span className={styles.rowNext}>{next ? next.title : 'Handled or cancelled by you'}</span><small>{plan.category === 'pets' ? 'Session-only Pet routine' : 'Open checklist · review before acting'}</small></span>
                  <Steps done={plan.tasks.filter(task => task.status === 'done').length} total={plan.tasks.length} />
                </button>
              </li>;
            })}
          </ul>}
          <button type="button" className={styles.primary} onClick={onReview}>Review my tasks<ArrowUpRight size={17} aria-hidden="true" /></button>
        </> : <>
          <ul className={styles.rows} aria-label="Your list">
            <li style={{ '--i': 0 } as CSSProperties}><button type="button" className={`${styles.row} ${styles.addRow}`} onClick={() => onWrite()}><span className={styles.tick} aria-hidden="true"><Plus size={15} strokeWidth={2.5} /></span><span className={styles.rowTitle}>Start with a note</span><ArrowUpRight className={styles.rowArrow} size={17} aria-hidden="true" /></button></li>

          </ul>
        </>}
        <small className={styles.nothingRead}><EyeOff size={13} aria-hidden="true" />Inbox and calendar not read</small>
      </div>
      {total > 0 && <Ring needsYou={needsYou} today={today} done={done} />}
    </div></div>
    {savedControls && <div className={styles.saved}>{savedControls}</div>}

    {total > 0 && <DoMiniatureList disabled={disabled} onChoose={onWrite} />}
    <footer className={styles.review}><Check size={17} aria-hidden="true" /><p><strong>Your say, before the next step.</strong> A draft is never a booking or purchase.</p></footer>
  </section>;
}

const noSubscription = () => () => {};
const noDate = () => '';
const todayLabel = () => new Intl.DateTimeFormat('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date());

/** Progress as a row of small steps, so a checklist reads at a glance. */
function Steps({ done, total }: { done: number; total: number }) {
  const shown = Math.min(total, 6);
  const filled = total ? Math.round((done / total) * shown) : 0;
  return <span className={styles.steps} role="img" aria-label={`${done} of ${total} steps recorded complete`}>
    {Array.from({ length: shown }, (_, index) => <i key={index} data-on={index < filled || undefined} />)}
  </span>;
}

/** One ring, three lanes. Segments only ever reflect checklists open on this page. */
function Ring({ needsYou, today, done }: { needsYou: number; today: number; done: number }) {
  const total = needsYou + today + done;
  const r = 42; const c = 2 * Math.PI * r; const gap = total > 1 ? 4 : 0;
  let start = 0;
  const segments = ([['needs-you', needsYou], ['today', today], ['done', done]] as const).filter(([, n]) => n).map(([lane, n]) => {
    const length = (n / total) * c; const segment = { lane, dash: Math.max(length - gap, 1), offset: -start };
    start += length; return segment;
  });
  return <figure className={styles.ring} data-empty={!total || undefined} aria-label={total ? `${needsYou} need you, ${today} ready today, ${done} handled or cancelled by you` : 'No checklists yet'} role="img">
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <circle className={styles.track} cx="50" cy="50" r={r} />
      {segments.map(({ lane, dash, offset }, index) => <circle key={lane} className={styles.segment} data-lane={lane} cx="50" cy="50" r={r} strokeDasharray={`${dash} ${c}`} strokeDashoffset={offset} style={{ '--i': index, '--len': dash } as CSSProperties} />)}
    </svg>
    <span className={styles.ringCount} aria-hidden="true">{total ? <><b>{done}</b><i>/{total}</i></> : <Check size={26} strokeWidth={2.5} />}</span>
    {total > 0 && <span className={styles.legend} aria-hidden="true">{([['needs-you', needsYou, 'need you'], ['today', today, 'today'], ['done', done, 'handled']] as const).filter(([, n]) => n).map(([lane, n, label]) => <span key={lane}><i data-lane={lane} />{n} {label}</span>)}</span>}
  </figure>;
}
