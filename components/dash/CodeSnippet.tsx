'use client';

/**
 * CodeSnippet — a mono code block with a copy button, for the dash.show()
 * install. Black surface, hi-vis keywords. Part of the agentic "one line"
 * pitch (see docs/dash-components-brief.md).
 */
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeSnippetProps {
  code: string;
  label?: string;
}

export function CodeSnippet({ code, label = 'two-line install' }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(code).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      },
      () => {},
    );
  }

  return (
    <div
      style={{
        background: 'var(--accent)',
        color: 'var(--surface)',
        border: '2px solid var(--accent)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          fontFamily: 'var(--ff-mono)',
          fontSize: 12,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--hivis)',
        }}
      >
        <span>{label}</span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: 0,
            color: copied ? 'var(--mint)' : 'var(--surface)',
            cursor: 'pointer',
            fontFamily: 'var(--ff-mono)',
            fontSize: 12,
          }}
        >
          {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: '18px 16px',
          fontFamily: 'var(--ff-mono)',
          fontSize: 13.5,
          lineHeight: 1.7,
          overflowX: 'auto',
          whiteSpace: 'pre',
        }}
      >
        {code}
      </pre>
    </div>
  );
}
