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
 * (KPI cards), `bar`, `line`, `image`. Anything unrecognised renders nothing,
 * so a malformed block never breaks the chat.
 */

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

type StatItem = { label: string; value: string | number };
type ChartPoint = { name: string; value: number };

export type VisualSpec =
  | { type: 'stats'; title?: string; items: StatItem[] }
  | { type: 'bar'; title?: string; data: ChartPoint[] }
  | { type: 'line'; title?: string; data: ChartPoint[] }
  | { type: 'image'; title?: string; url: string; alt?: string };

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
