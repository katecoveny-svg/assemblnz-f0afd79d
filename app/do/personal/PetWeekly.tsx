'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { DoTaskScene } from '@/components/do/DoTaskScene';
import { PET_DAYS } from '@/apps/do/personal/life-admin/templates';
import { createPetRoutine, reviewLifeAdminPlan, transitionLifeAdminTask, updateLifeAdminField, type LifeAdminPlan } from '@/apps/do/personal/life-admin/engine';
import styles from './PetWeekly.module.css';

const errorText = (error: unknown) => error instanceof Error && !('issues' in error) ? error.message : 'Add a nickname, your routine wording and at least one day.';
export function PetRoutineComposer({ onCreate }: { onCreate: (plan: LifeAdminPlan) => void }) {
  const [nickname, setNickname] = useState('');
  const [routine, setRoutine] = useState('');
  const [days, setDays] = useState<(typeof PET_DAYS)[number][]>([]);
  const [error, setError] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    try { onCreate(createPetRoutine({ nickname, routine, days })); setRoutine(''); setDays([]); setError(''); }
    catch (err) { setError(errorText(err)); }
  }
  return <form className={styles.composer} onSubmit={submit} aria-label="Pet routine organiser">
    <header className={styles.header}><div><h2>A week for your pet.</h2><p>Session-only local routine organiser</p></div><DoTaskScene kind="pets" className={styles.art} /></header>
    <p>Use a nickname and your own wording. Choose the days yourself. Leave out health details; medication, diagnosis and behaviour treatment need appropriate professional guidance.</p>
    <label>Pet nickname<input value={nickname} onChange={event => setNickname(event.target.value)} maxLength={80} required /></label>
    <label>Your routine wording<textarea value={routine} onChange={event => setRoutine(event.target.value)} maxLength={600} rows={3} required /></label>
    <fieldset><legend>Which days?</legend><div className={styles.dayChoices}>{PET_DAYS.map(day => <label key={day}><input type="checkbox" checked={days.includes(day)} onChange={event => setDays(current => event.target.checked ? [...current, day] : current.filter(item => item !== day))} />{day}</label>)}</div></fieldset>
    <p className={styles.quiet}>No times or responsibility are inferred. Nothing is scheduled or sent. Export before leaving, refreshing or changing accounts.</p>
    <button type="submit">Arrange my week</button><p role="status">{error}</p>
  </form>;
}
export function PetWeekly({ plan, onChange, onEditingChange }: { plan: LifeAdminPlan; onChange: (plan: LifeAdminPlan) => void; onEditingChange: (editing: boolean) => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [recording, setRecording] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  function change(run: () => LifeAdminPlan) { try { onChange(run()); setError(''); return true; } catch (err) { setError(errorText(err)); return false; } }
  const interrupted = editing !== null || recording !== null;
  useEffect(() => { onEditingChange(interrupted); return () => onEditingChange(false); }, [interrupted, onEditingChange]);
  return <section className={styles.week} aria-label="Seven-day pet routine">
    <header className={styles.header}><div><h4>{plan.fields.nickname}’s week</h4><p>Session-only local routine organiser</p><small>{plan.reviewedAt ? 'Reviewed by you' : 'Needs your review'} · completion is recorded by you</small></div><DoTaskScene kind="pets" className={styles.art} /></header>
    <p>Your wording stays as supplied. Times and responsibility are unknown unless included in your notes. No reminders or recommendations are created.</p>
    <div className={styles.grid}>{PET_DAYS.map(day => {
      const task = plan.tasks.find(item => item.key === day);
      return <section className={styles.day} key={day} aria-label={day} data-complete={task?.status === 'done'}><h5>{day}</h5>
        {editing === day ? <form onSubmit={event => { event.preventDefault(); if (change(() => updateLifeAdminField(plan, day, draft))) setEditing(null); }}><label>Routine for {day}<textarea autoFocus value={draft} onChange={event => setDraft(event.target.value)} maxLength={600} rows={4} /></label><button type="submit">Save day</button><button type="button" onClick={() => setEditing(null)}>Cancel edit</button><small>Saving changes requires a new review.</small></form> : <><p className={styles.wording}>{plan.fields[day] || 'No routine supplied'}</p><button type="button" disabled={interrupted} onClick={() => { setDraft(plan.fields[day] || ''); setEditing(day); }}>{task ? 'Edit' : 'Add routine'}<span className={styles.srOnly}> for {day}</span></button></>}
        {task && <><small>{task.status === 'done' ? 'Done · recorded by you' : task.status === 'needs_review' ? 'Needs review' : 'Ready for you'}</small>{task.evidence && <p className={styles.evidence}>{task.evidence.note}</p>}
          {task.status === 'todo' && <button type="button" disabled={interrupted} onClick={() => { setRecording(day); setNote(''); }}>Record completion<span className={styles.srOnly}> for {day}</span></button>}
          {task.status === 'done' && <button type="button" disabled={interrupted || !plan.reviewedAt} onClick={() => change(() => transitionLifeAdminTask(plan, task.id, { status: 'todo' }))}>Reopen<span className={styles.srOnly}> {day}</span></button>}
          {recording === day && <form onSubmit={event => { event.preventDefault(); if (change(() => transitionLifeAdminTask(plan, task.id, { status: 'done', note }))) setRecording(null); }}><label>Your completion note<textarea autoFocus value={note} onChange={event => setNote(event.target.value)} minLength={8} maxLength={2000} required /></label><button type="submit">Save completion</button><button type="button" onClick={() => setRecording(null)}>Cancel record</button></form>}
        </>}
      </section>;
    })}</div>
    {!plan.reviewedAt && <button type="button" disabled={interrupted} onClick={() => change(() => reviewLifeAdminPlan(plan))}>I’ve checked my week · review</button>}
    {interrupted && <p role="status">Finish or cancel your open edit before reviewing or recording another day. Unsaved edits stay in this open editor only.</p>}
    <p role="status">{error}</p><details><summary>Original wording you supplied</summary><pre>{plan.source.text}</pre></details><small>Review does not mark any activity done. Download the checklist below before leaving. Medical and behaviour-treatment recommendations are outside this organiser.</small>
  </section>;
}
