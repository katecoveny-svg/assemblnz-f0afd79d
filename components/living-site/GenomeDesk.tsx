'use client';

import { useRef, useState, useSyncExternalStore, type CSSProperties, type FormEvent } from 'react';
import { Mic, Send, Volume2, VolumeX } from 'lucide-react';
import { AgentMarkdown } from '@/components/marketplace/AgentMarkdown';
import type { VerticalPalette } from '@/lib/living-site/verticals';
import styles from './genome-desk.module.css';

type Source = { id: string; label: string; section: string };
type DeskMessage = { id: string; role: 'assistant' | 'user'; text: string; sources?: Source[]; mode?: string };

type Recognition = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function recognitionConstructor(): (new () => Recognition) | null {
  if (typeof window === 'undefined') return null;
  const speechWindow = window as unknown as {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/[#*_>`~]/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim();
  if (!clean) return;
  const utterance = new SpeechSynthesisUtterance(clean.slice(0, 900));
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find((voice) => voice.lang === 'en-NZ')
    ?? voices.find((voice) => voice.lang === 'en-AU')
    ?? voices.find((voice) => voice.lang.startsWith('en'))
    ?? null;
  utterance.rate = 1.02;
  window.speechSynthesis.speak(utterance);
}

export function GenomeDesk({
  tenant,
  businessName,
  owner,
  palette,
  greeting,
  prompts,
}: {
  tenant: string;
  businessName: string;
  owner: string;
  palette: VerticalPalette;
  greeting: string;
  prompts: string[];
}) {
  const [messages, setMessages] = useState<DeskMessage[]>([
    { id: 'greeting', role: 'assistant', text: greeting, mode: 'Business Genome' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const messageList = useRef<HTMLDivElement>(null);
  const messageId = useRef(0);
  const micSupported = useSyncExternalStore(
    () => () => {},
    () => recognitionConstructor() !== null,
    () => false,
  );
  const voiceSupported = useSyncExternalStore(
    () => () => {},
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
    () => false,
  );
  const variables = {
    '--desk-ink': palette.ink,
    '--desk-accent': palette.accent,
    '--desk-card': palette.card,
    '--desk-muted': palette.muted,
  } as CSSProperties;

  const ask = async (question: string, speakBack = voiceReplies) => {
    const clean = question.trim();
    if (!clean || busy) return;
    setBusy(true);
    setError('');
    setInput('');
    messageId.current += 1;
    setMessages((current) => [...current, { id: `u-${messageId.current}`, role: 'user', text: clean }]);
    try {
      const response = await fetch('/api/living-site/desk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant, question: clean }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.answer) throw new Error(result.error ?? 'The desk could not answer just now.');
      const reply: DeskMessage = {
        id: `a-${messageId.current}`,
        role: 'assistant',
        text: result.answer,
        sources: Array.isArray(result.sources) ? result.sources : [],
        mode: result.mode,
      };
      setMessages((current) => [...current, reply]);
      if (speakBack) speak(reply.text);
      requestAnimationFrame(() => messageList.current?.scrollTo({ top: messageList.current.scrollHeight, behavior: 'smooth' }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The desk could not answer just now.');
    } finally {
      setBusy(false);
    }
  };

  const toggleMic = () => {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    const RecognitionConstructor = recognitionConstructor();
    if (!RecognitionConstructor) return;
    const next = new RecognitionConstructor();
    next.lang = 'en-NZ';
    next.interimResults = true;
    next.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result?.[0]?.transcript ?? '';
      setInput(transcript);
      if (result?.isFinal && transcript.trim()) {
        setVoiceReplies(true);
        void ask(transcript, true);
      }
    };
    next.onend = () => setListening(false);
    next.onerror = () => setListening(false);
    recognition.current = next;
    setListening(true);
    next.start();
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(input);
  };

  return (
    <section className={styles.desk} style={variables} aria-label={`${businessName} voice and chat desk`}>
      <header className={styles.header}>
        <div className={styles.presence}><i aria-hidden /><div><strong>{businessName} desk</strong><span>reads the current Business Genome</span></div></div>
        {voiceSupported ? (
          <button type="button" className={`${styles.voiceToggle} ${voiceReplies ? styles.voiceOn : ''}`} onClick={() => { setVoiceReplies((current) => !current); window.speechSynthesis?.cancel(); }}>
            {voiceReplies ? <Volume2 size={13} aria-hidden /> : <VolumeX size={13} aria-hidden />} {voiceReplies ? 'voice replies on' : 'voice replies off'}
          </button>
        ) : null}
      </header>
      <div className={styles.messages} ref={messageList} aria-live="polite">
        {messages.map((message) => (
          <article key={message.id} className={`${styles.message} ${message.role === 'user' ? styles.user : styles.assistant}`}>
            {message.role === 'assistant' ? <AgentMarkdown text={message.text} /> : message.text}
            {message.sources?.length ? <div className={styles.sources}>{message.sources.map((source) => <span key={source.id}>{source.label}</span>)}</div> : null}
            {message.mode ? <p className={styles.mode}>{message.mode}</p> : null}
          </article>
        ))}
      </div>
      <div className={styles.quickRow} aria-label="Questions to try">
        {prompts.slice(0, 3).map((prompt) => <button key={prompt} type="button" disabled={busy} onClick={() => void ask(prompt)}>{prompt}</button>)}
      </div>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <form className={styles.composer} onSubmit={submit}>
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={`Ask ${owner}'s desk about a service, price or policy…`} maxLength={2000} aria-label="Your question" />
        {micSupported ? <button type="button" className={`${styles.mic} ${listening ? styles.listening : ''}`} onClick={toggleMic} aria-label={listening ? 'Stop listening' : 'Ask with your voice'}><Mic size={16} aria-hidden /></button> : null}
        <button type="submit" disabled={busy || !input.trim()} aria-label="Send question">{busy ? '…' : <Send size={15} aria-hidden />}</button>
      </form>
      <p className={styles.note}>Draft-only. This desk can explain the current genome and help prepare a request; it cannot confirm a booking, charge, send or publish. {owner} stays in control.</p>
    </section>
  );
}
