'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Send, X } from 'lucide-react';
import { isCustomerWorkspace, isAlphassembl, isAssemblBills, isStandaloneHealth, isMotionStudio, isCreativeStudio } from '@/components/site/site-header';
import { cn } from '@/lib/utils';
import { orderedBundles } from '@/lib/marketplace/bundles';
import { PRICING_NOTE, pricingPlainLines } from '@/lib/registry/pricing';

type Message = {
  role: 'user' | 'agent';
  body: string;
};

/* The public studio frame: paper, ink and one quiet sea-glass status accent. */
const PAPER = '#F0F0EB';
const INK = '#111311';
const GOLD = '#557060';

const QUICK_PROMPTS = [
  'how does pricing work?',
  'which bundle fits me?',
  'show me an agent',
  'book a pilot',
] as const;

/** Live bundle names, pulled from the registry — never hardcode agent names. */
function bundleSentence(): string {
  const bundles = orderedBundles();
  const named = bundles.map((bundle) => bundle.name).join(', ');
  return `There are ${bundles.length}: ${named}.`;
}

/** Knowledge base, built at render so pricing and names track the registry. */
function buildKnowledge() {
  return [
    {
      match: ['price', 'pricing', 'cost', 'pay', 'how much', 'subscription', 'plan'],
      answer: `Start free — every agent answers a few messages before you pay a cent. From there: ${pricingPlainLines().join('; ')}. ${PRICING_NOTE}`,
      href: '/pricing',
      cta: 'see pricing',
    },
    {
      match: ['bundle', 'fit', 'pack', 'industry', 'construction', 'automotive', 'creative', 'health', 'legal', 'family', 'immigration', 'animal', 'which'],
      answer: `A bundle is a team of specialists built for one line of work. ${bundleSentence()} Tell me what you do and I'll point you at the right one.`,
      href: '/bundles',
      cta: 'browse bundles',
    },
    {
      match: ['agent', 'show', 'assistant', 'fleet', 'marketplace', 'try'],
      answer:
        "Every agent has its own page — what it does, what it cites, and a chat you can try on the spot. A few messages free, no card. Pick the one that matches the job on your desk and put it to work.",
      href: '/agents',
      cta: 'meet the agents',
    },
    {
      match: ['pilot', 'sprint', 'book', 'start', 'demo'],
      answer:
        "A pilot is the low-risk way in: one real workflow from your business, built and proven inside 30 days, priced as an outcome. You keep the evidence pack either way.",
      href: '/pilot-sprint',
      cta: 'book a pilot',
    },
    {
      match: ['evidence', 'proof', 'audit', 'review', 'approve', 'trust'],
      answer:
        'Every piece of work ships with its evidence pack: sources cited, reasoning shown, a named person signing it off. The mahi and the proof stay side by side.',
      href: '/evidence-pack',
      cta: 'see an evidence pack',
    },
  ] as const;
}

const MAX_CHARS = 1000;

export function AssemblConciergeWidget() {
  const pathname = usePathname();
  // True on an agent's own chat page (/agents/<slug>/chat) — where this global
  // concierge would overlap the agent's own chat surface.
  const isAgentChatPage = !!pathname && /^\/agents\/[^/]+\/chat(\/|$)/.test(pathname);
  // The /admin operator hub is an internal surface — keep the public concierge off it.
  const isAdminHub = !!pathname && (pathname === '/admin' || pathname.startsWith('/admin/'));
  // Full-screen white-labelled tenant workspaces must never show the assembl
  // concierge inside them (assembl attribution stays on the Mana Receipt).
  // Uses the same guard as the site header/footer so new tenants and the
  // /for/* magic links are covered without maintaining a slug list here —
  // per-slug lists rot on tenant renames (aeronaut→aironaut did exactly that).
  const isTenantWorkspace = isCustomerWorkspace(pathname);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'agent',
      body: "hey, I'm assembl. what would you like to know?",
    },
  ]);

  const knowledge = useMemo(() => buildKnowledge(), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Auto-scroll to bottom on message or typing change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle auto-focus and focus restoration
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else if (!isFirstRender.current) {
      triggerRef.current?.focus();
    }
    isFirstRender.current = false;
  }, [open]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const findAnswer = (input: string) => {
    const lower = input.toLowerCase();
    return (
      knowledge.find((entry) => entry.match.some((needle) => lower.includes(needle))) ?? {
        answer:
          "The short version: specialist agents that know Aotearoa, drafts a person approves, and an evidence pack behind every piece of work. Ask me about pricing, bundles, or a job you'd like off your plate.",
        href: '/agents',
        cta: 'meet the agents',
      }
    );
  };

  const latestMatch = useMemo(() => {
    const last = [...messages].reverse().find((message) => message.role === 'user');
    return last ? findAnswer(last.body) : knowledge[2];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const send = (text = draft) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setMessages((current) => [...current, { role: 'user', body: trimmed }]);
    setDraft('');
    setIsTyping(true);

    // Brief simulated typing delay
    setTimeout(() => {
      const found = findAnswer(trimmed);
      setMessages((current) => [
        ...current,
        { role: 'agent', body: found.answer },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  // Don't render the global concierge on an agent's own chat page, the internal
  // /admin operator hub, a tenant workspace, or the homepage (its own portal).
  if (isAgentChatPage || isAdminHub || isTenantWorkspace || isAlphassembl(pathname) || isAssemblBills(pathname) || isStandaloneHealth(pathname) || isMotionStudio(pathname) || isCreativeStudio(pathname) || (!!pathname && ['/', '/pricing', '/agents', '/about', '/pilots', '/field-notes', '/build-an-agent'].includes(pathname))) {
    return null;
  }

  return (
    <aside className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="ask assembl"
          style={{ backgroundColor: PAPER }}
          className="w-[min(calc(100vw-2rem),390px)] overflow-hidden border border-[rgba(17,19,17,0.24)] shadow-[0_24px_70px_rgba(17,19,17,0.16)] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300"
        >
          <div className="flex items-start justify-between gap-4 border-b border-[rgba(26,25,24,0.08)] p-4">
            <div>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.22em]"
                style={{ color: GOLD }}
              >
                your guide
              </p>
              <h2
                className="mt-1 font-display text-2xl font-semibold lowercase leading-none"
                style={{ color: INK }}
              >
                ask assembl
                <span aria-hidden style={{ color: GOLD }}>
                  .
                </span>
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close ask assembl"
              title="Close"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-[rgba(26,25,24,0.55)] transition-all hover:bg-[rgba(26,25,24,0.06)] hover:text-[#1A1918] focus-visible:bg-[rgba(26,25,24,0.06)] focus-visible:text-[#1A1918] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
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
                    'max-w-[86%] rounded-xl px-3 py-2 text-sm leading-relaxed',
                    message.role === 'user'
                      ? 'bg-[#1A1918] text-[#FBFAF6]'
                      : 'border border-[rgba(26,25,24,0.08)] bg-white text-[#3A3832]',
                  )}
                >
                  {message.body}
                </p>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-1 rounded-xl border border-[rgba(26,25,24,0.08)] bg-white px-3 py-3"
                  aria-hidden="true"
                >
                  <span className="h-1 w-1 animate-bounce rounded-full bg-[#BFA37A] [animation-delay:-0.3s]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-[#BFA37A] [animation-delay:-0.15s]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-[#BFA37A]" />
                </div>
                <span className="sr-only">assembl is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[rgba(26,25,24,0.08)] p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  disabled={isTyping}
                  className="border border-[rgba(17,19,17,0.18)] bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.04em] text-[#4f544f] transition-all hover:border-[#111311] hover:text-[#111311] focus-visible:border-[#111311] focus-visible:text-[#111311] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:opacity-40"
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
              className="flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <label htmlFor="assembl-guide-input" className="sr-only">
                  Ask assembl
                </label>
                <input
                  id="assembl-guide-input"
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value.slice(0, MAX_CHARS))}
                  placeholder="ask anything..."
                  disabled={isTyping}
                  aria-describedby="concierge-counter"
                  className="h-11 min-w-0 flex-1 border border-[rgba(17,19,17,0.2)] bg-white px-3 text-sm text-[#111311] transition-all focus:border-[#111311] focus:outline focus:outline-2 focus:outline-[#111311]/20 focus:outline-offset-0 disabled:opacity-60"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  style={{ backgroundColor: INK, color: PAPER }}
                  className="inline-flex h-11 w-11 items-center justify-center transition-all hover:opacity-90 focus-visible:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:opacity-40"
                  disabled={!draft.trim() || isTyping}
                >
                  <Send className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="flex justify-end">
                <span
                  id="concierge-counter"
                  className={cn(
                    'font-mono text-[10px] uppercase tracking-[0.1em]',
                    draft.length > MAX_CHARS * 0.9
                      ? 'font-medium text-destructive'
                      : 'text-[rgba(26,25,24,0.45)]',
                  )}
                  aria-hidden="true"
                >
                  {draft.length} / {MAX_CHARS}
                </span>
                <span className="sr-only" aria-live="polite">
                  {draft.length > MAX_CHARS * 0.9 ? `${draft.length} / ${MAX_CHARS} characters` : ''}
                </span>
              </div>
            </form>
            <Link
              href={latestMatch.href}
              className="mt-1 inline-flex items-center rounded-sm font-mono text-[10px] uppercase tracking-[0.18em] transition-opacity hover:opacity-80 focus-visible:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              style={{ color: GOLD }}
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
        style={{ backgroundColor: INK, color: PAPER }}
        className="inline-flex h-12 items-center gap-2 border border-[#111311] px-5 shadow-[0_16px_44px_rgba(17,19,17,0.16)] transition-all hover:-translate-y-0.5 hover:bg-[#343734] focus-visible:-translate-y-0.5 focus-visible:bg-[#343734] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 active:translate-y-0"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] leading-none">
          ask assembl
        </span>
      </button>
    </aside>
  );
}
