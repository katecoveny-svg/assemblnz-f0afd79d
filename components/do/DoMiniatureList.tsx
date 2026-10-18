'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import styles from './do-miniature-list.module.css';

const Scene = dynamic(() => import('./DoMiniatureScene'), { ssr: false });
export const DO_STARTERS = [
  { id: 'desk', prompt: 'Help me make room for what matters today. My priorities are: ', title: 'assembl my day', note: 'Inbox, priorities & calendar', status: 'Choose what to share', detail: 'Start with the priorities or calendar details you choose to share. Mail review needs a verified account connection and permission. A combined inbox and calendar briefing is not connected.', href: '/do/mail', action: 'Open mail review' },
  { id: 'flight', prompt: 'Help me plan a trip. I would like to go to ', title: 'assembl my trip', note: 'Flights & stays', status: 'Plan with your details', detail: 'Tell DO where and when you want to go, or open the travel workspace to organise your own estimates. Live flight and room availability, quotes and booking are not connected.', href: '/do/travel', action: 'Open travel planner' },
  { id: 'table', prompt: 'Help me plan a dinner date. The place, date and number of people are: ', title: 'assembl a dinner date', note: 'Find a table', status: 'Prepare a request', detail: 'Start with the place, date and number of people. DO can help draft your restaurant request; it cannot check table availability or make a reservation here.' },
  { id: 'meals', prompt: 'Help me plan dinner at home. I have these ingredients: ', title: 'assembl dinner at home', note: 'Meals & ingredients', status: 'Meal planner available', detail: 'Start with ingredients you have and meals you enjoy, or open the meal planner. Example prices are fictional; live stock, retailer carts and checkout are not connected.', href: '/do/shop', action: 'Open meal planner' },
  { id: 'gifts', prompt: 'Help me find ideas for clothes or a gift. I am looking for ', title: 'assembl clothes and gifts', note: 'A good fit. A thoughtful gift.', status: 'Prepare a shortlist', detail: 'Start with who it is for, style and a budget you choose to share. DO can help organise your requirements or details you supply. Live catalogues, stock and purchasing are not connected.' },
  { id: 'groceries', prompt: 'Help me make a shopping list. I need ', title: 'assembl my shopping basket', note: 'Your list, brought together', status: 'Plan a list', detail: 'Start with what you need and quantities. DO can help prepare a shopping list. It cannot fill a live browser cart, check stock or complete a purchase here.', href: '/do/shop', action: 'Open shopping planner' },
  { id: 'calendar', prompt: 'Help me prepare an appointment enquiry. The service and times that suit me are: ', title: 'assembl my appointments', note: 'Make room in the calendar', status: 'Prepare an enquiry', detail: 'Start with the service and times that suit you. Share only what is needed for an enquiry. DO cannot read your calendar, check appointment availability or book a service here.' },
] as const;
export type DoStarter = { id: string; title: string; prompt: string; detail: string; href?: string; action?: string };

/** Explicit editable starter requests. No submit, save or external action. */
export function DoMiniatureList({ compact = false, disabled = false, onChoose }: { compact?: boolean; disabled?: boolean; onChoose: (intent: DoStarter) => void }) {
  const paper = useRef<HTMLElement>(null);
  const [quiet, setQuiet] = useState(false);
  useEffect(() => {
    const update = () => setQuiet(document.activeElement instanceof HTMLTextAreaElement || document.activeElement instanceof HTMLInputElement);
    document.addEventListener('focusin', update); document.addEventListener('focusout', update);
    return () => { document.removeEventListener('focusin', update); document.removeEventListener('focusout', update); };
  }, []);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const paint = () => {
      frame = 0;
      if (!paper.current) return;
      for (const row of paper.current.querySelectorAll<HTMLElement>('[data-row-motion]')) {
        const bounds = row.getBoundingClientRect();
        const offset = media.matches || quiet || document.hidden || !bounds.height ? 0 : Math.max(-1, Math.min(1, (innerHeight * .52 - bounds.top - bounds.height / 2) / (innerHeight * .6)));
        row.style.setProperty('--depth', `${offset * 8}px`);
        row.style.setProperty('--turn', `${offset * 2}deg`);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    schedule(); addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', schedule); media.addEventListener('change', schedule);
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', schedule); removeEventListener('resize', schedule); media.removeEventListener('change', schedule); };
  }, [quiet]);
  return <section ref={paper} className={styles.note} data-compact={compact || undefined} aria-label="Task starters">
    <header className={styles.caption}><span>A little nudge?</span><small>Pick a little thing. Make it yours.</small></header>
    <ol className={styles.list}>{DO_STARTERS.map((task) => <StarterRow key={task.id} task={task} quiet={quiet} disabled={disabled} onChoose={onChoose} />)}</ol>
    <footer className={styles.footer}>A starting thought, ready to edit. Nothing is sent when you choose.</footer>
  </section>;
}
function StarterRow({ task, quiet, disabled, onChoose }: { task: typeof DO_STARTERS[number]; quiet: boolean; disabled: boolean; onChoose: (intent: DoStarter) => void }) {
  const ref = useRef<HTMLLIElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [gesture, setGesture] = useState(0);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches); update(); media.addEventListener('change', update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && !document.hidden), { threshold: .1 });
    if (ref.current) observer.observe(ref.current);
    const visibility = () => { if (document.hidden) setVisible(false); else if (ref.current) { const rect = ref.current.getBoundingClientRect(); setVisible(rect.bottom > 0 && rect.top < innerHeight); } };
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); media.removeEventListener('change', update); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  return <li ref={ref} className={styles.item} data-row-motion data-visible={visible || undefined}><button type="button" disabled={disabled} onPointerEnter={() => setGesture(n => n + 1)} onPointerDown={() => setGesture(n => n + 1)} onFocus={() => setGesture(n => n + 1)} onClick={() => onChoose(task)} aria-label={`${task.title} · ${task.note} · task starter`}>
    <span className={styles.copy}><strong>{task.title}</strong><small>{task.note}<span aria-hidden="true"> ↗</span></small></span>
    <span className={styles.scene} aria-hidden="true" data-miniature={task.id}>{visible && <Scene kind={task.id} reduced={reduced} gesture={gesture} quiet={quiet} />}</span>
  </button></li>;
}
