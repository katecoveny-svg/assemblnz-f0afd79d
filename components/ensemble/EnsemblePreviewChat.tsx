'use client';

import { useState } from 'react';
import { ENSEMBLE_PREVIEW } from '@/lib/ensemble/preview-copy';

type Msg = {
  from: 'you' | 'ensemble';
  text: string;
  awaitingApproval?: boolean;
};

export function EnsemblePreviewChat() {
  const openers = ENSEMBLE_PREVIEW.chatOpeners;
  const [thread, setThread] = useState<Msg[]>([
    { from: 'ensemble', text: ENSEMBLE_PREVIEW.chatGreeting },
  ]);
  const [used, setUsed] = useState<number[]>([]);

  const ask = (i: number) => {
    const { q, a } = openers[i];
    setThread((t) => [
      ...t,
      { from: 'you', text: q },
      { from: 'ensemble', text: a, awaitingApproval: true },
    ]);
    setUsed((u) => [...u, i]);
  };

  return (
    <div className="aa-chat-grid">
      <div className="aa-chat" id="ensemble-chat">
        <div className="aa-chat-head">
          <span className="aa-mark aa-mono" aria-hidden>
            ENS
          </span>
          <div>
            <strong>{ENSEMBLE_PREVIEW.brand}</strong>
            <span className="aa-mono">scripted · draft-only · DEMO</span>
          </div>
        </div>

        <div className="aa-chat-thread" role="log" aria-live="polite">
          {thread.map((m, i) => (
            <div
              key={`${m.from}-${i}`}
              className={`aa-bubble ${m.from === 'ensemble' ? 'aa-bubble-arc' : 'aa-bubble-you'}`}
            >
              {m.text}
              {m.awaitingApproval ? (
                <div className="aa-approval aa-mono">{ENSEMBLE_PREVIEW.approvalLabel}</div>
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
          <p className="aa-chat-foot aa-mono">{ENSEMBLE_PREVIEW.chatFooter}</p>
        </div>
      </div>

      <aside className="aa-evidence">
        <p className="aa-eyebrow aa-mono">{ENSEMBLE_PREVIEW.evidenceLabel}</p>
        <h3>Latest draft status</h3>
        <dl>
          <div>
            <dt className="aa-mono">State</dt>
            <dd>
              {used.length === 0
                ? 'No draft yet — ask Ensemble one question'
                : ENSEMBLE_PREVIEW.approvalLabel}
            </dd>
          </div>
          <div>
            <dt className="aa-mono">Sources</dt>
            <dd>ASA · Fair Trading Act 1986 DEMO citations on this page only</dd>
          </div>
          <div>
            <dt className="aa-mono">Publish</dt>
            <dd>Blocked until a human approves</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
