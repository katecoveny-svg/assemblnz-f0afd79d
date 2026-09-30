'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { DoProductFrame } from '@/components/do/DoProductFrame';
import { createClient } from '@/lib/supabase/client';
import { renderAgentEmailText } from '@/lib/agent-email/template';
import type { EnquiryJob } from '@/apps/do/enquiries/contract';
import styles from './enquiries.module.css';

type State = { workspaceKey: string; jobs: EnquiryJob[]; funnel: Record<string, number>; window: string; sendingReady: boolean; sender: string; connection: { created_at: string } | null; workerLastSeen: string | null; pluginEnabled: boolean };
const labels = { pending: 'Ready for review', sending: 'Send in progress · do not retry', sent: 'Accepted by email provider', failed: 'Provider rejected the send', uncertain: 'Result needs checking', cancelled: 'Closed without sending' };
const stamp = (date: string) => new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
export default function Enquiries() {
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState('');
  const [guest, setGuest] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedAt, setLoadedAt] = useState(0);
  const [token, setToken] = useState('');
  const generation = useRef(0);
  const lock = useRef(false);
  const requestId = useRef('');
  const load = useCallback(async () => {
    const current = ++generation.current;
    try {
      const response = await fetch('/api/do/enquiries', { cache: 'no-store' });
      const data = await response.json();
      if (current !== generation.current) return;
      setGuest(response.status === 401);
      if (!response.ok) { setState(null); setError(data.error); return; }
      setState(data); setLoadedAt(Date.now()); setError('');
    } catch { if (current === generation.current) { setState(null); setError('Could not load your enquiries. Please refresh.'); } }
    finally { if (current === generation.current) setLoading(false); }
  }, []);
  const invalidate = useCallback(() => { generation.current++; }, []);
  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    let unsubscribe = () => {};
    try {
      const { data } = createClient().auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          generation.current++; setState(null); setToken(''); requestId.current = ''; void load();
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch { /* API displays missing configuration without exposing private state. */ }
    return () => { window.clearTimeout(initial); invalidate(); unsubscribe(); };
  }, [load, invalidate]);
  async function mutate(input: Record<string, unknown>) {
    if (!state || lock.current) return false;
    lock.current = true; setBusy(true); setError('');
    const current = generation.current;
    try {
      const response = await fetch('/api/do/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-DO-Workspace': state.workspaceKey }, body: JSON.stringify(input) });
      const data = await response.json();
      if (current !== generation.current) return false;
      if (!response.ok) throw new Error(data.error);
      if (data.token) setToken(data.token);
      if (input.action === 'disconnect') setToken('');
      await load(); return true;
    } catch (cause) { if (current === generation.current) setError(cause instanceof Error ? cause.message : 'The result is unclear. Refresh before continuing.'); return false; }
    finally { lock.current = false; setBusy(false); }
  }
  async function receive(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
    if (!requestId.current) requestId.current = crypto.randomUUID();
    if (await mutate({ action: 'receive', requestId: requestId.current, name: data.get('name'), email: data.get('email'), message: data.get('message') })) { requestId.current = ''; form.reset(); }
  }
  const workerFresh = state?.workerLastSeen && loadedAt - Date.parse(state.workerLastSeen) < 90 * 60_000;
  return <DoProductFrame product="enquiries"><div className={styles.workspace}>
    <section className={styles.hero}><p className={styles.eyebrow}>LESS ADMIN. MORE MAHI.</p><h1>A good enquiry.<br /><span>A useful next step.</span></h1><p>Prepare the reply. Make the call. See what happened.</p><span className={styles.badge}>Private assembl pilot</span></section>
    {loading && <p role="status">Opening your enquiries…</p>}
    {error && <p role="alert" className={styles.notice}>{error.replaceAll('_', ' ')}</p>}
    {guest && <section className={styles.panel}><h2>Your work stays with you.</h2><p>Sign in with your assembl founder account to open the pilot.</p><Link className={styles.primary} href="/login?redirect=%2Fdo%2Fenquiries">Sign in to continue</Link></section>}
    {state && <>
      <section aria-label="Enquiry funnel" className={styles.funnel}>{Object.entries(state.funnel).map(([name, count]) => <div key={name}><strong>{count}</strong><span>{name === 'sent' ? 'Sent · provider accepted' : name}</span></div>)}</section>
      <p className={styles.meta}>{state.window}. Reply and booking counts include explicitly recorded outcomes.</p>
      <div className={styles.layout}>
        <section className={styles.panel}><p className={styles.eyebrow}>01 / RECEIVE</p><h2>What came in?</h2><p>Add a real enquiry. DO prepares a starter reply for you to edit.</p>
          <form onSubmit={receive} onChange={() => { requestId.current = ''; }} className={styles.form}>
            <label>Name<input name="name" required maxLength={100} autoComplete="name" /></label>
            <label>Reply to<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
            <label>The enquiry<textarea name="message" required minLength={3} maxLength={4000} rows={5} /></label>
            <button className={styles.primary} disabled={busy}>Prepare a reply</button>
          </form>
        </section>
        <section className={styles.queue}><div className={styles.queueHeading}><div><p className={styles.eyebrow}>02 / REVIEW & DO</p><h2>Your enquiries</h2></div><button disabled={busy} onClick={() => void load()}>Refresh</button></div>
          {!state.jobs.length && <div className={styles.empty}><span aria-hidden="true">✦</span><h3>Room for the first one.</h3><p>Your reply, approval and evidence will stay together here.</p></div>}
          {state.jobs.map(job => <Job key={`${state.workspaceKey}:${job.id}:${job.revision}`} job={job} busy={busy} sendingReady={state.sendingReady} mutate={mutate} />)}
        </section>
      </div>
      <section className={styles.panel}><p className={styles.eyebrow}>03 / KEEP THINGS MOVING</p><h2>Enquiries can arrive here automatically.</h2><p>Connect a form or booking system using a private event key. New enquiries prepare a reply; recorded replies and bookings stop pending follow-ups.</p>
        <p className={styles.meta}>Follow-ups become drafts after three days without a recorded outcome. Each needs your approval. {workerFresh ? `Worker last checked in ${stamp(state.workerLastSeen!)}.` : 'Scheduled work is not verified: the worker heartbeat is missing or stale.'}</p>
        <button disabled={busy} onClick={() => void mutate({ action: 'check_followups' })}>Check for due follow-ups now</button>
        <details><summary>Connect events and the assembl plugin</summary><div className={styles.form}>
          <p>Send events from your server to <code>https://www.assembl.co.nz/api/do/enquiries/events</code>. Keep the key out of public forms and browser code.</p>
          <div className={styles.actions}><button disabled={busy} onClick={() => void mutate({ action: 'connect' })}>{state.connection ? 'Replace event key' : 'Create event key'}</button>{state.connection && <button disabled={busy} onClick={() => void mutate({ action: 'disconnect' })}>Revoke connection</button>}</div>
          {token && <label>Save this key now. Replacing it stops the previous connection.<textarea readOnly value={token} rows={3} onFocus={e => e.currentTarget.select()} /></label>}
          <p>The authenticated plugin endpoint is <code>https://www.assembl.co.nz/api/mcp</code>. It can prepare work and read status and evidence. Sending is approved on this page.</p>
          <p>{state.pluginEnabled ? 'Plugin access is enabled for your account. Complete sign-in and consent in ChatGPT to connect it.' : 'Plugin access is off for your account.'}</p>
          <button disabled={busy} onClick={() => void mutate({ action: state.pluginEnabled ? 'disable_plugin' : 'enable_plugin' })}>{state.pluginEnabled ? 'Revoke enquiry plugin access' : 'Enable enquiry plugin access'}</button>
          <Link href="/docs/mcp">Connection guide</Link>
        </div></details>
      </section>
    </>}
  </div></DoProductFrame>;
}
function Job({ job, busy, sendingReady, mutate }: { job: EnquiryJob; busy: boolean; sendingReady: boolean; mutate: (input: Record<string, unknown>) => Promise<boolean> }) {
  const [subject, setSubject] = useState(job.subject);
  const [body, setBody] = useState(job.body);
  const [confirm, setConfirm] = useState(false);
  const [evidence, setEvidence] = useState('');
  const dirty = subject !== job.subject || body !== job.body;
  return <article className={styles.job} id={`job-${job.id}`}>
    <p className={styles.eyebrow}>{job.parent_id ? 'FOLLOW-UP · FRESH APPROVAL NEEDED' : labels[job.status]}</p><h3>{job.name}</h3><p className={styles.meta}>{job.email} · {stamp(job.received_at)}</p>
    <details><summary>Original enquiry</summary><p className={styles.message}>{job.message}</p></details>
    {job.status === 'pending' ? <div className={styles.form}>
      <label>Subject<input value={subject} maxLength={200} onChange={e => { setSubject(e.target.value); setConfirm(false); }} /></label>
      <label>Your reply<textarea aria-label="Your reply" rows={7} value={body} maxLength={5000} onChange={e => { setBody(e.target.value); setConfirm(false); }} /></label>
      <p className={styles.meta}>From front@assembl.co.nz · To {job.email}</p>
      <details><summary>Preview the full email text</summary><pre className={styles.message}>{renderAgentEmailText({ agentName: 'assembl', agentEmail: 'front@assembl.co.nz', body })}</pre></details>
      {dirty ? <button disabled={busy || !subject.trim() || !body.trim()} onClick={() => void mutate({ action: 'edit', id: job.id, revision: job.revision, subject, body })}>Save changes for review</button>
        : <><label className={styles.check}><input type="checkbox" checked={confirm} onChange={e => setConfirm(e.target.checked)} />I have checked the recipient and this reply. Send it now.</label><button className={styles.primary} disabled={busy || !confirm || !sendingReady} onClick={() => { setConfirm(false); void mutate({ action: 'approve', id: job.id, revision: job.revision, confirmSend: true }); }}>Approve & send email</button></>}
      {!sendingReady && <p className={styles.meta}>The email service needs configuration before sending.</p>}
      <button disabled={busy} onClick={() => void mutate({ action: 'cancel', id: job.id })}>Close without sending</button>
    </div> : <p>{labels[job.status]}. {job.provider_id && <>Receipt: <code>{job.provider_id}</code></>}</p>}
    {job.status === 'sent' && <div className={styles.form}><p className={styles.meta}>Provider acceptance does not confirm inbox delivery. Record the next outcome when you have evidence.</p><label>What confirms the outcome?<input value={evidence} maxLength={1200} onChange={e => setEvidence(e.target.value)} placeholder="Reply received, or booking reference and date" /></label><div className={styles.actions}><button disabled={busy || evidence.trim().length < 3 || !!job.answered_at} onClick={() => void mutate({ action: 'answered', id: job.id, evidence })}>{job.answered_at ? 'Reply recorded' : 'Record reply'}</button><button disabled={busy || evidence.trim().length < 3 || !!job.booked_at} onClick={() => void mutate({ action: 'booked', id: job.id, evidence })}>{job.booked_at ? 'Booking recorded' : 'Record booking'}</button></div></div>}
    <details className={styles.evidence}><summary>Evidence · {job.evidence.length} events</summary><ol>{job.evidence.map((event, i) => <li key={i}><strong>{event.kind.replaceAll('_', ' ')}</strong><span>{stamp(event.at)} · {event.source}</span>{event.detail && <p>{event.detail}</p>}</li>)}</ol></details>
  </article>;
}
