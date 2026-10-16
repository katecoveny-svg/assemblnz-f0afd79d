'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import styles from './do-miniature-list.module.css';

const Scene = dynamic(() => import('./DoMiniatureScene'), { ssr: false });
export const DO_STARTERS = [
  { id: 'groceries', title: 'Pick up the good things', note: 'Make a grocery list', detail: 'Fictional starter: help me plan a grocery list. Ask what I need; do not assume a budget, diet or retailer connection.' },
  { id: 'newsletter', title: 'Put a little news together', note: 'Draft a newsletter', detail: 'Fictional starter: help me draft a newsletter. Ask for the audience and source material. Nothing is sent.' },
  { id: 'flight', title: 'Plan a change of scenery', note: 'Sketch a trip', detail: 'Fictional starter: help me sketch a trip. Ask where and when. Live availability and booking are not connected.' },
  { id: 'desk', title: 'Make room in the inbox', note: 'Sort a note into next steps', detail: 'Fictional starter: help me organise a note I choose to paste. No inbox has been read and nothing will be sent.' },
  { id: 'weights', title: 'Make time to move', note: 'Plan a small movement break', detail: 'Fictional starter: help me make room for a movement break. Ask what I enjoy; do not assume health information.' },
] as const;
export type DoStarter = { id: string; title: string; detail: string };

/** Navigation examples only. Never writes tasks, storage, consent or an existing draft. */
export function DoMiniatureList({ compact = false, disabled = false, onChoose }: { compact?: boolean; disabled?: boolean; onChoose: (intent: DoStarter) => void }) {
  return <section className={styles.note} data-compact={compact || undefined} aria-label="Fictional task starters">
    <header className={styles.caption}><span>Something to start with</span><small>Fictional ideas · choose one to make it yours</small></header>
    <ol className={styles.list}>{DO_STARTERS.slice(0, compact ? 3 : 5).map((task, index) => <StarterRow key={task.id} task={task} index={index} disabled={disabled} onChoose={onChoose} />)}</ol>
    <footer className={styles.footer}>Only ideas. Nothing read, saved, booked or sent.</footer>
  </section>;
}
function StarterRow({ task, index, disabled, onChoose }: { task: typeof DO_STARTERS[number]; index: number; disabled: boolean; onChoose: (intent: DoStarter) => void }) {
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
  return <li ref={ref} className={styles.item}><button type="button" disabled={disabled} onPointerEnter={() => setGesture(n => n + 1)} onFocus={() => setGesture(n => n + 1)} onClick={() => onChoose(task)} aria-label={`${task.title} · ${task.note} · fictional starter`}>
    <span className={styles.number} aria-hidden="true">0{index + 1}</span>
    <span className={styles.copy}><strong>{task.title}</strong><small>{task.note}<span aria-hidden="true"> ↗</span></small></span>
    <span className={styles.scene} aria-hidden="true" data-miniature={task.id}>{visible && <Scene kind={task.id} reduced={reduced} gesture={gesture} />}</span>
  </button></li>;
}
