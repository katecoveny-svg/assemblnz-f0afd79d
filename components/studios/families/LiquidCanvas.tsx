'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RendererProps } from '@/lib/generative-art/families';
import { LIQUID_FAMILY, liquidPromptFor } from '@/lib/generative-art/families/liquid';

interface RenderResult {
  ok: true;
  imageUrl: string;
  prompt: string;
  cost_usd: number | null;
}
interface RenderError {
  ok: false;
  error: string;
  hint?: string;
  prompt?: string;
}
type ApiResponse = RenderResult | RenderError;

export function LiquidCanvas({ presetId, values, seed, onExportersReady }: RendererProps) {
  const preset =
    LIQUID_FAMILY.presets.find((p) => p.id === presetId) ?? LIQUID_FAMILY.presets[0];

  const [state, setState] = useState<
    | { kind: 'idle' }
    | { kind: 'rendering' }
    | { kind: 'error'; message: string; hint?: string; prompt?: string }
    | { kind: 'done'; imageUrl: string; prompt: string; cost: number | null }
  >({ kind: 'idle' });

  const [copied, setCopied] = useState(false);

  const currentPrompt = useMemo(() => liquidPromptFor(preset.id, values), [preset.id, values]);

  const render = useCallback(async () => {
    setState({ kind: 'rendering' });
    try {
      const res = await fetch('/api/creative-playground/render', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          family: 'liquid',
          presetId: preset.id,
          values,
          seed,
        }),
      });
      const body = (await res.json()) as ApiResponse;
      if (!body.ok) {
        setState({
          kind: 'error',
          message: body.error,
          hint: body.hint,
          prompt: body.prompt,
        });
      } else {
        setState({ kind: 'done', imageUrl: body.imageUrl, prompt: body.prompt, cost: body.cost_usd });
      }
    } catch (err) {
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'render failed',
      });
    }
  }, [preset.id, values, seed]);

  // PNG export = the current AI image (fetch to blob).
  useEffect(() => {
    const png = async (): Promise<Blob | null> => {
      if (state.kind !== 'done') return null;
      const r = await fetch(state.imageUrl);
      if (!r.ok) return null;
      return await r.blob();
    };
    onExportersReady?.({ png });
  }, [onExportersReady, state]);

  const copyPrompt = useCallback(() => {
    navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [currentPrompt]);

  return (
    <div className="flex w-full flex-col gap-4">
      <div
        className="relative mx-auto aspect-[0.92/1] w-full max-w-[720px] overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]"
        style={{ background: LIQUID_FAMILY.ground }}
      >
        {state.kind === 'done' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={state.imageUrl}
            alt={`${preset.label} render`}
            className="h-full w-full object-cover"
          />
        )}

        {state.kind === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
              press render to make {preset.label.toLowerCase()}
            </div>
            <button
              type="button"
              onClick={render}
              className="rounded-[2px] border border-[color:var(--text-primary)] bg-[color:var(--text-primary)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-paper)]"
            >
              render
            </button>
          </div>
        )}

        {state.kind === 'rendering' && (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[10.5px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
            assembling… fal flux 1.1 pro
          </div>
        )}

        {state.kind === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
              couldn&rsquo;t render
            </div>
            <div className="max-w-[420px] font-mono text-[11px] leading-[1.55] text-[color:var(--text-primary)]">
              {state.message}
            </div>
            {state.hint && (
              <div className="max-w-[420px] font-mono text-[10.5px] leading-[1.55] text-[color:var(--text-secondary)]">
                {state.hint}
              </div>
            )}
            <button
              type="button"
              onClick={render}
              className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em]"
            >
              try again
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-start gap-3">
        {state.kind === 'done' && (
          <button
            type="button"
            onClick={render}
            className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
          >
            re-render
          </button>
        )}
        <button
          type="button"
          onClick={copyPrompt}
          className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
        >
          {copied ? 'copied' : 'copy prompt'}
        </button>
      </div>

      <details className="rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-3.5">
        <summary className="cursor-pointer font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          current prompt
        </summary>
        <p className="mt-2 font-mono text-[11.5px] leading-[1.55] text-[color:var(--text-primary)]">
          {currentPrompt}
        </p>
        {state.kind === 'done' && state.cost != null && (
          <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
            ~${state.cost.toFixed(2)} usd · fal flux 1.1 pro
          </p>
        )}
      </details>
    </div>
  );
}
