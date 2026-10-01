"use client";

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, ChevronDown, Copy, LoaderCircle, RotateCcw, X } from 'lucide-react';
import {
  PERSONAL_DO_ASSISTANT_CONSENT, personalAssistantInputSchema, personalAssistantDraftSchema,
  type PersonalAssistantAvailability, type PersonalAssistantInput, type PersonalAssistantResult,
} from '@/apps/do/personal/assistant';
import type { PersonalDoProfile } from '@/apps/do/personal/profile';
import styles from './personal-assistant.module.css';

/** Mount with the verified owner scope as the React key; never persist conversation across accounts. */
export type PersonalAssistantWork = { dirty: boolean; exportText: string };
export function PersonalDoAssistant({ profile, onWorkingChange, onWorkChange }: { profile?: PersonalDoProfile; onWorkingChange?: (working: boolean) => void; onWorkChange?: (work: PersonalAssistantWork) => void }) {
  const [message, setMessage] = useState('');
  const [context, setContext] = useState('');
  const [consent, setConsent] = useState(false);
  const [usePublicNz, setUsePublicNz] = useState(false);
  const [useSavedStyle, setUseSavedStyle] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [availability, setAvailability] = useState<PersonalAssistantAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  const [result, setResult] = useState<PersonalAssistantResult | null>(null);
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const attempt = useRef<{ body: string; id: string } | null>(null);
  const request = useRef<AbortController | null>(null);
  const statusRequest = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const lock = useRef(false);
  const alive = useRef(true);
  const workingCallback = useRef(onWorkingChange);
  useEffect(() => { workingCallback.current = onWorkingChange; }, [onWorkingChange]);
  const exportText = [message.trim() ? `Unfinished message\n${message}` : '', context.trim() ? `Added notes\n${context}` : '', result ? `Last request\n${lastMessage}\n\nDO reply (review required)\n${result.reply}${draft ? `\n\nEditable draft\n${draft}` : ''}` : ''].filter(Boolean).join('\n\n');
  useEffect(() => { onWorkChange?.({ dirty: Boolean(exportText), exportText }); }, [exportText, onWorkChange]);

  const loadAvailability = useCallback(async () => {
    statusRequest.current?.abort();
    const controller = new AbortController(); statusRequest.current = controller;
    setLoading(true);
    try {
      const response = await fetch('/api/do/personal/assistant', { cache: 'no-store', signal: controller.signal });
      const data = await response.json();
      if (controller.signal.aborted) return;
      if ((!response.ok && response.status !== 401) || typeof data.ready !== 'boolean' || typeof data.signedIn !== 'boolean' || typeof data.message !== 'string') throw new Error('invalid_status');
      setAvailability(data as PersonalAssistantAvailability);
    } catch {
      if (!controller.signal.aborted) { setAvailability(null); setError('DO’s availability could not be checked. Your note can stay here; try checking again.'); }
    } finally { if (!controller.signal.aborted) setLoading(false); }
  }, []);
  useEffect(() => {
    alive.current = true;
    // Availability is an asynchronous owner-scoped read, never a provider call.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAvailability();
    const focusInput = () => inputRef.current?.focus();
    window.addEventListener('assembl:do-focus', focusInput);
    return () => {
      alive.current = false; request.current?.abort(); statusRequest.current?.abort();
      workingCallback.current?.(false);
      window.removeEventListener('assembl:do-focus', focusInput);
    };
  }, [loadAvailability]);

  function cancel() {
    request.current?.abort(); request.current = null; lock.current = false;
    setWorking(false); workingCallback.current?.(false);
    setConsent(false); setNotice('Stopped. Your note is still here.');
  }
  function clearConversation() {
    attempt.current = null;
    cancel(); setResult(null); setDraft(''); setLastMessage(''); setCopied(false);
    setMessage(''); setContext(''); setReviewOpen(false); setError(''); setNotice('New conversation.');
    inputRef.current?.focus();
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (lock.current) return;
    setError(''); setNotice('');
    if (!message.trim()) { inputRef.current?.focus(); return; }
    if (!reviewOpen || !consent) { setReviewOpen(true); requestAnimationFrame(() => consentRef.current?.focus()); return; }
    const history: PersonalAssistantInput['history'] = result ? [
      { role: 'user', text: lastMessage },
      { role: 'assistant', text: [result.reply, draft].filter(Boolean).join('\n\n') },
    ] : [];
    const parsed = personalAssistantInputSchema.safeParse({ message, context, history, consent, useSavedStyle, usePublicNz });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Check your request.'); return; }
    const body = JSON.stringify(parsed.data);
    if (attempt.current?.body !== body) attempt.current = { body, id: crypto.randomUUID() };
    const controller = new AbortController(); request.current = controller; lock.current = true;
    setWorking(true); workingCallback.current?.(true); setConsent(false); setCopied(false);
    try {
      const response = await fetch('/api/do/personal/assistant', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': attempt.current.id },
        body, signal: controller.signal,
      });
      const data = await response.json();
      if (controller.signal.aborted || !alive.current || request.current !== controller) return;
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) void loadAvailability();
        throw new Error(typeof data.message === 'string' ? data.message : 'DO could not finish this request. Please try again.');
      }
      const next = data.result as PersonalAssistantResult;
      if (!personalAssistantDraftSchema.safeParse(next && { reply: next.reply, rationale: next.rationale, evidence: next.evidence, missingInformation: next.missingInformation, nextStep: next.nextStep }).success || !next.reasoning || next.externalActions !== false || next.reviewRequired !== true || typeof next.id !== 'string') throw new Error('DO returned an incomplete reply. Please try again.');
      attempt.current = null;
      setResult(next); setDraft(next.nextStep.draft ?? ''); setLastMessage(parsed.data.message);
      setMessage(''); setReviewOpen(false); setNotice('A reply is ready for your review.');
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch (cause) {
      if (!controller.signal.aborted && alive.current && request.current === controller) setError(cause instanceof Error ? cause.message : 'DO could not finish this request. Please try again.');
    } finally {
      if (request.current === controller && alive.current) { request.current = null; lock.current = false; setWorking(false); workingCallback.current?.(false); }
    }
  }
  async function copyDraft() {
    try { await navigator.clipboard.writeText(draft); if (alive.current) setCopied(true); }
    catch { setError('Copy is unavailable here. Select the draft text and copy it manually.'); }
  }

  return <section className={styles.panel} aria-label={`Ask ${profile?.displayName ?? 'DO'}`} aria-busy={working}>
    {result && <div className={styles.exchange}>
      <p className={styles.userMessage}>{lastMessage}</p>
      <div className={styles.response}>
        <div className={styles.responseTop}><h3 ref={resultRef} tabIndex={-1}>{profile?.displayName ?? 'DO'} · {result.state === 'draft' ? 'for your review' : 'one next step'}</h3><button type="button" onClick={clearConversation} disabled={working} title="Start a new conversation"><RotateCcw size={14} /> New</button></div>
        <p className={styles.reply}>{result.reply}</p>
        {result.nextStep.draft !== null && <div className={styles.draft}>
          <label htmlFor="personal-assistant-draft">{result.nextStep.label}</label>
          <textarea id="personal-assistant-draft" value={draft} maxLength={6000} onChange={event => { setDraft(event.target.value); setCopied(false); setConsent(false); }} rows={8} disabled={working} />
          <button type="button" onClick={() => void copyDraft()} disabled={!draft.trim()}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy draft'}</button>
        </div>}
        {result.nextStep.draft === null && <p className={styles.question}>{result.nextStep.label}</p>}
        <details className={styles.evidence}><summary>Why this next step <ChevronDown size={14} /></summary>
          <p>{result.rationale}</p>
          {!!result.evidence.length && <><h4>What this reply uses</h4><ul>{result.evidence.map((item, index) => <li key={index}>“{item.quote}” <span>({item.source === 'public_source' ? 'official reference' : item.source})</span>{item.source === 'public_source' && item.citation && <a href={item.citation} target="_blank" rel="noopener noreferrer"> Source</a>}</li>)}</ul></>}
          {!!result.missingInformation.length && <><h4>Still to check</h4><ul>{result.missingInformation.map((item, index) => <li key={index}>{item}</li>)}</ul></>}
          <p>{result.generation ? `Reply: ${result.generation.actualModel} · ${result.generation.reasoningEffort} reasoning.` : 'No OpenAI generation was made for this reply.'} Request check: TypeSafe ({result.reasoning.model}).</p>
          <p>{result.reasoning.note} Your text and reply are not saved to your Assembl account by this conversation; provider retention terms apply.</p>
        </details>
      </div>
    </div>}
    {result?.officialSourcesRequested && <details className={styles.notes}><summary>Official references checked for this request</summary>{result.officialSources?.length ? result.officialSources.map(source => <article key={source.citation}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a><p>{source.status || 'Status not provided'}{source.stage ? ` · ${source.stage}` : ''}</p><p>{source.excerpt}</p><p>Checked {source.verifiedAt}. Introduction: {source.introducedAt || 'unknown'}. Stage activity: {source.activityAt || 'unknown'}. Original publication unknown. A bill is not necessarily enacted law; recheck at the source.</p></article>) : <p>No fresh verified Parliament evidence was available for this request. Discovery links do not establish current facts.</p>}</details>}
    <form onSubmit={event => void submit(event)}>
      <label className={styles.inputLabel} htmlFor="personal-assistant-input">{result ? 'What would help next?' : 'What needs doing?'}</label>
      <textarea ref={inputRef} id="personal-assistant-input" data-do-primary-input value={message} maxLength={4000} rows={3} disabled={working} placeholder="e.g. Prepare a reply to my property manager" onChange={event => { setMessage(event.target.value); setConsent(false); setNotice(''); }} />
      <div className={styles.composerFooter}>
        <span>{working ? 'Checking the request and preparing your reply…' : 'You decide what happens next'}</span>
        {working ? <button className={styles.stop} type="button" onClick={cancel}><X size={15} /> Stop</button> : <button className={styles.send} type="submit" disabled={!message.trim() || loading || !availability?.ready}>{reviewOpen && consent ? 'Ask DO' : 'Start'}<ArrowUpRight size={18} /></button>}
      </div>
      <label className={styles.consent}><input type="checkbox" checked={usePublicNz} disabled={working} onChange={event => { setUsePublicNz(event.target.checked); setConsent(false); }} /><span>Include official NZ references. Fresh Parliament details only; other links need checking. This is not a topic search. Selected public references also go to OpenAI and TypeSafe.</span></label>
      <details className={styles.notes}><summary>Add a little context <ChevronDown size={14} /></summary><label htmlFor="personal-assistant-notes">Notes to use in this conversation</label><textarea id="personal-assistant-notes" value={context} maxLength={6000} rows={3} disabled={working} onChange={event => { setContext(event.target.value); setConsent(false); }} placeholder="Paste only the details you want DO to use. Links are not opened." /><p>Remove passwords, payment details and anything you don’t want to share. Only the last exchange and these notes go with your next message.</p></details>
      {reviewOpen && <div className={styles.consent}>
        <label><input ref={consentRef} type="checkbox" checked={consent} disabled={working} onChange={event => setConsent(event.target.checked)} /><span>{PERSONAL_DO_ASSISTANT_CONSENT}</span></label>
        {profile && <label><input type="checkbox" checked={useSavedStyle} disabled={working} onChange={event => { setUseSavedStyle(event.target.checked); setConsent(false); }} /><span>Also use my saved tone and wording preferences with OpenAI</span></label>}
      </div>}
    </form>
    <div className={styles.status} aria-live="polite" role="status">
      {loading && <p><LoaderCircle size={13} /> Checking availability…</p>}
      {!loading && availability && !availability.ready && <p>{availability.message} {availability.reason === 'entitlement_required' && <Link href="/do/billing">Personal DO subscription</Link>} {!availability.signedIn ? <Link href="/login?redirect=%2Fdo">Sign in</Link> : <button type="button" onClick={() => { setError(''); void loadAvailability(); }}>Check again</button>}</p>}
      {!loading && !availability && <button type="button" onClick={() => { setError(''); void loadAvailability(); }}>Check availability again</button>}
      {notice && <p>{notice}</p>}
    </div>
    {error && <p className={styles.error} role="alert">{error}</p>}
  </section>;
}
