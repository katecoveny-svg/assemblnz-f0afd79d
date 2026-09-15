'use client';
import { DoMark } from './DoAppearance';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Copy, Download, LoaderCircle, Trash2 } from 'lucide-react';
import { cleanSourceUrl, DO_BRIEF_LIMIT, DO_SOURCE_LIMIT, DO_TASKS, draftAsMarkdown, type DoAvailability, type DoPreparedDraft, type DoTask } from '@/apps/do/shared/preparation';
import { editDoDraft, readLocalDrafts, removeLocalDraft, saveLocalDraft, type SavedDoDraft } from '@/apps/do/shared/local-drafts';

const EXAMPLES = [
  { title: 'Message · sample', text: 'Example message: Hi, could you send the updated outline before our meeting on Thursday? We need to agree who is doing each part and confirm whether the timeline still works. Please suggest a time to review the open questions.' },
  { title: 'School notice · sample', text: 'Example school notice\nScience trip: 22 September 2026. Bring PE gear, a packed lunch and a water bottle. The contribution is NZ$12. Permission forms are due 18 September 2026. Please check the school portal for the payment and permission form. A parent or caregiver needs to review both.' },
  { title: 'Two quotes · sample', text: 'Example quotes for the same print job\nOption A: 500 brochures for NZ$420 including GST. Delivery in 5 working days. One proof included. Delivery charge NZ$25.\nOption B: 500 brochures for NZ$390 excluding GST. Delivery in 7 working days. Two proofs included. Delivery charge not stated.\nBoth quotes need confirmation of paper weight, size and print finish before they can be compared fairly.' },
];

function downloadText(name: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function DoTextWorkspace({ initialBrief = '', initialTask = 'reply', embedded = false, onSettled }: { initialBrief?: string; initialTask?: DoTask; embedded?: boolean; onSettled?: () => void }) {
  const [task, setTask] = useState<DoTask>(initialTask);
  const [source, setSource] = useState(initialBrief);
  const [brief, setBrief] = useState(initialBrief.slice(0, DO_BRIEF_LIMIT));
  const [sourceTitle, setSourceTitle] = useState(initialBrief ? 'Your instruction' : '');
  const [sourceUrl, setSourceUrl] = useState('');
  const [consent, setConsent] = useState(false);
  const [availability, setAvailability] = useState<DoAvailability | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<DoPreparedDraft | null>(null);
  const [reviewer, setReviewer] = useState('');
  const [saved, setSaved] = useState<SavedDoDraft[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [sourceForDraft, setSourceForDraft] = useState('');
  const [briefForDraft, setBriefForDraft] = useState('');
  const abort = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/do/runtime', { signal: controller.signal }).then(res => res.ok ? res.json() : null).then(data => setAvailability(data?.availability || null)).catch(() => {});
    const restore = requestAnimationFrame(() => {
      try { if (!embedded) setSaved(readLocalDrafts(localStorage)); } catch { /* Storage is optional. */ }
    });
    return () => { cancelAnimationFrame(restore); controller.abort(); abort.current?.abort(); };
  }, [embedded]);

  // An embed can offer context for review. It cannot trigger generation or read the result.
  useEffect(() => {
    if (!embedded) return;
    const receive = (event: MessageEvent) => {
      if (event.source !== window.parent || event.data?.type !== 'assembl-do:context') return;
      if (typeof event.data.text !== 'string') return;
      setSource(event.data.text.slice(0, DO_SOURCE_LIMIT));
      setSourceTitle(typeof event.data.title === 'string' ? event.data.title.slice(0, 160) : 'Shared context');
      setSourceUrl(typeof event.data.url === 'string' ? cleanSourceUrl(event.data.url) : '');
      setConsent(false); setNotice('Context added. Review the text, then choose whether to prepare it.');
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [embedded]);

  async function prepare(event: React.FormEvent) {
    event.preventDefault();
    if (!consent || !source.trim() || busy) return;
    setBusy(true); setError(''); setNotice('');
    const controller = new AbortController(); abort.current = controller;
    try {
      const response = await fetch('/api/do/prepare', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ task, source, brief, sourceTitle: sourceTitle || 'Pasted text', sourceUrl, consent }),
      });
      const data = await response.json();
      if (!response.ok || !data.draft) throw new Error(data.message || 'DO could not finish this preparation.');
      setDraft(data.draft); setReviewer(''); setSourceForDraft(source.trim()); setBriefForDraft(brief.trim());
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch (cause) {
      setError(cause instanceof Error && cause.name === 'AbortError' ? 'Preparation stopped. Your text is still here.' : cause instanceof Error ? cause.message : 'Preparation failed. Your text is still here.');
    } finally { setBusy(false); abort.current = null; onSettled?.(); }
  }

  async function review() {
    if (!draft || !reviewer.trim()) return;
    try {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(draft.text));
      const reviewedTextHash = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
      setDraft({ ...draft, status: 'reviewed', reviewer: reviewer.trim(), reviewedAt: new Date().toISOString(), reviewedTextHash });
      setNotice('Review recorded in this draft. You can now copy or download it for your next step.');
    } catch { setError('The review could not be recorded in this browser. You can still download the draft.'); }
  }

  function save() {
    if (!draft) return;
    try {
      setSaved(saveLocalDraft(localStorage, { draft, source: sourceForDraft, brief: briefForDraft }));
      setNotice('Saved in this browser. The text will remain on this device until you remove it.');
    } catch { setError('This browser could not save the draft. Download a copy instead.'); }
  }

  function openSaved(entry: SavedDoDraft) {
    setDraft(entry.draft); setTask(entry.draft.task); setSource(entry.source); setBrief(entry.brief);
    setSourceForDraft(entry.source); setBriefForDraft(entry.brief);
    setSourceTitle(entry.draft.evidence.sourceTitle); setSourceUrl(entry.draft.evidence.sourceUrl);
    setReviewer(entry.draft.reviewer || ''); setConsent(false); setNotice('Saved draft opened.');
  }

  return <div className={`do-workspace ${embedded ? 'do-workspace-embedded' : ''}`}>
    <div className="do-workspace-intro"><span className="do-small-label">SIX READY-TO-USE WRITING & TASK AGENTS</span><h2>What do you want to DO?</h2><p>Choose an agent. Add your text. Get work you can edit, copy and use.</p></div>
    <form onSubmit={prepare} className="do-preparation-form">
      <fieldset className="do-task-picker" disabled={busy}><legend>Choose your agent</legend>{DO_TASKS.map(option => <label key={option.id} className={task === option.id ? 'is-selected' : ''}><input type="radio" name="do-task" value={option.id} checked={task === option.id} onChange={() => { setTask(option.id); setConsent(false); }} /><span className="do-task-glyph" aria-hidden>{option.glyph}</span><span><strong>{option.title}</strong><small>{option.description}</small></span></label>)}</fieldset>
      <div className="do-field-head"><label htmlFor="do-source">Text DO can use</label><span>{source.length.toLocaleString()} / 12,000</span></div>
      <textarea id="do-source" value={source} maxLength={DO_SOURCE_LIMIT} rows={7} required disabled={busy} onChange={event => { setSource(event.target.value); setConsent(false); }} placeholder="Paste a notice, brief, quote or the part of a page you want to work with…" />
      <div className="do-example-row"><span>Try with sample text:</span>{EXAMPLES.map((example, index) => <button key={example.title} type="button" disabled={busy} onClick={() => { setSource(example.text); setSourceTitle(example.title); setSourceUrl(''); setBrief(''); setConsent(false); setTask(index === 0 ? 'reply' : index === 1 ? 'brief' : 'compare'); }}>{index === 0 ? 'A message' : index === 1 ? 'School notice' : 'Two quotes'}</button>)}</div>
      <details className="do-source-details"><summary>Add a source label or instructions</summary><label htmlFor="do-source-title">Source label</label><input id="do-source-title" value={sourceTitle} maxLength={160} disabled={busy} onChange={event => { setSourceTitle(event.target.value); setConsent(false); }} placeholder="For example, September supplier quotes" /><label htmlFor="do-source-url">Source link, if useful</label><input id="do-source-url" type="url" value={sourceUrl} maxLength={2_000} disabled={busy} onChange={event => { setSourceUrl(event.target.value); setConsent(false); }} placeholder="https://…" /><p>Links are recorded as references. Paste the text you want used; DO does not open these pages.</p><label htmlFor="do-brief">Anything to focus on?</label><textarea id="do-brief" value={brief} maxLength={DO_BRIEF_LIMIT} rows={3} disabled={busy} onChange={event => { setBrief(event.target.value); setConsent(false); }} placeholder="For example, prepare this for Jamie and flag anything we need to confirm." /></details>
      <label className="do-consent"><input type="checkbox" checked={consent} disabled={busy} onChange={event => setConsent(event.target.checked)} /><span>Use this text for this preparation.<small>{task === 'extract' ? 'assembl will extract exact matches from the text.' : 'The text and instructions go to assembl and its configured model provider.'} Saving a copy on this device is a separate choice.</small></span></label>
      <div className="do-prepare-actions"><button className="do-primary" disabled={busy || !consent || !source.trim()} type="submit">{busy ? <LoaderCircle className="do-spin" size={18} /> : <span className="do-action-mark" aria-hidden><DoMark /></span>}{busy ? 'Preparing your draft…' : DO_TASKS.find(option => option.id === task)!.title}<ArrowUpRight size={18} /></button>{busy && <button type="button" className="do-quiet-button" onClick={() => abort.current?.abort()}>Stop</button>}</div>
      <p className="do-runtime-note">{availability?.note || 'Preparation status is checked when you run a task.'}</p>
    </form>
    {error && <p className="do-error" role="alert">{error}</p>}
    {notice && <p className="do-success" role="status">{notice}</p>}
    {draft && <section ref={resultRef} tabIndex={-1} className="do-prepared" aria-label="Prepared draft">
      <div className="do-result-heading"><span className="do-small-label">{draft.status === 'reviewed' ? 'REVIEW RECORDED' : 'READY FOR YOUR REVIEW'}</span><span>{draft.evidence.method === 'model' ? 'Generated draft' : 'Exact text extraction'}</span></div>
      <h3>{draft.title}</h3><label htmlFor="do-result">Your editable draft</label><textarea id="do-result" value={draft.text} maxLength={20_000} rows={12} onChange={event => { setDraft(editDoDraft(draft, event.target.value)); setNotice(''); }} />
      <div className="do-review-row"><label htmlFor="do-reviewer">Reviewed by<input id="do-reviewer" disabled={draft.status === 'reviewed'} value={reviewer} maxLength={100} onChange={event => setReviewer(event.target.value)} placeholder="Your name or responsible team" /></label><button type="button" className="do-primary" disabled={!reviewer.trim() || !draft.text.trim() || draft.status === 'reviewed'} onClick={() => void review()}><Check size={17} />{draft.status === 'reviewed' ? 'Review recorded' : 'Mark as reviewed'}</button></div>
      <p className="do-review-note">Review confirms this draft is ready for your next step. You remain responsible for sending, submitting or acting on it.</p>
      <div className="do-export-actions"><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(draft.text); setNotice('Draft copied.'); } catch { setError('Copy is unavailable here. Download the draft instead.'); } }}><Copy size={16} />Copy text</button><button type="button" onClick={() => downloadText(`do-${draft.id.slice(0, 8)}.md`, draftAsMarkdown(draft), 'text/markdown;charset=utf-8')}><Download size={16} />Draft + receipt</button><button type="button" onClick={() => downloadText(`do-${draft.id.slice(0, 8)}.json`, JSON.stringify(draft, null, 2), 'application/json')}><Download size={16} />Receipt JSON</button>{!embedded && <button type="button" onClick={save}>Save in this browser</button>}</div>
      <details className="do-evidence"><summary>What DO used and what happened</summary><dl><div><dt>Source</dt><dd>{draft.evidence.sourceTitle} · {draft.evidence.sourceCharacters.toLocaleString()} characters</dd></div><div><dt>Method</dt><dd>{draft.evidence.model || 'Exact text matching; no model'}</dd></div><div><dt>Prepared</dt><dd>{new Date(draft.createdAt).toLocaleString()}</dd></div><div><dt>Boundary</dt><dd>{draft.evidence.boundary}</dd></div><div><dt>Source fingerprint</dt><dd className="do-hash">{draft.evidence.sourceHash}</dd></div></dl><p>The receipt records the original source and output fingerprints. Editing a reviewed draft clears its review.</p></details>
    </section>}
    {!embedded && saved.length > 0 && <section className="do-saved"><div className="do-section-head"><h3>Kept on this device</h3><span>Up to eight drafts · this browser only</span></div>{saved.map(entry => <div className="do-saved-row" key={entry.draft.id}><button onClick={() => openSaved(entry)}><strong>{entry.draft.title}</strong><small>{entry.draft.status === 'reviewed' ? 'Reviewed draft' : 'Draft'} · {new Date(entry.draft.createdAt).toLocaleDateString()}</small></button><button aria-label={`Remove ${entry.draft.title} from this browser`} onClick={() => { try { setSaved(removeLocalDraft(localStorage, entry.draft.id)); setNotice('Saved copy removed from this browser.'); } catch { setError('The saved copy could not be removed.'); } }}><Trash2 size={17} /></button></div>)}</section>}
    {embedded && <a className="do-widget-brand" href="/do" target="_blank" rel="noreferrer">DO by assembl <ArrowUpRight size={14} /></a>}
  </div>;
}
