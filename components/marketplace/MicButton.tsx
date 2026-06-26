'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';

/**
 * Voice input for the agent chat composer. Uses the browser's built-in Web
 * Speech API (no server, no cost), so the user can speak instead of type. The
 * recognised text is handed back via onTranscript to append to the input.
 * Renders nothing on browsers without speech recognition.
 */

interface SpeechAlternativeLike {
  transcript: string;
}
interface SpeechResultLike {
  0: SpeechAlternativeLike;
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

export function MicButton({
  onTranscript,
  disabled,
  ink,
}: {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  ink: string;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setSupported(true);
    const rec = new Ctor();
    rec.lang = 'en-NZ';
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(' ')
        .trim();
      if (text) onTranscript(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    return () => {
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
    };
  }, [onTranscript]);

  const toggle = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    if (listening) {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      setListening(false);
    } else {
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  }, [listening]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-label={listening ? 'Stop voice input' : 'Speak your message'}
      title={listening ? 'Listening… tap to stop' : 'Speak'}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition disabled:opacity-40"
      style={{
        borderColor: listening ? '#C0392B' : ink,
        color: listening ? '#FFFFFF' : ink,
        backgroundColor: listening ? '#C0392B' : 'transparent',
      }}
    >
      {listening ? <Square size={16} aria-hidden /> : <Mic size={18} aria-hidden />}
    </button>
  );
}
