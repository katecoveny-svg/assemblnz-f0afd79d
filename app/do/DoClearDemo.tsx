'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ClearMark } from '@/apps/do/shared/clear';

const SAMPLE =
  'It is important to note that we will prepare the pursuit brief in order to win, due to the fact that the RFP closes soon.';

export function DoClearDemo() {
  const [text, setText] = useState(SAMPLE);
  const [rewritten, setRewritten] = useState('');
  const [marks, setMarks] = useState<ClearMark[]>([]);
  const [busy, setBusy] = useState(false);
  const [runtimeLabel, setRuntimeLabel] = useState('Assembl runtime · DEMO');

  const run = useCallback(async (value: string) => {
    setBusy(true);
    try {
      const res = await fetch('/api/do/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setMarks(data.marks || []);
      setRewritten(data.rewritten || '');
      if (data.runtime?.label) setRuntimeLabel(data.runtime.label);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void run(SAMPLE);
  }, [run]);

  const segments = useMemo(() => {
    if (!marks.length) return [{ text, marked: false as const }];
    const sorted = [...marks].sort((a, b) => a.start - b.start);
    const out: Array<{ text: string; marked: boolean; mark?: ClearMark }> = [];
    let cursor = 0;
    for (const mark of sorted) {
      if (mark.start < cursor) continue;
      if (mark.start > cursor) {
        out.push({ text: text.slice(cursor, mark.start), marked: false });
      }
      out.push({ text: text.slice(mark.start, mark.end), marked: true, mark });
      cursor = mark.end;
    }
    if (cursor < text.length) out.push({ text: text.slice(cursor), marked: false });
    return out;
  }, [text, marks]);

  return (
    <div className="do-clear" aria-label="DO Clear demo">
      <div className="do-clear-chrome">
        <span className="do-mono">DO Clear · anti-slop</span>
        <span className="do-chip do-chip-live">
          <span className="do-chip-dot" />
          {runtimeLabel}
        </span>
      </div>
      <div className="do-clear-stage">
        <div className="do-clear-underlay" aria-hidden>
          {segments.map((seg, i) =>
            seg.marked ? (
              <span key={i} className={`do-clear-mark do-clear-mark-${seg.mark?.kind || 'clarity'}`}>
                {seg.text}
              </span>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </div>
        <textarea
          className="do-clear-input"
          value={text}
          rows={4}
          spellCheck={false}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => void run(text)}
          aria-label="Clear draft"
        />
      </div>
      <div className="do-clear-actions">
        <button
          type="button"
          className="do-cta do-cta-secondary do-cta-compact"
          disabled={busy || !rewritten || rewritten === text}
          onClick={() => {
            setText(rewritten);
            void run(rewritten);
          }}
        >
          Apply rewrite
        </button>
        {marks[0] ? (
          <span className="do-clear-hint">{marks[0].suggestion}</span>
        ) : (
          <span className="do-clear-hint">Secondary · plain vertical, not grammar-first</span>
        )}
      </div>
    </div>
  );
}
