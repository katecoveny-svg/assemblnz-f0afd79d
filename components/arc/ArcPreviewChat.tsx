'use client';

import { useState } from 'react';
import { ARC_PREVIEW } from '@/lib/arc/preview-copy';

type Msg = {
  from: 'you' | 'arc';
  text: string;
  awaitingApproval?: boolean;
};

export function ArcPreviewChat({ compact = false }: { compact?: boolean }) {
  const openers = ARC_PREVIEW.chatOpeners;
  const [thread, setThread] = useState<Msg[]>([
    { from: 'arc', text: ARC_PREVIEW.chatGreeting },
  ]);
  const [used, setUsed] = useState<number[]>([]);

  const ask = (i: number) => {
    const { q, a } = openers[i];
    setThread((t) => [
      ...t,
      { from: 'you', text: q },
      { from: 'arc', text: a, awaitingApproval: true },
    ]);
    setUsed((u) => [...u, i]);
  };

  const chat = (
    <div className="arc-chat bp-frame-premium" id="arc-chat">
      <div className="arc-chat-head">
        <span className="arc-mark arc-mono" aria-hidden>
          ARC
        </span>
        <div>
          <strong>{ARC_PREVIEW.brand}</strong>
          <span className="arc-mono">scripted · draft-only · DEMO</span>
        </div>
      </div>

      <div className="arc-chat-thread" role="log" aria-live="polite">
        {thread.map((m, i) => (
          <div
            key={`${m.from}-${i}`}
            className={`arc-bubble ${m.from === 'arc' ? 'arc-bubble-arc' : 'arc-bubble-you'}`}
          >
            {m.text}
            {m.awaitingApproval ? (
              <div className="arc-approval arc-mono">{ARC_PREVIEW.approvalLabel}</div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="arc-chat-actions">
        {openers.map((o, i) =>
          used.includes(i) ? null : (
            <button key={o.q} type="button" onClick={() => ask(i)}>
              {o.q}
            </button>
          ),
        )}
        <p className="arc-chat-foot arc-mono">{ARC_PREVIEW.chatFooter}</p>
      </div>
    </div>
  );

  if (compact) return chat;

  return (
    <div className="arc-chat-grid">
      {chat}
      <aside className="arc-evidence bp-frame">
        <p className="arc-eyebrow arc-mono">{ARC_PREVIEW.evidenceLabel}</p>
        <h3>Latest draft status</h3>
        <dl>
          <div>
            <dt className="arc-mono">State</dt>
            <dd>
              {used.length === 0
                ? 'No draft yet — ask Arc one question'
                : ARC_PREVIEW.approvalLabel}
            </dd>
          </div>
          <div>
            <dt className="arc-mono">Sources</dt>
            <dd>NZBC / AUP-class DEMO citations on this page only</dd>
          </div>
          <div>
            <dt className="arc-mono">Send</dt>
            <dd>Blocked until a human approves</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
