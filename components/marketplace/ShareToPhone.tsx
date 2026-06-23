'use client';

/**
 * ShareToPhone — save/share an agent draft to the user's phone.
 *
 * Ported from the old `assemblnz-f0afd79d-main` Web Share usage in
 * `StructuredOutputCard.tsx` (`navigator.share` / `navigator.canShare`) plus
 * the iOS/Android branching in `PWAInstallBanner.tsx`. Uses the native Web
 * Share sheet where available (and Web Share Level 2 for a PDF file), falling
 * back to clipboard. Dash-branded, drop-in for the chat surface.
 *
 * Deliberately does NOT register a service worker or trigger a PWA install —
 * the marketing-site SW is a kill switch (see project memory) and must stay so.
 * This is share-only.
 */

import { useCallback, useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { PALETTE } from '@/lib/marketplace/agents';

type Props = {
  title: string;
  text: string;
  /** optional file to share (e.g. the generated evidence-pack PDF). */
  file?: File | null;
  className?: string;
  label?: string;
};

function canShareFile(file: File): boolean {
  if (typeof navigator === 'undefined' || !navigator.canShare) return false;
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

export function ShareToPhone({ title, text, file, className, label = 'Save to phone' }: Props) {
  const [done, setDone] = useState(false);

  const flash = useCallback(() => {
    setDone(true);
    window.setTimeout(() => setDone(false), 1800);
  }, []);

  const onShare = useCallback(async () => {
    // Prefer the native share sheet (mobile) — with the PDF if we can.
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        if (file && canShareFile(file)) {
          await navigator.share({ title, text, files: [file] });
        } else {
          await navigator.share({ title, text });
        }
        flash();
        return;
      } catch (err) {
        // User dismissed the sheet — not an error worth surfacing.
        if (err instanceof DOMException && err.name === 'AbortError') return;
        // Otherwise fall through to clipboard.
      }
    }
    // Desktop / no Web Share — copy the draft.
    try {
      await navigator.clipboard.writeText(`${title}\n\n${text}`);
      flash();
    } catch {
      // Clipboard blocked — last resort: nothing we can do silently.
    }
  }, [file, flash, text, title]);

  return (
    <button
      type="button"
      onClick={onShare}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition hover:bg-white ${className ?? ''}`}
      style={{ borderColor: PALETTE.hairline, color: PALETTE.ink }}
      aria-label={label}
    >
      {done ? <Check size={14} aria-hidden /> : <Share2 size={14} aria-hidden />}
      {done ? 'Shared' : label}
    </button>
  );
}
