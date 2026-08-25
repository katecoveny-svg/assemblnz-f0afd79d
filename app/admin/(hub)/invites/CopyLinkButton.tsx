'use client';

import { useState } from 'react';

const MONO = 'var(--font-mono), "Space Mono", ui-monospace, monospace';
const GOLD = '#BFA37A';

/** Clipboard button for a magic link. Falls back to a prompt() if the
 *  Clipboard API is unavailable (non-secure context). */
export function CopyLinkButton({ url, label = 'copy link' }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copy the magic link:', url);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      style={{
        fontFamily: MONO,
        fontSize: 12,
        letterSpacing: '0.04em',
        color: copied ? '#3f7d4e' : GOLD,
        background: 'transparent',
        border: `1px solid ${copied ? '#3f7d4e55' : `${GOLD}66`}`,
        borderRadius: 999,
        padding: '4px 12px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? 'copied ✓' : label}
    </button>
  );
}
