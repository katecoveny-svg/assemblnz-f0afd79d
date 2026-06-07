'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MessageCircle, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'agent';
  body: string;
};

const QUICK_PROMPTS = [
  'Which kete fits construction?',
  'What does Industry Pack cost?',
  'How do agents collaborate?',
  'What is an evidence pack?',
] as const;

const MAX_CHARS = 1000;

const KNOWLEDGE = [
  {
    match: ['price', 'cost', 'industry pack', 'pricing', 'pay'],
    answer:
      'Industry Pack is NZ$5,000/mo flat, GST exclusive, for one industry pack with its specialist fleet, evidence inbox, and proof layer. Tōro is separate at NZ$29/mo for families. Pilot Sprint is NZ$5,000 once-off for two weeks, one workflow, and one evidence pack.',
    href: '/pricing',
    cta: 'See pricing',
  },
  {
    match: ['kete', 'industry', 'construction', 'hospitality', 'freight', 'automotive', 'creative', 'education', 'retail'],
    answer:
      'assembl has nine packs: Waihanga, Manaaki, Pīkau, Arataki, Auaha, Ako, Mātauranga, Hoko, and Tōro. The eight industry packs run business workflows; Tōro is the family assistant.',
    href: '/kete',
    cta: 'Explore kete',
  },
  {
    match: ['agent', 'collaborate', 'handoff', 'fleet', 'together'],
    answer:
      'Assistants collaborate behind the scenes. Each specialist keeps its lane, uses remembered business context when approved, hands off when another phase is needed, and leaves a trace for the evidence pack.',
    href: '/agents',
    cta: 'Browse agents',
  },
  {
    match: ['evidence', 'proof', 'audit', 'review', 'approve'],
    answer:
      'An evidence pack is the working record: source citations, reasoning trace, reviewer edits, sign-off, and verifier trail. The important bit is that the mahi and the proof stay beside each other.',
    href: '/evidence-pack',
    cta: 'See evidence pack',
  },
  {
    match: ['pilot', 'sprint', 'try', 'start'],
    answer:
      'Pilot Sprint is the low-risk start: two weeks, one real workflow, one named reviewer, and one evidence pack. It is built to prove the mahi before you subscribe.',
    href: '/pilot-sprint',
    cta: 'Book a pilot',
  },
] as const;

export function AssemblConciergeWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'agent',
      body:
        'Kia ora. I know the assembl offer, kete, pricing, evidence packs, and agent fleet. Ask me where to start.',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isFirstRender = useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
      // Focus the input when the widget opens, but not on initial page load
      if (!isFirstRender.current) {
        inputRef.current?.focus();
      }
    } else if (!isFirstRender.current) {
      // Restore focus to trigger when closing
      triggerRef.current?.focus();
    }
    isFirstRender.current = false;
  }, [messages, open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const latestMatch = useMemo(() => {
    const last = [...messages].reverse().find((message) => message.role === 'user');
    return last ? findAnswer(last.body) : KNOWLEDGE[2];
  }, [messages]);

  const send = (text = draft) => {
    const trimmed = text.slice(0, MAX_CHARS).trim();
    if (!trimmed) return;
    const found = findAnswer(trimmed);
    setMessages((current) => [
      ...current,
      { role: 'user', body: trimmed },
      { role: 'agent', body: found.answer },
    ]);
    setDraft('');
  };

  return (
    <aside className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="concierge-title"
          className="w-[min(calc(100vw-2rem),390px)] overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-[color:var(--assembl-paper)] shadow-[0_24px_80px_rgba(35,33,31,0.22)] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300"
        >
          <div className="flex items-start justify-between gap-4 border-b border-[rgba(35,33,31,0.10)] bg-white/60 p-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
                assembl guide
              </p>
              <h2
                id="concierge-title"
                className="mt-1 font-display text-2xl font-light leading-none text-[color:var(--text-primary)]"
              >
                Ask about the mahi.
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close assembl guide"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-[color:var(--text-secondary)] transition-all hover:bg-[rgba(35,33,31,0.06)] hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div
            className="max-h-[420px] space-y-3 overflow-y-auto p-4"
            aria-live="polite"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
              >
                <p
                  className={cn(
                    'max-w-[86%] rounded-[8px] px-3 py-2 text-sm leading-relaxed',
                    message.role === 'user'
                      ? 'bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
                      : 'border border-[rgba(35,33,31,0.10)] bg-white/70 text-[color:var(--text-body)]'
                  )}
                >
                  {message.body}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[rgba(35,33,31,0.10)] p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  className="rounded-full border border-[rgba(35,33,31,0.12)] bg-white/60 px-3 py-1 text-xs text-[color:var(--text-secondary)] transition-all hover:border-[color:var(--assembl-pounamu)] hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                send();
              }}
              className="flex items-center gap-2"
            >
              <label htmlFor="assembl-guide-input" className="sr-only">
                Ask assembl guide
              </label>
              <input
                ref={inputRef}
                id="assembl-guide-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about assembl..."
                maxLength={MAX_CHARS}
                aria-describedby="char-counter"
                className="h-11 min-w-0 flex-1 rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-white/70 px-3 text-sm text-[color:var(--text-primary)] outline-none transition-all focus:border-[color:var(--assembl-pounamu)] focus:ring-2 focus:ring-[color:var(--assembl-pounamu)]/20"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] bg-[color:var(--assembl-pounamu)] text-[color:var(--assembl-paper)] transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2 disabled:opacity-40"
                disabled={!draft.trim()}
              >
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </form>
            <div className="mt-2 flex justify-end">
              <span
                id="char-counter"
                className={cn(
                  'font-mono text-[9px] uppercase tracking-[0.1em]',
                  draft.length >= MAX_CHARS * 0.9
                    ? 'font-medium text-[color:var(--assembl-clay)]'
                    : 'text-[color:var(--text-secondary)]'
                )}
              >
                {draft.length} / {MAX_CHARS}
              </span>
            </div>
            <Link
              href={latestMatch.href}
              className="mt-3 inline-flex items-center rounded-sm font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
            >
              {latestMatch.cta}
              <ArrowRight className="ml-2 h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-14 items-center gap-3 rounded-full border border-[rgba(35,33,31,0.12)] bg-[color:var(--assembl-pounamu)] px-5 text-sm font-medium text-[color:var(--assembl-paper)] shadow-[0_16px_50px_rgba(35,33,31,0.20)] transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <MessageCircle className="h-5 w-5" aria-hidden />
        Ask assembl
      </button>
    </aside>
  );
}

function findAnswer(input: string) {
  const lower = input.toLowerCase();
  return (
    KNOWLEDGE.find((entry) => entry.match.some((needle) => lower.includes(needle))) ??
    {
      answer:
        'The short version: assembl gives NZ operators specialist agents, live business context, reviewable drafts, and evidence packs. For a precise answer, start with the kete or workflow you care about.',
      href: '/agents',
      cta: 'Browse agents',
    }
  );
}
