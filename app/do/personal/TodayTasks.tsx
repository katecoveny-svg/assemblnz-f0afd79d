"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, ChevronDown } from 'lucide-react';
import styles from './TodayTasks.module.css';

// Entry points describe shipped capability, never infer a connection from sign-in.
export const PERSONAL_TASKS = [
  { id: 'briefing', title: 'Inbox & my day', subtitle: 'Make room for what matters.', status: 'Account check required',
    detail: 'Choose an account in mail review. Reading needs a verified connection and your permission. A combined email and calendar briefing is not available yet.', action: 'Open mail review', href: '/do/mail' },
  { id: 'travel', title: 'Flights & stays', subtitle: 'Flights, stays and time away.', status: 'Live search unavailable',
    detail: 'Use the current travel workspace to organise a trip and estimates you enter. Live flight and room availability, quotes and booking are not connected.', action: 'Open travel workspace', href: '/do/travel' },
  { id: 'dinner', title: 'A table for us', subtitle: 'The place. The people. The occasion.', status: 'Booking unavailable',
    detail: 'Write what you have in mind and prepare a request. DO cannot check restaurant availability or reserve a table here.', action: 'Write a dinner request' },
  { id: 'appointments', title: 'Appointments', subtitle: 'Appointments and everyday services.', status: 'Availability unavailable',
    detail: 'Prepare questions or a request for a doctor, physio, beauty or other service. DO cannot check appointment times or book a service here. Share only the details needed for the request.', action: 'Write a service request' },
  { id: 'shopping', title: 'Clothes & gifts', subtitle: 'Clothes, gifts and things you need.', status: 'Store connection needed',
    detail: 'Write your requirements or compare details you supply. Live clothes and general shopping catalogues, stock, checkout and purchasing are not connected.', action: 'Write a shopping request' },
  { id: 'meals', title: 'Dinner at home', subtitle: 'Start with what is in the pantry.', status: 'Meal planning available',
    detail: 'Build a meal plan and shopping list in Shopper. Its examples use fictional prices. Live stock, retailer carts and checkout are not connected.', action: 'Open meal planner', href: '/do/shop' },
] as const;

export type PersonalTaskIntent = { id: string; title: string; detail: string };

type Props = { today: number; needsYou: number; done: number; onReview: () => void; onWrite: (intent?: PersonalTaskIntent) => void };
export function TodayTasks({ today, needsYou, done, onReview, onWrite }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const total = today + needsYou + done;
  return <section className={styles.home} aria-labelledby="personal-today-heading">
    <header className={styles.heading}><div><h2 id="personal-today-heading" tabIndex={-1}>Today</h2><p>A little less on your mind.</p></div><span className={styles.scope}>This workspace</span></header>
    <div className={styles.today}>

      <div><h3>{total ? `${needsYou} ${needsYou === 1 ? 'thing needs' : 'things need'} you` : 'What shall we take care of?'}</h3>
        <p>{total ? `${today} ready today · ${done} handled or cancelled by you` : 'Your tasks and review decisions will gather here as you work.'}</p>
        <small>No inbox or calendar has been read for this view.</small>
      </div>
      <button type="button" onClick={() => total ? onReview() : onWrite()}>{total ? 'Review my tasks' : 'Start with a note'}<ArrowUpRight size={17} aria-hidden="true" /></button>
    </div>
    <div className={styles.sectionHeading}><h3>What would make life easier?</h3><p>Choose a task to see what is available.</p></div>
    <div className={styles.tasks}>
      {PERSONAL_TASKS.map(({ id, title, subtitle, status, detail, action, ...destination }) => <article key={id} className={styles.task} data-task={id} data-expanded={open === id}>
        <button type="button" className={styles.taskButton} aria-expanded={open === id} aria-controls={`task-detail-${id}`} onClick={() => setOpen(open === id ? null : id)}>
          <TaskArt kind={id} />
          <span className={styles.taskCopy}><strong>{title}</strong><span>{subtitle}</span><small>{status}</small></span><ChevronDown className={styles.chevron} size={18} aria-hidden="true" />
        </button>
        <div id={`task-detail-${id}`} className={styles.detail} hidden={open !== id}>
          <p>{detail}</p>
          {'href' in destination ? <Link prefetch={false} href={destination.href}>{action}<ArrowUpRight size={16} aria-hidden="true" /></Link> : <button type="button" onClick={() => onWrite({ id, title, detail })}>{action}<ArrowUpRight size={16} aria-hidden="true" /></button>}
          <small>Opening a task does not authorise an external action.</small>
        </div>
      </article>)}
    </div>
    <footer className={styles.review}><Check size={19} aria-hidden="true" /><p><strong>Your say, before the next step.</strong> Review the details in each task. Completed actions need a confirmation; a draft is not a booking or purchase.</p></footer>
  </section>;
}

function TaskArt({ kind }: { kind: string }) {
  return <svg className={styles.art} viewBox="0 0 160 64" fill="none" aria-hidden="true" focusable="false">
    {kind === 'briefing' && <><rect x="40" y="6" width="68" height="48" rx="5" fill="#916A70" transform="rotate(-7 40 6)"/><rect x="55" y="2" width="61" height="45" rx="4" fill="#FFFDFB"/><path d="M65 13h38M65 20h27M65 27h32" stroke="#B39AA8" strokeWidth="3"/><path d="M34 26h91v34H34z" fill="#C8A7BB"/><path d="m34 26 45 24 46-24" fill="#E8D6E1"/><path d="m34 60 32-22m59 22L93 38" stroke="#916A70"/><circle cx="123" cy="13" r="9" fill="#492B3E"/><path d="m119 13 3 3 5-6" stroke="#FFFDFB" strokeWidth="1.5"/></>}
    {kind === 'travel' && <><path d="M20 13h107v42H20V13Z" fill="#C4B5D4" transform="rotate(-6 20 13)"/><path d="M36 10h108v16a7 7 0 0 0 0 14v16H36V40a7 7 0 0 0 0-14V10Z" fill="#FFFDFB"/><path d="M113 12v42" stroke="#916A70" strokeDasharray="3 3"/><path d="m50 31 43-13-17 31-5-14-21-4Z" fill="#654A4E"/><path d="m71 35 22-17" stroke="#EAC8DF"/><path d="M121 20h12m-12 7h8m-12 17h16" stroke="#916A70" strokeWidth="2"/></>}
    {kind === 'dinner' && <><path d="M20 5h33v54H20z" fill="#E0C2CE"/><ellipse cx="86" cy="33" rx="31" ry="28" fill="#FFFDFB"/><ellipse cx="86" cy="33" rx="23" ry="20" stroke="#C8A7BB" strokeWidth="2"/><path d="m72 22 28 5-19 19-9-24Z" fill="#916A70"/><path d="M35 13v40m-7-40v12q7 8 14 0V13m-7 0v15M131 12v41m0-41q-14 17 0 23" stroke="#654A4E" strokeWidth="2" strokeLinecap="round"/></>}
    {kind === 'appointments' && <><rect x="38" y="8" width="77" height="50" rx="7" fill="#BDA7B6" transform="rotate(-6 38 8)"/><rect x="49" y="5" width="76" height="52" rx="6" fill="#FFFDFB"/><path d="M49 19h76" stroke="#E0C2CE" strokeWidth="9"/><path d="M65 3v11m44-11v11" stroke="#492B3E" strokeWidth="3" strokeLinecap="round"/><path d="M61 30h9m10 0h9m10 0h13M61 42h9m10 0h9" stroke="#BDA7B6" strokeWidth="4"/><circle cx="111" cy="45" r="11" fill="#492B3E"/><path d="m106 45 4 3 6-7" stroke="#FFFDFB" strokeWidth="2"/></>}
    {kind === 'shopping' && <><path d="m48 12 23-8q9 11 18 0l23 8 13 19-17 8-8-12v32H60V27l-8 12-17-8 13-19Z" fill="#916A70"/><path d="M71 4q9 21 18 0" stroke="#EAC8DF" strokeWidth="4"/><path d="M65 46h30M65 51h30" stroke="#C8A7BB"/><path d="m110 9 24 6-10 31-24-7 10-30Z" fill="#FFFDFB"/><circle cx="116" cy="17" r="2" fill="#916A70"/><path d="m109 26 15 4m-17 3 10 3" stroke="#C8A7BB" strokeWidth="2"/></>}
    {kind === 'meals' && <><ellipse cx="81" cy="48" rx="53" ry="9" fill="#DCC6C7"/><path d="M36 27h90q-8 31-45 31T36 27" fill="#916A70"/><ellipse cx="81" cy="27" rx="45" ry="17" fill="#FFFDFB"/><ellipse cx="81" cy="27" rx="35" ry="11" fill="#E4CFBD"/><path d="M56 21q10 1 9 13-13 0-9-13m32-6q15 1 15 13-17 0-15-13m-9 9q13 0 12 12-13 0-12-12" fill="#928C75"/><path d="m67 21 8 4m20 7 6-3m-28 5 3-4" stroke="#916A70" strokeWidth="3" strokeLinecap="round"/></>}
  </svg>;
}
