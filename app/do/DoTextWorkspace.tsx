'use client';

import { useNativeReview } from '@/apps/do/shared/use-native-review';
import { DO_TEXT_PROVIDER_CONSENT_VERSION } from '@/apps/do/shared/provider-consent';
import { DoShareButton } from '@/components/do/DoShareButton';
import { DoMark } from './DoAppearance';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { doReturnPath } from '@/lib/do/navigation';
const subscribeLocation = () => () => {};
const currentSearch = () => window.location.search;
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

type RuntimeStatus = { availability?: DoAvailability; signedIn?: boolean; trial?: { remaining?: number } };
async function readRuntime(signal?: AbortSignal): Promise<RuntimeStatus> {
  const response = await fetch('/api/do/runtime', { cache: 'no-store', signal });
  if (!response.ok) throw new Error('Connection status is unavailable. Your text is still here.');
  return response.json();
}

export function DoTextWorkspace({ initialBrief = '', initialTask = 'reply', embedded = false, onSettled, focus = false, offeredContext, onSourceChange, onNativeReveal }: { initialBrief?: string; initialTask?: DoTask; embedded?: boolean; onSettled?: () => void; focus?: boolean; offeredContext?: { text: string; id: number }; onSourceChange?: (value: string) => void; onNativeReveal?: () => void }) {
  const [task, setTask] = useState<DoTask>(initialTask);
  const [source, setSourceState] = useState(initialBrief);
  const editorRevision = useRef(0);
  const setSource = useCallback((value: string) => { editorRevision.current++; setSourceState(value); }, []);
  const [brief, setBrief] = useState(initialBrief.slice(0, DO_BRIEF_LIMIT));
  const [sourceTitle, setSourceTitle] = useState(initialBrief ? 'Your instruction' : '');
  const [sourceUrl, setSourceUrl] = useState('');
  const [consent, setConsent] = useState(false);
  const [availability, setAvailability] = useState<DoAvailability | null>(null);
  const [needsSignIn, setNeedsSignIn] = useState(true);
  const pathname = usePathname();
  const query = useSyncExternalStore(subscribeLocation, currentSearch, () => "");
  const nativeOrigin = new URLSearchParams(query).get('nativeReview') === '1' && focus;
  const isNativeDocument = () => typeof window !== 'undefined' && focus && new URLSearchParams(location.search).get('nativeReview') === '1';
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
  const currentDraft = useRef(draft);
  const reviewGeneration = useRef(0);
  useLayoutEffect(() => { currentDraft.current = draft; });
  useEffect(() => () => { reviewGeneration.current++; }, []);

  const nativeReview = useNativeReview({
    enabled: nativeOrigin,
    source,
    occupied: Boolean(source.trim() || brief.trim() || draft || busy),
    revision: editorRevision,
    onReveal: onNativeReveal,
    onCommit: text => {
      abort.current?.abort(); setBusy(false); setSource(text); setBrief(''); setSourceTitle('Reviewed app text');
      setSourceUrl(''); setConsent(false); setDraft(null); setSaved([]);
      setNotice('Added to this editor for review. This session is not saved or synced.');
    },
    onUnavailable: () => {
      reviewGeneration.current++;
      abort.current?.abort(); setBusy(false); setConsent(false);
      setNotice('Recipient could not be checked. Your work is still here; reconnect and confirm before preparing.');
    },
    onReset: () => {
      reviewGeneration.current++; currentDraft.current = null;
      abort.current?.abort(); setBusy(false); setSource(''); setBrief(''); setSourceTitle(''); setSourceUrl('');
      setConsent(false); setDraft(null); setSaved([]); setNeedsSignIn(true); setError(''); setSourceForDraft(''); setBriefForDraft(''); setReviewer('');
      onNativeReveal?.(); setNotice('Recipient changed or became unavailable. Review context cleared.');
    },
  });

  const applyRuntime = useCallback((data: RuntimeStatus) => {
    setAvailability(data.availability || null);
    setNeedsSignIn(data.signedIn !== true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void readRuntime(AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)])).then(applyRuntime).catch(() => {});
    const restore = requestAnimationFrame(() => {
      try { if (!embedded && !(focus && new URLSearchParams(location.search).get('nativeReview') === '1')) setSaved(readLocalDrafts(localStorage)); } catch { /* Storage is optional. */ }
    });
    return () => { cancelAnimationFrame(restore); controller.abort(); abort.current?.abort(); };
  }, [embedded, focus, applyRuntime]);

  useEffect(() => { onSourceChange?.(source); }, [source, onSourceChange]);
  useEffect(() => {
    if (!offeredContext) return;
    const frame = requestAnimationFrame(() => {
      abort.current?.abort();
      setSource(offeredContext.text.slice(0, DO_SOURCE_LIMIT)); setSourceTitle('Reviewed DO context');
      setSourceUrl(''); setConsent(false); setDraft(null); setNotice('Context added. Review it before preparing.');
    });
    return () => cancelAnimationFrame(frame);
  }, [offeredContext, setSource]);

  // A parent embed or same-window extension handoff can offer context for review only.
  useEffect(() => {
    // Native-v1 accepts only the bound Promise receiver, never the legacy handoff.
    if (focus && new URLSearchParams(location.search).get('nativeReview') === '1') return;
    const receive = (event: MessageEvent) => {
      if (embedded ? event.source !== window.parent : event.source !== window || event.origin !== location.origin) return;
      if (event.data?.type === 'assembl-do:hello') { window.parent.postMessage({ type: 'assembl-do:ready' }, '*'); return; }
      if (event.data?.type !== 'assembl-do:context') return;
      if (typeof event.data.text !== 'string') return;
      abort.current?.abort(); setDraft(null);
      setSource(event.data.text.slice(0, DO_SOURCE_LIMIT));
      setSourceTitle(typeof event.data.title === 'string' ? event.data.title.slice(0, 160) : 'Shared context');
      setSourceUrl(typeof event.data.url === 'string' ? cleanSourceUrl(event.data.url) : '');
      setConsent(false); setNotice('Context added. Review the text, then choose whether to prepare it.');
      if (typeof event.data.contextId === 'string' && event.data.contextId.length <= 80) {
        window.parent.postMessage({ type: 'assembl-do:context-received', contextId: event.data.contextId }, event.origin === 'null' ? '*' : event.origin);
      }
    };
    window.addEventListener('message', receive);
    window.parent.postMessage({ type: 'assembl-do:ready' }, '*');
    return () => window.removeEventListener('message', receive);
  }, [embedded, focus, setSource]);

  async function prepare(event: React.FormEvent) {
    event.preventDefault();
    if (!consent || !source.trim() || busy || (task !== 'extract' && needsSignIn)) return;
    const revision = editorRevision.current;
    const generation = reviewGeneration.current;
    setBusy(true); setError(''); setNotice('');
    const controller = new AbortController(); abort.current = controller;
    let expectedOwner: string | null = null;
    try {
      expectedOwner = isNativeDocument() ? await nativeReview.bindRecipient() : null;
      if (controller.signal.aborted || revision !== editorRevision.current || generation !== reviewGeneration.current) return;
      if (isNativeDocument() && !expectedOwner) throw new Error('Check this app’s signed-in recipient before preparing.');
      const response = await fetch('/api/do/prepare', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ ...(expectedOwner ? { nativeExpectedOwner: expectedOwner } : {}), task, source, brief, sourceTitle: sourceTitle || 'Pasted text', sourceUrl, consent, providerConsentVersion: DO_TEXT_PROVIDER_CONSENT_VERSION }),
      });
      const data = await response.json();
      if (controller.signal.aborted || (expectedOwner && nativeReview.owner.current !== expectedOwner)) return;
      if (!response.ok || !data.draft) {
        if (data.error === 'sign_in_required') setNeedsSignIn(true);
        throw new Error(data.message || 'DO could not finish this preparation.');
      }
      setDraft(data.draft); setReviewer(''); setSourceForDraft(source.trim()); setBriefForDraft(brief.trim());
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch (cause) {
      if (expectedOwner && nativeReview.owner.current !== expectedOwner) return;
      setError(cause instanceof Error && cause.name === 'AbortError' ? 'Preparation stopped. Your text is still here.' : cause instanceof Error ? cause.message : 'Preparation failed. Your text is still here.');
    } finally { if (abort.current === controller) { setBusy(false); abort.current = null; onSettled?.(); } }
  }

  async function review() {
    if (!draft || !reviewer.trim()) return;
    const reviewedDraft = draft;
    const generation = reviewGeneration.current;
    const expectedOwner = nativeReview.owner.current;
    const revision = editorRevision.current;
    const reviewedBy = reviewer.trim();
    try {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(reviewedDraft.text));
      if (generation !== reviewGeneration.current || currentDraft.current !== reviewedDraft || revision !== editorRevision.current || nativeReview.owner.current !== expectedOwner) return;
      const reviewedTextHash = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
      setDraft({ ...reviewedDraft, status: 'reviewed', reviewer: reviewedBy, reviewedAt: new Date().toISOString(), reviewedTextHash });
      setNotice('Review recorded in this draft. You can now copy or download it for your next step.');
    } catch { if (generation === reviewGeneration.current && currentDraft.current === reviewedDraft) setError('The review could not be recorded in this browser. You can still download the draft.'); }
  }

  function save() {
    if (!draft) return;
    if (isNativeDocument()) { setError('This app review session is transient. Download a copy instead.'); return; }
    try {
      setSaved(saveLocalDraft(localStorage, { draft, source: sourceForDraft, brief: briefForDraft }));
      setNotice('Saved in this browser. The text will remain on this device until you remove it.');
    } catch { setError('This browser could not save the draft. Download a copy instead.'); }
  }

  function openSaved(entry: SavedDoDraft) {
    if (isNativeDocument()) return;
    setDraft(entry.draft); setTask(entry.draft.task); setSource(entry.source); setBrief(entry.brief);
    setSourceForDraft(entry.source); setBriefForDraft(entry.brief);
    setSourceTitle(entry.draft.evidence.sourceTitle); setSourceUrl(entry.draft.evidence.sourceUrl);
    setReviewer(entry.draft.reviewer || ''); setConsent(false); setNotice('Saved draft opened.');
  }

  return <div className={`do-workspace ${embedded ? 'do-workspace-embedded' : ''}`}>
    <div className="do-workspace-intro"><span className="do-small-label">WRITING & TASK PREPARATION</span><h2>What do you want to DO?</h2><p>Choose an agent. Add your text. Get work you can edit, copy and use.</p></div>
    <form onSubmit={prepare} className="do-preparation-form">
      {focus ? <label className="do-focus-task">What should DO prepare?<select aria-label="Task" value={task} disabled={busy} onChange={e => { editorRevision.current++; setTask(e.target.value as DoTask); setConsent(false); }}>{DO_TASKS.map(option => <option value={option.id} key={option.id}>{option.title}</option>)}</select></label> : <fieldset className="do-task-picker" disabled={busy}><legend>Choose your agent</legend>{DO_TASKS.map(option => <label key={option.id} className={task === option.id ? 'is-selected' : ''}><input type="radio" name="do-task" value={option.id} checked={task === option.id} onChange={() => { editorRevision.current++; setTask(option.id); setConsent(false); }} /><span className="do-task-glyph" aria-hidden>{option.glyph}</span><span><strong>{option.title}</strong><small>{option.description}</small></span></label>)}</fieldset>}
      <div className="do-field-head"><label htmlFor="do-source">Text DO can use</label><span>{source.length.toLocaleString()} / 12,000</span></div>
      <textarea id="do-source" value={source} maxLength={DO_SOURCE_LIMIT} rows={7} required disabled={busy} onChange={event => { setSource(event.target.value); setConsent(false); }} placeholder="Paste a notice, brief, quote or the part of a page you want to work with…" />
      {!focus && <div className="do-example-row"><span>Try with sample text:</span>{EXAMPLES.map((example, index) => <button key={example.title} type="button" disabled={busy} onClick={() => { setSource(example.text); setSourceTitle(example.title); setSourceUrl(''); setBrief(''); setConsent(false); setTask(index === 0 ? 'reply' : index === 1 ? 'brief' : 'compare'); }}>{index === 0 ? 'A message' : index === 1 ? 'School notice' : 'Two quotes'}</button>)}</div>}
      <details className="do-source-details"><summary>Add a source label or instructions</summary><label htmlFor="do-source-title">Source label</label><input id="do-source-title" value={sourceTitle} maxLength={160} disabled={busy} onChange={event => { editorRevision.current++; setSourceTitle(event.target.value); setConsent(false); }} placeholder="For example, September supplier quotes" /><label htmlFor="do-source-url">Source link, if useful</label><input id="do-source-url" type="url" value={sourceUrl} maxLength={2_000} disabled={busy} onChange={event => { editorRevision.current++; setSourceUrl(event.target.value); setConsent(false); }} placeholder="https://…" /><p>Links are recorded as references. Paste the text you want used; DO does not open these pages.</p><label htmlFor="do-brief">Anything to focus on?</label><textarea id="do-brief" value={brief} maxLength={DO_BRIEF_LIMIT} rows={3} disabled={busy} onChange={event => { editorRevision.current++; setBrief(event.target.value); setConsent(false); }} placeholder="For example, prepare this for Jamie and flag anything we need to confirm." /></details>
      <label className="do-consent"><input type="checkbox" checked={consent} disabled={busy} onChange={event => { editorRevision.current++; setConsent(event.target.checked); }} /><span>Use this text for this preparation.<small>{task === 'extract' ? 'assembl will extract exact matches from the text.' : 'The text and instructions go to OpenAI (GPT-6 Astra) and TypeSafe after this confirmation.'} {nativeOrigin ? 'This app review session is not saved or synced.' : 'Saving a copy on this device is a separate choice.'}</small></span></label>
      <div className="do-prepare-actions"><button className="do-primary" disabled={busy || (task !== 'extract' && needsSignIn) || !consent || !source.trim() || (task !== 'extract' && availability?.preparation === 'unavailable')} type="submit">{busy ? <LoaderCircle className="do-spin" size={18} /> : <span className="do-action-mark" aria-hidden><DoMark /></span>}{busy ? 'Preparing your draft…' : DO_TASKS.find(option => option.id === task)!.title}<ArrowUpRight size={18} /></button>{busy && <button type="button" className="do-quiet-button" onClick={() => abort.current?.abort()}>Stop</button>}</div>
      <p className="do-runtime-note">{availability?.note || 'Preparation status is checked when you run a task.'}</p>
    </form>
    {task !== 'extract' && needsSignIn && <p className="do-error" role="status">Model preparation needs your signed-in account and configured access. Exact extraction needs no model or subscription. <a href={`/login?redirect=${encodeURIComponent(nativeOrigin ? '/do/widget?nativeReview=1' : doReturnPath(pathname || '/do/widget', query))}`} target={nativeOrigin ? undefined : '_blank'} rel="noopener noreferrer">{nativeOrigin ? 'Sign in in this app' : 'Sign in in a new tab'}</a>, then return here. Your text stays on this page. <button type="button" className="do-quiet-button" onClick={() => void readRuntime(AbortSignal.timeout(10_000)).then(applyRuntime).then(() => setError('')).catch(cause => setError(cause instanceof Error ? cause.message : 'Connection could not be checked.'))}>Check connection</button></p>}
    {error && <p className="do-error" role="alert">{error}</p>}
    {notice && <p className="do-success" role="status">{notice}</p>}
    {draft && <section ref={resultRef} tabIndex={-1} className="do-prepared" aria-label="Prepared draft">
      <div className="do-result-heading"><span className="do-small-label">{draft.status === 'reviewed' ? 'REVIEW RECORDED' : 'READY FOR YOUR REVIEW'}</span><span>{draft.evidence.method === 'model' ? 'Generated draft' : 'Exact text extraction'}</span></div>
      <h3>{draft.title}</h3><label htmlFor="do-result">Your editable draft</label><textarea id="do-result" value={draft.text} maxLength={20_000} rows={12} onChange={event => { setDraft(editDoDraft(draft, event.target.value)); setNotice(''); }} />
      <div className="do-review-row"><label htmlFor="do-reviewer">Reviewed by<input id="do-reviewer" disabled={draft.status === 'reviewed'} value={reviewer} maxLength={100} onChange={event => setReviewer(event.target.value)} placeholder="Your name or responsible team" /></label><button type="button" className="do-primary" disabled={!reviewer.trim() || !draft.text.trim() || draft.status === 'reviewed'} onClick={() => void review()}><Check size={17} />{draft.status === 'reviewed' ? 'Review recorded' : 'Mark as reviewed'}</button></div>
      <p className="do-review-note">Review confirms this draft is ready for your next step. You remain responsible for sending, submitting or acting on it.</p>
      <div className="do-export-actions"><DoShareButton label="Share draft" disabled={draft.status !== 'reviewed'} content={{ title: draft.title, text: draft.text, filename: 'do-draft.txt' }} /><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(draft.text); setNotice('Draft copied.'); } catch { setError('Copy is unavailable here. Download the draft instead.'); } }}><Copy size={16} />Copy text</button><button type="button" onClick={() => downloadText(`do-${draft.id.slice(0, 8)}.md`, draftAsMarkdown(draft), 'text/markdown;charset=utf-8')}><Download size={16} />Draft + receipt</button><button type="button" onClick={() => downloadText(`do-${draft.id.slice(0, 8)}.json`, JSON.stringify(draft, null, 2), 'application/json')}><Download size={16} />Receipt JSON</button>{!embedded && !nativeOrigin && <button type="button" onClick={save}>Save in this browser</button>}</div>
      <details className="do-evidence"><summary>What DO used and what happened</summary><dl><div><dt>Source</dt><dd>{draft.evidence.sourceTitle} · {draft.evidence.sourceCharacters.toLocaleString()} characters</dd></div><div><dt>Method</dt><dd>{draft.evidence.model || 'Exact text matching; no model'}</dd></div><div><dt>Prepared</dt><dd>{new Date(draft.createdAt).toLocaleString()}</dd></div><div><dt>Boundary</dt><dd>{draft.evidence.boundary}</dd></div><div><dt>Source fingerprint</dt><dd className="do-hash">{draft.evidence.sourceHash}</dd></div></dl><p>The receipt records the original source and output fingerprints. Editing a reviewed draft clears its review.</p></details>
    </section>}
    {!embedded && !nativeOrigin && saved.length > 0 && <section className="do-saved"><div className="do-section-head"><h3>Kept on this device</h3><span>Up to eight drafts · this browser only</span></div>{saved.map(entry => <div className="do-saved-row" key={entry.draft.id}><button onClick={() => openSaved(entry)}><strong>{entry.draft.title}</strong><small>{entry.draft.status === 'reviewed' ? 'Reviewed draft' : 'Draft'} · {new Date(entry.draft.createdAt).toLocaleDateString()}</small></button><button aria-label={`Remove ${entry.draft.title} from this browser`} onClick={() => { try { setSaved(removeLocalDraft(localStorage, entry.draft.id)); setNotice('Saved copy removed from this browser.'); } catch { setError('The saved copy could not be removed.'); } }}><Trash2 size={17} /></button></div>)}</section>}
    {embedded && <a className="do-widget-brand" href="/do" target="_blank" rel="noreferrer">DO by assembl <ArrowUpRight size={14} /></a>}
  </div>;
}
