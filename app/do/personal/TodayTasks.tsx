"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Check, ChevronDown, Mail, Plane, ShoppingBag, Shirt, Utensils } from 'lucide-react';
import styles from './TodayTasks.module.css';

// Entry points describe shipped capability, never infer a connection from sign-in.
export const PERSONAL_TASKS = [
  { id: 'briefing', title: 'My day & inbox', subtitle: 'Make room for what matters.', status: 'Account check required', Icon: Mail,
    detail: 'Choose an account in mail review. Reading needs a verified connection and your permission. A combined email and calendar briefing is not available yet.', action: 'Open mail review', href: '/do/mail' },
  { id: 'travel', title: 'A little further', subtitle: 'Flights, stays and time away.', status: 'Live search unavailable', Icon: Plane,
    detail: 'Use the current travel workspace to organise a trip and estimates you enter. Live flight and room availability, quotes and booking are not connected.', action: 'Open travel workspace', href: '/do/travel' },
  { id: 'dinner', title: 'A table for us', subtitle: 'The place. The people. The occasion.', status: 'Booking unavailable', Icon: Utensils,
    detail: 'Write what you have in mind and prepare a request. DO cannot check restaurant availability or reserve a table here.', action: 'Write a dinner request' },
  { id: 'appointments', title: 'Time for yourself', subtitle: 'Appointments and everyday services.', status: 'Availability unavailable', Icon: CalendarDays,
    detail: 'Prepare questions or a request for a doctor, physio, beauty or other service. DO cannot check appointment times or book a service here. Share only the details needed for the request.', action: 'Write a service request' },
  { id: 'shopping', title: 'Something for you', subtitle: 'Clothes, gifts and things you need.', status: 'Store connection needed', Icon: Shirt,
    detail: 'Write your requirements or compare details you supply. Live clothes and general shopping catalogues, stock, checkout and purchasing are not connected.', action: 'Write a shopping request' },
  { id: 'meals', title: 'Dinner at home', subtitle: 'Start with what is in the pantry.', status: 'Meal planning available', Icon: ShoppingBag,
    detail: 'Build a meal plan and shopping list in Shopper. Its examples use fictional prices. Live stock, retailer carts and checkout are not connected.', action: 'Open meal planner', href: '/do/shop' },
] as const;

type Props = { today: number; needsYou: number; done: number; onReview: () => void; onWrite: () => void };
export function TodayTasks({ today, needsYou, done, onReview, onWrite }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const total = today + needsYou + done;
  return <section className={styles.home} aria-labelledby="personal-today-heading">
    <header className={styles.heading}><div><h2 id="personal-today-heading">Today</h2><p>A little less on your mind.</p></div><span className={styles.scope}>This workspace</span></header>
    <div className={styles.today}>
      <span className={styles.dayMark} aria-hidden="true"><CalendarDays size={28} /></span>
      <div><h3>{total ? `${needsYou} ${needsYou === 1 ? 'thing needs' : 'things need'} you` : 'What shall we take care of?'}</h3>
        <p>{total ? `${today} ready today · ${done} handled or cancelled by you` : 'Your tasks and review decisions will gather here as you work.'}</p>
        <small>No inbox or calendar has been read for this view.</small>
      </div>
      <button type="button" onClick={total ? onReview : onWrite}>{total ? 'Review my tasks' : 'Start with a note'}<ArrowUpRight size={17} aria-hidden="true" /></button>
    </div>
    <div className={styles.sectionHeading}><h3>What would make life easier?</h3><p>Choose a task to see what is available.</p></div>
    <div className={styles.tasks}>
      {PERSONAL_TASKS.map(({ id, title, subtitle, status, Icon, detail, action, ...destination }) => <article key={id} className={styles.task} data-task={id}>
        <button type="button" className={styles.taskButton} aria-expanded={open === id} aria-controls={`task-detail-${id}`} onClick={() => setOpen(open === id ? null : id)}>
          <span className={styles.art} aria-hidden="true"><Icon strokeWidth={1.25} /><span className={styles.artLine} /></span>
          <span className={styles.taskCopy}><strong>{title}</strong><span>{subtitle}</span><small>{status}</small></span><ChevronDown className={styles.chevron} size={18} aria-hidden="true" />
        </button>
        <div id={`task-detail-${id}`} className={styles.detail} hidden={open !== id}>
          <p>{detail}</p>
          {'href' in destination ? <Link prefetch={false} href={destination.href}>{action}<ArrowUpRight size={16} aria-hidden="true" /></Link> : <button type="button" onClick={onWrite}>{action}<ArrowUpRight size={16} aria-hidden="true" /></button>}
          <small>Opening a task does not authorise an external action.</small>
        </div>
      </article>)}
    </div>
    <footer className={styles.review}><Check size={19} aria-hidden="true" /><p><strong>Your say, before the next step.</strong> Review the details in each task. Completed actions need a confirmation; a draft is not a booking or purchase.</p></footer>
  </section>;
}
