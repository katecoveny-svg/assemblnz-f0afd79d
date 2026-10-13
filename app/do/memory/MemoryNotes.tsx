'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { DoBrand } from '@/components/do/DoBrand';
import { DoSecondaryNavigation } from '@/components/do/DoSecondaryNavigation';
import { PERSONAL_MEMORY_NOTICE, personalMemoryRecordSchema, type PersonalMemoryMutation, type PersonalMemoryRecord } from '@/apps/do/personal/memory';
import {
  EMPTY_MEMORY_DRAFT, MEMORY_KIND_LABEL, MEMORY_RETENTION_OPTIONS, changeMemoryMutation, daysUntil, draftFromRecord, saveMemoryMutation, sortMemory,
  memoryDay,
  type MemoryDraft,
} from '@/apps/do/personal/memory-page';
import styles from './memory.module.css';

type Storage = 'loading' | 'none' | 'unavailable' | 'account';
const KINDS = Object.keys(MEMORY_KIND_LABEL) as PersonalMemoryRecord['kind'][];
const dateFormat = new Intl.DateTimeFormat('en-NZ', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Pacific/Auckland' });

/** Every note DO keeps, readable and changeable from any signed-in device. The server owns identity and the clock. */
export function MemoryNotes() {
  const [storage, setStorage] = useState<Storage>('loading');
  const [records, setRecords] = useState<PersonalMemoryRecord[]>([]);
  const [draft, setDraft] = useState<MemoryDraft>(() => EMPTY_MEMORY_DRAFT(new Date().toISOString()));
  const [editing, setEditing] = useState<PersonalMemoryRecord | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const formRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const alive = useRef(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/do/personal/memory', { cache: 'no-store' });
      const data = await response.json();
      if (!alive.current) return;
      if (response.status === 503 || data.storage === 'unavailable') { setStorage('unavailable'); setRecords([]); return; }
      if (data.storage === 'none') { setStorage('none'); setRecords([]); return; }
      const parsed = Array.isArray(data.records) ? data.records.map((item: unknown) => personalMemoryRecordSchema.parse(item)) : [];
      setRecords(sortMemory(parsed)); setStorage('account');
    } catch {
      if (alive.current) { setStorage('unavailable'); setError('Memory could not be loaded. Nothing was changed.'); }
    }
  }, []);
  useEffect(() => {
    alive.current = true;
    // Owner-scoped read of saved notes; state updates arrive after the fetch resolves, never a provider call.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    return () => { alive.current = false; };
  }, [load]);

  async function send(mutation: PersonalMemoryMutation, success: string) {
    setBusy(true); setError(''); setStatus('');
    try {
      const response = await fetch('/api/do/personal/memory', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mutation),
      });
      const data = await response.json().catch(() => ({}));
      if (!alive.current) return false;
      if (response.status === 409) { setError('This note changed on another device. Reloading the latest version.'); await load(); return false; }
      if (!response.ok) { setError(typeof data.error === 'string' ? data.error : 'Memory storage unavailable. No change was confirmed.'); return false; }
      setStatus(success);
      await load();
      return true;
    } catch {
      if (alive.current) setError('Memory storage unavailable. No change was confirmed.');
      return false;
    } finally { if (alive.current) setBusy(false); }
  }

  function startEdit(record: PersonalMemoryRecord) {
    setEditing(record); setDraft(draftFromRecord(record)); setConsent(false); setStatus(''); setError('');
    formRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    requestAnimationFrame(() => textRef.current?.focus());
  }
  function cancelEdit() { setEditing(null); setDraft(EMPTY_MEMORY_DRAFT(new Date().toISOString())); setConsent(false); }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.text.trim()) { textRef.current?.focus(); return; }
    if (!consent) { setError('Tick the box to confirm this note is about you and not sensitive.'); return; }
    const id = editing?.id ?? crypto.randomUUID();
    const saved = await send(saveMemoryMutation(id, draft, editing, editing?.active ?? true), editing ? 'Note updated on your account.' : 'Note saved to your account.');
    if (saved) cancelEdit();
  }

  const signedOut = storage === 'none';
  const canWrite = storage === 'account' && !busy;

  return <main className={styles.shell} aria-busy={busy}>
    <header className={styles.topbar}>
      <div className={styles.brandRow}><DoBrand /><span className={styles.crumb}>Memory</span></div>
      <nav aria-label="DO" className={styles.nav}><Link href="/do">My DO</Link><DoSecondaryNavigation /></nav>
    </header>

    <section className={styles.intro} aria-labelledby="memory-title">
      <p className={styles.eyebrow}>what DO remembers</p>
      <h1 id="memory-title">Every note, in your hands.</h1>
      <p className={styles.lede}>DO only keeps what you write here. Each note shows what it is, when you observed it and when it expires. Edit, pause or delete any note from any device you are signed in on.</p>
      <p className={styles.notice}>{PERSONAL_MEMORY_NOTICE}</p>
    </section>

    <div className={styles.status} role="status" aria-live="polite">
      {storage === 'loading' && <p>Checking your account memory…</p>}
      {signedOut && <p>Sign in to see and manage DO’s notes. Nothing is stored for guests. <Link href={`/login?redirect=${encodeURIComponent('/do/memory')}`}>Sign in</Link></p>}
      {storage === 'unavailable' && <p>Account memory is not switched on for this deployment yet. Nothing has been saved, and nothing below is live. <button type="button" onClick={() => void load()}>Check again</button></p>}
      {status && <p>{status}</p>}
    </div>
    {error && <p className={styles.error} role="alert">{error}</p>}

    <div className={styles.columns}>
      <section className={styles.list} aria-labelledby="notes-title">
        <h2 id="notes-title">{records.length ? `${records.length} ${records.length === 1 ? 'note' : 'notes'}` : 'No notes yet'}</h2>
        {storage === 'account' && !records.length && <p className={styles.empty}>DO has nothing stored about you. Add a note when something is worth remembering, or leave it empty.</p>}
        <ul>
          {records.map(record => <li key={record.id} className={styles.note} data-active={record.active}>
            <div className={styles.noteMeta}>
              <span>{MEMORY_KIND_LABEL[record.kind]}</span>
              <span>{record.active ? 'active' : 'paused'}</span>
              <span>observed {dateFormat.format(new Date(record.observedAt))}</span>
              <span>expires in {daysUntil(record.expiresAt)}d · {dateFormat.format(new Date(record.expiresAt))}</span>
              <span>rev {record.revision}</span>
            </div>
            <p className={styles.noteText}>{record.text}</p>
            <div className={styles.noteActions}>
              <button type="button" disabled={!canWrite} onClick={() => startEdit(record)}>Edit</button>
              {record.active
                ? <button type="button" disabled={!canWrite} onClick={() => void send(changeMemoryMutation('pause', record), 'Note paused. DO will not use it until you edit it again.')}>Pause</button>
                : <button type="button" disabled={!canWrite} onClick={() => void send(saveMemoryMutation(record.id, draftFromRecord(record), record, true), 'Note resumed.')}>Resume</button>}
              <button type="button" disabled={!canWrite} onClick={() => void send(changeMemoryMutation('review', record), 'Marked as reviewed today.')}>Still true</button>
              <button type="button" className={styles.danger} disabled={!canWrite} onClick={() => { if (window.confirm('Delete this note? DO forgets it everywhere, and the deletion cannot be undone.')) void send(changeMemoryMutation('delete', record), 'Note deleted everywhere.'); }}>Delete</button>
            </div>
          </li>)}
        </ul>
      </section>

      <div ref={formRef} className={styles.formWrap}>
        <form className={styles.form} onSubmit={event => void submit(event)} aria-labelledby="form-title">
          <h2 id="form-title">{editing ? 'Edit note' : 'Add a note'}</h2>
          <label htmlFor="memory-kind">What kind of note</label>
          <select id="memory-kind" value={draft.kind} disabled={!canWrite} onChange={event => { setDraft(d => ({ ...d, kind: event.target.value as PersonalMemoryRecord['kind'] })); setConsent(false); }}>
            {KINDS.map(kind => <option key={kind} value={kind}>{MEMORY_KIND_LABEL[kind]}</option>)}
          </select>
          <label htmlFor="memory-text">The note, in your words</label>
          <textarea ref={textRef} id="memory-text" rows={4} maxLength={1200} value={draft.text} disabled={!canWrite} placeholder="e.g. I prefer plain, short replies." onChange={event => { setDraft(d => ({ ...d, text: event.target.value })); setConsent(false); }} />
          <div className={styles.row}>
            <div>
              <label htmlFor="memory-observed">Observed on</label>
              <input id="memory-observed" type="date" value={draft.observedAt} max={memoryDay()} disabled={!canWrite} onChange={event => { setDraft(d => ({ ...d, observedAt: event.target.value })); setConsent(false); }} />
            </div>
            <div>
              <label htmlFor="memory-retention">Keep for</label>
              <select id="memory-retention" value={draft.retentionDays} disabled={!canWrite} onChange={event => { setDraft(d => ({ ...d, retentionDays: Number(event.target.value) as MemoryDraft['retentionDays'] })); setConsent(false); }}>
                {MEMORY_RETENTION_OPTIONS.map(days => <option key={days} value={days}>{days} days</option>)}
              </select>
            </div>
          </div>
          <label className={styles.consent}><input type="checkbox" checked={consent} disabled={!canWrite} onChange={event => setConsent(event.target.checked)} /><span>This is about me, not another person, and contains no health, identity, payment or password details.</span></label>
          <div className={styles.formActions}>
            <button type="submit" className={styles.primary} disabled={!canWrite || !draft.text.trim()}>{editing ? 'Save changes' : 'Save note'}</button>
            {editing && <button type="button" onClick={cancelEdit} disabled={busy}>Cancel</button>}
          </div>
          <p className={styles.fine}>Saved privately to your account for your own review. Not sent to a drafting provider unless you separately allow that for a specific request.</p>
        </form>
      </div>
    </div>
  </main>;
}
