"use client";

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowDownToLine, ArrowRight, ArrowUpRight, Check, ChevronRight, FileText, Mic, Plus, RotateCcw, ShieldCheck, Sparkles, X, Backpack, ReceiptText, CarFront } from 'lucide-react';
import { ChecklistCloud } from './ChecklistCloud';
import { LifeAdminTraffic } from './LifeAdminTraffic';
import type { PersonalDoProfile } from '@/apps/do/personal/profile';
import { DoVision } from '@/app/do/DoVision';
import { extractDetails, type DoPreparedDraft } from '@/apps/do/shared/preparation';
import {
  createLifeAdminPlan, hasLifeAdminSecretLabel, isLifeAdminFollowUpDue, lifeAdminCalendarFile,
  lifeAdminLane, lifeAdminPack, LIFE_ADMIN_BOUNDARY, LIFE_ADMIN_SOURCE_LIMIT, lifeAdminStorageKey,
  localDateSchema, missingLifeAdminFields, nextLifeAdminStep, parseLifeAdminStore, reviewLifeAdminPlan,
  serialiseLifeAdminStore, transitionLifeAdminTask, updateLifeAdminField,
  type LifeAdminLane, type LifeAdminPlan, type LifeAdminTransition,
} from '@/apps/do/personal/life-admin/engine';
import { LIFE_ADMIN_CAPABILITIES, LIFE_ADMIN_TEMPLATES, lifeAdminTemplate, suggestLifeAdminCategory, type LifeAdminCategory } from '@/apps/do/personal/life-admin/templates';
import { LIFE_ADMIN_EXAMPLES } from '@/apps/do/personal/life-admin/examples';
import styles from './LifeAdmin.module.css';
import entry from './entry.module.css';
import { DoEntryObject } from '@/components/do/DoEntryObject';
import { DoActionIcon } from '@/components/do/DoBrand';

type Intake = { id: string; text: string; sourceTitle?: string };
type TaskEditor = { planId: string; taskId: string; status: 'done' | 'waiting'; note: string; url: string; date: string };
const lanes: { id: LifeAdminLane; name: string }[] = [{ id: 'today', name: 'Today' }, { id: 'needs-you', name: 'Needs you' }, { id: 'done', name: 'Done' }];
function saveFile(name: string, text: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
function readableError(error: unknown, fallback: string) {
  // Zod errors are useful to tests but too noisy for a person filling out a checklist.
  if (error && typeof error === 'object' && 'issues' in error && Array.isArray(error.issues)) return error.issues[0]?.message ?? fallback;
  return error instanceof Error ? error.message : fallback;
}
type LifeAdminProps = { assistant?: ReactNode; assistantWork?: { dirty: boolean; exportText: string }; assistantWorking?: boolean; onCustomise?: () => void; profile?: PersonalDoProfile | null; onTalk?: () => void; intake?: Intake | null; storageScope?: string; onIntakeAccepted?: (id: string) => void; onGuestWorkChange?: (dirty: boolean) => void };
export function LifeAdmin(props: LifeAdminProps) {
  return <LifeAdminWorkspace key={props.storageScope ?? 'unavailable'} {...props} />;
}
function LifeAdminWorkspace({ assistant, assistantWork, assistantWorking = false, profile, onCustomise, onTalk, intake, storageScope = 'unavailable', onIntakeAccepted, onGuestWorkChange }: LifeAdminProps) {
  const storageKey = lifeAdminStorageKey(storageScope);
  const [source, setSource] = useState('');
  const [captureMode, setCaptureMode] = useState<'type' | 'photo' | 'forward'>('type');
  const [showExamples, setShowExamples] = useState(false);
  const [guideStarted, setGuideStarted] = useState(false);
  const [guideDismissed, setGuideDismissed] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [localOpen, setLocalOpen] = useState(Boolean(intake) || storageScope === 'guest');
  const [sourceIntakeId, setSourceIntakeId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [method, setMethod] = useState<LifeAdminPlan['source']['method']>('pasted-text');
  const [category, setCategory] = useState<LifeAdminCategory | 'auto'>('auto');
  const [plans, setPlans] = useState<LifeAdminPlan[]>([]);
  const [lane, setLane] = useState<LifeAdminLane>('needs-you');
  const [selected, setSelected] = useState<string | null>(null);
  const [simple, setSimple] = useState(false);
  const [notice, setNotice] = useState('');
  const [reviewChecked, setReviewChecked] = useState(false);
  const [providerConsent, setProviderConsent] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [taskEditor, setTaskEditor] = useState<TaskEditor | null>(null);
  const [undo, setUndo] = useState<LifeAdminPlan | null>(null);
  const [saveAllowed, setSaveAllowed] = useState(false);
  const [forgetConfirm, setForgetConfirm] = useState(false);
  const seenIntake = useRef<string | null>(null);
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const activeHeading = useRef<HTMLHeadingElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const request = useRef<AbortController | null>(null);
  const requestVersion = useRef(0);
  const busyLock = useRef(false);
  const plansRef = useRef(plans);
  const guestDirty = storageScope === 'guest' && (Boolean(source.trim()) || plans.length > 0 || Boolean(assistantWork?.dirty));
  useEffect(() => { onGuestWorkChange?.(guestDirty); }, [guestDirty, onGuestWorkChange]);
  useEffect(() => { plansRef.current = plans; }, [plans]);
  useEffect(() => () => { requestVersion.current++; request.current?.abort(); }, []);
  useEffect(() => {
    if (!intake || intake.id === seenIntake.current) return;
    const frame = requestAnimationFrame(() => {
      seenIntake.current = intake.id;
      if (intake.text.length > LIFE_ADMIN_SOURCE_LIMIT) { setNotice('That handoff is longer than 12,000 characters. Shorten it before adding it here. Nothing was sent.'); return; }
      // Never overwrite a note that the person is currently editing.
      if (source.trim()) { setNotice('Your new handoff is ready below. Finish or clear your current note, then choose “Use incoming note”.'); return; }
      setLocalOpen(true); setSource(intake.text); setSourceIntakeId(intake.id); setTitle(intake.sourceTitle ?? 'Reviewed handoff'); setMethod('pasted-text'); setSourceUrl('');
      setNotice('Your incoming note is ready to review. Nothing has been sent for drafting.'); sourceRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [intake, source]);
  useEffect(() => {
    const focus = () => requestAnimationFrame(() => {
      if (localOpen) sourceRef.current?.focus();
      else document.getElementById('personal-assistant-input')?.focus();
    });
    window.addEventListener('assembl:do-focus', focus);
    return () => window.removeEventListener('assembl:do-focus', focus);
  }, [localOpen]);
  const inferred = suggestLifeAdminCategory(source);
  const chosen = category === 'auto' ? inferred : category;
  const template = chosen ? lifeAdminTemplate(chosen) : null;
  const active = plans.find((plan) => plan.id === selected);
  const activeTemplate = active ? lifeAdminTemplate(active.category) : null;
  const missing = active ? missingLifeAdminFields(active) : [];
  const visible = plans.filter((plan) => lifeAdminLane(plan) === lane).sort((a, b) => Number(isLifeAdminFollowUpDue(b)) - Number(isLifeAdminFollowUpDue(a)));
  const listed = simple ? visible.slice(0, 1) : visible;
  function replacePlan(plan: LifeAdminPlan) {
    setPlans((current) => current.map((item) => item.id === plan.id ? plan : item));
    setReviewChecked(false); setProviderConsent(false); setNotice('');
  }
  function openPlan(plan: LifeAdminPlan) {
    setSelected(plan.id); setReviewChecked(false); setProviderConsent(false); setTaskEditor(null);
    requestAnimationFrame(() => {
      resultHeading.current?.focus({ preventScroll: true });
      resultHeading.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
  }
  function start(event: FormEvent) {
    event.preventDefault();
    if (!chosen) { setNotice('Choose the kind of admin so I can give you the right checklist.'); return; }
    if (plans.length >= 30) { setNotice('This workspace holds up to 30 checklists. Download a pack before starting a fresh workspace.'); return; }
    try {
      const plan = createLifeAdminPlan({ source, category: chosen, title, sourceUrl, method });
      setPlans((current) => [plan, ...current]); openPlan(plan); setLane('needs-you');
      if (sourceIntakeId) onIntakeAccepted?.(sourceIntakeId);
      setSourceIntakeId(null); setSource(''); setTitle(''); setSourceUrl(''); setMethod('pasted-text'); setNotice('Checklist prepared on this device. Check the details, then review the next steps together.');
    } catch (error) { setNotice(readableError(error, 'Check your note and try again.')); }
  }
  function tryExample(example: (typeof LIFE_ADMIN_EXAMPLES)[number]) {
    if (plans.length >= 30) { setNotice('This workspace holds up to 30 checklists. Download a pack before starting a fresh workspace.'); return; }
    try {
      const plan = createLifeAdminPlan({ source: example.source, category: example.category, title: example.title, method: 'pasted-text' });
      setPlans(current => [plan, ...current]); setGuideStarted(true); openPlan(plan); setLane('needs-you');
      setNotice('Fictional example prepared on this device. Check the details and see the next steps. Nothing has been sent or completed for you.');
    } catch (error) { setNotice(readableError(error, 'This example could not open. Try your own note instead.')); }
  }
  function editField(plan: LifeAdminPlan, key: string, value: string) {
    if (busyId === plan.id) return;
    try { replacePlan(updateLifeAdminField(plan, key, value)); setUndo(null); }
    catch (error) { setNotice(readableError(error, 'Check that detail.')); }
  }
  function review() {
    if (!active || !reviewChecked) return;
    try {
      const updated = reviewLifeAdminPlan(active); setUndo(active); replacePlan(updated); setLane(lifeAdminLane(updated));
      setNotice('Checklist reviewed. The remaining actions are ready for you to handle. No external action was authorised or performed.');
    } catch (error) { setNotice(readableError(error, 'Check the missing details.')); }
  }
  function transition(plan: LifeAdminPlan, taskId: string, action: LifeAdminTransition) {
    try {
      const updated = transitionLifeAdminTask(plan, taskId, action); setUndo(plan); replacePlan(updated); setLane(lifeAdminLane(updated)); setTaskEditor(null);
      setNotice(action.status === 'done' ? 'Recorded as done by you, with your evidence. DO has not independently verified it.' : action.status === 'cancelled' ? 'This checklist step was cancelled. Nothing outside DO was cancelled.' : action.status === 'waiting' ? 'Waiting recorded. The check date appears here; no background reminder is scheduled.' : 'Step reopened.');
    } catch (error) { setNotice(readableError(error, 'That step could not be updated.')); }
  }
  function recordStep(event: FormEvent) {
    event.preventDefault();
    if (!taskEditor) return;
    const plan = plans.find((item) => item.id === taskEditor.planId); if (!plan) return;
    transition(plan, taskEditor.taskId, taskEditor.status === 'done' ? { status: 'done', note: taskEditor.note, url: taskEditor.url } : { status: 'waiting', note: taskEditor.note, followUpOn: taskEditor.date });
  }
  async function prepare() {
    if (!active || !providerConsent || busyLock.current) return;
    const target = active;
    if (hasLifeAdminSecretLabel([target.source.text, target.title, ...Object.values(target.fields)].join('\n'))) { setNotice('Remove credentials, identity numbers and payment details before sending. You can keep using the local checklist.'); return; }
    const controller = new AbortController(); request.current = controller; busyLock.current = true;
    const version = ++requestVersion.current; setBusyId(target.id); setNotice('Preparing a draft from the notes and details you approved…');
    try {
      const response = await fetch('/api/do/personal/life-admin/preparation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ category: target.category, source: target.source.text, title: target.title, fields: target.fields, consent: true }) });
      const body = await response.json() as { draft?: DoPreparedDraft; error?: string };
      if (!response.ok || !body.draft) throw new Error(body.error || 'Draft preparation is unavailable. Your checklist is unchanged.');
      if (version !== requestVersion.current || controller.signal.aborted) return;
      const current = plansRef.current.find((plan) => plan.id === target.id);
      if (!current || current.updatedAt !== target.updatedAt) { setNotice('The checklist changed while preparing. This older draft was not added.'); return; }
      const draft = body.draft;
      replacePlan({ ...current, generated: { text: draft.text, model: draft.evidence.model, sourceHash: draft.evidence.sourceHash, outputHash: draft.evidence.outputHash, createdAt: draft.createdAt } });
      setNotice('Your tailored draft is ready to check. It has not marked any step complete.');
    } catch (error) {
      if (version === requestVersion.current) setNotice(controller.signal.aborted ? 'Stopped on this device. No draft was added. Data already sent cannot be recalled.' : readableError(error, 'Preparation could not finish. Your checklist is unchanged.'));
    } finally {
      if (version === requestVersion.current) { busyLock.current = false; setBusyId(null); request.current = null; setProviderConsent(false); }
    }
  }
  function persist() {
    if (!saveAllowed || !storageKey) return;
    if (hasLifeAdminSecretLabel(JSON.stringify(plans))) { setNotice('Remove credentials, identity numbers and payment details before saving a browser snapshot.'); return; }
    try { localStorage.setItem(storageKey, serialiseLifeAdminStore(plans, storageScope)); setNotice('A snapshot was saved in this browser. Later changes need another Save. This is not cloud storage or a background service.'); }
    catch { setNotice('This browser could not save the snapshot. Your open checklists are still here; download a pack instead.'); }
  }
  function restore() {
    if (!saveAllowed || !storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey); if (!raw) { setNotice('There is no saved snapshot in this browser.'); return; }
      const saved = parseLifeAdminStore(raw, storageScope); const currentIds = new Set(plans.map((plan) => plan.id));
      const additions = saved.filter((plan) => !currentIds.has(plan.id));
      if (plans.length + additions.length > 30) throw new Error('Restoring would exceed 30 checklists.');
      setPlans((current) => [...current, ...additions]); setNotice(`Restored ${additions.length} checklist${additions.length === 1 ? '' : 's'}. Already-open checklists were kept unchanged.`);
    } catch { setNotice('That saved snapshot could not be safely restored. Your open checklists are unchanged.'); }
  }
  function forget() {
    if (!storageKey) return;
    try { localStorage.removeItem(storageKey); setForgetConfirm(false); setNotice('Saved browser snapshot removed. Open checklists are still here until you leave or refresh.'); }
    catch { setNotice('The saved snapshot could not be removed. Check your browser storage settings.'); }
  }
  function setFollowUp(plan: LifeAdminPlan, date: string) {
    if (date && !localDateSchema.safeParse(date).success) { setNotice('Choose a valid follow-up date.'); return; }
    setPlans((current) => current.map((item) => item.id === plan.id ? { ...item, followUpOn: date || null, updatedAt: new Date().toISOString() } : item)); setUndo(null);
  }
  const counts = (id: LifeAdminLane) => plans.filter((plan) => lifeAdminLane(plan) === id).length;
  const localComposer = (
      <div className={entry.intake}>
        <form onSubmit={start}>
          <div className={entry.intakeTop}><label htmlFor="life-admin-source">What needs doing?</label></div>
          {captureMode === 'forward' && <p className={styles.captureHint}>Paste an email below, or use your phone’s share menu to send text into DO. No inbox is connected.</p>}
          <textarea ref={sourceRef} data-do-primary-input={localOpen || !assistant ? true : undefined} id="life-admin-source" value={source} onChange={(event) => { setSource(event.target.value); if (!event.target.value) setSourceIntakeId(null); setMethod('pasted-text'); }} maxLength={LIFE_ADMIN_SOURCE_LIMIT} rows={2} placeholder={template?.prompt ?? 'Paste a notice or tell DO what needs sorting…'} required />
          {intake && source !== intake.text && <button type="button" className={styles.textButton} disabled={Boolean(source.trim()) || intake.text.length > LIFE_ADMIN_SOURCE_LIMIT} onClick={() => { setSource(intake.text); setSourceIntakeId(intake.id); setTitle(intake.sourceTitle ?? 'Incoming note'); setSourceUrl(''); setMethod('pasted-text'); }}>Use incoming note</button>}
          {(Boolean(source.trim()) || category !== 'auto') && <div className={styles.noteDetails}>
          <div className={entry.intakeFields}><label>Kind of admin<select value={category} onChange={(event) => setCategory(event.target.value as LifeAdminCategory | 'auto')}><option value="auto">Suggest from note</option>{LIFE_ADMIN_TEMPLATES.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><details className={styles.optionalTitle}><summary>Name this note</summary><label>Name it, if useful<input value={title} maxLength={160} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Friday’s school trip" /></label></details></div>
          {category === 'auto' && !inferred && source.trim().length >= 5 && <p className={styles.hint}>Choose a kind of admin above so the checklist fits your note.</p>}
          {category === 'auto' && inferred && <p className={styles.hint}>Suggested: {lifeAdminTemplate(inferred).name}. Change it above if another checklist fits better.</p>}
          <details className={styles.sourceLink}><summary>Add the original source link</summary><label>Link for your reference<input type="url" value={sourceUrl} maxLength={2000} placeholder="https://…" onChange={(event) => setSourceUrl(event.target.value)} /></label><small>Linked pages are not fetched. Queries and sign-in tokens are removed from stored links.</small></details>
          </div>}
          <div className={entry.intakeActions}><details className={entry.addContext}><summary><Plus size={17} /> Add context</summary><div className={entry.captureModes}>{onTalk && <button type="button" onClick={onTalk}><DoActionIcon kind="voice" /><span>Talk</span></button>}<button type="button" aria-pressed={captureMode === 'photo'} onClick={() => setCaptureMode(captureMode === 'photo' ? 'type' : 'photo')}><DoActionIcon kind="photo" /><span>Photo</span></button><button type="button" onClick={() => { setCaptureMode('forward'); sourceRef.current?.focus(); }}><DoActionIcon kind="note" /><span>Paste a notice</span></button></div></details><button className={entry.primary} type="submit" disabled={source.trim().length < 5 || !chosen}>Start <DoActionIcon kind="arrow" /></button></div>
          <p className={entry.privacy}>Checklist stays on this device. Leave out passwords and payment details.</p>
        </form>
        {captureMode === 'photo' && <div className={styles.vision}><p className={styles.hint}>For screenshots, review what is visible first. Optional image processing sends the approved image to assembl’s configured OpenAI, Anthropic or Google vision provider.</p><DoVision onUse={(text) => {
          const combined = source.trim() ? `${source.trim()}\n\n${text}` : text;
          if (combined.length > LIFE_ADMIN_SOURCE_LIMIT) { setNotice('That would exceed 12,000 characters. Shorten the current note before adding the observation.'); return false; }
          setSource(combined); setMethod('reviewed-observation'); setNotice('Reviewed image notes added. Check them here before making a checklist.'); return true;
        }} /></div>}
      </div>
  );
  return (
    <section className={`${styles.workspace} ${entry.workspace}`} id="life-admin" aria-labelledby="life-admin-heading">
      <div className={entry.stage} data-simple={simple || undefined}>
      <header className={entry.heading}>
        <DoEntryObject compact avatar={profile?.avatar} working={assistantWorking} finish={profile?.avatar === 'pebble' ? 'paper' : 'plum'} />
        <div className={entry.intro}>
          <h1 id="life-admin-heading">What needs doing?</h1>
          <p>{assistantWorking ? 'Preparing your reply…' : profile?.displayName && profile.displayName !== 'DO' ? `Hi, ${profile.displayName}.` : 'Ask a question, write a reply or sort a notice.'}</p>
        </div>
      </header>
      {active && <section className={styles.quickResult} aria-labelledby="personal-do-result">
        <div className={styles.resultStamp}><Check size={19} /><span>{lifeAdminLane(active) === 'done' ? 'RECORDED BY YOU' : 'READY TO CHECK'}</span></div>
        <h2 ref={resultHeading} tabIndex={-1} id="personal-do-result">{active.title}</h2><p>{nextLifeAdminStep(active)}</p>
        <button type="button" onClick={() => { setBoardOpen(true); requestAnimationFrame(() => { activeHeading.current?.focus({ preventScroll: true }); activeHeading.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }); }}>See my next steps <ArrowRight size={17} /></button>
        {!guideDismissed && (!profile?.onboardingCompleted || guideStarted) && <div className={styles.resultGuide}><span>Review before sharing.</span>{onCustomise && <button type="button" onClick={onCustomise}>Make DO mine <ArrowUpRight size={13} /></button>}<button type="button" onClick={() => setGuideDismissed(true)} aria-label="Dismiss first-result guide"><X size={14} /></button></div>}
      </section>}
      {assistant && <nav className={entry.composerTabs} aria-label="Choose how to start">
        <button type="button" aria-pressed={!localOpen} onClick={() => { setLocalOpen(false); requestAnimationFrame(() => document.getElementById('personal-assistant-input')?.focus()); }}>Ask DO</button>
        <button type="button" aria-pressed={localOpen} onClick={() => { setLocalOpen(true); requestAnimationFrame(() => sourceRef.current?.focus()); }}>Make a checklist</button>
      </nav>}
      <div hidden={Boolean(assistant) && localOpen}>{assistant}</div>
      <div id="personal-local-checklist" hidden={Boolean(assistant) && !localOpen}>{localComposer}</div>
      {assistant && <div className={entry.mainModes} aria-label="More ways to start">
        {onTalk && <button type="button" onClick={onTalk} aria-label="Talk it through"><DoActionIcon kind="voice" /><span><strong>Talk</strong><small>Open voice options</small></span></button>}
        <button type="button" onClick={() => { setLocalOpen(true); setCaptureMode('photo'); }}><DoActionIcon kind="photo" /><span><strong>Photo</strong><small>Review an image</small></span></button>
        <button type="button" onClick={() => { setLocalOpen(true); setCaptureMode('forward'); requestAnimationFrame(() => sourceRef.current?.focus()); }}><DoActionIcon kind="note" /><span><strong>Paste a notice</strong><small>Make a checklist</small></span></button>
      </div>}
      {!plans.length && <button type="button" className={entry.exampleToggle} aria-expanded={showExamples} onClick={() => setShowExamples(!showExamples)}>{showExamples ? 'Hide examples' : 'See an example'}<ChevronRight size={16} /></button>}
      {!plans.length && showExamples && !source.trim() && !intake && <section className={styles.examples} aria-label="Try a fictional example">
        <div className={styles.exampleHeading}><span>TRY ONE THING</span><button type="button" onClick={() => { setShowExamples(false); setGuideStarted(true); if (assistant) document.getElementById('personal-assistant-input')?.focus(); else sourceRef.current?.focus(); }}>Use my own note <ArrowRight size={14} /></button></div>
        <div className={styles.exampleGrid}>{LIFE_ADMIN_EXAMPLES.map((example, index) => {
          const Icon = [Backpack, ReceiptText, CarFront][index];
          return <button className={styles.exampleCard} data-example={example.id} type="button" key={example.id} onClick={() => tryExample(example)} aria-label={example.action}>
            <span className={styles.exampleBadge}>EXAMPLE</span>
            <span className={styles.exampleVisual} aria-hidden="true"><span className={styles.exampleDocument}><Icon size={21} /><strong>{example.document}</strong><small>{example.detail}</small><i /><i /></span><ArrowRight className={styles.exampleArrow} size={21} /><span className={styles.exampleOutcome}><Check size={20} /><i /><i /></span></span>
            <span className={styles.exampleLabel}>{example.label}<ArrowUpRight size={16} /></span><span className={styles.exampleResult}>{example.output}</span>
          </button>;
        })}</div>
        <p className={styles.exampleNote}>Fictional examples. Real checklists. Nothing sent.</p>
      </section>}

      </div>
      {Boolean(plans.length) && <div className={styles.workspaceTools}><span className={styles.toolsCaption}>YOUR NEXT STEP</span><button className={styles.mode} type="button" aria-pressed={simple} onClick={() => setSimple(!simple)}>{simple ? 'Show the full picture' : 'I’m overwhelmed · just one thing'}<span aria-hidden="true">{simple ? '−' : '↘'}</span></button></div>}
      {storageScope === 'guest' && guestDirty && <aside className={styles.guest}><p>Guest work stays on this page. Download it before signing in, refreshing or leaving.</p><button type="button" onClick={() => { saveFile('do-guest-work.txt', [assistantWork?.exportText ? `Personal DO conversation\n${assistantWork.exportText}` : '', source.trim() ? `Unfinished note: ${title || 'Untitled'}\n${source}` : '', ...plans.map(lifeAdminPack)].filter(Boolean).join('\n\n────────\n\n')); setNotice('Your current note and guest checklists were downloaded. Nothing was sent or transferred to an account.'); }}>Download all guest work</button></aside>}
      <div hidden={!plans.length}>
      <details className={styles.workUnderway} open={boardOpen} onToggle={event => setBoardOpen(event.currentTarget.open)}><summary><span>What’s underway <b>{plans.length}</b></span><Plus size={19} /></summary>
      <div className={styles.boardHeader}><nav className={styles.lanes} aria-label="Checklist status">{lanes.map((item) => <button key={item.id} type="button" aria-pressed={lane === item.id} onClick={() => { setLane(item.id); setSelected(null); setTaskEditor(null); setProviderConsent(false); }}>{item.name}<span>{counts(item.id)}</span></button>)}</nav><span className={styles.device}>This open workspace · save is optional</span></div>
      <p className={styles.boardHint}>{lane === 'today' ? 'Reviewed steps ready to move. Follow-up dates are checked when you open this workspace.' : lane === 'needs-you' ? 'Missing details, review decisions and things waiting on someone.' : 'Completed or cancelled steps, with your recorded evidence. Prepared drafts alone are not completed external work.'}</p>
      <div className={styles.board} data-empty={!plans.length || undefined}>
        <div className={styles.planList}>
          {!listed.length && <div className={styles.empty}><span className={styles.emptyMark} aria-hidden="true"><Check size={22} /></span><div><h3>{plans.length ? 'Nothing in this view' : 'No checklists yet'}</h3><p>{plans.length ? 'Nothing in this view right now.' : 'Your first checklist will appear here. Start with a note above.'}</p></div></div>}
          {listed.map((plan) => <button type="button" className={`${styles.planCard} ${selected === plan.id ? styles.selected : ''}`} key={plan.id} onClick={() => openPlan(plan)}><span className={styles.planCategory}>{lifeAdminTemplate(plan.category).name}{isLifeAdminFollowUpDue(plan) && <b>Check date reached</b>}</span><strong>{plan.title}</strong><span>{nextLifeAdminStep(plan)}</span><small>{plan.tasks.filter((task) => task.status === 'done').length}/{plan.tasks.length} steps recorded complete</small></button>)}
          {simple && visible.length > 1 && <p className={styles.hint}>{visible.length - 1} more kept out of the way. Switch to the full picture when you want them.</p>}
        </div>
        {active && activeTemplate && <article className={styles.detail} aria-labelledby="life-admin-active-title">
          <header className={styles.detailHeader}><div><p className={styles.eyebrow}>{activeTemplate.name}</p><h3 ref={activeHeading} tabIndex={-1} id="life-admin-active-title">{active.title}</h3></div><button type="button" aria-label="Close checklist details" onClick={() => { setSelected(null); setTaskEditor(null); setProviderConsent(false); }}><X size={18} /></button></header>
          <div className={styles.next}><span>JUST THE NEXT THING</span><p>{nextLifeAdminStep(active)}</p></div>
          <details className={styles.disclosure}><summary><FileText size={16} /> Source and exact details</summary><p>{active.source.title} · {active.source.method.replaceAll('-', ' ')}</p><pre>{active.source.text}</pre>{active.source.url && <a href={active.source.url} target="_blank" rel="noopener noreferrer">Open original source <ArrowUpRight size={14} /></a>}<h4>Exact matches, not confirmed deadlines</h4><pre>{extractDetails(active.source.text)}</pre></details>
          <fieldset className={styles.fields} disabled={busyId === active.id}><legend>{missing.length ? `${missing.length} detail${missing.length === 1 ? '' : 's'} to fill in` : active.reviewedAt ? 'The details you reviewed' : 'Source details to check'}</legend><p className={styles.hint}>Matching source excerpts are copied in where possible. Check their meaning or add what you know. Say “not stated” where the source is silent; check uncertainty before acting.</p>{activeTemplate.fields.map((field) => <label key={field.key}>{field.label}<textarea rows={2} value={active.fields[field.key] ?? ''} maxLength={2000} placeholder={field.hint} onChange={(event) => editField(active, field.key, event.target.value)} /></label>)}</fieldset>
          {!active.reviewedAt && <div className={styles.review}><label><input type="checkbox" checked={reviewChecked} disabled={Boolean(missing.length) || busyId === active.id} onChange={(event) => setReviewChecked(event.target.checked)} />I’ve checked the source, details and proposed steps below. Unknowns still need checking before I act.</label><button className={styles.primary} type="button" disabled={!reviewChecked || Boolean(missing.length) || busyId === active.id} onClick={review}><Check size={16} /> Review these steps together</button><small>This organises your checklist. It does not approve sending, payments, bookings or submissions.</small></div>}
          <ol className={styles.tasks}>{active.tasks.map((task) => <li key={task.id} className={styles.task}><div className={styles.taskHeading}><strong>{task.title}</strong><span>{task.status === 'done' ? task.kind === 'preparation' ? 'Checklist reviewed' : 'Done · recorded by you' : task.status.replaceAll('_', ' ')}</span></div><p>{task.detail}</p>{task.waitingFor && <p className={styles.waiting}>Waiting for: {task.waitingFor}<br />Check on: {task.followUpOn} · on-screen only</p>}{task.evidence && <details><summary>{task.evidence.kind === 'review' ? 'Review record' : 'Your completion evidence'}</summary><p>{task.evidence.note}</p><small>{task.evidence.at}</small>{task.evidence.url && <a href={task.evidence.url} target="_blank" rel="noopener noreferrer">Open evidence link</a>}</details>}
            <div className={styles.taskActions}>{task.kind === 'personal-action' && task.status === 'todo' && <><button type="button" disabled={busyId === active.id} onClick={() => setTaskEditor({ planId: active.id, taskId: task.id, status: 'done', note: '', url: '', date: '' })}>I’ve done this</button><button type="button" disabled={busyId === active.id} onClick={() => setTaskEditor({ planId: active.id, taskId: task.id, status: 'waiting', note: '', url: '', date: active.followUpOn ?? '' })}>Waiting on something</button></>}{task.status === 'waiting' && <><button type="button" disabled={busyId === active.id} onClick={() => setTaskEditor({ planId: active.id, taskId: task.id, status: 'done', note: '', url: '', date: '' })}>I’ve done this</button><button type="button" disabled={busyId === active.id} onClick={() => transition(active, task.id, { status: 'todo' })}>Ready again</button></>}{task.status === 'done' && task.kind === 'personal-action' && <button type="button" disabled={busyId === active.id} onClick={() => transition(active, task.id, { status: 'todo' })}>Reopen step</button>}{task.status === 'cancelled' && <button type="button" disabled={busyId === active.id} onClick={() => transition(active, task.id, { status: 'restore' })}>Restore step for review</button>}{!['done', 'cancelled'].includes(task.status) && <button type="button" disabled={busyId === active.id} onClick={() => transition(active, task.id, { status: 'cancelled' })}>Skip this step</button>}</div>
            {taskEditor?.taskId === task.id && <form className={styles.recordForm} onSubmit={recordStep}><label>{taskEditor.status === 'done' ? 'What confirms it is done?' : 'Who or what are you waiting for?'}<textarea rows={2} value={taskEditor.note} minLength={taskEditor.status === 'done' ? 8 : 3} maxLength={2000} required placeholder={taskEditor.status === 'done' ? 'e.g. School confirmed receipt today; reference held in my email' : 'e.g. The school’s answer about collection time'} onChange={(event) => setTaskEditor({ ...taskEditor, note: event.target.value })} /></label>{taskEditor.status === 'done' ? <label>Evidence link, if useful<input type="url" value={taskEditor.url} maxLength={2000} onChange={(event) => setTaskEditor({ ...taskEditor, url: event.target.value })} placeholder="https://…" /><small>Do not paste private access tokens. URL queries are removed.</small></label> : <label>When will you check again?<input type="date" required value={taskEditor.date} onChange={(event) => setTaskEditor({ ...taskEditor, date: event.target.value })} /></label>}<div className={styles.taskActions}><button className={styles.primary} type="submit">Save this record</button><button type="button" onClick={() => setTaskEditor(null)}>Cancel</button></div></form>}
          </li>)}</ol>
          <div className={styles.followUp}><label>Your next check date<input type="date" value={active.followUpOn ?? ''} disabled={busyId === active.id} onChange={(event) => setFollowUp(active, event.target.value)} /></label><p>No background reminder is scheduled. Download an all-day calendar file if you want to import it into your own calendar.</p>{active.followUpOn && <button type="button" onClick={() => { saveFile('do-follow-up.ics', lifeAdminCalendarFile(active), 'text/calendar;charset=utf-8'); setNotice('Calendar file downloaded. Import and review it in your calendar; no calendar was changed by DO.'); }}><ArrowDownToLine size={16} /> Download calendar file</button>}</div>
          <details className={styles.disclosure}><summary><Sparkles size={16} /> Make the draft more useful</summary><p>Optional: ask DO to turn this checklist into a tailored brief, list or draft message.</p><p className={styles.hint}>This sends the source note, title and all details above to assembl’s configured Anthropic, OpenAI, Google or Groq generation provider. Include children’s, health or other sensitive details only if you want them used for this one draft. No passwords, identity numbers or payment details.</p><label className={styles.consent}><input type="checkbox" checked={providerConsent} disabled={Boolean(busyId)} onChange={(event) => setProviderConsent(event.target.checked)} />Send these notes and details to the configured provider for this draft.</label><div className={styles.taskActions}><button className={styles.primary} type="button" disabled={!providerConsent || Boolean(busyId)} onClick={() => void prepare()}>{busyId === active.id ? 'Preparing…' : 'Prepare my draft'}</button>{busyId === active.id && <button type="button" onClick={() => request.current?.abort()}>Stop</button>}</div><small>Uses your DO sign-in and Assembl’s configured drafting provider. This flow does not use the TypeSafe check. Availability is checked when you ask; local checklists still work if generation is unavailable.</small></details>
          {active.generated && <section className={styles.generated}><h4>Your generated draft · review before using</h4><pre>{active.generated.text}</pre><details><summary>Preparation evidence</summary><p>Provider: {active.generated.model ?? 'Not recorded'}<br />Prepared: {active.generated.createdAt}</p><p className={styles.hash}>Source fingerprint: {active.generated.sourceHash}<br />Original output fingerprint: {active.generated.outputHash}</p><p>Draft preparation only. This is not evidence of sending or external completion.</p></details></section>}
          {['vehicle', 'transport', 'travel'].includes(active.category) && <LifeAdminTraffic />}
          {activeTemplate.resources.length > 0 && <div className={styles.resources}><h4>Useful NZ sources</h4>{activeTemplate.resources.map((resource) => <div key={resource.url}><a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title} <ArrowUpRight size={14} /></a><p>{resource.note}</p></div>)}</div>}
          <p className={styles.boundary}>{activeTemplate.guardrail}</p><button type="button" className={styles.export} onClick={() => { saveFile(`do-${active.category}-checklist.txt`, lifeAdminPack(active)); setNotice('Private checklist downloaded to this device. It has not been shared.'); }}><ArrowDownToLine size={16} /> Download my checklist and evidence</button>
        </article>}
      </div>
      <div className={styles.notice} role="status" aria-live="polite">{notice}{undo && <button type="button" disabled={Boolean(busyId)} onClick={() => { replacePlan(undo); setLane(lifeAdminLane(undo)); setUndo(null); setTaskEditor(null); setNotice('Last checklist change undone. Nothing outside DO was changed.'); }}><RotateCcw size={15} /> Undo last checklist change</button>}</div>
      </details>
      </div>

      <details className={styles.moreChecklists}><summary>More things to sort <Plus size={17} /></summary><div className={styles.starters} aria-label="Everyday NZ checklists">{LIFE_ADMIN_TEMPLATES.map((item, index) => <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => { setCategory(item.id); setShowExamples(false); setLocalOpen(true); requestAnimationFrame(() => sourceRef.current?.focus()); }}><span className={styles.starterIndex} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span>{item.name}</span><small>{item.description}</small><ChevronRight size={16} /></button>)}</div><button type="button" className={styles.textButton} onClick={() => { setShowExamples(true); document.getElementById('life-admin-heading')?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }}>Show visual examples</button></details>
      <details className={styles.connections}><summary>Need to work in another app? <ArrowUpRight size={15} /></summary><p>Start here without connecting anything. Add a browser companion when you want to bring in something from another page.</p><Link href="/do/install#chrome">Set up the browser companion <ArrowUpRight size={15} /></Link><br /><Link href="/do/widget">Open the writing workspace <ArrowUpRight size={15} /></Link><p className={styles.hint}>The companion can bring selected context back for review. It does not give DO permission to send, pay or change an account. A personal cloud computer is not connected here.</p></details>
      <div className={styles.notice} role="status" aria-live="polite">{!boardOpen ? notice : ''}</div>
      {storageKey && <ChecklistCloud ownerId={storageScope} plans={plans} disabled={Boolean(busyId)} onRestore={restored => { setPlans(restored); if (restored.length) setBoardOpen(true); }} />}
      <details className={styles.storage}><summary>Keep this for later</summary><p>Checklists stay in this open page unless you save a snapshot. {storageScope === 'guest' ? 'Sign in to use account-scoped browser snapshots. Guest checklists are not transferred automatically.' : !storageKey ? 'Account identity could not be checked, so browser snapshots are unavailable.' : ''} Browser snapshots are not encrypted and do not sync. They are separated by DO account. Guest mode stays in this open page; download a checklist to keep it. Someone with access to this browser’s stored data may still be able to read them. Prefer a download for private information on a shared device.</p><label className={styles.consent}><input type="checkbox" checked={saveAllowed} disabled={!storageKey} onChange={(event) => setSaveAllowed(event.target.checked)} />I want to save or open checklist data in this browser for this DO account.</label><div className={styles.taskActions}><button type="button" disabled={!saveAllowed || !plans.length || Boolean(busyId)} onClick={persist}>Save browser snapshot</button><button type="button" disabled={!saveAllowed || Boolean(busyId)} onClick={restore}>Open saved snapshot</button><button type="button" disabled={!storageKey} onClick={() => setForgetConfirm(true)}>Remove saved snapshot</button></div>{forgetConfirm && <div className={styles.confirm}><p>Remove the snapshot saved by this browser? Open checklists will stay here.</p><button type="button" onClick={forget}>Yes, remove snapshot</button><button type="button" onClick={() => setForgetConfirm(false)}>Keep it</button></div>}</details>
      <details className={styles.capabilities}><summary>What works here, and what needs another step</summary><div>{LIFE_ADMIN_CAPABILITIES.map((capability) => <section key={capability.name}><h4>{capability.name}<span>{capability.status}</span></h4><p>{capability.detail}</p></section>)}</div><p>{LIFE_ADMIN_BOUNDARY}</p></details>
    </section>
  );
}
