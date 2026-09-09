'use client';

import { useState } from 'react';
import { FORGE_PREVIEW } from '@/lib/forge/preview-copy';

type Msg = {
  from: 'you' | 'forge';
  text: string;
  awaitingApproval?: boolean;
};

export function ForgePreviewChat() {
  const openers = FORGE_PREVIEW.chatOpeners;
  const [thread, setThread] = useState<Msg[]>([
    { from: 'forge', text: FORGE_PREVIEW.chatGreeting },
  ]);
  const [used, setUsed] = useState<number[]>([]);

  const ask = (i: number) => {
    const { q, a } = openers[i];
    setThread((t) => [
      ...t,
      { from: 'you', text: q },
      { from: 'forge', text: a, awaitingApproval: true },
    ]);
    setUsed((u) => [...u, i]);
  };

  return (
    <div className="aa-chat-grid">
      <div className="aa-chat" id="forge-chat">
        <div className="aa-chat-head">
          <span className="aa-mark aa-mono" aria-hidden>
            FRG
          </span>
          <div>
            <strong>{FORGE_PREVIEW.brand}</strong>
            <span className="aa-mono">scripted · draft-only · DEMO</span>
          </div>
        </div>

        <div className="aa-chat-thread" role="log" aria-live="polite">
          {thread.map((m, i) => (
            <div
              key={`${m.from}-${i}`}
              className={`aa-bubble ${m.from === 'forge' ? 'aa-bubble-arc' : 'aa-bubble-you'}`}
            >
              {m.text}
              {m.awaitingApproval ? (
                <div className="aa-approval aa-mono">{FORGE_PREVIEW.approvalLabel}</div>
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
          <p className="aa-chat-foot aa-mono">{FORGE_PREVIEW.chatFooter}</p>
        </div>
      </div>

      <aside className="aa-evidence">
        <p className="aa-eyebrow aa-mono">{FORGE_PREVIEW.evidenceLabel}</p>
        <h3>Latest draft status</h3>
        <dl>
          <div>
            <dt className="aa-mono">State</dt>
            <dd>
              {used.length === 0
                ? 'No draft yet — ask Forge one question'
                : FORGE_PREVIEW.approvalLabel}
            </dd>
          </div>
          <div>
            <dt className="aa-mono">Sources</dt>
            <dd>NZTA WoF/CoF · CCCFA DEMO citations on this page only</dd>
          </div>
          <div>
            <dt className="aa-mono">Send</dt>
            <dd>Blocked until a human approves</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
