'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MeetingDoExperience } from './MeetingDoExperience';
import {
  MEETING_SMART_NOTES_BRIEF,
} from '@/apps/do/shared/meeting-smart-notes';
import type { DoPreparedDraft } from '@/apps/do/shared/preparation';
import '@/app/do/do-craft.css';

const PREVIEW_SOURCE = 'Avery and Jordan discussed the phone Meeting DO for the demo. Decided to ship soft launch after Install → Record works. Riley will send the invite by Friday. Budget not confirmed. Open question: who hosts the follow-up?';
const PREVIEW_DRAFT = [
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

/**
 * Meeting DO — recording-first, phone-easy.
 * Pipeline: Capture → turn audio into notes → review.
 * Record + download work unsigned-in. Transcribe / write notes need sign-in.
 * The same focused recording experience adapts to desktop and phone.
 *
 * Saved tasks remain accessible via More; no task board competes with recording.
 */
function MeetingDoState({ previewNotes }: { previewNotes: boolean }) {
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
  const [notes, setNotes] = useState(previewNotes ? PREVIEW_SOURCE : '');
  const [draft, setDraft] = useState(previewNotes ? PREVIEW_DRAFT : '');
  const [receipt, setReceipt] = useState<DoPreparedDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [transcriptionReady, setTranscriptionReady] = useState<boolean | null>(null);
  const [activity, setActivity] = useState<'transcribe' | 'smart-notes' | null>(null);
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
        if (!cancelled) setTranscriptionReady(Boolean(data.configured));
      })
      .catch(() => {
        if (!cancelled) setTranscriptionReady(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);


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
      setNotes(''); setDraft(''); setReceipt(null); setReviewed(false); setShareNotes(false);
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
    if (kind === 'transcribe' && transcriptionReady === false) {
      setMessage(
        'Transcription isn’t available here right now. Paste notes below, then turn them into notes you can use.',
      );
      return;
    }
    setBusy(true);
    setActivity(kind);
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
      if (!alive.current || controller.signal.aborted) return;
      if (!response.ok) throw new Error(data.message || 'Could not finish. Your source is still here.');
      if (kind === 'transcribe') {
        setNotes(data.transcript);
        setShareAudio(false);
        setDraft(''); setReceipt(null); setReviewed(false); setShareNotes(false);
        setMessage('Review and correct the transcript, then turn it into notes.');
      } else {
        setDraft(data.draft.text);
        setReceipt(data.draft);
        setReviewed(false);
        setMessage('Notes ready — review before any handoff.');
      }
    } catch (error) {
      if (alive.current) setMessage(error instanceof Error ? error.message : 'Could not finish.');
    } finally {
      if (alive.current) { setBusy(false); setActivity(null); }
    }
  }

  async function refreshConnection() {
    const [runtime, transcription] = await Promise.all([
      fetch('/api/do/runtime', { credentials: 'same-origin', cache: 'no-store' }).then(r => r.json()).catch(() => null),
      fetch('/api/do/meetings/transcribe', { credentials: 'same-origin', cache: 'no-store' }).then(r => r.json()).catch(() => null),
    ]);
    if (!alive.current) return;
    setSignedIn(runtime ? (typeof runtime.signedIn === 'boolean' ? runtime.signedIn : Boolean(runtime.trial?.bypassed)) : null);
    setTranscriptionReady(transcription ? Boolean(transcription.configured) : null);
  }

  return <MeetingDoExperience
    preview={previewNotes} captureMode={captureMode} permission={permission}
    shareAudio={shareAudio} shareNotes={shareNotes} recording={recording} starting={starting}
    busy={busy} activity={activity} hasAudio={Boolean(audio)} audioUrl={audioUrl}
    extension={audio?.type.includes('mp4') ? 'm4a' : 'webm'} notes={notes} draft={draft}
    receipt={receipt} reviewed={reviewed} signedIn={signedIn}
    transcriptionReady={transcriptionReady} message={message}
    setCaptureMode={setCaptureMode} setPermission={setPermission}
    setShareAudio={setShareAudio} setShareNotes={setShareNotes}
    editNotes={value => { setNotes(value); setDraft(''); setReceipt(null); setReviewed(false); setShareNotes(false); }}
    editDraft={value => { setDraft(value); setReviewed(false); }} setReviewed={setReviewed}
    start={() => void start()} stop={stop} process={kind => void process(kind)}
    cancel={() => request.current?.abort()} refreshConnection={() => void refreshConnection()}
  />;
}

function MeetingDoInner() {
  const params = useSearchParams();
  const previewNotes = params.get('previewNotes') === '1';
  return <MeetingDoState key={previewNotes ? 'preview' : 'live'} previewNotes={previewNotes} />;
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
