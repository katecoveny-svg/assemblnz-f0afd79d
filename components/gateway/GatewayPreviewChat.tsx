'use client';

import { useState } from 'react';
import { GATEWAY_PREVIEW } from '@/lib/gateway/preview-copy';

type Msg = {
  from: 'you' | 'gateway';
  text: string;
  awaitingApproval?: boolean;
};

export function GatewayPreviewChat() {
  const openers = GATEWAY_PREVIEW.chatOpeners;
  const [thread, setThread] = useState<Msg[]>([
    { from: 'gateway', text: GATEWAY_PREVIEW.chatGreeting },
  ]);
  const [used, setUsed] = useState<number[]>([]);

  const ask = (i: number) => {
    const { q, a } = openers[i];
    setThread((t) => [
      ...t,
      { from: 'you', text: q },
      { from: 'gateway', text: a, awaitingApproval: true },
    ]);
    setUsed((u) => [...u, i]);
  };

  return (
    <div className="aa-chat-grid">
      <div className="aa-chat" id="gateway-chat">
        <div className="aa-chat-head">
          <span className="aa-mark aa-mono" aria-hidden>
            GTW
          </span>
          <div>
            <strong>{GATEWAY_PREVIEW.brand}</strong>
            <span className="aa-mono">scripted · draft-only · DEMO</span>
          </div>
        </div>

        <div className="aa-chat-thread" role="log" aria-live="polite">
          {thread.map((m, i) => (
            <div
              key={`${m.from}-${i}`}
              className={`aa-bubble ${m.from === 'gateway' ? 'aa-bubble-arc' : 'aa-bubble-you'}`}
            >
              {m.text}
              {m.awaitingApproval ? (
                <div className="aa-approval aa-mono">{GATEWAY_PREVIEW.approvalLabel}</div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="aa-chat-actions">
          {openers.map((o, i) =>
            used.includes(i) ? null : (
              <button key={o.q} type="button" onClick={() => ask(i)}>
                {o.q}
              </button>
            ),
          )}
          <p className="aa-chat-foot aa-mono">{GATEWAY_PREVIEW.chatFooter}</p>
        </div>
      </div>

      <aside className="aa-evidence">
        <p className="aa-eyebrow aa-mono">{GATEWAY_PREVIEW.evidenceLabel}</p>
        <h3>Latest draft status</h3>
        <dl>
          <div>
            <dt className="aa-mono">State</dt>
            <dd>
              {used.length === 0
                ? 'No draft yet — ask Gateway one question'
                : GATEWAY_PREVIEW.approvalLabel}
            </dd>
          </div>
          <div>
            <dt className="aa-mono">Sources</dt>
            <dd>Customs Act · Working Tariff · Biosecurity DEMO citations on this page only</dd>
          </div>
          <div>
            <dt className="aa-mono">Lodge</dt>
            <dd>Blocked until a human approves — no TSW writeback</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
