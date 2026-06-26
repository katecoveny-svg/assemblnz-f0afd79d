'use client';

import { useState } from 'react';
import { Copy, Check, Mail } from 'lucide-react';
import { PALETTE } from '@/lib/marketplace/agents';

/**
 * Quiet "Email this agent" line for the detail page. Shown only for agents that
 * have an inbox (agentEmailAddress != null). Copy-to-clipboard for the address.
 */
export function EmailAgentLine({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the address is visible to copy by hand */
    }
  }

  return (
    <div
      className="mt-4 inline-flex items-center gap-2 text-sm"
      style={{ color: PALETTE.body }}
    >
      <Mail size={15} aria-hidden style={{ color: PALETTE.gold }} />
      <span>Email this agent:</span>
      <a href={`mailto:${address}`} className="font-bold hover:opacity-70" style={{ color: PALETTE.ink }}>
        {address}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy address'}
        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold transition hover:bg-white"
        style={{ borderColor: PALETTE.hairline, color: PALETTE.body }}
      >
        {copied ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
