"use client";

import { useEffect, useRef, useState } from 'react';
import { ASSISTANT_NOTE_EVENT, type AssistantNoteOffer } from '@/apps/do/personal/editor-note';
import styles from './first-result.module.css';

/** Local preparation only. Account/provider consent remains in the existing tools. */
export function DoFirstResult({ onTalk, onDirty }: { onTalk: () => void; onDirty: (dirty: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [goal, setGoal] = useState('');
  const [notes, setNotes] = useState('');
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  useEffect(() => { onDirty(Boolean(goal || notes || draft)); }, [goal, notes, draft, onDirty]);
  useEffect(() => {
    if (moved.current && !collapsed) heading.current?.focus();
    moved.current = true;
  }, [step, collapsed]);
  if (collapsed) return <div className={styles.reopen}><button type="button" onClick={() => setCollapsed(false)}>{draft ? 'Return to my unsaved brief' : 'Start with one small task'}</button></div>;
  function prepare() {
    if (!goal.trim()) { setNotice('Add the outcome you want. Your notes are still here.'); return; }
    // A transparent outline, not a fabricated model response or execution receipt.
    if (!draft) setDraft(`Outcome\n${goal.trim()}\n\nDetails to use\n${notes.trim() || 'Add any details you need.'}\n\nNext steps to review\n1.\n2.\n3.`);
    setNotice(''); setStep(2);
  }
  function refine() {
    const offer: AssistantNoteOffer = { text: `Help me turn this brief into a practical plan for review. Do not carry out actions.\n\n${draft}` };
    window.dispatchEvent(new CustomEvent(ASSISTANT_NOTE_EVENT, { detail: offer }));
    if (!offer.result?.accepted) { setNotice(offer.result && !offer.result.accepted ? offer.result.message : 'Ask DO is not ready. Open the writing workspace, then try again. Your brief stays here.'); return; }
    setNotice('Copied to Ask DO for review. Nothing was sent or saved. Review its availability and sharing consent before asking.');
    document.getElementById('personal-assistant-input')?.focus();
  }
  return <section className={styles.guide} aria-labelledby="do-first-result-heading">
    <p className={styles.progress}>Getting started · {step + 1} of 3</p>
    <h2 id="do-first-result-heading" ref={heading} tabIndex={-1}>{['Start with one useful brief', 'Bring just the details you need', 'Your brief, ready to edit'][step]}</h2>
    {step === 0 && <>
      <p>Choose an outcome, add a few notes and make an editable outline. This first step works in this tab without an account or microphone.</p>
      <p>It organises your text locally. It does not generate AI advice, save to your account or carry out the task.</p>
      <button type="button" onClick={() => setStep(1)}>Prepare a brief</button>
    </>}
    {step === 1 && <form onSubmit={event => { event.preventDefault(); prepare(); }}>
      <label htmlFor="do-first-goal">What would you like to achieve?</label>
      <input id="do-first-goal" value={goal} maxLength={400} onChange={event => setGoal(event.target.value)} placeholder="For example, plan a weekend in Wellington" />
      <label htmlFor="do-first-notes">Useful details · optional</label>
      <textarea id="do-first-notes" value={notes} maxLength={2000} rows={4} onChange={event => setNotes(event.target.value)} placeholder="Your constraints, questions or notes" />
      <p>Only what you type here is used. No apps, windows or accounts are read.</p>
      {draft && <p>Your edited brief is preserved. Returning to review will not overwrite it with these notes.</p>}
      <div className={styles.actions}><button type="button" onClick={() => setStep(0)}>Back</button><button type="submit">{draft ? 'Return to my brief' : 'Make editable outline'}</button></div>
    </form>}
    {step === 2 && <>
      <p><strong>In this tab · not saved</strong>. This is an outline made from your text. Edit the next steps yourself, or ask DO to refine it after reviewing sharing consent.</p>
      <label htmlFor="do-first-draft">Editable brief</label>
      <textarea id="do-first-draft" value={draft} maxLength={3000} rows={10} onChange={event => { setDraft(event.target.value); setNotice(''); }} />
      <p>Copy it before refreshing or leaving. No task is running in the background.</p>
      <div className={styles.actions}><button type="button" onClick={() => setStep(1)}>Back</button><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(draft); setNotice('Copied to your clipboard. No account save was made.'); } catch { setNotice('Copy was unavailable. Select the brief text and copy it manually; your edits are still here.'); } }}>Copy brief</button><button type="button" disabled={!draft.trim()} onClick={refine}>Review in Ask DO</button></div>
    </>}
    <p role="status">{notice}</p>
    <details><summary>Prefer to talk?</summary><p>Voice is optional and needs sign-in, available call time and separate microphone/provider consent. Opening call options does not start a call or share this brief. A consistent NZ accent has not been verified.</p><div className={styles.actions}><button type="button" onClick={onTalk}>Review voice options</button><button type="button" onClick={() => { if (step === 0) setStep(1); setNotice('Continue by typing. No microphone permission is needed.'); }}>Type instead</button></div></details>
    <button className={styles.skip} type="button" onClick={() => setCollapsed(true)}>{goal || notes || draft ? 'Close guide · keep work in this tab' : 'Skip · open workspace'}</button>
  </section>;
}
