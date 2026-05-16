'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function DeploymentCopyButton({
  value,
  label = 'Copy',
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[rgba(35,33,31,0.16)] px-4 text-sm font-medium transition hover:border-[rgba(35,33,31,0.32)] hover:bg-white"
    >
      {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      {copied ? 'Copied' : label}
    </button>
  );
}
