'use client';

/**
 * AgentVisual — inline rich rendering for agent chat.
 *
 * Ported from the old `assemblnz-f0afd79d-main/src/components/shared/AgentCharts.tsx`
 * (recharts kit) and `StructuredOutputCard.tsx` (rich blocks). An agent can emit
 * a fenced block:
 *
 *   ```assembl-visual
 *   { "type": "stats", "title": "Rates summary", "items": [{ "label": "Annual", "value": "$2,480" }] }
 *   ```
 *
 * {@link parseVisuals} strips those blocks out of the message text and returns
 * the parsed specs; {@link AgentVisual} renders one. Supported types: `stats`
 * (KPI cards), `bar`, `line`, `image`, `video` (Kling render, polls to the MP4)
 * and `audio` (a script voiced in the assembl NZ voice). Anything unrecognised
 * renders nothing, so a malformed block never breaks the chat.
 */

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PALETTE } from '@/lib/marketplace/agents';
import { DashLoader } from '@/components/marketplace/DashLoader';

type StatItem = { label: string; value: string | number };
type ChartPoint = { name: string; value: number };

export type VisualSpec =
  | { type: 'stats'; title?: string; items: StatItem[] }
  | { type: 'bar'; title?: string; data: ChartPoint[] }
  | { type: 'line'; title?: string; data: ChartPoint[] }
  | { type: 'image'; title?: string; url: string; alt?: string }
  | { type: 'video'; title?: string; url?: string; requestId?: string; alt?: string }
  | { type: 'audio'; title?: string; script: string; voice?: string };

const FENCE = /```assembl-visual\s*\n([\s\S]*?)```/g;

/** Pull every `assembl-visual` block out of `text`; return cleaned text + specs. */
export function parseVisuals(text: string): { text: string; visuals: VisualSpec[] } {
  const visuals: VisualSpec[] = [];
  const cleaned = text.replace(FENCE, (_match, body: string) => {
    try {
      const spec = JSON.parse(body.trim()) as VisualSpec;
      if (isValidSpec(spec)) visuals.push(spec);
    } catch {
      /* malformed block — drop it, keep the chat intact */
    }
    return '';
  });
  return { text: cleaned.trim(), visuals };
}

function isValidSpec(spec: unknown): spec is VisualSpec {
  if (!spec || typeof spec !== 'object') return false;
  const s = spec as { type?: string; items?: unknown; data?: unknown; url?: unknown };
  switch (s.type) {
    case 'stats':
      return Array.isArray(s.items) && s.items.length > 0;
    case 'bar':
    case 'line':
      return Array.isArray(s.data) && s.data.length > 0;
    case 'image':
      return typeof s.url === 'string' && s.url.length > 0;
    case 'video':
      return (
        (typeof s.url === 'string' && s.url.length > 0) ||
        (typeof (s as { requestId?: unknown }).requestId === 'string' &&
          ((s as { requestId: string }).requestId).length > 0)
      );
    case 'audio':
      return typeof (s as { script?: unknown }).script === 'string' && (s as { script: string }).script.length > 0;
    default:
      return false;
  }
}

function Frame({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div
      className="my-2 rounded-[16px] border p-3"
      style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.paper }}
    >
      {title ? (
        <p className="mk-mono mb-2 text-[10px] uppercase tracking-[0.18em]" style={{ color: PALETTE.muted }}>
          {title}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function AgentVisual({ spec }: { spec: VisualSpec }) {
  if (spec.type === 'stats') {
    return (
      <Frame title={spec.title}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {spec.items.map((it, i) => (
            <div key={i} className="rounded-[12px] p-2.5" style={{ backgroundColor: PALETTE.cream }}>
              <p className="text-lg font-black leading-none" style={{ color: PALETTE.ink }}>
                {it.value}
              </p>
              <p className="mt-1 text-[11px]" style={{ color: PALETTE.body }}>
                {it.label}
              </p>
            </div>
          ))}
        </div>
      </Frame>
    );
  }

  if (spec.type === 'image') {
    return (
      <Frame title={spec.title}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={spec.url} alt={spec.alt ?? spec.title ?? 'agent visual'} className="w-full rounded-[12px]" />
      </Frame>
    );
  }

  if (spec.type === 'video') {
    return (
      <Frame title={spec.title}>
        <VideoBlock url={spec.url} requestId={spec.requestId} />
      </Frame>
    );
  }

  if (spec.type === 'audio') {
    return (
      <Frame title={spec.title ?? 'Audio'}>
        <AudioBlock script={spec.script} voice={spec.voice} />
      </Frame>
    );
  }

  // bar | line
  return (
    <Frame title={spec.title}>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          {spec.type === 'bar' ? (
            <BarChart data={spec.data} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.hairline} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: PALETTE.muted }} />
              <YAxis tick={{ fontSize: 10, fill: PALETTE.muted }} />
              <Tooltip />
              <Bar dataKey="value" fill={PALETTE.canary} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={spec.data} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.hairline} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: PALETTE.muted }} />
              <YAxis tick={{ fontSize: 10, fill: PALETTE.muted }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={PALETTE.gold} strokeWidth={2} dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Frame>
  );
}

/** A Kling clip: shows a rendering state and polls the status route to the MP4. */
function VideoBlock({ url, requestId }: { url?: string; requestId?: string }) {
  const [videoUrl, setVideoUrl] = useState(url ?? '');
  const [state, setState] = useState<'rendering' | 'ready' | 'failed'>(url ? 'ready' : 'rendering');

  useEffect(() => {
    if (url || !requestId) return;
    let active = true;
    const poll = async () => {
      try {
        const r = await fetch(`/api/agents/creative/video-status?id=${encodeURIComponent(requestId)}`);
        const d = (await r.json()) as { status?: string; videoUrl?: string };
        if (!active) return false;
        if (d.status === 'completed' && d.videoUrl) {
          setVideoUrl(d.videoUrl);
          setState('ready');
          return true;
        }
        if (d.status === 'failed' || d.status === 'error') {
          setState('failed');
          return true;
        }
      } catch {
        /* keep polling */
      }
      return false;
    };
    void poll();
    const t = setInterval(async () => {
      if (await poll()) clearInterval(t);
    }, 6000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [url, requestId]);

  if (state === 'failed') {
    return (
      <p className="text-sm" style={{ color: PALETTE.body }}>
        The video render didn’t complete. Ask {`Auaha`} to try again or tweak the motion prompt.
      </p>
    );
  }
  if (state === 'ready' && videoUrl) {
    return (
      <div>
        <video src={videoUrl} controls playsInline className="w-full rounded-[12px]" />
        <div className="mt-2 text-right">
          <a href={videoUrl} download className="mk-mono text-[11px] underline" style={{ color: PALETTE.gold }}>
            Download
          </a>
        </div>
      </div>
    );
  }
  return <DashLoader label="Rendering your clip with Kling… 1–3 min" width={64} />;
}

/** Voices a script in the assembl NZ voice via the platform TTS route. */
function AudioBlock({ script, voice }: { script: string; voice?: string }) {
  const [audioUrl, setAudioUrl] = useState('');
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!script) return;
    let active = true;
    let objUrl = '';
    (async () => {
      setPhase('loading');
      try {
        const r = await fetch('/api/voice/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: script }),
        });
        if (!r.ok || r.status === 204) {
          if (active) setPhase('error');
          return;
        }
        const blob = await r.blob();
        objUrl = URL.createObjectURL(blob);
        if (active) {
          setAudioUrl(objUrl);
          setPhase('ready');
        }
      } catch {
        if (active) setPhase('error');
      }
    })();
    return () => {
      active = false;
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [script]);

  return (
    <div>
      <p className="mk-mono mb-2 text-[10px] uppercase tracking-[0.18em]" style={{ color: PALETTE.muted }}>
        {voice ?? 'assembl NZ voice'}
      </p>
      {phase === 'loading' ? <DashLoader label="Voicing the script…" width={64} /> : null}
      {phase === 'ready' && audioUrl ? <audio src={audioUrl} controls className="w-full" /> : null}
      {phase === 'error' ? (
        <p className="text-sm" style={{ color: PALETTE.body }}>
          Couldn’t voice the script right now — the text is above to read.
        </p>
      ) : null}
    </div>
  );
}
