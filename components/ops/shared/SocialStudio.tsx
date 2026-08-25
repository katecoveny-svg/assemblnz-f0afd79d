'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  SOCIAL_PRESETS,
  type SocialPilot,
  type SocialPlatform,
} from '@/lib/ops/social-presets';

/**
 * Shared social media linkage panel for ADT, Happy Tails, and TOA.
 * Connects platforms (demo), drafts posts, and hands raw uploads to Auaha
 * for imagery / video / captions — draft-only, never publishes.
 */

type GenKind = 'image' | 'video' | 'post';

type DraftOut = {
  kind: GenKind;
  platform: SocialPlatform;
  title: string;
  body: string;
  mediaUrl?: string;
  mediaKind?: 'image' | 'video';
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function SocialStudio({ pilot }: { pilot: SocialPilot }) {
  const preset = SOCIAL_PRESETS[pilot];
  const reduce = useReducedMotion();
  const [platform, setPlatform] = useState<SocialPlatform>(preset.platforms[0].id);
  const [brief, setBrief] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [out, setOut] = useState<DraftOut | null>(null);

  const glass: CSSProperties = useMemo(
    () => ({
      borderRadius: 18,
      border: `1px solid ${preset.ink}14`,
      background: preset.surface,
      boxShadow: '0 14px 36px rgba(0,0,0,0.06)',
    }),
    [preset.ink, preset.surface],
  );

  const eyebrow: CSSProperties = {
    fontSize: 12,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: preset.muted,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  };

  const onPickFile = async (f: File | null) => {
    setFile(f);
    setOut(null);
    setErr(null);
    if (!f) {
      setPreview(null);
      return;
    }
    if (f.size > 12 * 1024 * 1024) {
      setErr('Keep uploads under 12MB for the demo pipeline.');
      setFile(null);
      setPreview(null);
      return;
    }
    setPreview(await fileToDataUrl(f));
  };

  const generate = async (kind: GenKind) => {
    setBusy(true);
    setErr(null);
    setNotice(null);
    setOut(null);
    try {
      const starter = brief.trim() || preset.starters[0];
      const platformLabel =
        preset.platforms.find((p) => p.id === platform)?.label ?? platform;

      if (kind === 'post') {
        const res = await fetch('/api/creative/copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent: 'muse',
            messages: [
              {
                role: 'user',
                content: [
                  `Write one ${platformLabel} post for ${preset.brandLabel} (${preset.handle}).`,
                  `Voice: ${preset.voiceNote}`,
                  `Brief: ${starter}`,
                  file ? `Raw media attached: ${file.name} (${file.type}). Reference it in the caption.` : '',
                  'Return: a short title line, then the post body. NZ English. Draft-only — do not claim it was published.',
                ]
                  .filter(Boolean)
                  .join('\n'),
              },
            ],
          }),
        });
        if (res.status === 429) {
          setErr('Rate limit reached — try again shortly.');
          return;
        }
        const ctype = res.headers.get('content-type') ?? '';
        if (ctype.includes('application/json')) {
          const j = await res.json().catch(() => ({}));
          if (j.notConfigured) {
            setNotice(`Muse not configured (${j.envVar}) — showing a studio draft instead.`);
            setOut({
              kind: 'post',
              platform,
              title: preset.sampleDrafts[0]?.title ?? 'Draft post',
              body: localPostDraft(starter, preset, file?.name),
              mediaUrl: preview ?? undefined,
              mediaKind: file?.type.startsWith('video/') ? 'video' : preview ? 'image' : undefined,
            });
            return;
          }
          if (j.error) {
            setErr(j.error);
            return;
          }
        }
        // Muse streams plain text
        const reader = res.body?.getReader();
        const dec = new TextDecoder();
        let text = '';
        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          text += dec.decode(value, { stream: true });
        }
        text = text.trim();
        if (!text) {
          setOut({
            kind: 'post',
            platform,
            title: preset.sampleDrafts[0]?.title ?? 'Draft post',
            body: localPostDraft(starter, preset, file?.name),
            mediaUrl: preview ?? undefined,
            mediaKind: file?.type.startsWith('video/') ? 'video' : preview ? 'image' : undefined,
          });
          return;
        }
        const [titleLine, ...rest] = text.split('\n').filter(Boolean);
        setOut({
          kind: 'post',
          platform,
          title: titleLine?.replace(/^#+\s*/, '').slice(0, 80) || 'Draft post',
          body: rest.join('\n').trim() || text,
          mediaUrl: preview ?? undefined,
          mediaKind: file?.type.startsWith('video/') ? 'video' : preview ? 'image' : undefined,
        });
        return;
      }

      if (kind === 'image') {
        const imageBrief = [
          `On-brand social still for ${preset.brandLabel}.`,
          `Platform: ${platformLabel}.`,
          `Direction: ${starter}.`,
          preset.pilot === 'auckland-dog-trainer'
            ? 'Training-field editorial: leash line, hand signal, navy and blush. No daycare pack photos. No Franklin.'
            : preset.pilot === 'happy-tails'
              ? 'Warm daycare atmosphere, cream and brown, pack life, bus energy.'
              : 'Monochrome architecture practice: charcoal, champagne accent, massing, no hype.',
          file ? `Inspired by uploaded reference ${file.name}.` : '',
        ]
          .filter(Boolean)
          .join(' ');

        const res = await fetch('/api/creative/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brief: imageBrief,
            agent: 'prism',
            count: 2,
            aspectRatio: platform === 'tiktok' || platform === 'instagram' ? '4:5' : '1:1',
            referenceDataUrl: file?.type.startsWith('image/') ? preview : undefined,
          }),
        });
        const j = await res.json().catch(() => ({}));
        if (j.notConfigured) {
          setNotice(`Prism not configured (${j.envVar}) — using your upload as the draft still.`);
          setOut({
            kind: 'image',
            platform,
            title: 'Draft still',
            body: starter,
            mediaUrl: preview ?? undefined,
            mediaKind: 'image',
          });
          return;
        }
        if (j.error) {
          setErr(j.error);
          return;
        }
        const url = j.images?.[0] as string | undefined;
        setOut({
          kind: 'image',
          platform,
          title: 'Generated still · Prism',
          body: starter,
          mediaUrl: url ?? preview ?? undefined,
          mediaKind: 'image',
        });
        return;
      }

      // video
      const videoBrief = [
        `15s social film for ${preset.brandLabel} on ${platformLabel}.`,
        starter,
        file ? `Image-to-video / edit from uploaded clip ${file.name}.` : '',
        'Hook in first 2 seconds. Draft only.',
      ]
        .filter(Boolean)
        .join(' ');

      const res = await fetch('/api/creative/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: videoBrief,
          aspectRatio: platform === 'tiktok' || platform === 'instagram' ? '9:16' : '16:9',
          referenceDataUrl: preview ?? undefined,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (j.notConfigured) {
        setNotice(`Flux not configured (${j.envVar}) — queueing a storyboard draft from your upload.`);
        setOut({
          kind: 'video',
          platform,
          title: 'Storyboard draft',
          body: `${videoBrief}\n\n(Generation keys offline — caption + cut list ready for approval.)`,
          mediaUrl: preview ?? undefined,
          mediaKind: file?.type.startsWith('video/') ? 'video' : preview ? 'image' : undefined,
        });
        return;
      }
      if (j.error) {
        setErr(j.error);
        return;
      }
      if (j.done && j.video) {
        setOut({
          kind: 'video',
          platform,
          title: 'Generated clip · Flux',
          body: starter,
          mediaUrl: j.video,
          mediaKind: 'video',
        });
        return;
      }
      setNotice('Video render started — open Auaha creative for the full Flux poller, or retry shortly.');
      setOut({
        kind: 'video',
        platform,
        title: 'Render queued',
        body: starter,
        mediaUrl: preview ?? undefined,
        mediaKind: file?.type.startsWith('video/') ? 'video' : 'image',
      });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <section style={{ ...glass, padding: 18, position: 'relative', overflow: 'hidden' }}>
        <p style={eyebrow}>social · {preset.handle}</p>
        <h2
          style={{
            margin: '8px 0 0',
            fontFamily: 'Georgia, "Cormorant Garamond", serif',
            fontSize: 24,
            color: preset.ink,
            fontWeight: 500,
          }}
        >
          Link, draft, create
        </h2>
        <p style={{ margin: '8px 0 0', fontSize: 13.5, color: preset.muted, lineHeight: 1.55, maxWidth: 520 }}>
          Connect the channels, drop a raw photo or clip, and Auaha drafts the post, still, or
          reel. {preset.voiceNote} Nothing publishes without your yes.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {preset.platforms.map((p) => {
            const on = p.id === platform;
            return (
              <motion.button
                key={p.id}
                type="button"
                onClick={() => setPlatform(p.id)}
                whileHover={reduce ? undefined : { y: -2 }}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: `1.5px solid ${on ? preset.ink : `${preset.ink}22`}`,
                  background: on ? preset.ink : preset.surface,
                  color: on ? '#fff' : preset.ink,
                  cursor: 'pointer',
                }}
              >
                {p.label}
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 12,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    opacity: 0.75,
                  }}
                >
                  {p.connected ? 'linked' : 'link'}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        }}
      >
        <section style={{ ...glass, padding: 16 }}>
          <p style={eyebrow}>raw upload</p>
          <label
            style={{
              marginTop: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              minHeight: 140,
              borderRadius: 14,
              border: `1.5px dashed ${preset.accent}`,
              background: `${preset.accent}14`,
              cursor: 'pointer',
              padding: 16,
              textAlign: 'center',
            }}
          >
            <input
              type="file"
              accept="image/*,video/*"
              hidden
              onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: preset.ink }}>
              Drop a photo or clip
            </span>
            <span style={{ fontSize: 12, color: preset.muted }}>
              Session footage, site stills, pack photos — max 12MB
            </span>
          </label>
          {preview ? (
            <div style={{ marginTop: 12 }}>
              {file?.type.startsWith('video/') ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={preview}
                  controls
                  style={{ width: '100%', borderRadius: 12, maxHeight: 220, objectFit: 'cover' }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Upload preview"
                  style={{ width: '100%', borderRadius: 12, maxHeight: 220, objectFit: 'cover' }}
                />
              )}
              <button
                type="button"
                onClick={() => void onPickFile(null)}
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: preset.muted,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                clear upload
              </button>
            </div>
          ) : null}
        </section>

        <section style={{ ...glass, padding: 16 }}>
          <p style={eyebrow}>brief</p>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={4}
            placeholder={preset.starters[0]}
            style={{
              marginTop: 10,
              width: '100%',
              resize: 'vertical',
              borderRadius: 12,
              border: `1px solid ${preset.ink}18`,
              padding: '12px 14px',
              fontSize: 13.5,
              fontFamily: 'inherit',
              color: preset.ink,
              background: '#fff',
              lineHeight: 1.5,
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {preset.starters.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setBrief(s)}
                style={{
                  fontSize: 12,
                  padding: '6px 10px',
                  borderRadius: 999,
                  border: `1px solid ${preset.ink}18`,
                  background: `${preset.accent}18`,
                  color: preset.ink,
                  cursor: 'pointer',
                }}
              >
                {s.slice(0, 42)}
                {s.length > 42 ? '…' : ''}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {(
              [
                ['post', 'Draft post'],
                ['image', 'Make still'],
                ['video', 'Make reel'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                disabled={busy}
                onClick={() => void generate(k)}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  padding: '10px 14px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: busy ? 'default' : 'pointer',
                  background: k === 'post' ? preset.ink : preset.accent,
                  color: k === 'post' ? '#fff' : preset.ink,
                  opacity: busy ? 0.6 : 1,
                }}
              >
                {busy ? '…' : label}
              </button>
            ))}
          </div>
          {notice ? (
            <p style={{ margin: '12px 0 0', fontSize: 12.5, color: preset.muted, lineHeight: 1.45 }}>
              {notice}
            </p>
          ) : null}
          {err ? (
            <p style={{ margin: '12px 0 0', fontSize: 12.5, color: '#9B3B3B', lineHeight: 1.45 }}>
              {err}
            </p>
          ) : null}
        </section>
      </div>

      {out ? (
        <section style={{ ...glass, padding: 16, borderColor: `${preset.accent}88` }}>
          <p style={{ ...eyebrow, color: preset.accent }}>
            draft · {out.platform} · {out.kind} · awaiting approval
          </p>
          <h3 style={{ margin: '8px 0 0', fontSize: 18, color: preset.ink }}>{out.title}</h3>
          <p
            style={{
              margin: '10px 0 0',
              fontSize: 14,
              color: preset.ink,
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap',
            }}
          >
            {out.body}
          </p>
          {out.mediaUrl ? (
            <div style={{ marginTop: 14 }}>
              {out.mediaKind === 'video' ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={out.mediaUrl}
                  controls
                  style={{ width: '100%', maxHeight: 320, borderRadius: 12, objectFit: 'cover' }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={out.mediaUrl}
                  alt=""
                  style={{ width: '100%', maxHeight: 320, borderRadius: 12, objectFit: 'cover' }}
                />
              )}
            </div>
          ) : null}
          <p style={{ margin: '12px 0 0', fontSize: 12, color: preset.muted }}>
            Draft-only. Approve in the queue before anything reaches {preset.handle}.
          </p>
        </section>
      ) : null}

      <section style={{ ...glass, padding: 16 }}>
        <p style={eyebrow}>queue · sample</p>
        <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
          {preset.sampleDrafts.map((d) => (
            <article
              key={d.id}
              style={{
                padding: 12,
                borderRadius: 12,
                border: `1px solid ${preset.ink}10`,
                background: `${preset.accent}10`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: preset.ink }}>{d.title}</p>
                <span style={{ ...eyebrow, color: preset.accent }}>
                  {d.platform} · {d.status}
                </span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: preset.muted, lineHeight: 1.45 }}>
                {d.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function localPostDraft(
  starter: string,
  preset: (typeof SOCIAL_PRESETS)[SocialPilot],
  fileName?: string,
): string {
  return [
    starter,
    '',
    preset.sampleDrafts[0]?.body ?? '',
    fileName ? `(refs ${fileName})` : '',
    `— ${preset.handle} · draft only`,
  ]
    .filter(Boolean)
    .join('\n');
}
