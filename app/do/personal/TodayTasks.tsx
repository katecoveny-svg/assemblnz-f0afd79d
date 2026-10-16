"use client";

import { useState, useSyncExternalStore, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, EyeOff, Plus } from 'lucide-react';
import styles from './TodayTasks.module.css';
import { TaskArt } from './TaskArt';

/**
 * Entry points describe shipped capability, never infer a connection from sign-in.
 * `state` drives the visual status mark: ready (works here), draft (DO prepares a request only),
 * account (needs a verified connection first). The words in `status` stay the honest label.
 */
export const PERSONAL_TASKS = [
  { id: 'briefing', title: 'Inbox & my day', subtitle: 'Make room for what matters.', status: 'Account check required', state: 'account',
    detail: 'Choose an account in mail review. Reading needs a verified connection and your permission. A combined email and calendar briefing is not available yet.', action: 'Open mail review', href: '/do/mail' },
  { id: 'travel', title: 'Flights & stays', subtitle: 'Flights, stays and time away.', status: 'Live search unavailable', state: 'draft',
    detail: 'Use the current travel workspace to organise a trip and estimates you enter. Live flight and room availability, quotes and booking are not connected.', action: 'Open travel workspace', href: '/do/travel' },
  { id: 'dinner', title: 'A table for us', subtitle: 'The place. The people. The occasion.', status: 'Booking unavailable', state: 'draft',
    detail: 'Write what you have in mind and prepare a request. DO cannot check restaurant availability or reserve a table here.', action: 'Write a dinner request' },
  { id: 'appointments', title: 'Appointments', subtitle: 'Appointments and everyday services.', status: 'Availability unavailable', state: 'draft',
    detail: 'Prepare questions or a request for a doctor, physio, beauty or other service. DO cannot check appointment times or book a service here. Share only the details needed for the request.', action: 'Write a service request' },
  { id: 'shopping', title: 'Clothes & gifts', subtitle: 'Clothes, gifts and things you need.', status: 'Store connection needed', state: 'account',
    detail: 'Write your requirements or compare details you supply. Live clothes and general shopping catalogues, stock, checkout and purchasing are not connected.', action: 'Write a shopping request' },
  { id: 'meals', title: 'Dinner at home', subtitle: 'Start with what is in the pantry.', status: 'Meal planning available', state: 'ready',
    detail: 'Build a meal plan and shopping list in Shopper. Its examples use fictional prices. Live stock, retailer carts and checkout are not connected.', action: 'Open meal planner', href: '/do/shop' },
] as const;

export type PersonalTaskIntent = { id: string; title: string; detail: string };
export type TodayPreview = { id: string; title: string; lane: 'today' | 'needs-you' | 'done'; done: number; total: number };

type Props = {
  today: number; needsYou: number; done: number;
  /** Actual local checklists, most urgent first. Titles only; nothing here is read from an inbox or calendar. */
  preview?: TodayPreview[];
  onReview: () => void; onOpen?: (id: string) => void; onWrite: (intent?: PersonalTaskIntent) => void;
};

export function TodayTasks({ today, needsYou, done, preview = [], onReview, onOpen, onWrite }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  // Empty on the server, the visitor's own date in the browser, so time zones never disagree at hydration.
  const date = useSyncExternalStore(noSubscription, todayLabel, noDate);
  const total = today + needsYou + done;
  const rows = preview.slice(0, 3);
  return <section className={styles.home} aria-labelledby="personal-today-heading">
    <header className={styles.heading}>
      <h2 id="personal-today-heading" tabIndex={-1}>Today</h2>
      <span className={styles.date} aria-hidden={!date}>{date}</span>
    </header>

    <div className={styles.todayWrap}><div className={styles.today} data-empty={!total || undefined}>
      <div className={styles.sheet}>
        <h3>{total ? `${needsYou} ${needsYou === 1 ? 'thing needs' : 'things need'} you` : 'What shall we take care of?'}</h3>
        {total ? <>
          <ul className={styles.rows} aria-label="On your list">
            {rows.length ? rows.map((row, index) => <li key={row.id} style={{ '--i': index } as CSSProperties}>
              <button type="button" className={styles.row} data-lane={row.lane} onClick={() => onOpen ? onOpen(row.id) : onReview()}>
                <span className={styles.tick} aria-hidden="true">{row.lane === 'done' && <Check size={14} strokeWidth={3} />}</span>
                <span className={styles.rowTitle}>{row.title}</span>
                <Steps done={row.done} total={row.total} />
              </button>
            </li>) : ([['needs-you', needsYou, 'need you'], ['today', today, 'ready today'], ['done', done, 'done by you']] as const).filter(([, count]) => count).map(([lane, count, label], index) => <li key={lane} style={{ '--i': index } as CSSProperties}>
              <span className={styles.row} data-lane={lane}><span className={styles.tick} aria-hidden="true">{lane === 'done' && <Check size={14} strokeWidth={3} />}</span><span className={styles.rowTitle}>{count} {label}</span></span>
            </li>)}
          </ul>
          <button type="button" className={styles.primary} onClick={onReview}>Review my tasks<ArrowUpRight size={17} aria-hidden="true" /></button>
        </> : <>
          <ul className={styles.rows} aria-label="Your list">
            <li style={{ '--i': 0 } as CSSProperties}><button type="button" className={`${styles.row} ${styles.addRow}`} onClick={() => onWrite()}><span className={styles.tick} aria-hidden="true"><Plus size={15} strokeWidth={2.5} /></span><span className={styles.rowTitle}>Start with a note</span><ArrowUpRight className={styles.rowArrow} size={17} aria-hidden="true" /></button></li>
            {[0.72, 0.5, 0.62].map((width, index) => <li key={width} aria-hidden="true" className={styles.ghost} style={{ '--i': index + 1, '--w': width } as CSSProperties}><span className={styles.tick} /><i /></li>)}
          </ul>
        </>}
        <small className={styles.nothingRead}><EyeOff size={13} aria-hidden="true" />Inbox and calendar not read</small>
      </div>
      <Ring needsYou={needsYou} today={today} done={done} />
    </div></div>

    <h3 className={styles.sectionHeading}>What would make life easier?</h3>
    <div className={styles.tasks}>
      {PERSONAL_TASKS.map(({ id, title, subtitle, status, state, detail, action, ...destination }, index) => <article key={id} className={styles.task} data-task={id} data-state={state} data-expanded={open === id} style={{ '--i': index } as CSSProperties}>
        <button type="button" className={styles.taskButton} aria-expanded={open === id} aria-controls={`task-detail-${id}`} onClick={() => setOpen(open === id ? null : id)}>
          <span className={styles.stage} aria-hidden="true"><i className={styles.pieceA} /><i className={styles.pieceB} /><TaskArt kind={id} className={styles.art} /></span>
          <span className={styles.taskCopy}><strong>{title}</strong><small className={styles.status}><i aria-hidden="true" />{status}</small></span>
          <span className={styles.plus} aria-hidden="true"><Plus size={18} strokeWidth={2.25} /></span>
        </button>
        <div id={`task-detail-${id}`} className={styles.detail} hidden={open !== id}>
          <p className={styles.lead}>{subtitle}</p>
          <p>{detail}</p>
          {'href' in destination ? <Link prefetch={false} href={destination.href}>{action}<ArrowUpRight size={16} aria-hidden="true" /></Link> : <button type="button" onClick={() => onWrite({ id, title, detail })}>{action}<ArrowUpRight size={16} aria-hidden="true" /></button>}
          <small>Opening a task does not authorise an external action.</small>
        </div>
      </article>)}
    </div>
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
    {total > 0 && <span className={styles.legend} aria-hidden="true">{([['needs-you', needsYou, 'need you'], ['today', today, 'today'], ['done', done, 'done']] as const).filter(([, n]) => n).map(([lane, n, label]) => <span key={lane}><i data-lane={lane} />{n} {label}</span>)}</span>}
  </figure>;
}
