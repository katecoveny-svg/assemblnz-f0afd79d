'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PRE_SEEDED_PHRASEBOOK,
  PHRASEBOOK_CATEGORY_LABELS,
  groupPhrasebook,
  type PhrasebookCategory,
  type PhrasebookEntry,
} from '@/lib/voyage/phrasebook';

// Web Speech API minimal type shim — TypeScript's lib.dom.d.ts doesn't
// ship full SpeechRecognition types in every release.
type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionResultEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }> & { isFinal: boolean }>;
};

type WindowWithSpeech = Window & {
  SpeechRecognition?: new () => RecognitionLike;
  webkitSpeechRecognition?: new () => RecognitionLike;
};

type SavedPhrase = PhrasebookEntry & { savedAt: number };

const STORAGE_KEY = 'voyage:phrasebook';

type Lang = 'en-NZ' | 'it-IT';

type Translation = {
  sourceText: string;
  translated: string;
  fromLang: Lang;
  toLang: Lang;
};

function getRecognitionCtor(): (new () => RecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as WindowWithSpeech;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function speak(text: string, lang: Lang) {
  if (typeof window === 'undefined') return;
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.95;
  // Prefer a same-language voice if one is loaded.
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) => v.lang === lang) ?? voices.find((v) => v.lang.startsWith(lang.split('-')[0]));
  if (match) utter.voice = match;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function inferCategory(text: string): PhrasebookCategory {
  const t = text.toLowerCase();
  if (/hello|ciao|grazie|thank|good (morning|evening)/.test(t)) return 'greetings';
  if (/eat|drink|menu|bill|table|coffee|water|wine|food|menu|conto/.test(t)) return 'restaurant';
  if (/where|how do|train|street|station|right|left|destra|sinistra/.test(t)) return 'directions';
  if (/help|police|doctor|lost|emergency|aiuto|medico|polizia/.test(t)) return 'emergencies';
  if (/cost|price|buy|cash|card|euro|costa|comprare/.test(t)) return 'shopping';
  if (/ticket|taxi|bus|seat|platform|stop|biglietto|binario/.test(t)) return 'transport';
  return 'greetings';
}

export function VoiceTranslator() {
  const [direction, setDirection] = useState<{ from: Lang; to: Lang }>({
    from: 'en-NZ',
    to: 'it-IT',
  });
  const [isRecording, setIsRecording] = useState(false);
  const [interim, setInterim] = useState('');
  const [pending, setPending] = useState(false);
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [savedExtras, setSavedExtras] = useState<SavedPhrase[]>([]);
  const [fallbackText, setFallbackText] = useState('');

  const recognitionRef = useRef<RecognitionLike | null>(null);
  const recognitionAvailable = useMemo(() => getRecognitionCtor() !== null, []);

  // Hydrate saved phrases from localStorage.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SavedPhrase[];
      if (Array.isArray(parsed)) setSavedExtras(parsed);
    } catch {
      // Ignore corrupted storage — phrasebook still works from the seed.
    }
  }, []);

  const persistSaved = useCallback((next: SavedPhrase[]) => {
    setSavedExtras(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Quota / private mode — silently drop. Translator still functions.
    }
  }, []);

  const startTranslation = useCallback(
    async (text: string, from: Lang, to: Lang) => {
      setPending(true);
      setError(null);
      try {
        const res = await fetch('/api/hapai/voyage-italy/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, fromLang: from, toLang: to }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          translated?: string;
          error?: string;
        };
        if (!res.ok || !data.translated) {
          setError(data.error ?? 'Translation failed. Try the phrasebook.');
          setPending(false);
          return;
        }
        const next: Translation = {
          sourceText: text,
          translated: data.translated,
          fromLang: from,
          toLang: to,
        };
        setTranslation(next);
        setPending(false);
        if (autoSpeak) speak(next.translated, to);
      } catch {
        setError('Network hiccup. Try again, or use the phrasebook.');
        setPending(false);
      }
    },
    [autoSpeak],
  );

  const beginRecording = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = direction.from;
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: SpeechRecognitionResultEvent) => {
      let combined = '';
      for (let i = 0; i < e.results.length; i += 1) {
        const result = e.results[i];
        const alt = result[0];
        if (alt) combined += alt.transcript;
      }
      setInterim(combined);
      // If final result is in, fire translation.
      const lastResult = e.results[e.results.length - 1];
      if (lastResult && lastResult.isFinal && combined.trim()) {
        void startTranslation(combined.trim(), direction.from, direction.to);
        setInterim('');
      }
    };
    rec.onerror = (ev) => {
      setError(
        ev.error === 'not-allowed'
          ? 'Microphone permission denied. Use the text box instead.'
          : 'Voice input glitched. Try again or type below.',
      );
      setIsRecording(false);
    };
    rec.onend = () => {
      setIsRecording(false);
    };
    try {
      rec.start();
      recognitionRef.current = rec;
      setIsRecording(true);
      setError(null);
    } catch {
      setIsRecording(false);
      setError('Could not start the mic. Try the text box.');
    }
  }, [direction, startTranslation]);

  const endRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // No-op
      }
    }
    setIsRecording(false);
  }, []);

  const swapDirection = useCallback(() => {
    setDirection((d) => ({ from: d.to, to: d.from }));
    setTranslation(null);
    setInterim('');
  }, []);

  const submitFallback = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = fallbackText.trim();
      if (!text) return;
      void startTranslation(text, direction.from, direction.to);
      setFallbackText('');
    },
    [fallbackText, direction, startTranslation],
  );

  const savePhrase = useCallback(
    (entry: { en: string; it: string }) => {
      const category = inferCategory(entry.en);
      const next: SavedPhrase = {
        category,
        en: entry.en,
        it: entry.it,
        savedAt: Date.now(),
      };
      // Dedupe by EN+IT pair.
      const filtered = savedExtras.filter(
        (s) => s.en !== next.en || s.it !== next.it,
      );
      persistSaved([next, ...filtered].slice(0, 100));
    },
    [savedExtras, persistSaved],
  );

  const removeSaved = useCallback(
    (saved: SavedPhrase) => {
      persistSaved(savedExtras.filter((s) => s.savedAt !== saved.savedAt));
    },
    [savedExtras, persistSaved],
  );

  const grouped = useMemo(
    () => groupPhrasebook([...savedExtras, ...PRE_SEEDED_PHRASEBOOK]),
    [savedExtras],
  );

  const fromFlag = direction.from === 'en-NZ' ? '🇳🇿' : '🇮🇹';
  const toFlag = direction.to === 'en-NZ' ? '🇳🇿' : '🇮🇹';

  return (
    <section
      aria-label="Voice translator"
      className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 p-5"
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-light text-[color:var(--text-primary)]">
            Translator
          </h3>
          <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
            press &amp; hold the mic · {fromFlag} → {toFlag}
          </p>
        </div>
        <button
          type="button"
          onClick={swapDirection}
          className="rounded-full border border-[rgba(35,33,31,0.15)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-primary)] transition hover:bg-white/85"
          aria-label="Swap translation direction"
        >
          swap ↔
        </button>
      </header>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onMouseDown={recognitionAvailable ? beginRecording : undefined}
          onMouseUp={recognitionAvailable ? endRecording : undefined}
          onTouchStart={recognitionAvailable ? beginRecording : undefined}
          onTouchEnd={recognitionAvailable ? endRecording : undefined}
          onMouseLeave={isRecording ? endRecording : undefined}
          disabled={!recognitionAvailable}
          className={`flex min-h-[88px] w-full select-none items-center justify-center gap-2 rounded-card border px-4 py-5 text-center font-mono text-[12px] uppercase tracking-[0.22em] transition ${
            isRecording
              ? 'border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu)] text-white'
              : 'border-[rgba(35,33,31,0.15)] bg-white/75 text-[color:var(--text-primary)] hover:bg-white'
          } ${!recognitionAvailable ? 'opacity-60' : ''}`}
        >
          {isRecording ? (
            <span>● listening · {fromFlag} release to translate</span>
          ) : recognitionAvailable ? (
            <span>🎙 hold to speak {fromFlag}</span>
          ) : (
            <span>voice unavailable on this browser — use the box below</span>
          )}
        </button>

        {interim ? (
          <p className="font-mono text-xs text-[color:var(--text-secondary)]">
            …{interim}
          </p>
        ) : null}

        <form onSubmit={submitFallback} className="flex gap-2">
          <input
            type="text"
            value={fallbackText}
            onChange={(e) => setFallbackText(e.target.value)}
            placeholder={
              direction.from === 'en-NZ'
                ? 'or type in English…'
                : 'o scrivi in italiano…'
            }
            maxLength={500}
            className="flex-1 rounded-card border border-[rgba(35,33,31,0.15)] bg-white/85 px-3 py-2 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)] focus:border-[color:var(--assembl-pounamu)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending || !fallbackText.trim()}
            className="rounded-card bg-[color:var(--assembl-ink)] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--assembl-paper)] transition hover:opacity-85 disabled:opacity-50"
          >
            translate
          </button>
        </form>

        <label className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
          <input
            type="checkbox"
            checked={autoSpeak}
            onChange={(e) => setAutoSpeak(e.target.checked)}
            className="h-4 w-4"
          />
          auto-play translation
        </label>

        {error ? (
          <p className="rounded-card bg-[rgba(193,68,68,0.08)] px-3 py-2 text-sm text-[color:var(--text-primary)]">
            {error}
          </p>
        ) : null}

        {pending && !translation ? (
          <p className="font-mono text-xs text-[color:var(--text-secondary)]">
            translating…
          </p>
        ) : null}

        {translation ? (
          <article
            aria-label="Latest translation"
            className="space-y-3 rounded-card border border-[rgba(35,33,31,0.10)] bg-white/85 p-4"
          >
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                {translation.fromLang === 'en-NZ' ? '🇳🇿 English' : '🇮🇹 Italian'}
              </p>
              <p className="mt-1 text-base text-[color:var(--text-primary)]">
                {translation.sourceText}
              </p>
            </div>
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                {translation.toLang === 'en-NZ' ? '🇳🇿 English' : '🇮🇹 Italian'}
              </p>
              <p className="mt-1 font-display text-xl font-light text-[color:var(--text-primary)]">
                {translation.translated}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => speak(translation.translated, translation.toLang)}
                className="rounded-full border border-[rgba(35,33,31,0.15)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-primary)] transition hover:bg-white"
              >
                🔊 play
              </button>
              <button
                type="button"
                onClick={() =>
                  savePhrase({
                    en:
                      translation.fromLang === 'en-NZ'
                        ? translation.sourceText
                        : translation.translated,
                    it:
                      translation.toLang === 'it-IT'
                        ? translation.translated
                        : translation.sourceText,
                  })
                }
                className="rounded-full border border-[rgba(35,33,31,0.15)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-primary)] transition hover:bg-white"
              >
                ☆ save phrase
              </button>
            </div>
          </article>
        ) : null}
      </div>

      <section aria-label="Phrasebook" className="mt-6">
        <h4 className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
          Phrasebook (offline)
        </h4>
        <p className="mt-1 text-xs text-[color:var(--text-body)]">
          Saved phrases plus 30 essentials. Tap a phrase to hear it.
        </p>
        <div className="mt-3 space-y-4">
          {grouped.map((group) => (
            <details
              key={group.category}
              className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 px-3 py-2"
            >
              <summary className="cursor-pointer font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
                {PHRASEBOOK_CATEGORY_LABELS[group.category]} ({group.entries.length})
              </summary>
              <ul className="mt-3 space-y-2">
                {group.entries.map((entry, idx) => {
                  const isSaved = 'savedAt' in entry;
                  return (
                    <li
                      key={`${entry.en}-${idx}`}
                      className="flex flex-wrap items-start justify-between gap-2 border-t border-[rgba(35,33,31,0.06)] pt-2 first:border-t-0 first:pt-0"
                    >
                      <button
                        type="button"
                        onClick={() => speak(entry.it, 'it-IT')}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="text-sm text-[color:var(--text-primary)]">
                          {entry.it}
                        </p>
                        <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                          {entry.en}
                          {entry.pronounce ? ` · ${entry.pronounce}` : ''}
                        </p>
                      </button>
                      {isSaved ? (
                        <button
                          type="button"
                          onClick={() => removeSaved(entry as SavedPhrase)}
                          aria-label="Remove saved phrase"
                          className="rounded-full border border-[rgba(35,33,31,0.12)] px-2 py-1 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] transition hover:bg-white"
                        >
                          remove
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}
        </div>
      </section>
    </section>
  );
}
