'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { DoBrand } from '@/components/do/DoBrand';
import { DoPresence } from '@/components/do/DoPresence';
import { createClient } from '@/lib/supabase/client';
import { CONTINUITY_VERSION, CONTINUITY_BOUNDARY, CONTINUITY_RESULT_LIMIT, taskSchema, visibleTask, type PortableTask, type Scope, type Save, type Change } from '@/apps/do/continuity/contract';
import { FixtureRepository } from '@/apps/do/continuity/repository';
import styles from './portable.module.css';

const FIXTURE_KEY = 'assembl:do:continuity:fictional:v1';
const FIXTURE_OWNER = 'fictional-owner';
const now = () => new Date().toISOString();
const labels = { waiting: 'Waiting for you', needs_review: 'Ready to review', cancelled: 'Cancelled', revoked: 'Permission revoked', expired: 'Permission expired' };
function readFixture() {
  const raw = localStorage.getItem(FIXTURE_KEY);
  const rows = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(rows) || rows.length > 2048) throw new Error('Fixture storage is unavailable.');
  const parsed = rows.map(row => taskSchema.parse(row)).filter(t => t.ownerId === FIXTURE_OWNER);
  const timestamp = now();
  const retained = parsed.map(t => visibleTask(t, timestamp));
  if (JSON.stringify(parsed) !== JSON.stringify(retained)) localStorage.setItem(FIXTURE_KEY, JSON.stringify(retained));
  return retained;
}
export function PortableDo({ initialFixture = false, initialScope = 'personal' }: { initialFixture?: boolean; initialScope?: Scope }) {
  const [fixture, setFixture] = useState(initialFixture);
  const [scope, setScope] = useState<Scope>(initialScope);
  const [request, setRequest] = useState('');
  const [notes, setNotes] = useState('');
  const [include, setInclude] = useState(false);
  const [consent, setConsent] = useState(false);
  const [task, setTask] = useState<PortableTask | null>(null);
  const [tasks, setTasks] = useState<PortableTask[]>([]);
  const [result, setResult] = useState('');
  const [message, setMessage] = useState('Checking storage…');
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(true);
  const [owner, setOwner] = useState<string | null>(null);
  const pendingId = useRef('');
  const contextId = useRef('');
  const generation = useRef(0);
  const busyRef = useRef(false);
  const network = useRef<AbortController | null>(null);
  const fixtureRef = useRef(initialFixture);
  const ownerRef = useRef<string | null>(null);
  const clear = useCallback(() => {
    generation.current++;
    network.current?.abort();
    busyRef.current = false;
    setBusy(false); setTask(null); setTasks([]); setResult(''); setRequest(''); setNotes('');
    setInclude(false); setConsent(false); setOwner(null);
    ownerRef.current = null;
    pendingId.current = crypto.randomUUID(); contextId.current = crypto.randomUUID();
  }, []);
  const refresh = useCallback(async (requestedId?: string) => {
    const epoch = ++generation.current;
    network.current?.abort();
    const controller = new AbortController(); network.current = controller;
    try {
      if (fixture) {
        const repo = new FixtureRepository(new Map(readFixture().map(t => [t.id, t])));
        const loaded = await repo.list(FIXTURE_OWNER, scope, now());
        if (epoch !== generation.current) return;
        setTasks(loaded); setOwner(FIXTURE_OWNER);
        const id = requestedId ?? new URLSearchParams(location.search).get('task');
        const reopened = loaded.find(t => t.id === id);
        setTask(reopened || null); setResult(reopened?.result || '');
        setMessage('Fictional fixture · saved only in this browser.');
        return;
      }
      const params = new URLSearchParams({ scope });
      const id = requestedId ?? new URLSearchParams(location.search).get('task'); if (id) params.set('id', id);
      const response = await fetch(`/api/do/continuity?${params}`, { cache: 'no-store', signal: controller.signal });
      const data = await response.json();
      if (epoch !== generation.current) return;
      const verifiedOwner = response.status === 401 ? null : data.workspaceKey || null;
      if (ownerRef.current !== null && ownerRef.current !== verifiedOwner) {
        setRequest(''); setNotes(''); setInclude(false); setConsent(false); setTask(null); setTasks([]); setResult('');
        pendingId.current = crypto.randomUUID(); contextId.current = crypto.randomUUID();
      }
      ownerRef.current = verifiedOwner; setOwner(verifiedOwner);
      if (!response.ok) { setTask(null); setTasks([]); setResult(''); throw new Error(data.message || 'Sign in to reopen private tasks. Cross-device storage is awaiting review.'); }
      if (!data.durable || data.storage !== 'database') throw new Error('Online storage could not be confirmed.');
      const loaded = (data.tasks as unknown[]).map(t => taskSchema.parse(t));
      if (loaded.some(t => t.ownerId !== data.workspaceKey || t.scope !== scope)) throw new Error('Reopen your workspace.');
      const reopened = id ? loaded.find(t => t.id === id) : null;
      setTasks(loaded); setTask(reopened || null); setResult(reopened?.result || '');
      setMessage(id && !loaded.length ? 'That task is no longer available.' : 'Private online storage connected.');
    } catch (error) {
      if (epoch !== generation.current || controller.signal.aborted) return;
      setTask(null); setTasks([]); setResult('');
      setMessage(error instanceof Error ? error.message : 'Storage unavailable. Retry when connected.');
    }
  }, [fixture, scope]);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) void refresh(); });
    return () => { active = false; };
  }, [refresh]);
  useEffect(() => {
    const status = () => setOnline(navigator.onLine);
    status(); window.addEventListener('online', status); window.addEventListener('offline', status);
    let unsubscribe = () => {};
    try {
      const { data } = createClient().auth.onAuthStateChange(event => {
        if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED' || fixtureRef.current) return;
        clear(); void refresh();
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch { /* Missing optional auth configuration is surfaced by the endpoint. */ }
    return () => { window.removeEventListener('online', status); window.removeEventListener('offline', status); unsubscribe(); network.current?.abort(); };
  }, [clear, refresh]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if ((!task && request.trim()) || (task?.status === 'needs_review' && result !== task.result)) {
        event.preventDefault(); event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [task, request, result]);
  async function mutate(input: Save | Change) {
    if (busyRef.current) return;
    if (!online && !fixture) { setMessage('Offline · nothing submitted. Keep this tab open, then retry.'); return; }
    busyRef.current = true; setBusy(true);
    const epoch = generation.current;
    setMessage(input.action === 'save' ? 'Saving…' : input.action === 'prepare' ? 'Preparing your worksheet…' : 'Saving your change…');
    try {
      let saved: PortableTask;
      if (fixture) {
        const rows = readFixture();
        const backing = new Map(rows.map(t => [t.id, t]));
        const repo = new FixtureRepository(backing);
        saved = input.action === 'save' ? await repo.save(FIXTURE_OWNER, input, now()) : await repo.change(FIXTURE_OWNER, input, now());
        if (epoch !== generation.current) return;
        // A failed write never updates UI to a saved state or silently falls back.
        localStorage.setItem(FIXTURE_KEY, JSON.stringify([...backing.values()]));
        setTasks(await repo.list(FIXTURE_OWNER, scope, now()));
      } else {
        const controller = new AbortController(); network.current = controller;
        const response = await fetch('/api/do/continuity', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-DO-Workspace': owner || '' }, body: JSON.stringify(input), signal: controller.signal });
        const data = await response.json();
        if (epoch !== generation.current) return;
        if (response.status === 401 || data.error === 'workspace_changed') { clear(); void refresh(); return; }
        if (!response.ok) throw new Error(data.message || (response.status === 401 ? 'Sign in before saving. Nothing saved online.' : 'Save could not be confirmed.'));
        saved = taskSchema.parse(data.task);
        if (!data.durable || data.storage !== 'database' || data.workspaceKey !== owner || saved.ownerId !== owner || saved.scope !== scope) throw new Error('Save could not be confirmed. Reopen your workspace.');
        setTasks(previous => [...previous.filter(t => t.id !== saved.id), saved]);
      }
      if (epoch !== generation.current) return;
      setTask(saved); setResult(saved.result || ''); setConsent(false);
      const url = new URL(location.href); url.searchParams.set('task', saved.id); url.searchParams.set('scope', scope); history.replaceState(null, '', url);
      setMessage(`${fixture ? 'Saved in this browser only' : 'Saved online'} · ${labels[saved.status].toLowerCase()}.`);
    } catch (error) {
      if (epoch !== generation.current) return;
      setMessage(error instanceof Error && error.name === 'AbortError'
        ? 'Stopped waiting on this device. Reopen to check whether the save finished. No new save confirmed.'
        : `${error instanceof Error ? error.message : 'Transport failed.'} No new save confirmed. Retry uses the same task ID.`);
    } finally { if (epoch === generation.current) { busyRef.current = false; setBusy(false); } }
  }
  function startFixture() {
    const url = new URL(location.href); url.search = ''; url.searchParams.set('fixture', '1'); history.replaceState(null, '', url);
    clear(); fixtureRef.current = true; setFixture(true);
    setRequest('Prepare a follow-up about the fictional school picnic. Ask Sam to confirm the pickup plan.');
    setNotes('Fictional notice: picnic on Friday; pickup time has not been confirmed.');
  }
  function switchScope(value: Scope) {
    clear(); const url = new URL(location.href); url.search = ''; if (fixture) url.searchParams.set('fixture', '1'); url.searchParams.set('scope', value); history.replaceState(null, '', url); setScope(value);
  }
  const stopped = task && ['cancelled', 'revoked', 'expired'].includes(task.status);
  return <main className={styles.root}>
    <header className={styles.header}><DoBrand /><Link href="/do/personal">Personal DO ↗</Link></header>
    <section className={styles.intro}><DoPresence size="small" /><div><p className={styles.eyebrow}>Portable continuity · review prototype</p><h1>Keep the thread.</h1><p>Paste a request. Choose its context. Come back to the same task.</p></div></section>
    <div className={styles.status} role="status" aria-live="polite">{!online && !fixture ? 'Offline · nothing submitted. Keep this tab open to retry.' : message}</div>
    {busy && !fixture && <button onClick={() => network.current?.abort()}>Stop waiting</button>}
    <div className={styles.toolbar}><div role="group" aria-label="Task scope">{(['personal', 'work'] as const).map(value => <button key={value} aria-pressed={scope === value} disabled={busy} onClick={() => switchScope(value)}>{value === 'personal' ? 'Personal' : 'Work'}</button>)}</div>
      {!fixture ? <button onClick={startFixture} disabled={busy}>Try a fictional example</button> : <button onClick={() => { clear(); const url = new URL(location.href); url.search = ''; history.replaceState(null, '', url); fixtureRef.current = false; setFixture(false); }}>Leave fixture</button>}</div>
    {fixture && <p className={styles.notice}>Fictional test data only. This browser’s fixture does not sync to your phone or desktop.</p>}
    <div className={styles.grid}>
      <section className={styles.card}>
        {!task ? <><h2>What needs doing?</h2><label htmlFor="portable-request">Paste your request</label><textarea id="portable-request" value={request} maxLength={4000} onChange={e => { setRequest(e.target.value); setConsent(false); }} placeholder="Prepare my next step…" />
          <label htmlFor="portable-notes">Optional context</label><textarea id="portable-notes" value={notes} maxLength={2000} onChange={e => { setNotes(e.target.value); setInclude(false); setConsent(false); }} placeholder="Only the notes this task needs" />
          <label className={styles.check}><input type="checkbox" checked={include} disabled={!notes.trim()} onChange={e => { setInclude(e.target.checked); setConsent(false); }} />Include these notes in this task</label>
          <div className={styles.bundle}><span>Selected bundle</span><p>{include && notes.trim() ? notes : 'Request only. No saved memory selected.'}</p></div>
          <label className={styles.check}><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />{fixture ? 'Save this fictional fixture in this browser. Permission expires in 24 hours; clear expired content on reopen. No provider transmission.' : 'Save this request and selected notes for seven days. Allow worksheet preparation for 24 hours. No provider transmission.'}</label>
          <button className={styles.primary} disabled={busy || !consent || request.trim().length < 8} onClick={() => void mutate({ action: 'save', id: pendingId.current || (pendingId.current = crypto.randomUUID()), scope, request, context: include && notes.trim() ? [{ id: contextId.current || (contextId.current = crypto.randomUUID()), label: 'My selected notes', text: notes, source: 'user_selected' }] : [], consent: true, consentVersion: CONTINUITY_VERSION })}>Save one task</button>
          <p className={styles.small}>{fixture ? 'Fixture storage stays on this browser.' : 'Online storage is inactive pending schema review. An unsaved request is lost when this tab closes.'}</p>
        </> : <><p className={styles.eyebrow}>{labels[task.status]}</p><h2>Your request</h2><p className={styles.content}>{task.request || 'Retained content has expired.'}</p><div className={styles.bundle}><span>Selected context</span>{task.context.length ? task.context.map(c => <p className={styles.content} key={c.id}>{c.text}</p>) : <p>No selected notes available.</p>}</div>
          <p className={styles.small}>Permission until {new Date(task.consentUntil).toLocaleString('en-NZ')}. Task {task.id.slice(0, 8)} · revision {task.revision}.</p>
          <div className={styles.actions}>{task.status === 'waiting' && <button className={styles.primary} disabled={busy || (!online && !fixture)} onClick={() => void mutate({ action: 'prepare', id: task.id, scope, expectedRevision: task.revision })}>Prepare editable worksheet</button>}
            {!stopped && <><button disabled={busy} onClick={() => void mutate({ action: 'cancel', id: task.id, scope, expectedRevision: task.revision })}>Cancel task</button><button disabled={busy} onClick={() => void mutate({ action: 'revoke', id: task.id, scope, expectedRevision: task.revision })}>Revoke context permission</button></>}
            <button disabled={busy} onClick={() => { clear(); const url = new URL(location.href); url.search = ''; if (fixture) url.searchParams.set('fixture', '1'); url.searchParams.set('scope', scope); history.replaceState(null, '', url); void refresh(); }}>New request</button></div>
        </>}
      </section>
      <section className={styles.card}><h2>{task?.status === 'needs_review' ? 'Make it yours.' : 'The next step, ready to review.'}</h2>
        {task?.status === 'needs_review' ? <><label htmlFor="portable-result">Editable result</label><textarea id="portable-result" className={styles.result} value={result} maxLength={CONTINUITY_RESULT_LIMIT} onChange={e => setResult(e.target.value)} /><button className={styles.primary} disabled={busy || result === task.result} onClick={() => void mutate({ action: 'edit', id: task.id, scope, expectedRevision: task.revision, result })}>Save edited result</button><p className={styles.small}>{result === task.result ? 'Last confirmed revision shown.' : 'Unsaved edits · keep this tab open.'}</p></> : <div className={styles.empty}><DoPresence size="small" /><p>{stopped ? 'This task is stopped. Review a new request to continue.' : 'Save your reviewed request, then prepare an EA worksheet.'}</p></div>}
        <p className={styles.small}>{CONTINUITY_BOUNDARY}</p><div className={styles.saved}><h3>Reopen a task</h3>{tasks.length ? tasks.map(t => <button key={t.id} disabled={busy} onClick={() => { setTask(null); setResult(''); setRequest(''); setNotes(''); setInclude(false); setConsent(false); const url = new URL(location.href); url.searchParams.set('task', t.id); url.searchParams.set('scope', scope); history.replaceState(null, '', url); void refresh(t.id); }}>{t.request.slice(0, 70) || 'Expired task'} <small>{labels[t.status]}</small></button>) : <p>No confirmed tasks in this scope.</p>}<button disabled={busy} onClick={() => void refresh()}>Reopen / retry connection</button><p className={styles.small}>{fixture ? 'Reload proves this browser’s fixture only.' : 'Desktop continuation requires the same signed-in owner and approved online storage.'}</p></div>
      </section>
    </div>
  </main>;
}
