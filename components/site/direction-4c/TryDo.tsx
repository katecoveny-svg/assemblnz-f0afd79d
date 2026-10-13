'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

// Simulated DO job from the Direction 4c design. Nothing here reads, uploads, sends or stores
// anything: every job, file chip and voice transcript is fictional and labelled as simulated.

type JobKey = 'shop' | 'travel' | 'bills' | 'meeting' | 'school' | 'writing';
type Scenario = { name: string; title: string; lines: [string, string, string, string, string]; ask: string; used: string; action: string };
type Mode = 'write' | 'talk' | 'add';
type Voice = 'Plain' | 'Warm';

export type TryDoSignals = { setLit(value: number): void; pulse(): void };

const SCENARIOS: Record<JobKey, Scenario> = {
  shop: { name: 'Shopping DO', title: 'Plan this week’s shop', lines: ['Opening your pantry notes and last week’s list. Nothing else.', 'Five dinners and one list, grouped by aisle. Nothing bought.', '', 'Saving the list to your notes.', 'Checking the list is there.'], ask: 'Save this list to your notes?', used: 'Pantry notes, last week’s list', action: 'List saved to your notes' },
  travel: { name: 'Travel DO', title: 'Organise a weekend away', lines: ['Opening your travel notes and your calendar.', 'A two-night plan, ready to edit. Nothing booked.', '', 'Holding Friday afternoon in your calendar.', 'Checking the hold is there.'], ask: 'Hold Friday afternoon in your calendar?', used: 'Your travel notes, your calendar', action: 'Friday afternoon held in your calendar' },
  bills: { name: 'Bills DO', title: 'Review my bills', lines: ['Opening the three bills you added. Nothing else.', 'Power, phone and insurance side by side. Any savings shown are estimates, not verified.', '', 'Saving the summary to your notes.', 'Checking the summary is there.'], ask: 'Save the bill summary to your notes?', used: 'Three bills you added', action: 'Summary saved to your notes' },
  meeting: { name: 'Meeting DO', title: 'Turn Tuesday’s meeting into notes', lines: ['Opening the transcript and the project plan.', 'Two decisions and four actions. One action has no owner yet.', '', 'Putting the notes in your email drafts.', 'Checking the draft is there.'], ask: 'Put the notes in your email drafts?', used: 'Meeting transcript, project plan', action: 'Notes saved to your email drafts' },
  school: { name: 'School admin DO', title: 'Sort the school newsletter', lines: ['Opening the newsletter and the family calendar. Nothing else.', 'Three dates found. The camp cost is missing, so DO drafted a question for the school.', '', 'Adding three dates to the family calendar.', 'Checking all three landed.'], ask: 'Add three dates to the family calendar?', used: 'Term 4 newsletter, family calendar', action: 'Three dates added to the family calendar' },
  writing: { name: 'Writing DO', title: '', lines: ['Working only from what you typed.', '', '', 'Putting the draft in your email drafts.', 'Checking the draft is there.'], ask: 'Put this draft in your email drafts?', used: 'Only what you typed', action: 'Draft saved to your email drafts' },
};

const EXAMPLES = ['Prepare a reply to my property manager', 'Turn Tuesday’s meeting into notes', 'Sort the school newsletter'];
const MORE_JOBS: [string, string][] = [['Turn a meeting into notes', 'Turn Tuesday’s meeting into notes'], ['Sort a school notice', 'Sort the school newsletter'], ['Draft a reply', 'Prepare a reply to my property manager']];
const STEP_LABELS = ['know', 'prepare', 'permit', 'do', 'verify', 'receipt'];
const STATUS = ['DEMO · READING', 'DEMO · PREPARING', 'SIMULATED APPROVAL', 'DOING · SIMULATED', 'DEMO · CHECKING', 'SIMULATED RECEIPT', 'DEMO · NOT NOW'];
// Step n advances to the next step after a pause; step 2 waits for Approve / Not now.
const AUTO_ADVANCE: Partial<Record<number, [number, number]>> = { 0: [1100, 1], 1: [1500, 2], 3: [1100, 4], 4: [1000, 5] };
const PARKED = 6, DONE = 5;
const MODES: [Mode, string][] = [['write', 'Write'], ['talk', 'Talk'], ['add', 'Add']];
const ATTACHMENTS = { photo: 'photo · power-bill.jpg', file: 'file · insurance-renewal.pdf', link: 'link · ferry timetable' };
const TALK_PHRASE = 'Organise a weekend away in the Bay of Islands';

function pickJob(text: string): JobKey {
  if (/shop|grocer|dinner|meal|supermarket/i.test(text)) return 'shop';
  if (/weekend|trip|travel|holiday|away/i.test(text)) return 'travel';
  if (/bill|power|phone|insurance|saving/i.test(text)) return 'bills';
  if (/meeting|transcript|minutes/i.test(text)) return 'meeting';
  if (/school|newsletter|notice|camp/i.test(text)) return 'school';
  return 'writing';
}

const Plus = () => <svg viewBox="0 0 24 24" aria-hidden="true" className="td-icon td-icon-14"><path d="M5 12h14" /><path d="M12 5v14" /></svg>;
const Arrow = () => <svg viewBox="0 0 24 24" aria-hidden="true" className="td-icon td-icon-15"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>;

export function TryDo({ signals }: { signals: { current: TryDoSignals | null } }) {
  const [text, setText] = useState('');
  const [notes, setNotes] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('write');
  const [files, setFiles] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [menu, setMenu] = useState<'more' | 'custom' | null>(null);
  const [voice, setVoice] = useState<Voice>('Plain');
  const [job, setJob] = useState<{ key: JobKey; text: string } | null>(null);
  const [step, setStep] = useState(-1);
  const [approvedAt, setApprovedAt] = useState('');

  const timers = useRef<number[]>([]);
  const voiceTimers = useRef<number[]>([]);
  const exampleIndex = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const jobHeadingRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const focusAfter = useRef<'job' | 'input' | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const uid = useId();

  const later = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };
  const clearTimers = () => { timers.current.forEach(id => clearTimeout(id)); timers.current = []; };
  useEffect(() => {
    const pending = timers, voice = voiceTimers;
    return () => { pending.current.forEach(id => clearTimeout(id)); voice.current.forEach(id => clearTimeout(id)); };
  }, []);

  const cancelVoice = () => {
    voiceTimers.current.forEach(id => clearTimeout(id)); voiceTimers.current = [];
    setListening(false); setHeard('');
  };
  const selectMode = (next: Mode) => { cancelVoice(); setMode(next); };

  // Steps advance themselves on a timer; the ref always points at the latest render's go().
  const goRef = useRef<(n: number) => void>(() => {});
  const go = (n: number) => {
    setStep(n);
    signals.current?.setLit(Math.min(1, (n + 1) / 6));
    if (n === DONE) signals.current?.pulse();
    const next = AUTO_ADVANCE[n];
    if (next) later(next[0], () => goRef.current(next[1]));
  };
  useEffect(() => { goRef.current = go; });

  const start = (value?: string) => {
    const trimmed = (value ?? text).trim();
    if (!trimmed) return;
    clearTimers(); cancelVoice();
    setText(trimmed); setJob({ key: pickJob(trimmed), text: trimmed }); setApprovedAt(''); setMenu(null); setListening(false); setHeard('');
    focusAfter.current = 'job';
    go(0);
  };

  const approve = () => {
    setApprovedAt(new Date().toLocaleTimeString('en-NZ', { hour: 'numeric', minute: '2-digit' }));
    go(3);
  };
  const park = () => { clearTimers(); setStep(PARKED); signals.current?.setLit(0.5); };
  const reset = () => {
    clearTimers(); cancelVoice(); setJob(null); setStep(-1); setText(''); setFiles([]); setMode('write');
    signals.current?.setLit(0);
    focusAfter.current = 'input';
  };

  // Keep keyboard and screen-reader users in place when the card swaps between form and job.
  useEffect(() => {
    const target = focusAfter.current === 'job' ? jobHeadingRef.current : focusAfter.current === 'input' ? inputRef.current : null;
    if (target) { focusAfter.current = null; target.focus({ preventScroll: true }); }
  }, [job, mode]);

  // Popovers close on outside press and Escape, returning focus to their trigger.
  useEffect(() => {
    if (!menu) return;
    const card = cardRef.current;
    const onDown = (e: PointerEvent) => { if (!(e.target as Element).closest?.('[data-pop]')) setMenu(null); };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMenu(null);
      card?.querySelector<HTMLButtonElement>(`[data-pop-trigger="${menu}"]`)?.focus();
    };
    addEventListener('pointerdown', onDown); addEventListener('keydown', onKey);
    return () => { removeEventListener('pointerdown', onDown); removeEventListener('keydown', onKey); };
  }, [menu]);

  const listen = () => {
    if (listening) return;
    cancelVoice();
    const voiceLater = (ms: number, fn: () => void) => { voiceTimers.current.push(window.setTimeout(fn, ms)); };
    const words = TALK_PHRASE.split(' ');
    setListening(true); setHeard('');
    words.forEach((_, i) => voiceLater(500 + i * 190, () => setHeard(words.slice(0, i + 1).join(' '))));
    voiceLater(500 + words.length * 190 + 700, () => {
      setListening(false); setHeard(''); setText(TALK_PHRASE); setMode('write');
      focusAfter.current = 'input';
    });
  };

  const addFile = (kind: keyof typeof ATTACHMENTS) => {
    const label = ATTACHMENTS[kind];
    setFiles(list => list.includes(label) ? list : [...list, label]);
    selectMode('write');
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    const edge = e.key === 'Home' ? 0 : e.key === 'End' ? MODES.length - 1 : -1;
    if (!delta && edge < 0) return;
    e.preventDefault();
    const next = edge >= 0 ? edge : (index + delta + MODES.length) % MODES.length;
    selectMode(MODES[next][0]);
    tabRefs.current[next]?.focus();
  };

  const scenario = job ? SCENARIOS[job.key] : null;
  const parked = step === PARKED, done = step === DONE;
  const completed = parked ? 2 : done ? 6 : Math.max(0, step);
  const lines = !scenario ? [] : job?.key === 'writing'
    ? [scenario.lines[0], voice === 'Warm' ? 'A warm, clear draft, ready for you to edit.' : 'A plain, clear draft, ready for you to edit.', '', scenario.lines[3], scenario.lines[4]]
    : scenario.lines;
  const line = !scenario ? '' : step === 2 ? scenario.ask : parked ? 'This example is paused. No draft is saved.' : done ? 'Example complete. This is a fictional receipt.' : lines[step] ?? '';
  const receipt: [string, string][] = scenario && job ? [
    ['job', scenario.title || job.text],
    ['used', scenario.used],
    ['approved by', `you · ${approvedAt || 'just now'}`],
    ['action', `${scenario.action} · simulated`],
  ] : [];
  const panelId = `${uid}-panel`;

  return (
    <section id="try-demo" data-sec="" data-screen-label="Try DO" className="td-section" aria-labelledby={`${uid}-title`}>
      <div className="td-wrap">
        <p className="td-kicker">DO walkthrough · simulated</p>
        <p className="td-demo-notice">Fictional walkthrough only. No accounts, microphone or files are accessed. Nothing is saved, sent or booked. Use the links above to work in DO.</p>
        <div data-rv="0">
          <div ref={cardRef} className="td-card">
            <div aria-hidden="true" className="td-glow" />
            <div className="td-head">
              <div className="td-brand">
                <span className="td-brand-mark"><Image src="/direction-4c/assets/brand/do-d-glass-transparent.png" alt="" width={34} height={34} /></span>
                <span className="td-brand-name"><strong>DO</strong><span>by assembl</span></span>
              </div>
              <div className="td-head-actions">
                <button type="button" data-pop="" data-pop-trigger="more" aria-expanded={menu === 'more'} aria-controls={`${uid}-more`} className="td-ghost" onClick={() => setMenu(m => m === 'more' ? null : 'more')}>
                  <span className="td-underline">More</span><Plus />
                </button>
                <button type="button" data-pop="" data-pop-trigger="custom" aria-expanded={menu === 'custom'} aria-controls={`${uid}-custom`} className="td-chip" onClick={() => setMenu(m => m === 'custom' ? null : 'custom')}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="td-icon td-icon-15"><path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4" /></svg>Customise DO
                </button>
              </div>
            </div>

            {menu === 'more' && (
              <div id={`${uid}-more`} data-pop="" className="td-pop" role="group" aria-label="More jobs for DO">
                <p className="td-mono td-pop-title">more jobs for DO</p>
                {MORE_JOBS.map(([label, prompt]) => (
                  <button key={label} type="button" className="td-pop-item" onClick={() => start(prompt)}>{label}</button>
                ))}
              </div>
            )}
            {menu === 'custom' && (
              <div id={`${uid}-custom`} data-pop="" className="td-pop td-pop-custom" role="group" aria-label="Customise DO">
                <p className="td-mono td-pop-label">customise DO</p>
                <div className="td-row">
                  <span className="td-voice-label">Draft voice</span>
                  <div role="group" aria-label="Draft voice" className="td-seg">
                    {(['Plain', 'Warm'] as Voice[]).map(v => (
                      <button key={v} type="button" aria-pressed={voice === v} className="td-seg-btn" onClick={() => setVoice(v)}>{v}</button>
                    ))}
                  </div>
                </div>
                <p className="td-lock-note">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="td-icon td-icon-16 td-lock"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  This example includes a review step. Real DO tools have their own permissions and review requirements.
                </p>
              </div>
            )}

            {!scenario && (
              <>
                <h3 id={`${uid}-title`} className="td-title">What would you like <span className="td-accent">done?</span></h3>
                <p className="td-sub">Explore a fictional example of the review steps.</p>
                <div role="tablist" aria-label="How to ask DO" className="td-tabs">
                  {MODES.map(([key, label], i) => (
                    <button
                      key={key}
                      ref={el => { tabRefs.current[i] = el; }}
                      type="button"
                      role="tab"
                      id={`${uid}-tab-${key}`}
                      aria-selected={mode === key}
                      aria-controls={panelId}
                      tabIndex={mode === key ? 0 : -1}
                      className="td-tab"
                      onClick={() => { selectMode(key); setMenu(null); }}
                      onKeyDown={e => onTabKey(e, i)}
                    >
                      {label}{key === 'add' && <Plus />}
                    </button>
                  ))}
                </div>

                <div id={panelId} role="tabpanel" aria-labelledby={`${uid}-tab-${mode}`}>
                  {mode === 'write' && (
                    <div className="td-panel">
                      <label className="td-block">
                        <span className="td-sr">What would you like done?</span>
                        <textarea
                          ref={inputRef}
                          value={text}
                          onChange={e => setText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); start(); } }}
                          rows={3}
                          placeholder="e.g. Prepare a reply to my property manager"
                          className="td-input"
                        />
                      </label>
                      {files.length > 0 && (
                        <ul className="td-files" aria-label="Added for this job">
                          {files.map(f => <li key={f} className="td-file">{f}</li>)}
                        </ul>
                      )}
                      <div className="td-panel-foot">
                        <span className="td-review">
                          <span aria-hidden="true" className="td-switch"><i /></span>Review drafts before sharing
                        </span>
                        <button type="button" className="td-start" disabled={!text.trim()} onClick={() => start()}>Run example<Arrow /></button>
                      </div>
                    </div>
                  )}
                  {mode === 'talk' && (
                    <div className="td-panel td-panel-talk">
                      <button type="button" className="td-mic" aria-label={listening ? 'Simulated voice example playing' : 'Play simulated voice example'} aria-pressed={listening} onClick={listen}>
                        {listening && <span aria-hidden="true" className="td-mic-ring" />}
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="td-icon td-icon-26"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><path d="M12 19v3" /></svg>
                      </button>
                      <p aria-live="polite" className="td-talk-line">{listening ? heard || 'Playing example…' : 'Play a fictional voice example. Your microphone is not used.'}</p>
                      <p className="td-mono td-note">voice is simulated on this page</p>
                    </div>
                  )}
                  {mode === 'add' && (
                    <div className="td-panel">
                      <p className="td-add-lead">Give DO something to work from.</p>
                      <div className="td-add-row">
                        <button type="button" className="td-add" onClick={() => addFile('photo')}>
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="td-icon td-icon-16"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" /></svg>Photo
                        </button>
                        <button type="button" className="td-add" onClick={() => addFile('file')}>
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="td-icon td-icon-16"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>File
                        </button>
                        <button type="button" className="td-add" onClick={() => addFile('link')}>
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="td-icon td-icon-16"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>Link
                        </button>
                      </div>
                      <p className="td-mono td-note td-note-gap">simulated · nothing is uploaded on this page</p>
                    </div>
                  )}
                </div>

                <button type="button" aria-expanded={notesOpen} aria-controls={`${uid}-notes`} className="td-notes-toggle" onClick={() => setNotesOpen(o => !o)}>
                  <span className="td-underline">Notes &amp; references</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="td-icon td-icon-15 td-chevron" style={{ transform: `rotate(${notesOpen ? 180 : 0}deg)` }}><path d="m6 9 6 6 6-6" /></svg>
                </button>
                {notesOpen && (
                  <label id={`${uid}-notes`} className="td-block td-notes">
                    <span className="td-sr">Notes and references</span>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Links, details or anything DO should use" className="td-notes-input" />
                  </label>
                )}

                <div className="td-cards">
                  <button type="button" className="td-job td-job-shop" onClick={() => start('Plan this week’s shop')}><span className="td-mono">Shop</span><span className="td-job-title">Plan this week’s shop</span></button>
                  <button type="button" className="td-job td-job-travel" onClick={() => start('Organise a weekend away')}><span className="td-mono">Travel</span><span className="td-job-title">Organise a weekend away</span></button>
                  <button type="button" className="td-job td-job-save" onClick={() => start('Review my bills')}><span className="td-mono">Save</span><span className="td-job-title">Review my bills</span></button>
                </div>
                <p className="td-fine">Plans and drafts for your review. No purchases, bookings or verified savings.</p>
                <button type="button" className="td-example" onClick={() => start(EXAMPLES[exampleIndex.current++ % EXAMPLES.length])}>
                  Try a fictional example
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="td-icon td-icon-15"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              </>
            )}

            {scenario && job && (
              <div className="td-job-view">
                <div className="td-job-meta">
                  <span className="td-mono td-job-name">{scenario.name}</span>
                  <span role="status" className="td-status"><i aria-hidden="true" />{STATUS[step] ?? ''}</span>
                </div>
                <h3 id={`${uid}-title`} ref={jobHeadingRef} tabIndex={-1} className="td-job-heading">{scenario.title || job.text}</h3>
                <ol aria-label="Job progress" className="td-steps">
                  {STEP_LABELS.map((label, i) => {
                    const complete = i < completed, current = !parked && !done && i === step;
                    return (
                      <li key={label} data-state={complete ? 'done' : current ? 'current' : 'todo'} aria-current={current ? 'step' : undefined}>
                        <i aria-hidden="true" className="td-step-bar" />
                        <span><i aria-hidden="true" className="td-step-dot" />{label}</span>
                      </li>
                    );
                  })}
                </ol>
                <p aria-live="polite" className="td-line">{line}</p>
                {step === 2 && (
                  <div className="td-actions">
                    <button type="button" className="td-approve" onClick={approve}>Simulate approval</button>
                    <button type="button" className="td-park" onClick={park}>Not now</button>
                  </div>
                )}
                {done && (
                  <dl className="td-receipt" aria-label="Receipt">
                    {receipt.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                  </dl>
                )}
                {(done || parked) && (
                  <div className="td-actions td-actions-center">
                    <Link href="/do?tool=write" className="td-open">Open the full DO <Arrow /></Link>
                    <button type="button" className="td-again" onClick={reset}>Try another job</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
