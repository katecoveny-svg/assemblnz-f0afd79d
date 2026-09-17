'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DoLivingBlob } from '@/components/do/DoLivingBlob';
import { DoWorkBoard } from '@/components/do/DoWorkBoard';
import { DoInstallPwaCta } from '@/components/do/DoInstallPwaCta';
import { DoTaskPanel } from '@/components/do/DoTaskPanel';
import { saveHomeBrief } from '@/apps/do/shared/home-handoff';
import {
  MEETING_SMART_NOTES_BRIEF,
  parseMeetingSmartNotes,
} from '@/apps/do/shared/meeting-smart-notes';
import type { DoPreparedDraft } from '@/apps/do/shared/preparation';
import '@/app/do/do-craft.css';
import styles from './meeting.module.css';

/**
 * Meeting DO — recording-first, phone-easy.
 * Pipeline: Capture → turn audio into notes → review.
 * Record + download work unsigned-in. Transcribe / write notes need sign-in.
 * `?phone=1` → one-screen Install → Record landing for tonight’s phone use.
 *
 * Compatible with per-DO to-do panel from PR #1303 (boardId meeting-do).
 */
function MeetingDoInner() {
  const router = useRouter();
  const params = useSearchParams();
  const phoneMode = params.get('phone') === '1';
  const previewNotes = params.get('previewNotes') === '1';
  const recordRef = useRef<HTMLElement | null>(null);
  const [captureMode, setCaptureMode] = useState<'microphone' | 'meeting'>('microphone');
  const audioContext = useRef<AudioContext | null>(null);
  const extraStreams = useRef<MediaStream[]>([]);
  const [permission, setPermission] = useState(false);
  const [shareAudio, setShareAudio] = useState(false);
  const [shareNotes, setShareNotes] = useState(false);
  const [recording, setRecording] = useState(false);
  const [starting, setStarting] = useState(false);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [draft, setDraft] = useState('');
  const [receipt, setReceipt] = useState<DoPreparedDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [deepgramConfigured, setDeepgramConfigured] = useState<boolean | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [editNotesOpen, setEditNotesOpen] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const alive = useRef(true);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef(false);
  const request = useRef<AbortController | null>(null);

  const release = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    extraStreams.current.forEach((s) => s.getTracks().forEach((t) => t.stop()));
    extraStreams.current = [];
    void audioContext.current?.close();
    audioContext.current = null;
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const stop = useCallback(() => {
    if (recorder.current?.state === 'recording') recorder.current.stop();
    release();
  }, [release]);

  const cancelCapture = useCallback(() => {
    generation.current++;
    stop();
  }, [stop]);

  useEffect(() => {
    alive.current = true;
    const leave = cancelCapture;
    window.addEventListener('pagehide', leave);
    return () => {
      alive.current = false;
      cancelCapture();
      request.current?.abort();
      window.removeEventListener('pagehide', leave);
    };
  }, [cancelCapture]);

  useEffect(() => {
    if (!audio) return;
    const url = URL.createObjectURL(audio);
    const frame = requestAnimationFrame(() => setAudioUrl(url));
    return () => {
      cancelAnimationFrame(frame);
      URL.revokeObjectURL(url);
    };
  }, [audio]);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/do/runtime', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((data: { signedIn?: boolean; trial?: { bypassed?: boolean } }) => {
        if (cancelled) return;
        setSignedIn(
          typeof data.signedIn === 'boolean'
            ? data.signedIn
            : Boolean(data.trial?.bypassed),
        );
      })
      .catch(() => {
        if (!cancelled) setSignedIn(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/do/meetings/transcribe', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((data: { configured?: boolean }) => {
        if (!cancelled) setDeepgramConfigured(Boolean(data.configured));
      })
      .catch(() => {
        if (!cancelled) setDeepgramConfigured(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Local UI preview of the review surface when preparation is unavailable (no model claim).
  useEffect(() => {
    if (!previewNotes) return;
    const sample = [
      'Meeting notes',
      'Avery and Jordan aligned on shipping phone Meeting DO for the demo after Install → Record works.',
      '',
      'Attendees',
      'Avery, Jordan, Riley',
      '',
      'Decisions / outcomes',
      'Ship soft launch for the demo once Install → Record is reliable.',
      '',
      'Action items',
      'Send invite · Owner: Riley · Due: Friday',
      '',
      'Open questions',
      'Budget not confirmed.',
      'Who hosts the follow-up?',
      '',
      'Suggested specialist DO',
      'Meeting DO — follow-up notes (draft)',
      '',
      'Follow-up email draft',
      'Subject: Soft launch for Meeting DO',
      'Kia ora — notes from today for review. Nothing sent automatically.',
    ].join('\n');
    setNotes(
      'Avery and Jordan discussed the phone Meeting DO for the demo. Decided to ship soft launch after Install → Record works. Riley will send the invite by Friday. Budget not confirmed. Open question: who hosts the follow-up?',
    );
    setDraft(sample);
    setReceipt({
      version: 1,
      id: '00000000-0000-4000-8000-000000000001',
      task: 'meeting-notes',
      title: 'Smart meeting notes · Meeting transcript',
      text: sample,
      createdAt: new Date().toISOString(),
      status: 'draft',
      evidence: {
        method: 'model',
        model: 'preview-only (not generated)',
        sourceTitle: 'Meeting transcript',
        sourceUrl: '',
        sourceHash: '0'.repeat(64),
        sourceCharacters: sample.length,
        instructionHash: '0'.repeat(64),
        outputHash: '0'.repeat(64),
        consentAt: new Date().toISOString(),
        boundary:
          'Preview layout only. No model was called. No message was sent.',
      },
    });
    setPasteOpen(true);
    setShareNotes(true);
  }, [previewNotes]);

  const noteSections = useMemo(
    () => (draft.trim() ? parseMeetingSmartNotes(draft) : []),
    [draft],
  );

  async function start() {
    if (!permission || pending.current || recording) return;
    pending.current = true;
    setStarting(true);
    setMessage('');
    const current = ++generation.current;
    try {
      let captured: MediaStream;
      if (captureMode === 'meeting') {
        const shared = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        if (!alive.current || current !== generation.current) {
          shared.getTracks().forEach((t) => t.stop());
          return;
        }
        extraStreams.current.push(shared);
        if (!shared.getAudioTracks().length) throw new Error('No meeting audio shared');
        const microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!alive.current || current !== generation.current) {
          microphone.getTracks().forEach((t) => t.stop());
          release();
          return;
        }
        extraStreams.current.push(microphone);
        const mixer = new AudioContext();
        audioContext.current = mixer;
        await mixer.resume();
        const destination = mixer.createMediaStreamDestination();
        mixer.createMediaStreamSource(new MediaStream(shared.getAudioTracks())).connect(destination);
        mixer.createMediaStreamSource(microphone).connect(destination);
        captured = destination.stream;
        shared.getVideoTracks().forEach((t) => t.addEventListener('ended', stop, { once: true }));
      } else {
        captured = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      if (!alive.current || current !== generation.current) {
        captured.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = captured;
      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4'].find((t) =>
        MediaRecorder.isTypeSupported(t),
      );
      const rec = new MediaRecorder(captured, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: 24000,
      });
      const chunks: Blob[] = [];
      let size = 0;
      rec.ondataavailable = (e) => {
        if (e.data.size) {
          chunks.push(e.data);
          size += e.data.size;
          if (size > 3_500_000 && rec.state === 'recording') stop();
        }
      };
      rec.onstop = () => {
        release();
        if (alive.current) {
          setAudio(new Blob(chunks, { type: rec.mimeType }));
          setRecording(false);
          setShareAudio(false);
          setMessage('Recording stopped. Listen and download before you leave this page.');
        }
      };
      rec.onerror = () => {
        stop();
        if (alive.current) setMessage('Recording encountered a problem. Check the captured audio.');
      };
      recorder.current = rec;
      rec.start(1000);
      setAudio(null);
      setAudioUrl('');
      setRecording(true);
      timer.current = setTimeout(stop, 10 * 60 * 1000);
    } catch {
      release();
      if (alive.current) {
        setMessage(
          captureMode === 'meeting'
            ? 'Meeting audio was not available. Select a tab and enable Share tab audio, or use microphone recording. System audio support varies by browser and OS.'
            : 'Microphone unavailable. Check permission, or open “Or paste notes instead” below.',
        );
      }
    } finally {
      pending.current = false;
      if (alive.current) setStarting(false);
    }
  }

  async function process(kind: 'transcribe' | 'smart-notes') {
    if (busy || recording) return;
    if (kind === 'transcribe' && !shareAudio) return;
    if (kind === 'smart-notes' && !shareNotes) return;
    if (signedIn === false) {
      setMessage(
        kind === 'transcribe'
          ? 'Sign in to turn audio into notes. Your recording stays on this page — download it first if you need a copy.'
          : 'Sign in to turn your transcript into notes. Your text stays on this page.',
      );
      return;
    }
    if (kind === 'transcribe' && deepgramConfigured === false) {
      setMessage(
        'Transcription isn’t available here right now. Paste notes below, then turn them into notes you can use.',
      );
      return;
    }
    setBusy(true);
    setMessage('');
    const controller = new AbortController();
    request.current = controller;
    try {
      const form = new FormData();
      if (audio) form.set('audio', audio, 'meeting.webm');
      form.set('consent', 'true');
      const response = await fetch(
        kind === 'transcribe' ? '/api/do/meetings/transcribe' : '/api/do/prepare',
        {
          method: 'POST',
          signal: controller.signal,
          ...(kind === 'transcribe'
            ? { body: form }
            : {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  task: 'meeting-notes',
                  source: notes,
                  sourceTitle: 'Meeting transcript',
                  sourceUrl: '',
                  consent: true,
                  brief: MEETING_SMART_NOTES_BRIEF,
                }),
              }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not finish. Your source is still here.');
      if (kind === 'transcribe') {
        setNotes(data.transcript);
        setShareAudio(false);
        setPasteOpen(true);
        setMessage('Review and correct the transcript, then turn it into notes.');
      } else {
        setDraft(data.draft.text);
        setReceipt(data.draft);
        setReviewed(false);
        setEditNotesOpen(false);
        setMessage('Notes ready — review before any handoff.');
      }
    } catch (error) {
      if (alive.current) setMessage(error instanceof Error ? error.message : 'Could not finish.');
    } finally {
      if (alive.current) setBusy(false);
    }
  }

  function handoff() {
    try {
      router.push(
        saveHomeBrief(
          sessionStorage,
          `Prepare this reviewed meeting handoff. Ask before external actions.\n${draft}`,
        ),
      );
    } catch {
      setMessage('Shorten the handoff to under 3,900 characters before opening a DO.');
    }
  }

  function jumpToRecord() {
    recordRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const needsAuth = signedIn === false;
  const canTranscribe =
    Boolean(audio) && shareAudio && !busy && !recording && !needsAuth && deepgramConfigured !== false;
  const canSmartNotes = Boolean(notes.trim()) && shareNotes && !busy && !recording && !needsAuth;
  const ext = audio?.type.includes('mp4') ? 'm4a' : 'webm';

  const boardNeedsYou = [
    ...(audio && !notes.trim() && !needsAuth && deepgramConfigured !== false
      ? [{ id: 'transcribe', title: 'Turn recording into notes', detail: 'Approve sharing, then transcribe.' }]
      : []),
    ...(audio && !notes.trim() && needsAuth
      ? [{ id: 'signin', title: 'Sign in to transcribe', detail: 'Recording stays on this page — download first if needed.' }]
      : []),
    ...(audio && !notes.trim() && deepgramConfigured === false
      ? [{ id: 'paste', title: 'Paste notes instead', detail: 'Transcription isn’t available here — paste still works.' }]
      : []),
    ...(draft && !reviewed
      ? [{ id: 'review-handoff', title: 'Review your notes', detail: 'Correct owners and dates before opening a DO.' }]
      : []),
    ...(notes.trim() && !draft
      ? [{ id: 'smart-notes', title: 'Turn transcript into notes', detail: 'Actions, decisions and who said what — drafts only.' }]
      : []),
  ];
  const boardWorking = [
    ...(recording || starting
      ? [{ id: 'recording', title: 'Recording meeting audio', detail: 'Stops at 10 minutes.' }]
      : []),
    ...(busy ? [{ id: 'busy', title: 'Working on your notes', detail: 'Source stays on this page.' }] : []),
  ];
  const boardDone = [
    ...(audio && !recording
      ? [{ id: 'captured', title: 'Recording captured', detail: 'Listen and download before leaving.' }]
      : []),
    ...(notes.trim()
      ? [{ id: 'words', title: 'Transcript ready', detail: 'From recording or pasted notes.' }]
      : []),
    ...(reviewed && draft
      ? [{ id: 'handoff-ready', title: 'Notes reviewed', detail: 'Ready to open a DO.' }]
      : []),
  ];

  const recordLabel = starting
    ? captureMode === 'meeting'
      ? 'Waiting for share…'
      : 'Waiting for microphone…'
    : recording
      ? 'Recording… tap Stop'
      : 'Record';

  return (
    <main
      className={`do-craft ${styles.shell} ${phoneMode ? styles.phoneShell : ''}`}
      data-phone={phoneMode ? '1' : undefined}
    >
      <nav className={phoneMode ? styles.phoneNav : undefined}>
        <Link href="/do">← Your DOs</Link>
        {!phoneMode ? (
          <Link href="/do/meetings?phone=1" className={styles.phoneLink}>
            Phone view
          </Link>
        ) : null}
      </nav>

      {previewNotes ? (
        <p className={styles.alert} role="status">
          Layout preview (`?previewNotes=1`) — sample notes only. No model was called and nothing
          was sent.
        </p>
      ) : null}

      {phoneMode ? (
        <section className={styles.phoneLanding} aria-label="Phone Meeting DO">
          <DoLivingBlob size="lg" className={styles.phoneBlob} label="Meeting DO" />
          <p className={styles.eyebrow}>PHONE · MEETING DO</p>
          <h1>Record tonight.</h1>
          <p className={styles.lead}>
            <strong>Install → Open → Record.</strong> No sign-in to capture audio. Sign in later to
            turn the recording into notes you can use.
          </p>

          <div className={styles.phoneSteps}>
            <p className={styles.phoneStepLabel}>
              <span>1</span> Install DO
            </p>
            <DoInstallPwaCta phone prominent />
          </div>

          <div className={styles.phoneSteps}>
            <p className={styles.phoneStepLabel}>
              <span>2</span> Open Meeting
            </p>
            <button type="button" className="do-cta do-cta--secondary" onClick={jumpToRecord}>
              Open Meeting → Record
            </button>
          </div>

          <div className={styles.phoneSteps}>
            <p className={styles.phoneStepLabel}>
              <span>3</span> Record
            </p>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={permission}
                disabled={recording || starting}
                onChange={(e) => setPermission(e.target.checked)}
              />
              Everyone has been informed and I have permission to record.
            </label>
            <div className={styles.phoneRecordRow}>
              <button
                type="button"
                className="do-cta do-cta--record"
                disabled={!permission || recording || starting || busy}
                data-live={recording ? 'true' : undefined}
                onClick={() => void start()}
              >
                {recordLabel}
              </button>
              <button
                type="button"
                className="do-cta do-cta--stop"
                disabled={!recording}
                onClick={stop}
              >
                Stop
              </button>
            </div>
            <p className={styles.status} role="status" data-live={recording ? 'true' : undefined}>
              {recording
                ? '● Recording — stops at 10 minutes'
                : audio
                  ? 'Recording ready · scroll for download'
                  : 'Mic stays off until Record'}
            </p>
          </div>
        </section>
      ) : (
        <header className={styles.hero}>
          <DoLivingBlob size="md" className={styles.markBlob} label="Meeting DO" />
          <p className={styles.eyebrow}>CAPTURE → NOTES → REVIEW</p>
          <h1>Meeting DO.</h1>
          <p className={styles.lead}>
            <strong>Record → notes you can use.</strong> Capture audio on this page,
            turn it into a transcript, then review actions, decisions and who said what.
            Drafts only — nothing is sent for you.
          </p>
        </header>
      )}

      {!phoneMode ? <DoTaskPanel boardId="meeting-do" title="Meeting DO to-do" /> : null}

      <section className={styles.installBanner} aria-label="Install DO on this phone">
        <div>
          <p className={styles.step}>Keep DO one tap away</p>
          <h2 className={styles.installTitle}>Install DO</h2>
          <p className={styles.copy}>
            Add to Home Screen for tonight — then open Meeting and hit Record.
          </p>
        </div>
        <DoInstallPwaCta prominent />
        {!phoneMode ? (
          <Link href="/do/meetings?phone=1" className={styles.phoneLink}>
            Open phone-easy view →
          </Link>
        ) : null}
      </section>

      {!phoneMode ? (
        <DoWorkBoard
          title="Meeting DO"
          needsYou={boardNeedsYou}
          working={boardWorking}
          done={boardDone}
          evidenceSlot={
            receipt
              ? `Preparation receipt: ${receipt.id} · ${receipt.evidence.model || 'model unavailable'}`
              : 'Local capture · no audio saved to the DO database until you choose Transcribe.'
          }
          empty={{
            copy: 'Start with a recording. Paste notes stay secondary.',
            firstAction: (
              <button type="button" className="do-cta do-cta--hero" onClick={jumpToRecord}>
                Record meeting
              </button>
            ),
          }}
        />
      ) : null}

      <section
        ref={recordRef}
        id="record"
        className={`${styles.record} ${styles.recordPrimaryPanel}`}
        aria-labelledby="record-title"
      >
        <p className={styles.step}>1 · Capture</p>
        <h2 id="record-title">Record the meeting</h2>
        <p className={styles.copy}>
          Audio stays on this device until you choose to share it. No video is kept. This recorder
          stops after <strong>10 minutes</strong> — download before closing the page. No sign-in
          needed to record or download.
        </p>

        <label className={styles.field}>
          Audio source
          <select
            value={captureMode}
            disabled={recording || starting}
            onChange={(e) => setCaptureMode(e.target.value as 'microphone' | 'meeting')}
          >
            <option value="microphone">In person · microphone</option>
            <option value="meeting">Meet / Zoom / Teams · shared audio + microphone</option>
          </select>
        </label>

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={permission}
            disabled={recording || starting}
            onChange={(e) => setPermission(e.target.checked)}
          />
          Everyone has been informed and I have permission to record.
        </label>

        <div className={styles.recordActions}>
          <button
            type="button"
            className="do-cta do-cta--record"
            disabled={!permission || recording || starting || busy}
            data-live={recording ? 'true' : undefined}
            onClick={() => void start()}
          >
            {recordLabel}
          </button>
          <button
            type="button"
            className="do-cta do-cta--stop"
            disabled={!recording}
            onClick={stop}
          >
            Stop recording
          </button>
        </div>

        <p className={styles.status} role="status" data-live={recording ? 'true' : undefined}>
          {recording
            ? '● Recording selected audio — stops at 10 minutes'
            : audio
              ? 'Recording ready · listen and download'
              : 'Ready when you are · mic stays off until Record'}
        </p>

        {audioUrl ? (
          <div className={styles.playback}>
            <audio controls src={audioUrl} />
            <a
              className="do-cta do-cta--secondary"
              href={audioUrl}
              download={`meeting-recording.${ext}`}
            >
              Download recording
            </a>
          </div>
        ) : null}

        <p className={styles.hint}>
          For Google Meet, select the meeting tab and enable Share tab audio. Zoom/Teams system audio
          depends on your browser and OS — if no audio is shared, recording will not start.
        </p>
      </section>

      <section className={styles.next} aria-labelledby="transcribe-title">
        <p className={styles.step}>2 · Transcribe</p>
        <h2 id="transcribe-title">Turn audio into notes</h2>
        <p className={styles.copy}>
          Transcribe the recording, or paste notes below. Sign-in is required to
          transcribe; record and download still work without it.
        </p>

        {needsAuth ? (
          <p className={styles.authSoft}>
            <Link href="/login?redirect=%2Fdo%2Fmeetings">Sign in</Link> to
            transcribe. No audio is saved to the DO database.
          </p>
        ) : deepgramConfigured === false ? (
          <p className={styles.authSoft}>
            Signed in · paste notes below, then turn them into notes you can use.
          </p>
        ) : (
          <p className={styles.authSoft}>
            Signed in · approve sharing below to turn this recording into a transcript.
          </p>
        )}

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={shareAudio}
            disabled={busy || recording || !audio}
            onChange={(e) => setShareAudio(e.target.checked)}
          />
          I approve sharing this audio for transcription.
        </label>

        <div className={styles.actions}>
          <button
            type="button"
            className="do-cta"
            disabled={!canTranscribe}
            onClick={() => void process('transcribe')}
          >
            {busy ? 'Working…' : 'Transcribe recording'}
          </button>
        </div>

        {notes.trim() ? (
          <label className={styles.field}>
            Transcript · review before writing notes
            <textarea
              value={notes}
              maxLength={12000}
              onChange={(e) => {
                setNotes(e.target.value);
                setReviewed(false);
              }}
              placeholder="Your transcript appears here after you transcribe…"
            />
          </label>
        ) : null}

        <details
          className={styles.paste}
          open={pasteOpen}
          onToggle={(e) => setPasteOpen((e.target as HTMLDetailsElement).open)}
        >
          <summary>Or paste notes instead</summary>
          <p className={styles.copy}>
            Secondary path if you already have notes. Recording above remains the primary way in.
          </p>
          <label className={styles.field}>
            Meeting notes
            <textarea
              value={notes}
              maxLength={12000}
              onChange={(e) => {
                setNotes(e.target.value);
                setReviewed(false);
              }}
              placeholder="Paste notes here…"
            />
          </label>
        </details>
      </section>

      {notes.trim() ? (
        <section className={styles.next} aria-labelledby="smart-notes-title">
          <p className={styles.step}>3 · Useful notes</p>
          <h2 id="smart-notes-title">Notes you can use</h2>
          <p className={styles.copy}>
            Turns your transcript into clean notes — decisions, action items
            (owners and dates only if stated), open questions and a follow-up
            draft you can edit. Nothing is sent.
          </p>

          {needsAuth ? (
            <p className={styles.authSoft}>
              <Link href="/login?redirect=%2Fdo%2Fmeetings">Sign in</Link> to
              turn this transcript into notes.
            </p>
          ) : (
            <p className={styles.authSoft}>
              Signed in · drafts only. Nothing leaves this page until you choose a handoff.
            </p>
          )}

          <label className={styles.check}>
            <input
              type="checkbox"
              checked={shareNotes}
              disabled={busy || recording}
              onChange={(e) => setShareNotes(e.target.checked)}
            />
            I approve sharing this transcript to prepare useful notes.
          </label>

          <div className={styles.actions}>
            <button
              type="button"
              className="do-cta do-cta--hero"
              disabled={!canSmartNotes}
              onClick={() => void process('smart-notes')}
            >
              {busy ? 'Writing notes…' : 'Write notes'}
            </button>
          </div>
        </section>
      ) : null}

      {draft ? (
        <section className={styles.notesReview} aria-labelledby="handoff-title">
          <p className={styles.step}>4 · Review</p>
          <h2 id="handoff-title">Review your notes</h2>
          <p className={styles.copy}>
            Correct owners, dates and proposed next steps. Nothing has been sent or assigned to
            another person.
          </p>

          <div className={styles.notesSurface}>
            {noteSections.map((section) => (
              <article key={section.heading} className={styles.notesBlock}>
                <h3 className={styles.notesHeading}>{section.heading}</h3>
                <div className={styles.notesBody}>
                  {section.body.split('\n').map((line, i) =>
                    line.trim() ? (
                      <p key={`${section.heading}-${i}`}>{line}</p>
                    ) : (
                      <br key={`${section.heading}-br-${i}`} />
                    ),
                  )}
                </div>
              </article>
            ))}
          </div>

          <details
            className={styles.editNotes}
            open={editNotesOpen}
            onToggle={(e) => setEditNotesOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary>Edit notes text</summary>
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setReviewed(false);
              }}
              aria-label="Edit notes"
            />
          </details>

          <label className={styles.check}>
            <input
              type="checkbox"
              checked={reviewed}
              onChange={(e) => setReviewed(e.target.checked)}
            />
            I have reviewed these notes. Owners and dates match the source.
          </label>
          <div className={styles.actions}>
            <button
              type="button"
              className="do-cta do-cta--hero"
              disabled={!reviewed || !draft.trim()}
              onClick={handoff}
            >
              Open a DO with this handoff
            </button>
          </div>
          <p className={styles.hint}>
            Opens the shared workspace for another review; it does not silently run work. Follow-up
            email stays a draft — never auto-sent.
          </p>
          <small className={styles.receipt}>
            Preparation receipt: {receipt?.id} · {receipt?.evidence.model || 'model unavailable'}
          </small>
        </section>
      ) : null}

      {message ? (
        <p className={styles.alert} role="alert">
          {message}
        </p>
      ) : null}
    </main>
  );
}

export function MeetingDo() {
  return (
    <Suspense
      fallback={
        <main className="do-craft" style={{ padding: 24 }}>
          <p className="do-craft-mono" style={{ color: '#654A4E' }}>
            Opening Meeting DO…
          </p>
        </main>
      }
    >
      <MeetingDoInner />
    </Suspense>
  );
}
