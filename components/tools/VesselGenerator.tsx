'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Sparkles, Share2, Download } from 'lucide-react';
import { BrandColorPicker } from './BrandColorPicker';

type Preset = {
  slug: string;
  brandName: string;
  brandColor: string;
  logoUrl?: string | null;
  defaultPrompt?: string | null;
};

type GenerationResult = {
  generationId: string;
  imageUrl: string;
  brandName: string;
  brandColor: string;
};

type Props = {
  initialPreset?: Preset;
};

const SUGGESTED_PROMPTS = [
  'shipping containers at Port of Auckland at golden hour',
  'kauri grove emerging from morning fog',
  'a workshop bench with hand tools laid out in editorial light',
  'a marae carving photographed against paper backdrop',
  'green-lipped mussels in a ceramic dish, overhead view',
];

export function VesselGenerator({ initialPreset }: Props) {
  const [brandName, setBrandName] = useState(initialPreset?.brandName ?? 'assembl');
  const [brandColor, setBrandColor] = useState(initialPreset?.brandColor ?? '#2B6B57');
  const [prompt, setPrompt] = useState(initialPreset?.defaultPrompt ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);

  // Reset to preset when navigating between /tools/vessel/[slug] variants.
  useEffect(() => {
    if (!initialPreset) return;
    setBrandName(initialPreset.brandName);
    setBrandColor(initialPreset.brandColor);
    if (initialPreset.defaultPrompt) setPrompt(initialPreset.defaultPrompt);
  }, [initialPreset]);

  const generate = useCallback(async () => {
    if (!prompt.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/vessel/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandSlug: initialPreset?.slug ?? null,
          brandName,
          brandColor,
          prompt: prompt.trim(),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | (GenerationResult & { error?: string })
        | { error?: string }
        | null;
      if (!res.ok || !data) {
        const message = (data && 'error' in data && data.error) || `HTTP ${res.status}`;
        throw new Error(message);
      }
      if ('imageUrl' in data && data.imageUrl) {
        setResult(data as GenerationResult);
      } else {
        throw new Error('No image returned.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed.');
    } finally {
      setSubmitting(false);
    }
  }, [brandColor, brandName, initialPreset?.slug, prompt, submitting]);

  const share = useCallback(async () => {
    if (!result) return;
    // UTM-tag shared links so visits back to assembl.co.nz are attributable.
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/tools/vessel/output/${result.generationId}?utm_source=share&utm_medium=vessel&utm_campaign=assembl_vessel`
        : '';
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    } catch {
      // Fallback: open in new tab so the user can copy from the URL bar.
      window.open(url, '_blank', 'noopener');
    }
  }, [result]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
      {/* Left pane — controls */}
      <section className="space-y-7">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
            Brand
          </p>
          <label htmlFor="brand-name" className="sr-only">
            Brand name
          </label>
          <input
            id="brand-name"
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            maxLength={60}
            placeholder="Your brand name"
            className="mt-2 w-full rounded-md border border-[rgba(35,33,31,0.18)] bg-white px-3 py-2.5 text-base text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B6B57]"
          />
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
            Brand colour
          </p>
          <div className="mt-2">
            <BrandColorPicker value={brandColor} onChange={setBrandColor} />
          </div>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
            Subject (what should the vessel hold?)
          </p>
          <label htmlFor="vessel-prompt" className="sr-only">
            Prompt
          </label>
          <textarea
            id="vessel-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            maxLength={600}
            placeholder="e.g. shipping containers at Port of Auckland at golden hour"
            className="mt-2 w-full resize-none rounded-md border border-[rgba(35,33,31,0.18)] bg-white px-3 py-2.5 text-base text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B6B57]"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setPrompt(suggestion)}
                className="min-h-11 rounded-full border border-[rgba(35,33,31,0.12)] bg-white px-3 py-2 text-xs text-[color:var(--text-secondary)] hover:border-[rgba(35,33,31,0.32)] hover:text-[color:var(--text-primary)]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={submitting || !prompt.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2B6B57] px-5 py-3 text-base font-medium text-white transition-colors hover:bg-[#235746] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden />
          )}
          {submitting ? 'Generating vessel…' : 'Generate vessel'}
        </button>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-[#C26A6A] bg-[rgba(194,106,106,0.06)] px-3 py-2 text-sm text-[#9A3412]"
          >
            {error}
          </p>
        )}
      </section>

      {/* Right pane — preview */}
      <section className="relative">
        <div className="sticky top-8 space-y-4">
          <div className="font-mono flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
            <span>Vessel preview</span>
            <span className="text-[color:var(--text-secondary)]">assembl covers generation</span>
          </div>
          <div
            className="relative aspect-[4/5] w-full overflow-hidden rounded-md border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)]"
            style={{ backgroundColor: '#FAF7F2' }}
          >
            {result ? (
              <a
                href={result.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.imageUrl}
                  alt={`Generated vessel for ${result.brandName}`}
                  className="h-full w-full object-cover"
                />
              </a>
            ) : (
              <div className="flex h-full w-full items-center justify-center px-8 text-center">
                <p className="font-display max-w-xs text-lg leading-snug text-[color:var(--text-secondary)]">
                  {submitting
                    ? 'Casting the vessel — about 8 to 12 seconds.'
                    : 'Your vessel will appear here. A4 backdrop, ceramic form, brand colour cast inside.'}
                </p>
              </div>
            )}
          </div>
          {result && (
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={result.imageUrl}
                download={`vessel-${result.brandName.toLowerCase().replace(/\s+/g, '-') || 'assembl'}.jpg`}
                className="inline-flex items-center gap-2 rounded-md border border-[rgba(35,33,31,0.18)] bg-white px-3 py-2 text-sm text-[color:var(--text-primary)] hover:border-[rgba(35,33,31,0.32)]"
              >
                <Download className="h-4 w-4" aria-hidden /> Download
              </a>
              <button
                type="button"
                onClick={share}
                className="inline-flex items-center gap-2 rounded-md border border-[rgba(35,33,31,0.18)] bg-white px-3 py-2 text-sm text-[color:var(--text-primary)] hover:border-[rgba(35,33,31,0.32)]"
              >
                <Share2 className="h-4 w-4" aria-hidden /> Copy share link
              </button>
              {shareToast && (
                <span
                  role="status"
                  className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#2B6B57]"
                >
                  Link copied
                </span>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
