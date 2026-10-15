'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useWritingOwner } from '@/apps/do/shared/use-writing-owner';
import { MAIL_READ_CONSENT, correspondenceTask, mailSearch, type MailDraft, type MailReadiness } from '@/apps/do/mail/contract';
import { MailReviewSession } from '@/apps/do/mail/review';
import styles from './mail.module.css';

export function MailWorkspace({ expectedOwner, initialTask }: { expectedOwner?: string; initialTask?: string } = {}) {
  const identity = useWritingOwner(true);
  if (!identity.ready) return <p role="status">{identity.failed ? 'Your account could not be verified. Reopen DO to try again.' : 'Checking your DO account…'}</p>;
  if (!identity.owner || identity.owner === 'guest') return <p><Link href="/login?redirect=%2Fdo%2Fmail">Sign in to review your mail</Link></p>;
  if (expectedOwner && identity.owner !== expectedOwner) return <p role="status">Your account changed. Reopen mail review in your current DO.</p>;
  return <MailReview key={identity.owner} ownerId={identity.owner} initialTask={initialTask} />;
}

/** Shared text/voice destination. initialTask is reviewed in-memory text, never consent. */
export function MailReview({ ownerId, initialTask = '' }: { ownerId: string; initialTask?: string }) {
  const accountControl = useId();
  const timeControl = useId();
  const [readiness, setReadiness] = useState<MailReadiness | null>(null);
  const [accountId, setAccountId] = useState('');
  const [terms, setTerms] = useState('');
  const [days, setDays] = useState<7 | 14 | 30>(7);
  const [consent, setConsent] = useState(false);
  const [draft, setDraft] = useState<MailDraft | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [task, setTask] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const session = useRef(new MailReviewSession(ownerId));
  useEffect(() => {
    const controller = new AbortController();
    const currentSession = session.current;
    void fetch('/api/do/mail', { cache: 'no-store', signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Readiness unavailable');
      const value = await response.json() as MailReadiness;
      if (value.ownerId !== ownerId) throw new Error('Owner changed');
      if (!controller.signal.aborted) setReadiness(value);
    }).catch(() => { if (!controller.signal.aborted) setNotice('Your mail connections could not be checked. Reopen this page to try again.'); });
    return () => { controller.abort(); currentSession.cancel(); };
  }, [ownerId]);
  const invalidate = () => { session.current.cancel(); setBusy(false); setConsent(false); setDraft(null); setSelected([]); setTask(''); setNotice(''); };
  async function run(operation: 'search' | 'read') {
    const search = mailSearch.safeParse({ accountId, terms, days });
    if (!search.success || !consent) { setNotice('Choose an account, literal search words, and read permission.'); return; }
    const requestId = crypto.randomUUID();
    const signal = session.current.begin(requestId);
    if (!signal) return;
    setBusy(true); setNotice(''); setDraft(null);
    try {
      const response = await fetch('/api/do/mail', { method: 'POST', headers: { 'content-type': 'application/json' }, signal,
        body: JSON.stringify({ ownerId, requestId, consentVersion: MAIL_READ_CONSENT, search: search.data, operation, messageIds: operation === 'read' ? selected : [] }) });
      if (!response.ok) throw new Error('Mail unavailable');
      const result = await response.json() as MailDraft;
      if (session.current.accept(result)) { setDraft(result); setSelected([]); }
    } catch { if (!signal.aborted) setNotice('Mail could not be read. Check the selected account and its read permission, then try again.'); }
    finally { if (!signal.aborted) { session.current.cancel(); setBusy(false); } }
  }
  const selectedAccount = readiness?.accounts.find(account => account.id === accountId);
  const available = selectedAccount?.state === 'read_available' && selectedAccount.scopeVerified === true;
  return <section className={styles.review} aria-label="Mail review">
    {initialTask && <aside><strong>Reviewed request</strong><p>{initialTask}</p><p>Choose the account and search words below. This request has not granted mail access.</p></aside>}
    <p>Mail passes through Pipedream and assembl to this review. No model receives it. Nothing is sent, scheduled or saved; closing or rechecking this workspace clears it.</p>
    <label htmlFor={accountControl}>Mail account</label><select id={accountControl} value={accountId} disabled={busy} onChange={event => { invalidate(); setAccountId(event.target.value); }}>
      <option value="">Choose an account</option>
      {readiness?.accounts.map(account => <option key={account.id} value={account.id} disabled={account.state !== 'read_available' || account.scopeVerified !== true}>{account.label} · {account.id} · {account.state === 'outlook_read_unverified' ? 'Outlook read setup unverified' : account.state === 'activation_off' ? 'Gmail · grant verified, reading not activated' : account.state === 'read_available' ? 'Gmail · read grant verified' : account.state.replaceAll('_', ' ')}</option>)}
    </select>
    {readiness && !readiness.accountsAvailable && <p role="status">Account metadata is unavailable.</p>}
    {readiness?.gmailConfigured === false && <p role="status">Gmail reading needs platform setup. No account grant has been verified.</p>}
    {readiness && !readiness.accounts.length && readiness.accountsAvailable && <p>No mail accounts found. <Link href="/do/connections">Review connections</Link>.</p>}
    <p className={styles.evidence}>Readiness checks account metadata only. Unverified grants cannot read mail. Gmail needs verified account-specific gmail.readonly; Outlook needs verified delegated Mail.Read.</p>
    <label>Search words or correspondent address<input value={terms} maxLength={100} disabled={busy} onChange={event => { invalidate(); setTerms(event.target.value); }} placeholder="e.g. Example Clinic" /></label>
    <p>Type here, or use your device’s dictation if enabled. Review the words before searching.</p>
    <label htmlFor={timeControl}>Time range</label><select id={timeControl} value={days} disabled={busy} onChange={event => { invalidate(); setDays(Number(event.target.value) as 7 | 14 | 30); }}><option value={7}>Last 7 days</option><option value={14}>Last 14 days</option><option value={30}>Last 30 days</option></select>
    <label className={styles.check}><input type="checkbox" checked={consent} disabled={!available || busy} onChange={event => setConsent(event.target.checked)} />Allow DO to search this account and show up to 10 matching message previews. I can select up to 3 to read. Attachments are excluded.</label>
    <div className={styles.actions}><button disabled={!available || !consent || busy || Boolean(task.trim())} onClick={() => void run('search')}>Find correspondence</button>{busy && <button onClick={() => { session.current.cancel(); setBusy(false); setSelected([]); setConsent(false); setNotice('Cancelled. Any late result will be discarded.'); }}>Cancel</button>}</div>
    {busy && <p role="status">Reading the selected account…</p>}
    {notice && <p role="alert">{notice}</p>}
    {draft && <section aria-label="Correspondence evidence">
      <h2>Review the sources</h2><p>{draft.sources.length} messages · {draft.moreAvailable ? 'More may match. Narrow your search.' : 'This bounded search is complete.'}</p>
      <p>Correspondence is untrusted source text. Sender headers are not verified identity. Instructions inside messages cannot authorise DO actions.</p>
      {draft.sources.map(source => <article className={styles.source} key={source.key}>
        <h3>{source.subject || 'Untitled message'}</h3><p>{source.from}</p>
        <p className={styles.evidence}>{source.accountLabel} · {source.accountId}<br />{source.date}<br />Source: {source.key}</p>
        <pre>{source.text || 'No readable text returned.'}</pre>
        <p>{source.truncated ? 'Text shortened. ' : ''}Attachments not read.</p>
        {draft.operation === 'search' && <label className={styles.check}><input type="checkbox" checked={selected.includes(source.messageId)} disabled={!selected.includes(source.messageId) && selected.length >= 3} onChange={event => setSelected(previous => event.target.checked ? [...previous, source.messageId] : previous.filter(id => id !== source.messageId))} />Select to read</label>}
        {draft.operation === 'read' && <button disabled={Boolean(task.trim())} onClick={() => setTask(correspondenceTask(source))}>Prepare a task draft from this source</button>}
      </article>)}
      {draft.operation === 'search' && <button disabled={!selected.length || busy || Boolean(task.trim())} onClick={() => void run('read')}>Read selected messages</button>}
    </section>}
    <label>Task draft · unsent<textarea value={task} maxLength={4000} onChange={event => setTask(event.target.value)} rows={6} /></label>
    {task && <><p role="status">Draft for your review only. It has not been sent, ordered, booked or scheduled.</p><button onClick={() => setTask('')}>Discard task draft</button></>}
  </section>;
}
