"use client";

import { useEffect, useRef, useState } from 'react';
import { Cloud, RefreshCw } from 'lucide-react';
import type { LifeAdminPlan } from '@/apps/do/personal/life-admin/engine';
import { checklistCloudSaveSchema, checklistCloudStateSchema, restoreCloudChecklists, type ChecklistCloudState } from '@/apps/do/personal/life-admin/cloud';
import styles from './LifeAdmin.module.css';

/** Parent is keyed by verified account identity. No automatic upload or model call. */
export function ChecklistCloud({ plans, onRestore, ownerId, disabled = false }: {
  ownerId: string; plans: LifeAdminPlan[]; onRestore: (plans: LifeAdminPlan[]) => void; disabled?: boolean;
}) {
  const [saved, setSaved] = useState<ChecklistCloudState | null>(null);
  const [consentFor, setConsentFor] = useState<string | null>(null);
  const fingerprint = JSON.stringify(plans);
  const consent = consentFor === fingerprint;
  const setConsent = (value: boolean) => setConsentFor(value ? fingerprint : null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [remove, setRemove] = useState(false);
  const request = useRef<AbortController | null>(null);
  const current = useRef(plans);
  useEffect(() => { current.current = plans; }, [plans]);
  useEffect(() => () => request.current?.abort(), []);

  async function run(action: 'open' | 'save' | 'remove') {
    if (request.current || disabled) return;
    if (action !== 'open' && (!saved || !consent)) return;
    const controller = new AbortController(); request.current = controller; setBusy(true); setNotice('');
    try {
      const snapshot = action === 'remove' ? [] : current.current;
      const body = action === 'open' ? undefined : checklistCloudSaveSchema.parse({ plans: snapshot, expectedRevision: saved!.revision, consent: true });
      const response = await fetch('/api/do/personal/checklists', {
        method: action === 'open' ? 'GET' : 'POST', cache: 'no-store', signal: controller.signal,
        headers: { 'X-DO-Workspace': ownerId, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok) {
        if (response.status === 409) setSaved(null);
        throw new Error(data.error || 'Saved checklists are unavailable. Your open work is safe on this page.');
      }
      const next = checklistCloudStateSchema.parse(data);
      if (action === 'open') {
        const restored = restoreCloudChecklists(current.current, next.plans);
        onRestore(restored.plans);
        setNotice(`${restored.added} saved checklist${restored.added === 1 ? '' : 's'} opened.${restored.conflicts ? ` ${restored.conflicts} already-open checklist${restored.conflicts === 1 ? '' : 's'} differed; your open edits were kept. Saving will replace the saved versions.` : ''}${!next.plans.length ? ' There are no checklists in your saved collection.' : ''}`);
      } else {
        setNotice(action === 'remove' ? 'Saved collection removed. Open checklists are still here. Nothing else was deleted.' : 'Checklists saved to your account. Open saved checklists on another device to continue. Later edits need another Save.');
      }
      setSaved(next); setConsent(false); setRemove(false);
    } catch (error) {
      if (!controller.signal.aborted) setNotice(error instanceof Error && !('issues' in error) ? error.message : 'Check the collection and remove credentials, ID numbers and payment details before saving.');
    } finally {
      if (!controller.signal.aborted) { setBusy(false); request.current = null; }
    }
  }
  return <details className={styles.cloudStorage}>
    <summary><Cloud size={18} /> Saved checklists <span>Continue on another device</span></summary>
    <p>Keep a private copy in your Assembl account. This saves your checklist notes, details, drafts and completion records. It does not save the chat or schedule reminders.</p>
    <div className={styles.taskActions}><button type="button" disabled={busy || disabled} onClick={() => void run('open')}><RefreshCw size={15} /> Open saved checklists</button></div>
    {saved && <>
      <p className={styles.hint}>{saved.savedAt ? `Last saved: ${new Date(saved.savedAt).toLocaleString('en-NZ')}. ${saved.plans.length} saved.` : 'No saved collection yet.'} Saving replaces your saved collection with the {plans.length} checklist{plans.length === 1 ? '' : 's'} open here.</p>
      <label className={styles.consent}><input type="checkbox" disabled={busy || disabled} checked={consent} onChange={event => setConsent(event.target.checked)} />I want to save or remove this checklist collection in my private Assembl account.</label>
      <div className={styles.taskActions}>
        <button type="button" disabled={!consent || busy || disabled || !plans.length} onClick={() => void run('save')}>Save {plans.length} checklist{plans.length === 1 ? '' : 's'} to my account</button>
        <button type="button" disabled={!consent || busy || disabled || !saved.plans.length} onClick={() => setRemove(true)}>Remove saved collection</button>
      </div>
      {remove && <div className={styles.confirm}><p>Remove the saved collection from your account? Open checklists on this device will stay here.</p><button type="button" disabled={!consent || busy || disabled} onClick={() => void run('remove')}>Yes, remove saved collection</button><button type="button" disabled={busy} onClick={() => setRemove(false)}>Keep it</button></div>}
    </>}
    <p role="status" aria-live="polite">{busy ? 'Checking your saved collection…' : notice}</p>
  </details>;
}
