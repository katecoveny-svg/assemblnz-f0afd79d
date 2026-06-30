'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { ArrowLeft, ArrowUp, FileDown, ImagePlus, Lock, X } from 'lucide-react';
import {
  agentCheckoutHref,
  PALETTE,
  agentPriceLabel,
  type PublicMarketplaceAgent,
} from '@/lib/marketplace/agents';
import { AgentIcon } from '@/components/marketplace/AgentIcon';
import { DashLoader } from '@/components/marketplace/DashLoader';
import { Wordmark } from '@/components/marketplace/Wordmark';
import { ShareToPhone } from '@/components/marketplace/ShareToPhone';
import { AgentVisual, parseVisuals } from '@/components/marketplace/AgentVisual';
import { AgentMarkdown } from '@/components/marketplace/AgentMarkdown';
import { downloadConversationPack, type ConversationTurn } from '@/lib/export/pdf';
import { InstallPwaButton } from '@/components/hapai/InstallPwaButton';
import { MicButton } from '@/components/marketplace/MicButton';
import { ConsultRecorder } from '@/components/marketplace/ConsultRecorder';
import orb from '@/components/marketplace/orbGrid.module.css';

/** Pull the rendered text out of a UIMessage's parts. */
function messageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

/** Pull image attachment URLs (data URLs) out of a UIMessage's file parts. */
function messageImages(message: UIMessage): string[] {
  return message.parts
    .filter((p) => p.type === 'file')
    .map((p) => p as unknown as { url?: string; mediaType?: string })
    .filter((p) => typeof p.url === 'string' && (p.mediaType ?? '').startsWith('image/'))
    .map((p) => p.url as string);
}

type Paywall = { message: string } | null;

export function AgentChat({
  agent,
  apiPath,
  backHref,
}: {
  agent: PublicMarketplaceAgent;
  /** Override the chat API endpoint (default: the marketplace agent route). */
  apiPath?: string;
  /** Override the header back link (default: the agent detail page). */
  backHref?: string;
}) {
  const chatApi = apiPath ?? `/api/agents/${agent.slug}/chat`;
  const back = backHref ?? `/agents/${agent.slug}`;
  const greeting: UIMessage = {
    id: 'greeting',
    role: 'assistant',
    parts: [{ type: 'text', text: agent.greeting }],
  };

  // Custom fetch so we can intercept the free-tier paywall (HTTP 402 once the
  // 3 free messages are spent) and show a subscribe card instead of an error.
  const [paywall, setPaywall] = useState<Paywall>(null);
  const chatFetch = useCallback<typeof fetch>(async (input, init) => {
    const res = await fetch(input, init);
    if (res.status === 402) {
      const data = (await res.clone().json().catch(() => null)) as { message?: string } | null;
      setPaywall({ message: data?.message ?? 'You have used your free messages with this agent.' });
    }
    return res;
  }, []);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: chatApi, fetch: chatFetch }),
    messages: [greeting],
  });

  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Voice input appends the spoken text to the composer for the user to review.
  const handleTranscript = useCallback((text: string) => {
    setInput((prev) => (prev ? `${prev} ${text}` : text));
  }, []);

  const busy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  function submit(text: string) {
    const trimmed = text.trim();
    if ((!trimmed && !imageFile) || busy || paywall) return;
    if (imageFile) {
      const dt = new DataTransfer();
      dt.items.add(imageFile);
      sendMessage({
        text: trimmed || 'Please read this photo and pull out the important details.',
        files: dt.files,
      });
      setImageFile(null);
    } else {
      sendMessage({ text: trimmed });
    }
    setInput('');
  }

  // The conversation as plain turns — feeds the PDF pack + the share text.
  const turns = useMemo<ConversationTurn[]>(
    () =>
      messages
        .map((m) => ({ role: m.role === 'user' ? ('user' as const) : ('assistant' as const), text: messageText(m) }))
        .filter((t) => t.text.trim().length > 0 && (t.role === 'user' || t.role === 'assistant')),
    [messages],
  );

  const hasConversation = turns.length > 1; // more than just the greeting
  const lastAssistant = [...turns].reverse().find((t) => t.role === 'assistant');

  const onDownload = useCallback(() => {
    if (!hasConversation) return;
    downloadConversationPack({
      agentName: agent.name,
      agentSlug: agent.slug,
      accent: agent.accent,
      turns,
    });
  }, [agent.accent, agent.name, agent.slug, hasConversation, turns]);

  // Is the assistant streaming but hasn't emitted visible text yet? Fill the dog.
  const last = messages[messages.length - 1];
  const waitingForText = busy && (!last || last.role !== 'assistant' || messageText(last).length === 0);

  return (
    <div className="mk-root flex h-[100dvh] flex-col" style={{ backgroundColor: PALETTE.cream }}>
      {/* Header */}
      <header
        className="flex items-center justify-between border-b px-4 py-3 md:px-6"
        style={{ borderColor: PALETTE.hairline, backgroundColor: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-3">
          <Link
            href={back}
            aria-label="Back to agent details"
            className="rounded-full p-1.5 hover:bg-black/5"
            style={{ color: PALETTE.ink }}
          >
            <ArrowLeft size={18} aria-hidden />
          </Link>
          <span
            className={orb.orb}
            style={{ width: 40, height: 40, background: 'radial-gradient(circle at 33% 26%, #FFFDF7 0%, #FFD42A 52%, #E0A800 100%)' }}
            aria-hidden
          >
            <span className={orb.orbSpec} aria-hidden />
            <AgentIcon name={agent.icon} className="relative h-5 w-5" />
          </span>
          <div className="flex items-baseline gap-2 leading-tight">
            <p className="text-xl" style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 600, letterSpacing: '-0.01em', color: PALETTE.ink }}>
              {agent.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasConversation ? (
            <>
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition hover:bg-white"
                style={{ borderColor: PALETTE.hairline, color: PALETTE.ink }}
                aria-label="Download evidence pack"
              >
                <FileDown size={14} aria-hidden />
                Pack
              </button>
              {lastAssistant ? (
                <ShareToPhone
                  title={`${agent.name} · assembl`}
                  text={lastAssistant.text}
                  label="Save"
                />
              ) : null}
            </>
          ) : null}
          <Wordmark size={18} href="/agents" />
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((m) => {
            const raw = messageText(m);
            const imgs = m.role === 'user' ? messageImages(m) : [];
            if (!raw && imgs.length === 0) return null;
            const isUser = m.role === 'user';
            const { text, visuals } = isUser ? { text: raw, visuals: [] } : parseVisuals(raw);
            return (
              <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                {imgs.length > 0 ? (
                  <div className="mb-1 flex w-full max-w-[85%] flex-col gap-1">
                    {imgs.map((src, i) => (
                      <div
                        key={i}
                        className="w-full rounded-[16px] border bg-cover bg-center"
                        style={{ borderColor: PALETTE.hairline, backgroundImage: `url(${src})`, height: 200 }}
                      />
                    ))}
                  </div>
                ) : null}
                {text ? (
                  <div
                    className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                      isUser ? 'rounded-[22px] rounded-br-md' : 'rounded-[22px] rounded-bl-md'
                    }`}
                    style={
                      isUser
                        ? {
                            background: 'linear-gradient(180deg, #FFE27A, #FFD42A)',
                            color: PALETTE.ink,
                            boxShadow: '0 8px 20px rgba(255,200,30,0.22)',
                          }
                        : {
                            backgroundColor: 'rgba(255,255,255,0.92)',
                            color: PALETTE.body,
                            border: `1px solid ${PALETTE.hairline}`,
                            boxShadow: '0 10px 30px rgba(180,140,0,0.06)',
                          }
                    }
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{text}</p>
                    ) : (
                      <AgentMarkdown text={text} />
                    )}
                  </div>
                ) : null}
                {visuals.length > 0 ? (
                  <div className="w-full max-w-[85%]">
                    {visuals.map((spec, i) => (
                      <AgentVisual key={i} spec={spec} />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}

          {waitingForText ? (
            <div className="self-start rounded-[20px] border px-4 py-3" style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.paper }}>
              <DashLoader label={`${agent.name} is thinking…`} width={64} />
            </div>
          ) : null}

          {paywall ? (
            <div
              className="self-start rounded-[20px] border px-4 py-4 text-sm"
              style={{ borderColor: PALETTE.canary, backgroundColor: PALETTE.cream, color: PALETTE.ink }}
            >
              <div className="flex items-center gap-2 font-bold">
                <Lock size={15} aria-hidden />
                Free messages used up
              </div>
              <p className="mt-1.5" style={{ color: PALETTE.body }}>
                {paywall.message}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link
                  href={agentCheckoutHref(agent)}
                  className={orb.installPill}
                  style={{ padding: '8px 16px', fontSize: 12 }}
                >
                  Subscribe · {agentPriceLabel(agent)}
                </Link>
                <Link
                  href="/agents/pricing"
                  className="inline-flex h-9 items-center rounded-full border px-4 text-xs font-bold"
                  style={{ borderColor: PALETTE.ink, color: PALETTE.ink }}
                >
                  See all plans
                </Link>
              </div>
            </div>
          ) : error ? (
            <div
              className="self-start rounded-[20px] border px-4 py-3 text-sm"
              style={{ borderColor: 'rgba(180,60,40,0.3)', backgroundColor: 'rgba(180,60,40,0.06)', color: '#7a2a1a' }}
            >
              Something went wrong: {error.message || 'the agent could not reply.'} The chat may not be
              configured yet.
            </div>
          ) : null}

          {/* Starters — only on the fresh, greeting-only state */}
          {messages.length <= 1 && !busy && !paywall ? (
            <div className="mt-2 flex flex-col gap-2">
              {agent.starters.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="self-start rounded-full border px-4 py-2 text-left text-sm font-bold transition hover:bg-white"
                  style={{ borderColor: PALETTE.hairline, color: PALETTE.ink }}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}

          {/* Install this agent as its own app */}
          {messages.length <= 1 && !busy && !paywall ? (
            <div className="mt-1">
              <InstallPwaButton label={`Add ${agent.name} to your home screen`} compact />
            </div>
          ) : null}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t px-4 py-3 md:px-6" style={{ borderColor: PALETTE.hairline, backgroundColor: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        {imageFile ? (
          <div className="mx-auto mb-2 flex max-w-2xl items-center gap-2">
            <div
              className="h-12 w-12 shrink-0 rounded-lg border bg-cover bg-center"
              style={{ borderColor: PALETTE.hairline, backgroundImage: `url(${URL.createObjectURL(imageFile)})` }}
            />
            <span className="truncate text-xs" style={{ color: PALETTE.muted }}>
              {imageFile.name}
            </span>
            <button
              type="button"
              onClick={() => setImageFile(null)}
              aria-label="Remove photo"
              className="rounded-full p-1 hover:bg-black/5"
              style={{ color: PALETTE.ink }}
            >
              <X size={14} aria-hidden />
            </button>
          </div>
        ) : null}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="mx-auto flex max-w-2xl items-end gap-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setImageFile(f);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!!paywall}
            aria-label="Add a photo"
            title="Add a photo"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition disabled:opacity-40"
            style={{ borderColor: PALETTE.ink, color: PALETTE.ink }}
          >
            <ImagePlus size={18} aria-hidden />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            rows={1}
            disabled={!!paywall}
            placeholder={paywall ? 'Free demo limit reached' : `Message ${agent.name}…`}
            className="max-h-40 flex-1 resize-none rounded-[20px] border bg-white px-4 py-3 text-sm outline-none disabled:opacity-60"
            style={{ borderColor: PALETTE.hairline, color: PALETTE.ink }}
          />
          {agent.consultCapture ? (
            <ConsultRecorder onTranscript={handleTranscript} disabled={!!paywall} ink={PALETTE.ink} />
          ) : (
            <MicButton onTranscript={handleTranscript} disabled={!!paywall} ink={PALETTE.ink} />
          )}
          <button
            type="submit"
            disabled={busy || (!input.trim() && !imageFile) || !!paywall}
            aria-label="Send"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
            style={{
              background: 'linear-gradient(180deg, #FFE27A, #FFD42A)',
              color: PALETTE.ink,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 8px 18px rgba(255,200,30,0.28)',
            }}
          >
            <ArrowUp size={18} aria-hidden />
          </button>
        </form>
        <p className="mk-mono mx-auto mt-2 max-w-2xl text-center text-[11px]" style={{ color: PALETTE.muted }}>
          A draft for you to check. Not legal, financial, or medical advice.
        </p>
      </div>
    </div>
  );
}
