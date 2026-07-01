'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

/**
 * Consult-grade audio capture for Quill.
 *
 * Unlike the lightweight Web Speech dictation mic (which stops after a phrase,
 * renders nothing on Firefox, and streams audio to a browser speech engine),
 * this records a full two-party consult with MediaRecorder and transcribes it
 * onshore via Deepgram (en-NZ, diarised) at POST /api/agents/transcribe. The
 * transcript is handed back for the clinician to review before anything is sent
 * to the agent.
 *
 * Browser reality handled here:
 * - MIME type differs by browser — Safari/iOS needs audio/mp4; Chromium/Firefox
 *   take audio/webm;codecs=opus. We pick the first supported type.
 * - getUserMedia needs a secure context (https or localhost). On http we say so
 *   rather than failing silently.
 * - Permission can be denied, dismissed, or there may be no microphone.
 */

type Phase = 'idle' | 'requesting' | 'recording' | 'transcribing' | 'error';

const CANDIDATE_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4', // Safari / iOS
  'audio/ogg;codecs=opus',
];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  for (const t of CANDIDATE_MIME_TYPES) {
    try {
      if (MediaRecorder.isTypeSupported(t)) return t;
    } catch {
      /* ignore */
    }
  }
  return undefined; // let the browser choose its default
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ConsultRecorder({
  onTranscript,
  disabled,
  ink,
}: {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  ink: string;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [message, setMessage] = useState<string>('');
  const [elapsed, setElapsed] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeRef = useRef<string>('audio/webm');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => stopTracks(), [stopTracks]);

  const transcribe = useCallback(
    async (blob: Blob) => {
      setPhase('transcribing');
      try {
        const fd = new FormData();
        const ext = mimeRef.current.includes('mp4') ? 'mp4' : mimeRef.current.includes('ogg') ? 'ogg' : 'webm';
        fd.append('audio', blob, `consult.${ext}`);
        const res = await fetch('/api/agents/transcribe', { method: 'POST', body: fd });
        const data = (await res.json().catch(() => null)) as
          | { transcript?: string; error?: string }
          | null;
        if (!res.ok || !data?.transcript) {
          setPhase('error');
          setMessage(data?.error ?? 'Transcription failed. Paste the transcript instead.');
          return;
        }
        onTranscript(data.transcript);
        setPhase('idle');
        setMessage('');
      } catch {
        setPhase('error');
        setMessage('Transcription failed. Paste the transcript instead.');
      }
    },
    [onTranscript],
  );

  const start = useCallback(async () => {
    setMessage('');
    // Secure-context + API guard — browsers block mic on http://.
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setPhase('error');
      setMessage(
        window.isSecureContext === false
          ? 'Recording needs a secure (https) connection. Paste the transcript instead.'
          : 'This browser can’t record audio here. Paste the transcript instead.',
      );
      return;
    }
    setPhase('requesting');
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setPhase('error');
      const name = (err as { name?: string })?.name;
      setMessage(
        name === 'NotAllowedError' || name === 'SecurityError'
          ? 'Microphone blocked. Allow it in your browser, or paste the transcript.'
          : name === 'NotFoundError'
            ? 'No microphone found. Plug one in, or paste the transcript.'
            : 'Couldn’t start the microphone. Paste the transcript instead.',
      );
      return;
    }

    streamRef.current = stream;
    const mime = pickMimeType();
    mimeRef.current = mime ?? 'audio/webm';
    chunksRef.current = [];
    let recorder: MediaRecorder;
    try {
      recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    } catch {
      recorder = new MediaRecorder(stream);
    }
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      stopTracks();
      const blob = new Blob(chunksRef.current, { type: mimeRef.current });
      chunksRef.current = [];
      if (blob.size === 0) {
        setPhase('error');
        setMessage('Nothing was captured. Try again, or paste the transcript.');
        return;
      }
      void transcribe(blob);
    };

    recorder.start(1000); // gather chunks every second
    setElapsed(0);
    setPhase('recording');
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  }, [stopTracks, transcribe]);

  const stop = useCallback(() => {
    const r = recorderRef.current;
    if (r && r.state !== 'inactive') {
      try {
        r.stop();
      } catch {
        stopTracks();
        setPhase('idle');
      }
    }
  }, [stopTracks]);

  const recording = phase === 'recording';
  const transcribing = phase === 'transcribing';
  const requesting = phase === 'requesting';

  const onClick = useCallback(() => {
    if (recording) stop();
    else if (phase === 'idle' || phase === 'error') void start();
  }, [recording, stop, start, phase]);

  return (
    <div className="relative flex shrink-0 items-center">
      {/* Status bubble floats above the button so it never widens the composer row. */}
      {(recording || transcribing || requesting || phase === 'error') && (
        <div
          className="mk-mono absolute bottom-[52px] right-0 z-10 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] shadow-sm"
          style={{
            borderColor: phase === 'error' ? 'rgba(180,60,40,0.35)' : '#C0392B',
            backgroundColor: phase === 'error' ? 'rgba(180,60,40,0.06)' : 'rgba(255,255,255,0.96)',
            color: phase === 'error' ? '#7a2a1a' : '#C0392B',
          }}
        >
          {recording
            ? `● Recording consult · ${fmt(elapsed)} — tap to stop`
            : requesting
              ? 'Asking for the microphone…'
              : transcribing
                ? 'Transcribing the consult…'
                : message}
        </div>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || transcribing || requesting}
        aria-label={recording ? 'Stop recording the consult' : 'Record the consult'}
        title={recording ? 'Recording… tap to stop' : 'Record the consult'}
        className="flex h-11 w-11 items-center justify-center rounded-full border transition disabled:opacity-40"
        style={{
          borderColor: recording ? '#C0392B' : ink,
          color: recording ? '#FFFFFF' : ink,
          backgroundColor: recording ? '#C0392B' : 'transparent',
        }}
      >
        {transcribing || requesting ? (
          <Loader2 size={18} className="animate-spin" aria-hidden />
        ) : recording ? (
          <Square size={16} aria-hidden />
        ) : (
          <Mic size={18} aria-hidden />
        )}
      </button>
    </div>
  );
}
