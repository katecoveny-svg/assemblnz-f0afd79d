'use client';

/**
 * Public chat with a shared community agent (/a/[slug]).
 *
 * Mirrors the saved-Pilot chat (app/agents/mine/[id]/MyAgentChat.tsx): the
 * system prompt never travels through here — /api/a/[slug]/chat resolves it
 * server-side from the shared row.
 *
 * Gating: a thin custom fetch on the transport watches for the 402 the gate
 * returns. On capture:true the shared CaptureModal opens (surface
 * 'agent:<slug>'); the blocked message is restored into the input so the
 * visitor can resend once their email lifts the limit. (useToolGate is not
 * used here — it hardcodes the 'hapai:' surface and can't replay streams.)
 */

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ImagePlus, Loader2, X } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { CaptureModal } from '@/components/gating/CaptureModal';

const INK = '#313c42';
const MUTED = '#68766f';
const TEAL = '#3f7373';
const HAIRLINE = 'rgba(49, 60, 66, 0.12)';

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_PHOTOS = 2;

interface PendingPhoto {
  url: string; // data URL
  mediaType: string;
}

export function CommunityAgentChat({ slug, name }: { slug: string; name: string }) {
  const [input, setInput] = useState('');
  const [captureOpen, setCaptureOpen] = useState(false);
  const [gateNote, setGateNote] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [photoNote, setPhotoNote] = useState<string | null>(null);
  const lastSent = useRef('');
  const lastPhotos = useRef<PendingPhoto[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // One stable transport; its fetch reads state via setters and a ref, so it
  // stays current without re-creating the chat.
  const [transport] = useState(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: `/api/a/${slug}/chat`,
        fetch: (async (info: RequestInfo | URL, init?: RequestInit) => {
          const res = await fetch(info, init);
          if (res.status === 402) {
            const data = (await res
              .clone()
              .json()
              .catch(() => null)) as { capture?: boolean; message?: string } | null;
            if (data?.capture) {
              setCaptureOpen(true);
            } else if (data?.message) {
              setGateNote(data.message);
            }
            // Put the blocked message (and its photos) back so one click resends it.
            setInput((v) => v || lastSent.current);
            setPhotos((p) => (p.length ? p : lastPhotos.current));
          }
          return res;
        }) as typeof fetch,
      }),
  );

  const greeting: UIMessage = {
    id: 'greeting',
    role: 'assistant',
    parts: [{ type: 'text', text: `Hi — I’m ${name}. What are we working on?` }],
  };
  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: [greeting],
  });
  const busy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const textOf = (m: UIMessage) =>
    m.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('');

  const imagesOf = (m: UIMessage) =>
    m.parts.filter(
      (p): p is { type: 'file'; mediaType: string; url: string } =>
        p.type === 'file' &&
        typeof p.url === 'string' &&
        p.url.startsWith('data:image/'),
    );

  const addPhoto = (file: File | undefined) => {
    setPhotoNote(null);
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return;
    if (file.size > MAX_PHOTO_BYTES) {
      // approved line, shared with the fridge-to-list tool
      setPhotoNote('Please upload an image under 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : '';
      if (!url.startsWith('data:image/')) return;
      setPhotos((p) => (p.length >= MAX_PHOTOS ? p : [...p, { url, mediaType: file.type }]));
    };
    reader.readAsDataURL(file);
  };

  const submit = (t: string) => {
    const v = t.trim();
    if ((!v && photos.length === 0) || busy) return;
    lastSent.current = v;
    lastPhotos.current = photos;
    setGateNote(null);
    setPhotoNote(null);
    sendMessage({
      text: v,
      files: photos.map((p) => ({ type: 'file' as const, mediaType: p.mediaType, url: p.url })),
    });
    setInput('');
    setPhotos([]);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 440,
          borderRadius: 22,
          border: `1px solid ${HAIRLINE}`,
          background: '#fbfaf6',
          overflow: 'hidden',
        }}
      >
        <div
          ref={scrollRef}
          style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: 18 }}
        >
          {messages.map((m) => {
            const text = textOf(m);
            const images = imagesOf(m);
            if (!text && images.length === 0) return null;
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                style={{
                  maxWidth: '85%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  padding: '10px 16px',
                  borderRadius: 18,
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  ...(isUser
                    ? { background: TEAL, color: '#fff' }
                    : { background: '#fff', color: INK, border: `1px solid ${HAIRLINE}` }),
                }}
              >
                {images.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: text ? 8 : 0 }}>
                    {images.map((img, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={img.url}
                        alt="Photo attached"
                        style={{ maxWidth: 140, maxHeight: 140, borderRadius: 10, display: 'block', objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                )}
                {text}
              </div>
            );
          })}
          {busy && (
            <div
              style={{
                alignSelf: 'flex-start',
                padding: '10px 16px',
                borderRadius: 18,
                border: `1px solid ${HAIRLINE}`,
                background: '#fff',
              }}
            >
              <Loader2 size={16} style={{ color: '#b8964f', animation: 'spin 1s linear infinite' }} />
            </div>
          )}
          {gateNote && (
            <p style={{ alignSelf: 'flex-start', margin: 0, color: MUTED, fontSize: 13 }}>{gateNote}</p>
          )}
          {error && !gateNote && !captureOpen && (
            <p style={{ alignSelf: 'flex-start', margin: 0, color: '#8a4b3c', fontSize: 13 }}>
              Something went wrong — try that again.
            </p>
          )}
        </div>
        {(photos.length > 0 || photoNote) && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px 0',
              borderTop: `1px solid ${HAIRLINE}`,
            }}
          >
            {photos.map((p, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt="Photo attached"
                  style={{
                    width: 52,
                    height: 52,
                    objectFit: 'cover',
                    borderRadius: 10,
                    border: `1px solid ${HAIRLINE}`,
                    display: 'block',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="Remove photo"
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    display: 'flex',
                    width: 18,
                    height: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 999,
                    border: `1px solid ${HAIRLINE}`,
                    background: '#fff',
                    color: INK,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            {photoNote && (
              <p role="alert" style={{ margin: 0, color: '#8a4b3c', fontSize: 12 }}>
                {photoNote}
              </p>
            )}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            padding: 14,
            borderTop: photos.length > 0 || photoNote ? 'none' : `1px solid ${HAIRLINE}`,
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => {
              addPhoto(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy || photos.length >= MAX_PHOTOS}
            // approved by Kate 2026-07-17
            aria-label="Add a photo"
            title="Add a photo"
            style={{
              display: 'flex',
              width: 42,
              height: 42,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              border: `1px solid ${HAIRLINE}`,
              background: '#fff',
              color: MUTED,
              cursor: busy || photos.length >= MAX_PHOTOS ? 'default' : 'pointer',
              opacity: busy || photos.length >= MAX_PHOTOS ? 0.4 : 1,
            }}
          >
            <ImagePlus size={18} />
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
            placeholder="Type a message…"
            style={{
              flex: 1,
              resize: 'none',
              padding: '10px 14px',
              borderRadius: 14,
              border: `1px solid ${HAIRLINE}`,
              background: '#fff',
              color: INK,
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={() => submit(input)}
            disabled={busy || (!input.trim() && photos.length === 0)}
            aria-label="Send"
            style={{
              display: 'flex',
              width: 42,
              height: 42,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              border: 'none',
              background: INK,
              color: '#fff',
              cursor: busy || (!input.trim() && photos.length === 0) ? 'default' : 'pointer',
              opacity: busy || (!input.trim() && photos.length === 0) ? 0.4 : 1,
            }}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <CaptureModal
        open={captureOpen}
        // Capture surface is capped at 64 chars server-side; stateless `l~…`
        // slugs are long opaque payloads, so trim for lead attribution.
        surface={`agent:${slug.slice(0, 56)}`}
        onClose={() => setCaptureOpen(false)}
        onUnlocked={() => setCaptureOpen(false)}
      />
    </div>
  );
}
