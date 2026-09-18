'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Mic, Square, ArrowUpRight, Download, FileText, Check, Headphones, Monitor } from 'lucide-react';
import { DoMark } from '@/components/do/DoMark';
import { DoProductFrame } from '@/components/do/DoProductFrame';
import type { DoPreparedDraft } from '@/apps/do/shared/preparation';
import { parseMeetingSmartNotes } from '@/apps/do/shared/meeting-smart-notes';
import styles from '@/components/do/do-product-focus.module.css';

export type MeetingExperienceProps = {
  preview: boolean; captureMode: 'microphone' | 'meeting';
  permission: boolean; shareAudio: boolean; shareNotes: boolean;
  recording: boolean; starting: boolean; busy: boolean; activity: 'transcribe' | 'smart-notes' | null;
  hasAudio: boolean; audioUrl: string; extension: string; notes: string; draft: string;
  receipt: DoPreparedDraft | null; reviewed: boolean; signedIn: boolean | null;
  transcriptionReady: boolean | null; message: string;
  setCaptureMode: (mode: 'microphone' | 'meeting') => void;
  setPermission: (value: boolean) => void; setShareAudio: (value: boolean) => void;
  setShareNotes: (value: boolean) => void; editNotes: (value: string) => void;
  editDraft: (value: string) => void; setReviewed: (value: boolean) => void;
  start: () => void; stop: () => void; process: (kind: 'transcribe' | 'smart-notes') => void;
  handoff: () => void; cancel: () => void; refreshConnection: () => void;
};

function saveText(text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'meeting-notes.txt';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Presentation only: all recording, consent and provider work belongs to MeetingDo. */
export function MeetingDoExperience(p: MeetingExperienceProps) {
  const [paste, setPaste] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [tab, setTab] = useState<'notes' | 'transcript' | 'details'>('notes');
  const [editing, setEditing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [replace, setReplace] = useState(false);
  const resultRef = useRef<HTMLElement>(null);
  const firstResult = useRef(false);
  useEffect(() => {
    if (!p.recording) return;
    const began = Date.now();
    const tick = () => setElapsed(Math.floor((Date.now() - began) / 1000));
    const timer = setInterval(tick, 500); return () => clearInterval(timer);
  }, [p.recording]);
  useEffect(() => {
    if (!p.draft) { firstResult.current = false; return; }
    if (!firstResult.current) { firstResult.current = true; resultRef.current?.focus({ preventScroll: false }); }
  }, [p.draft]);
  const active = p.recording || p.starting;
  const sections = parseMeetingSmartNotes(p.draft);
  const ready = Boolean(p.draft.trim());
  const hasNotes = Boolean(p.notes.trim());
  const step = ready ? 3 : hasNotes ? 2 : p.hasAudio ? 1 : 0;
  const time = `${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`;
  const auth = p.signedIn === false ? <p className={styles.notice}><Link href="/login?redirect=%2Fdo%2Fmeetings" target="_blank" rel="noopener noreferrer">Sign in in a new tab</Link>, then return here. <button type="button" className={styles.textButton} onClick={p.refreshConnection}>Refresh connection status</button> Download your recording before leaving this page.</p> : null;

  return <DoProductFrame product="meeting" board="meeting-do">
    {p.preview && <p className={styles.notice}>Sample notes for layout review. No meeting or model call took place.</p>}
    <div className={styles.progress} aria-label="Meeting progress">
      {['Record', 'Transcript', 'Notes'].map((label, index) => <span key={label} data-current={(index === 0 ? step <= 1 : index === 1 ? step === 2 : step === 3) || undefined}><i aria-hidden="true">{index + 1}</i>{label}</span>)}
    </div>
    <section className={styles.hero}>
      <p className={styles.kicker}>MEETING DO</p>
      <h1>{active ? 'Stay in the conversation.' : ready ? 'The conversation, assembled.' : 'Be in the conversation.'}</h1>
      <p>{ready ? 'Your notes are ready to read, edit and take forward.' : 'Record here. Prepare useful notes. Decide what happens next.'}</p>
    </section>
    {!ready && !hasNotes && <section className={styles.recorder} aria-label="Meeting recorder" data-recording={p.recording || undefined}>
      <div className={styles.recorderTop}>
        <div className={styles.sourceSwitch} role="group" aria-label="Recording source">
          <button type="button" aria-pressed={p.captureMode === 'microphone'} disabled={active || p.busy} onClick={() => p.setCaptureMode('microphone')}><Mic size={15} />In person</button>
          <button type="button" aria-pressed={p.captureMode === 'meeting'} disabled={active || p.busy} onClick={() => p.setCaptureMode('meeting')}><Monitor size={15} />Online meeting</button>
        </div>
        <span className={styles.localLabel}>{p.recording ? 'RECORDING ON THIS DEVICE' : 'YOU CHOOSE WHEN TO SHARE'}</span>
      </div>
      <div className={styles.recordObject} aria-hidden="true">
        <span className={styles.recordRing} /><span className={styles.recordRingInner} />
        <div className={styles.recordDisc}><DoMark /></div>
      </div>
      <p className={styles.recordCaption}>{p.recording ? time : p.starting ? 'Awaiting your permission' : p.hasAudio ? 'Recording captured' : 'Ready when you are'}</p>
      <p className={styles.recordSub}>{p.recording ? 'The ring shows recording activity, not sound levels.' : p.hasAudio ? 'Listen back before sharing for transcription.' : 'Your microphone stays off until you start.'}</p>
      {!p.hasAudio && !p.recording && <label className={styles.consent}><input type="checkbox" checked={p.permission} disabled={active || p.busy} onChange={e => p.setPermission(e.target.checked)} /><span>Everyone has been informed and I have permission to record.</span></label>}
      {p.recording ? <button className={styles.primary} type="button" onClick={p.stop}><Square size={17} fill="currentColor" />Stop recording</button>
        : !p.hasAudio ? <button className={styles.primary} type="button" disabled={!p.permission || active || p.busy} onClick={() => { setElapsed(0); p.start(); }}><Mic size={18} />{p.starting ? 'Waiting for permission…' : 'Start recording'}</button> : null}
      <p className={styles.limit}>10-minute limit · keep this page open · download before leaving</p>
      {p.captureMode === 'meeting' && <p className={styles.help}>Choose the meeting tab and enable Share tab audio. System-audio support depends on your browser. No video is kept.</p>}
      {p.hasAudio && p.audioUrl && <div className={styles.playback}>
        <audio controls src={p.audioUrl} aria-label="Your meeting recording" />
        <a className={styles.textButton} href={p.audioUrl} download={`meeting-recording.${p.extension}`}><Download size={16} />Download recording</a>
      </div>}
      {p.hasAudio && <div className={styles.nextStep}>
        {auth}
        {p.transcriptionReady === false && <p className={styles.notice}>Transcription is not configured on this deployment. Keep your recording or paste a transcript below.</p>}
        <label className={styles.consent}><input type="checkbox" checked={p.shareAudio} disabled={p.busy || active} onChange={e => p.setShareAudio(e.target.checked)} /><span>Share this recording with Deepgram to make a transcript.</span></label>
        <button className={styles.primary} disabled={!p.shareAudio || p.busy || active || p.signedIn !== true || p.transcriptionReady !== true} onClick={() => p.process('transcribe')}>Create transcript <ArrowUpRight size={18} /></button>
        <details className={styles.secondaryDetails}><summary>Record again</summary><p>This replaces the local recording. Download the current one first.</p><label className={styles.consent}><input type="checkbox" checked={replace} onChange={e => setReplace(e.target.checked)} />I have kept what I need and have permission to record again.</label><button type="button" className={styles.textButton} disabled={!replace || p.busy || active} onClick={() => { setReplace(false); p.start(); }}>Replace recording</button></details>
      </div>}
    </section>}
    {!ready && !hasNotes && !active && <div className={styles.pasteChoice}>
      <button type="button" className={styles.textButton} aria-expanded={paste} disabled={p.busy} onClick={() => setPaste(!paste)}><FileText size={16} />I already have a transcript</button>
      {paste && <div><label className={styles.field}>Paste your transcript<textarea rows={6} maxLength={12000} disabled={p.busy} value={pastedText} onChange={e => setPastedText(e.target.value)} placeholder="Paste the conversation or your own meeting notes…" /></label><button className={styles.primary} disabled={!pastedText.trim() || p.busy} onClick={() => { p.editNotes(pastedText); setPaste(false); }}>Use this transcript <ArrowUpRight size={16} /></button></div>}
    </div>}
    {hasNotes && !ready && <section className={styles.document} aria-labelledby="transcript-title">
      <div className={styles.documentHead}><span className={styles.kicker}>THE SOURCE</span><span className={styles.kicker}>REVIEW BEFORE PREPARING</span></div>
      <h2 id="transcript-title">First, check the words.</h2><p>Correct names and anything the recording missed.</p>
      <label className={styles.field}>Transcript<textarea rows={10} maxLength={12000} disabled={p.busy} value={p.notes} onChange={e => p.editNotes(e.target.value)} /></label>
      {auth}
      <label className={styles.consent}><input type="checkbox" checked={p.shareNotes} disabled={p.busy} onChange={e => p.setShareNotes(e.target.checked)} /><span>Use this transcript with DO’s preparation provider to write my notes.</span></label>
      <button className={styles.primary} disabled={!p.shareNotes || p.busy || p.signedIn !== true} onClick={() => p.process('smart-notes')}>Prepare my notes <ArrowUpRight size={18} /></button>
    </section>}
    {p.busy && <div className={styles.preparing} role="status"><div className={styles.assemblingLines} aria-hidden="true"><i /><i /><i /></div><div><strong>{p.activity === 'transcribe' ? 'Turning the recording into words.' : 'Preparing your meeting notes.'}</strong><p>No invented progress percentage. You can stop this request.</p></div><button className={styles.textButton} onClick={p.cancel}>Stop</button></div>}
    {ready && <section ref={resultRef} tabIndex={-1} className={styles.document} aria-label="Prepared meeting notes">
      <div className={styles.documentHead}><span className={styles.kicker}>{p.preview ? 'SAMPLE LAYOUT' : p.reviewed ? 'REVIEW RECORDED ON THIS PAGE' : 'DRAFT · YOUR REVIEW'}</span><button className={styles.textButton} onClick={() => saveText(p.draft)}><Download size={15} />Download notes</button></div>
      <div className={styles.tabs} role="group" aria-label="Meeting content">
        {(['notes', 'transcript', 'details'] as const).map(value => <button key={value} aria-pressed={tab === value} onClick={() => setTab(value)}>{value === 'details' ? 'Source & receipt' : value === 'notes' ? 'Notes' : 'Transcript'}</button>)}
      </div>
      {tab === 'notes' && <>
        {editing ? <label className={styles.field}>Edit notes<textarea rows={16} value={p.draft} onChange={e => p.editDraft(e.target.value)} /></label> : <div className={styles.noteContent}>{sections.map(section => <article key={section.heading}><h3>{section.heading === 'Action items' ? 'Agreed next steps' : section.heading}</h3><p>{section.body}</p></article>)}</div>}
        <button className={styles.textButton} onClick={() => setEditing(!editing)}>{editing ? 'Finish editing' : 'Edit notes'}</button>
        <div className={styles.reviewAction}><label className={styles.consent}><input type="checkbox" checked={p.reviewed} onChange={e => p.setReviewed(e.target.checked)} /><span>I checked the notes, including owners and dates.</span></label><button className={styles.primary} disabled={!p.reviewed || p.preview || !p.draft.trim()} onClick={p.handoff}>Prepare the follow-up <ArrowUpRight size={18} /></button><p>Opens a draft in DO. Nothing is assigned, sent or published.</p></div>
      </>}
      {tab === 'transcript' && <><p className={styles.help}>Changing the source clears the prepared notes and requires a new preparation.</p><label className={styles.field}>Original transcript<textarea rows={14} value={p.notes} readOnly /></label><button className={styles.textButton} onClick={() => p.editNotes(p.notes)}>Edit transcript and prepare again</button></>}
      {tab === 'details' && <div className={styles.sourceReceipt}>
        <h3>What happened</h3><p>{p.preview ? 'This is a sample layout. No provider was called.' : 'Notes were prepared from the transcript you approved. No external action was taken. This is not a save to a client record.'}</p>
        {p.receipt && !p.preview && <dl><dt>Preparation ID</dt><dd>{p.receipt.id}</dd><dt>Method</dt><dd>{p.receipt.evidence.method}</dd><dt>Model</dt><dd>{p.receipt.evidence.model || 'No writing model'}</dd><dt>Source fingerprint</dt><dd>{p.receipt.evidence.sourceHash}</dd></dl>}
        {p.audioUrl && <><audio controls src={p.audioUrl} aria-label="Source recording" /><a className={styles.textButton} href={p.audioUrl} download={`meeting-recording.${p.extension}`}><Headphones size={16} />Keep the original audio</a></>}
      </div>}
    </section>}
    {p.message && <p className={styles.notice} role="status">{p.message}</p>}
    <p className={styles.privacyNote}><Check size={13} />Recording, sharing and follow-up are separate choices.</p>
  </DoProductFrame>;
}
