'use client';

/**
 * Record-or-upload-a-meeting strip for community chief-of-staff agents.
 *
 * Mounted by CommunityAgentChat ONLY when the agent grew from the
 * chief-of-staff template (dynamic import — other agents never load this
 * code). Mirrors the Hui recorder (components/hui/HuiStudio.tsx): MediaRecorder
 * mic capture with an elapsed timer, an audio-file upload, and a REQUIRED
 * consent checkbox before either — consent/recording strings are reused from
 * Hui. Audio goes to /api/a/transcribe (Deepgram, transcribed then discarded,
 * never stored) and the transcript lands in the message input via
 * onTranscript, plain, for the visitor to check and send for a write-up.
 * Pasting a transcript into the normal input stays the fallback.
 *
 * The strip only renders once GET /api/a/transcribe confirms the provider is
 * configured — unconfigured deployments show nothing and the paste path
 * carries on as before.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Mic, Square, Upload } from 'lucide-react';

const INK = '#313c42';
const MUTED = '#68766f';
const HAIRLINE = 'rgba(49, 60, 66, 0.12)';

const MAX_AUDIO_BYTES = 40 * 1024 * 1024; // matches the /api/a/transcribe cap

export function MeetingCapture({
  disabled,
  onTranscript,
}: {
  disabled: boolean;
  onTranscript: (transcript: string) => void;
}) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [consent, setConsent] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [note, setNote] = useState('');
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/a/transcribe')
      .then((r) => r.json())
      .then((d) => setConfigured(Boolean(d?.configured)))
      .catch(() => setConfigured(false));
  }, []);

  useEffect(() => {
    if (!recording) return undefined;
    const timer = window.setInterval(() => setSeconds((v) => v + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  const formattedTime = useMemo(() => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [seconds]);

  async function transcribeBlob(blob: Blob) {
    setTranscribing(true);
    setNote('');
    try {
      const form = new FormData();
      form.append('audio', blob, 'meeting.webm');
      const res = await fetch('/api/a/transcribe', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        // Gate/rate bodies carry the sentence in `message`; the rest in `error`.
        const message =
          (typeof data?.message === 'string' && data.message) ||
          (typeof data?.error === 'string' && !/^[a-z_]+$/.test(data.error) && data.error) ||
          'Transcription failed. Try again, or paste the notes.';
        throw new Error(message);
      }
      onTranscript(String(data.transcript ?? ''));
    } catch (err) {
      setNote(err instanceof Error ? err.message : 'Transcription failed. Try again, or paste the notes.');
    } finally {
      setTranscribing(false);
    }
  }

  async function toggleRecording() {
    if (recording) {
      mediaRef.current?.stop();
      return;
    }
    if (!consent) {
      setNote('Confirm everyone in the meeting was told it is being recorded before you continue.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        void transcribeBlob(blob);
      };
      mediaRef.current = recorder;
      setSeconds(0);
      setNote('');
      recorder.start();
      setRecording(true);
    } catch {
      setNote('Microphone access was blocked. Allow it, or upload a file / paste a transcript.');
    }
  }

  function handleAudioUpload(file?: File | null) {
    if (!file) return;
    if (!consent) {
      setNote('Confirm everyone in the meeting was told it is being recorded before you continue.');
      return;
    }
    if (!file.type.startsWith('audio/') && !/\.(mp3|m4a|wav|mp4|webm|ogg)$/i.test(file.name)) {
      setNote('Upload an audio file (MP3, M4A, WAV, MP4).');
      return;
    }
    if (file.size > MAX_AUDIO_BYTES) {
      setNote('Audio file must be under 40MB.');
      return;
    }
    void transcribeBlob(file);
  }

  if (configured !== true) return null;

  const controlsOff = disabled || transcribing;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '10px 14px',
        borderTop: `1px solid ${HAIRLINE}`,
      }}
    >
      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          fontSize: 12,
          lineHeight: 1.5,
          color: MUTED,
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          style={{ marginTop: 2, accentColor: INK }}
        />
        <span>
          <strong style={{ color: INK }}>Recording consent.</strong> I confirm everyone in this
          meeting has been told it is being recorded, in line with the Privacy Act 2020 (IPP 3
          &amp; 3A). Audio is transcribed and then discarded — we never store your recording.
        </span>
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*,.mp3,.m4a,.wav,.mp4"
          style={{ display: 'none' }}
          onChange={(e) => {
            handleAudioUpload(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => void toggleRecording()}
          disabled={controlsOff}
          aria-label={recording ? 'Stop recording' : 'Record'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 999,
            border: recording ? 'none' : `1px solid ${HAIRLINE}`,
            background: recording ? '#B42828' : '#fff',
            color: recording ? '#fff' : INK,
            fontSize: 13,
            fontFamily: 'inherit',
            cursor: controlsOff ? 'default' : 'pointer',
            opacity: controlsOff ? 0.4 : 1,
          }}
        >
          {recording ? <Square size={14} /> : <Mic size={14} />}
          {recording ? 'Stop recording' : 'Record'}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={controlsOff || recording}
          aria-label="Upload audio"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 999,
            border: `1px solid ${HAIRLINE}`,
            background: '#fff',
            color: INK,
            fontSize: 13,
            fontFamily: 'inherit',
            cursor: controlsOff || recording ? 'default' : 'pointer',
            opacity: controlsOff || recording ? 0.4 : 1,
          }}
        >
          <Upload size={14} />
          Upload audio
        </button>
        {recording && (
          <span style={{ fontSize: 12, color: MUTED, fontVariantNumeric: 'tabular-nums' }}>
            <strong style={{ color: INK }}>Recording…</strong> {formattedTime}
          </span>
        )}
        {transcribing && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: MUTED }}>
            <Loader2 size={13} style={{ color: '#b8964f', animation: 'spin 1s linear infinite' }} />
            Transcribing audio…
          </span>
        )}
      </div>
      {note && (
        <p role="alert" style={{ margin: 0, color: '#8a4b3c', fontSize: 12 }}>
          {note}
        </p>
      )}
    </div>
  );
}
