'use client';

import { useState } from 'react';
import { getKete, reduxAspectFor } from '@/lib/vessel-studio/keteOptions';
import type { VesselStudioState } from '@/lib/vessel-studio/types';

interface PromptOutputProps {
  state: VesselStudioState;
  promptFull: string;
  onCopy: () => void;
  onReset: () => void;
}

export function PromptOutput({
  state,
  promptFull,
  onCopy,
  onReset,
}: PromptOutputProps) {
  const [copied, setCopied] = useState(false);
  const k = getKete(state.kete);
  const usingRedux = !!state.reference?.dataUrl;
  const mappedAr = reduxAspectFor(state.ar);
  const arNote =
    usingRedux && mappedAr !== state.ar ? ` · ar ${state.ar} → ${mappedAr}` : '';

  // Highlight flag tokens in faint colour for legibility.
  const highlighted: Array<{ text: string; flag: boolean }> = [];
  const safe = promptFull;
  const re = /(--[a-z]+ [^-]*)(?= --|$)/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(safe))) {
    if (m.index > lastIdx) {
      highlighted.push({ text: safe.slice(lastIdx, m.index), flag: false });
    }
    highlighted.push({ text: m[0].trim(), flag: true });
    if (m.index + m[0].length < safe.length) {
      highlighted.push({ text: ' ', flag: false });
    }
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < safe.length) {
    highlighted.push({ text: safe.slice(lastIdx), flag: false });
  }
  if (highlighted.length === 0) {
    highlighted.push({ text: safe, flag: false });
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(promptFull);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = promptFull;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 1400);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-mono text-[10.5px] lowercase tracking-[0.2em] text-[color:var(--text-secondary)]">
            prompt
          </div>
          <h2 className="mt-0.5 font-display text-[28px] font-light text-[color:var(--text-primary)]">
            composed
          </h2>
        </div>
        <div className="font-mono text-[10.5px] text-[color:var(--text-secondary)]">
          {k.name} · {state.ar} · {state.variants}× variant
          {state.variants > 1 ? 's' : ''}
        </div>
      </div>

      <div
        aria-live="polite"
        className="min-h-[80px] whitespace-pre-wrap break-words rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-cloud)]/40 p-4 font-mono text-[12.5px] leading-[1.65] text-[color:var(--text-primary)]"
      >
        {highlighted.map((seg, i) =>
          seg.flag ? (
            <span key={i} className="text-[color:var(--text-secondary)]">
              {seg.text}
            </span>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </div>

      {k.portrait && (
        <p className="border-l-2 border-[color:var(--assembl-gold-thread)] py-1 pl-3 font-mono text-[11px] italic font-light leading-[1.6] tracking-[0.04em] text-[color:var(--text-secondary)]">
          tip: upload one of your existing brand portraits as a reference image for style
          consistency. anchor strength 0.45–0.6 works well for founder content.
        </p>
      )}

      <div className="text-center font-mono text-[10px] lowercase tracking-[0.16em] text-[color:var(--text-secondary)]">
        mode:{' '}
        <span className="text-[color:var(--text-primary)]">
          {usingRedux ? 'image-to-image' : 'text-to-image'}
        </span>{' '}
        · {usingRedux ? 'flux pro v1.1 ultra/redux' : 'flux pro v1.1'}
        {usingRedux ? ` · anchor ${state.imagePromptStrength.toFixed(2)}${arNote}` : ''}
      </div>

      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={handleCopy}
          className={[
            'flex-1 rounded-[2px] border px-3.5 py-2.5 font-mono text-[11px] lowercase tracking-[0.18em] transition-colors',
            copied
              ? 'border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
              : 'border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)] hover:bg-[color:var(--assembl-cloud)]',
          ].join(' ')}
        >
          {copied ? 'copied' : 'copy prompt'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex-1 rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3.5 py-2.5 font-mono text-[11px] lowercase tracking-[0.18em] text-[color:var(--text-primary)] transition-colors hover:bg-[color:var(--assembl-cloud)]"
        >
          reset
        </button>
      </div>
    </div>
  );
}
