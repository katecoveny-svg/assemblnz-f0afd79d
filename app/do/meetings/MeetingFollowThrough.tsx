'use client';
import { useRef, useState } from 'react';
import { ArrowUpRight, CalendarDays, Check, Download, Mail, RefreshCw } from 'lucide-react';
import { MEETING_EMAIL_SENDER, meetingFollowupSchema, meetingFollowupStatus, meetingFollowthroughFromNotes, meetingReminderCalendar, type MeetingFollowupReceipt } from '@/apps/do/shared/meeting-followthrough';
import { addIssue, readDoTaskStore, resolveDoTaskOwnerKey, writeDoTaskStore } from '@/apps/do/shared/do-tasks';
import styles from '@/components/do/do-product-focus.module.css';
import follow from './follow-through.module.css';

function download(text: string, name: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name;
  document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
/** Uses existing local task storage and operator approvals, never a second executor. */
export function MeetingFollowThrough({ notes, reviewed, signedIn }: { notes: string; reviewed: boolean; signedIn: boolean | null }) {
  const [prepared] = useState(() => meetingFollowthroughFromNotes(notes));
  const [tab, setTab] = useState<'email' | 'tasks' | 'agenda'>('email');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState(prepared.subject);
  const [body, setBody] = useState(prepared.body);
  const [approved, setApproved] = useState(false);
  const [requestId] = useState(() => crypto.randomUUID());
  const [receipt, setReceipt] = useState<MeetingFollowupReceipt | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [agenda, setAgenda] = useState(prepared.agenda);
  const [when, setWhen] = useState('');
  const [title, setTitle] = useState('Meeting follow-up');
  const locked = busy || attempted;
  const valid = meetingFollowupSchema.safeParse({ requestId, to, subject, body, notes, approved }).success;
  function edit(set: (value: string) => void, value: string) { set(value); setApproved(false); }
  async function queueEmail() {
    if (pending.current || receipt || !reviewed || !valid || signedIn !== true) return;
    pending.current = true; setBusy(true); setAttempted(true); setMessage('');
    try {
      const response = await fetch('/api/do/meetings/follow-up', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId, to, subject, body, notes, approved: true }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'The request could not be confirmed.');
      setReceipt(data.receipt);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'The request could not be confirmed. Check its status before retrying.'); }
    finally { pending.current = false; setBusy(false); }
  }
  async function refresh() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setMessage('');
    try {
      const response = await fetch(`/api/do/meetings/follow-up?requestId=${encodeURIComponent(requestId)}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'The request could not be checked.');
      setReceipt(data.receipt);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'The request could not be checked.'); }
    finally { pending.current = false; setBusy(false); }
  }
  async function saveTasks() {
    if (pending.current || !reviewed || !selected.length || saved) return;
    pending.current = true; setBusy(true); setMessage('');
    try {
      const { ownerKey } = await resolveDoTaskOwnerKey();
      let store = readDoTaskStore(localStorage, ownerKey);
      for (const action of selected) store = addIssue(store, 'meeting-do', { title: action, notes: `From reviewed Meeting DO notes:\n${action}\n\nSaved as a task on this browser. No work was assigned or executed.`, href: '/do/meetings' });
      writeDoTaskStore(localStorage, ownerKey, store); setSaved(true);
      setMessage(`${selected.length} ${selected.length === 1 ? 'task' : 'tasks'} saved on this browser. Open More → Saved tasks to track the work.`);
    } catch { setMessage('Tasks could not be saved on this browser. Download the list to keep it.'); }
    finally { pending.current = false; setBusy(false); }
  }
  function reminder() {
    if (!reviewed || !when) return;
    try {
      download(meetingReminderCalendar({ title, agenda, startsAt: new Date(when).toISOString(), id: requestId }), 'meeting-follow-up.ics', 'text/calendar;charset=utf-8');
      setMessage('Calendar file prepared. Open it in your calendar and save it to set the reminder. No invitation has been sent.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Check the reminder date and time.'); }
  }
  return <section className={`${styles.document} ${follow.panel}`} aria-label="Meeting follow-through">
    <div className={styles.documentHead}><span className={styles.kicker}>FROM CONVERSATION TO WORK</span><span className={follow.badge}><Check size={12} />{reviewed ? 'Notes reviewed' : 'Review needed'}</span></div>
    <h2 className={follow.title}>Take the next step.</h2>
    <p className={styles.help}>Choose the work to take forward. Review each output before sharing or saving.</p>
    {!reviewed && <p className={styles.notice}>Review your notes again before continuing.</p>}
    <div className={styles.tabs} role="group" aria-label="Follow-through options">
      <button type="button" aria-pressed={tab === 'email'} onClick={() => { setTab('email'); setMessage(''); }}><Mail size={14} />Follow-up email</button>
      <button type="button" aria-pressed={tab === 'tasks'} onClick={() => { setTab('tasks'); setMessage(''); }}><Check size={14} />Next steps</button>
      <button type="button" aria-pressed={tab === 'agenda'} onClick={() => { setTab('agenda'); setMessage(''); }}><CalendarDays size={14} />Next meeting</button>
    </div>
    {tab === 'email' && <div>
      <p className={follow.sender}>From <strong>{MEETING_EMAIL_SENDER}</strong> · reviewed by an assembl operator before sending.</p>
      <label className={styles.field}>Recipient email<input type="email" value={to} maxLength={254} disabled={locked} autoComplete="off" placeholder="Choose the intended recipient" onChange={e => edit(setTo, e.target.value)} /></label>
      <label className={styles.field}>Email subject<input value={subject} maxLength={200} disabled={locked} onChange={e => edit(setSubject, e.target.value)} /></label>
      <label className={styles.field}>Follow-up message<textarea rows={8} value={body} maxLength={8000} disabled={locked} onChange={e => edit(setBody, e.target.value)} /></label>
      {!receipt && <>
        <label className={styles.consent}><input type="checkbox" checked={approved} disabled={locked} onChange={e => setApproved(e.target.checked)} /><span>I checked the recipient and message, have permission to contact them, and want an assembl operator to review sending this email from {MEETING_EMAIL_SENDER}.</span></label>
        {signedIn !== true && <p className={styles.help}>Sign in and refresh your connection to request operator review. You can keep a copy of your draft now.</p>}
        <button type="button" className={styles.primary} disabled={!reviewed || !valid || busy || signedIn !== true} onClick={() => void queueEmail()}>{busy ? 'Checking the request…' : attempted ? 'Retry the same request' : 'Request email review'}<ArrowUpRight size={16} /></button>
      </>}
      <div className={follow.actions}>
        <button type="button" className={styles.textButton} disabled={!body.trim()} onClick={() => download(`From: ${MEETING_EMAIL_SENDER}\nTo: ${to}\nSubject: ${subject}\n\n${body}\n\nDraft only. Sending requires separate approval.`, 'meeting-email-draft.txt')}><Download size={15} />Keep email draft</button>
        {attempted && <button type="button" className={styles.textButton} disabled={busy} onClick={() => void refresh()}><RefreshCw size={15} />Check request status</button>}
      </div>
      {attempted && !receipt && <p className={styles.help}>The first request may have been saved. Its fields are locked so a retry checks the same request without duplicating it.</p>}
      {receipt && <div className={follow.receipt} role="status"><span className={styles.kicker}>FOLLOW-UP RECEIPT</span><p>{meetingFollowupStatus(receipt.status)}</p><p className={follow.id}>Request {receipt.id}</p><button type="button" className={styles.textButton} onClick={() => download(JSON.stringify({ ...receipt, requestId, statusMeaning: meetingFollowupStatus(receipt.status) }, null, 2), 'meeting-follow-up-receipt.json', 'application/json')}><Download size={15} />Keep receipt</button></div>}
    </div>}
    {tab === 'tasks' && <div>
      <p className={styles.help}>Choose the agreed next steps to keep in your task list. Owners and dates stay exactly as written in your reviewed notes.</p>
      {prepared.actions.length ? <div className={follow.tasks}>{prepared.actions.map(action => <label key={action} className={styles.consent}><input type="checkbox" checked={selected.includes(action)} disabled={busy || saved} onChange={e => setSelected(e.target.checked ? [...selected, action] : selected.filter(a => a !== action))} /><span>{action}</span></label>)}</div> : <p className={styles.notice}>No agreed action items were found. Edit the notes if the meeting included next steps.</p>}
      <button type="button" className={styles.primary} disabled={!reviewed || !selected.length || busy || saved} onClick={() => void saveTasks()}>{saved ? 'Saved on this browser' : 'Save selected tasks'}<Check size={16} /></button>
      <button type="button" className={styles.textButton} disabled={!selected.length} onClick={() => download(selected.map(a => `• ${a}`).join('\n'), 'meeting-next-steps.txt')}><Download size={15} />Keep task list</button>
      <p className={styles.help}>These are tasks for you to track. Saving does not assign work to another person or run an agent.</p>
    </div>}
    {tab === 'agenda' && <div>
      <label className={styles.field}>Next meeting agenda<textarea rows={9} value={agenda} maxLength={12000} onChange={e => setAgenda(e.target.value)} /></label>
      <button type="button" className={styles.textButton} disabled={!agenda.trim()} onClick={() => download(agenda, 'next-meeting-agenda.txt')}><Download size={15} />Keep agenda</button>
      <div className={follow.reminder}><h3>Make time to follow through.</h3>
        <label className={styles.field}>Reminder title<input value={title} maxLength={200} onChange={e => setTitle(e.target.value)} /></label>
        <label className={styles.field}>Date and time<input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} /></label>
        <p className={styles.help}>Your device timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}. A 30-minute calendar entry with a reminder 15 minutes beforehand.</p>
        <button type="button" className={styles.primary} disabled={!reviewed || !when || !title.trim()} onClick={reminder}>Prepare calendar reminder<CalendarDays size={16} /></button>
        <p className={styles.help}>Download and import into your calendar to activate it. No event is booked or invitation sent here.</p>
      </div>
    </div>}
    {message && <p className={styles.notice} role="status">{message}</p>}
  </section>;
}
