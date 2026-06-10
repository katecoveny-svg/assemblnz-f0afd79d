'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, FileDown, Loader2, Paperclip, Send, ShieldCheck, X } from 'lucide-react';

type Tenant = {
  slug: string;
  name: string;
  kete: string;
  keteName: string;
  keteDomain: string;
  logoUrl: string | null;
  brandColor: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  body: string;
  createdAt: string;
};

type Attachment = {
  name: string;
  type: string;
  dataUrl: string;
};

type Props = {
  tenant: Tenant;
  embed?: boolean;
};

const LANDING_COPY: Record<string, {
  title: string;
  body: string;
  prompts: string[];
}> = {
  pikau: {
    title: 'Freight and customs work with the evidence trail built in.',
    body: 'Pīkau drafts broker-ready customs, tariff, biosecurity, and freight documentation. Every reply is a draft for human review, grounded in live Knowledge Brain sources where available.',
    prompts: [
      'Review a tariff classification question',
      'Draft a broker-ready customs evidence summary',
      'Check what MPI biosecurity evidence may be missing',
    ],
  },
  waihanga: {
    title: 'Construction paperwork that shows its working.',
    body: 'Waihanga helps draft project evidence, payment claim notes, consent trails, and compliance checks for review.',
    prompts: [
      'Check what is missing from this consent pack',
      'Draft an RFI response from site notes',
      'Review a payment claim evidence trail',
    ],
  },
  manaaki: {
    title: 'Hospitality compliance without losing the service rhythm.',
    body: 'Manaaki helps draft food safety, liquor licensing, roster, and incident documentation for review.',
    prompts: [
      'Draft a food safety corrective action',
      'Check a liquor licence renewal pack',
      'Summarise a guest incident for manager review',
    ],
  },
};

function landingCopy(tenant: Tenant) {
  return LANDING_COPY[tenant.kete] ?? {
    title: `${tenant.keteName} support, ready for review.`,
    body: `Ask ${tenant.name} a practical question. assembl will draft a grounded reply and keep the output in review posture.`,
    prompts: [
      'Draft the first version',
      'Check what evidence is missing',
      'Summarise the next action',
    ],
  };
}

function storageKey(slug: string) {
  return `assembl-public-chat:${slug}`;
}

function newId() {
  return crypto.randomUUID();
}

export function PublicChatClient({ tenant, embed = false }: Props) {
  const copy = landingCopy(tenant);
  // Sub-agent deep-link: read ?agent= from the URL so links like
  // /c/toro?agent=VOYAGE load the Voyage prompt instead of the kete default.
  const [agentSlug, setAgentSlug] = useState<string>('');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const a = params.get('agent');
    if (a) setAgentSlug(a.toLowerCase());
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'hello',
      role: 'assistant',
      body: `Kia ora. Ask ${tenant.name} a question and the ${tenant.keteName} pack will draft a grounded reply for review.`,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [savingPack, setSavingPack] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packError, setPackError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [redactPii, setRedactPii] = useState(false);
  const [chatId, setChatId] = useState<string>(() => newId());
  const [sessionId, setSessionId] = useState<string>(() => newId());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const history = useMemo(
    () =>
      messages
        .filter((message) => message.id !== 'hello')
        .slice(-8)
        .map((message) => ({
          role: message.role,
          content: message.body,
        })),
    [messages],
  );

  const transcriptMessages = useMemo(
    () =>
      messages.filter(
        (message) => message.id !== 'hello' && message.body.trim().length > 0,
      ),
    [messages],
  );

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(storageKey(tenant.slug));
      if (stored) {
        const parsed = JSON.parse(stored) as { chatId?: string; sessionId?: string };
        if (parsed.chatId) setChatId(parsed.chatId);
        if (parsed.sessionId) setSessionId(parsed.sessionId);
      } else {
        const ids = { chatId: newId(), sessionId: newId() };
        setChatId(ids.chatId);
        setSessionId(ids.sessionId);
        sessionStorage.setItem(storageKey(tenant.slug), JSON.stringify(ids));
      }
    } catch {
      // Keep generated ids; private browsing can block sessionStorage.
    }
  }, [tenant.slug]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
    if (embed) {
      window.parent?.postMessage(
        { type: 'assembl:resize', height: Math.min(node.scrollHeight + 160, 720) },
        '*',
      );
    }
  }, [messages, sending, embed]);

  useEffect(() => {
    inputRef.current?.focus();
    if (embed) {
      window.parent?.postMessage({ type: 'assembl:ready', tenant: tenant.slug }, '*');
    }
  }, [embed, tenant.slug]);

  const closeEmbed = useCallback(() => {
    window.parent?.postMessage({ type: 'assembl:close' }, '*');
  }, []);

  const attachFile = useCallback((file?: File) => {
    setError(null);
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError('Please attach an image or PDF under 8MB.');
      return;
    }
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Please attach an image or PDF.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        type: file.type,
        dataUrl: String(reader.result ?? ''),
      });
    };
    reader.onerror = () => setError('That file could not be read.');
    reader.readAsDataURL(file);
  }, []);

  const send = useCallback(async () => {
    const trimmed = draft.trim();
    if ((!trimmed && !attachment) || sending) return;

    const now = new Date().toISOString();
    const userBody = [
      trimmed,
      attachment ? `Attached file: ${attachment.name}` : '',
      redactPii ? 'PII redaction requested before processing.' : '',
    ].filter(Boolean).join('\n');
    const userMessage: Message = { id: newId(), role: 'user', body: userBody, createdAt: now };
    const assistantId = newId();
    setMessages((current) => [
      ...current,
      userMessage,
      { id: assistantId, role: 'assistant', body: '', createdAt: now },
    ]);
    setDraft('');
    setAttachment(null);
    setSending(true);
    setError(null);
    setPackError(null);

    try {
      const response = await fetch('/api/public-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: tenant.slug,
          kete: tenant.kete,
          agent: agentSlug || undefined,
          message: trimmed,
          imageDataUrl: attachment?.dataUrl,
          redactPii,
          sessionId,
          chatId,
          history,
        }),
      });
      if (!response.ok || !response.body) throw new Error('The chat could not answer just now.');

      const nextChatId = response.headers.get('X-Chat-Id');
      const nextSessionId = response.headers.get('X-Session-Id');
      if (nextChatId) setChatId(nextChatId);
      if (nextSessionId) setSessionId(nextSessionId);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let body = '';
      const responseStartedAt = new Date().toISOString();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        body += decoder.decode(value, { stream: true });
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, body, createdAt: responseStartedAt }
              : message,
          ),
        );
      }
      if (!body.trim()) throw new Error('The chat returned an empty reply.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
      setDraft(trimmed);
      setAttachment(attachment);
      setMessages((current) => current.filter((item) => item.id !== assistantId && item.id !== userMessage.id));
    } finally {
      setSending(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [agentSlug, attachment, chatId, draft, history, redactPii, sending, sessionId, tenant.kete, tenant.slug]);

  const saveEvidencePack = useCallback(async () => {
    if (transcriptMessages.length < 2 || savingPack) return;

    setSavingPack(true);
    setPackError(null);
    try {
      const response = await fetch('/api/public-evidence-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: tenant.slug,
          kete: tenant.kete,
          sessionId,
          transcript: transcriptMessages.map((message) => ({
            role: message.role,
            content: message.body,
            timestamp: message.createdAt,
          })),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || 'The evidence pack could not be created just now.');
      }

      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const sessionShort = sessionId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'demo';
      const link = document.createElement('a');
      link.href = href;
      link.download = `assembl-demo-evidence-pack-${tenant.slug}-${sessionShort}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(href);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setPackError(message);
    } finally {
      setSavingPack(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [savingPack, sessionId, tenant.kete, tenant.slug, transcriptMessages]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        send();
      }
    },
    [send],
  );

  const chatPanel = (
    <section
      className={[
        'flex min-h-0 w-full flex-1 flex-col overflow-hidden border border-[rgba(35,33,31,0.10)] bg-white shadow-[0_24px_70px_rgba(35,33,31,0.12)]',
        embed ? 'rounded-none border-0 shadow-none' : 'rounded-[8px]',
      ].join(' ')}
    >
      <header className="flex items-center justify-between gap-4 border-b border-[rgba(35,33,31,0.10)] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          {tenant.logoUrl ? (
            <img
              src={tenant.logoUrl}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-[8px] object-cover"
            />
          ) : (
            <div
              className="h-10 w-10 rounded-[8px]"
              style={{ backgroundColor: tenant.brandColor }}
              aria-hidden
            />
          )}
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-light leading-none sm:text-3xl">
              {tenant.name}
            </h1>
            <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              {tenant.keteName} · {tenant.keteDomain}
            </p>
          </div>
        </div>
        {embed ? (
          <button
            type="button"
            aria-label="Close chat"
            onClick={closeEmbed}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(35,33,31,0.12)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <div className="hidden items-center gap-2 rounded-full border border-[rgba(35,33,31,0.10)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)] sm:flex">
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: tenant.brandColor }} aria-hidden />
            Evidence held for review
          </div>
        )}
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={[
                'max-w-[88%] rounded-[8px] px-4 py-3 text-sm leading-relaxed',
                message.role === 'user'
                  ? 'ml-auto text-white'
                  : 'mr-auto border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] text-[color:var(--text-body)]',
              ].join(' ')}
              style={message.role === 'user' ? { backgroundColor: tenant.brandColor } : undefined}
            >
              {message.body ? (
                <p className="whitespace-pre-wrap">{message.body}</p>
              ) : (
                <span className="inline-flex items-center gap-2 text-[color:var(--text-secondary)]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  Drafting
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {(error || packError) && (
        <p className="border-t border-[rgba(35,33,31,0.08)] px-4 py-2 text-sm text-[#9A3412] sm:px-5">
          {error || packError}
        </p>
      )}

      <footer className="border-t border-[rgba(35,33,31,0.10)] bg-white px-4 py-3 sm:px-5">
        <div className="mx-auto max-w-3xl">
          {attachment && (
            <div className="mb-3 flex items-center justify-between gap-3 rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[color:var(--assembl-paper)] px-3 py-2 text-sm">
              <span className="min-w-0 truncate text-[color:var(--text-body)]">
                {attachment.type === 'application/pdf' ? 'PDF' : 'Image'} attached: {attachment.name}
              </span>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[color:var(--text-secondary)] hover:bg-white hover:text-[color:var(--text-primary)]"
                aria-label="Remove attachment"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          )}
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Ask a question..."
              className="min-h-11 resize-none rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-[color:var(--assembl-paper)] px-3 py-2.5 text-sm outline-none focus:border-[color:var(--tenant-accent)]"
            />
            <div className="flex gap-2">
              <label
                className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[8px] border border-[rgba(35,33,31,0.14)] text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)]"
                title="Attach an image or PDF"
                aria-label="Attach an image or PDF"
              >
                <Paperclip className="h-4 w-4" aria-hidden />
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="sr-only"
                  onChange={(event) => {
                    attachFile(event.target.files?.[0]);
                    event.currentTarget.value = '';
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => setRedactPii((value) => !value)}
                className={[
                  'inline-flex h-11 w-11 items-center justify-center rounded-[8px] border transition',
                  redactPii
                    ? 'border-[#2B6B57]/35 bg-[#2B6B57]/10 text-[#2B6B57]'
                    : 'border-[rgba(35,33,31,0.14)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]',
                ].join(' ')}
                title={`Redact PII — ${redactPii ? 'on' : 'off'}. Scrub NZ phone numbers, IRDs, bank accounts, emails, and addresses before processing.`}
                aria-label={`Redact PII — ${redactPii ? 'on' : 'off'}`}
              >
                <ShieldCheck className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={send}
                disabled={sending || (!draft.trim() && !attachment)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: tenant.brandColor }}
                aria-label="Send message"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
              </button>
            </div>
          </div>
          {transcriptMessages.length >= 2 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={saveEvidencePack}
                disabled={savingPack}
                className="group inline-flex items-center gap-2 font-display text-lg italic leading-none text-[color:var(--tenant-accent)] decoration-[color:var(--tenant-accent)] underline-offset-4 transition hover:underline disabled:cursor-wait disabled:opacity-60"
              >
                {savingPack ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <FileDown className="h-4 w-4" aria-hidden />
                )}
                Save this conversation as an evidence pack
              </button>
            </div>
          )}
          {!embed && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[rgba(35,33,31,0.08)] pt-3 text-xs text-[color:var(--text-secondary)]">
              <span>Powered by assembl.</span>
              <span>Demo packs download only and remain unsealed.</span>
            </div>
          )}
        </div>
      </footer>
    </section>
  );

  if (!embed) {
    return (
      <main
        className="public-chat-route min-h-screen bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]"
        style={{ '--tenant-accent': tenant.brandColor } as React.CSSProperties}
      >
        <div className="mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-7xl gap-8 px-5 py-8 md:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] md:px-8 md:py-10 lg:gap-12">
          <aside className="flex flex-col justify-center py-4">
            <Link
              href={`/kete/${tenant.kete}`}
              className="mb-8 inline-flex w-fit items-center gap-2 rounded-sm font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
            >
              <span>View {tenant.keteName} kete</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              {tenant.keteName} live draft desk
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-[clamp(3rem,7vw,6.5rem)] font-light leading-[0.9] tracking-normal text-[color:var(--text-primary)]">
              {tenant.name}
            </h1>
            <p className="mt-6 max-w-xl font-display text-3xl font-light leading-tight text-[color:var(--text-primary)] md:text-4xl">
              {copy.title}
            </p>
            <p className="mt-5 max-w-xl text-base leading-7 text-[color:var(--text-body)] md:text-lg">
              {copy.body}
            </p>

            <div className="mt-8 grid gap-3">
              {copy.prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setDraft(prompt);
                    requestAnimationFrame(() => inputRef.current?.focus());
                  }}
                  className="flex items-center justify-between gap-4 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/50 px-4 py-3 text-left text-sm leading-relaxed text-[color:var(--text-body)] transition hover:border-[color:var(--tenant-accent)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tenant-accent)] focus-visible:ring-offset-2"
                >
                  <span>{prompt}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" style={{ color: tenant.brandColor }} aria-hidden />
                </button>
              ))}
            </div>

            <div className="mt-8 max-w-xl rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-4 text-sm leading-6 text-[color:var(--text-secondary)]">
              Draft-only. A named person reviews outputs before external use. Conversations can be saved as demo evidence packs for review.
            </div>
          </aside>

          <div className="flex min-h-[560px] md:h-[calc(100vh-160px)] md:max-h-[720px] md:min-h-[560px] py-2">
            {chatPanel}
          </div>
        </div>
      </main>
    );
  }

  return (
    <div
      className={[
        'public-chat-route fixed inset-0 z-[80] flex bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]',
        embed ? 'bg-transparent p-0' : 'p-3 sm:p-5',
      ].join(' ')}
      style={{ '--tenant-accent': tenant.brandColor } as React.CSSProperties}
    >
      {chatPanel}
    </div>
  );
}
