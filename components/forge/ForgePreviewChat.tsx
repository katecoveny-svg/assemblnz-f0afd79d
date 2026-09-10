'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FORGE_PREVIEW } from '@/lib/forge/preview-copy';

type Msg = {
  from: 'you' | 'forge';
  text: string;
  awaitingApproval?: boolean;
};

/**
 * Scripted Forge chat proof. Evidence panel stays compact until a draft
 * exists — never a giant empty receipt as the hero.
 */
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

  const hasDraft = used.length > 0;

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
        {hasDraft ? (
          <>
            <p className="aa-eyebrow aa-mono">{FORGE_PREVIEW.evidenceLabel}</p>
            <h3>Latest draft status</h3>
            <dl>
              <div>
                <dt className="aa-mono">State</dt>
                <dd>{FORGE_PREVIEW.approvalLabel}</dd>
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
          </>
        ) : (
          <>
            <p className="aa-eyebrow aa-mono">Live automotive desk</p>
            <h3>Talk to Arataki</h3>
            <p style={{ margin: '0 0 1rem', color: 'var(--aa-ink-soft)', lineHeight: 1.5 }}>
              {FORGE_PREVIEW.aratakiNote}
            </p>
            <Link className="aa-cta aa-cta-primary" href={FORGE_PREVIEW.aratakiHref}>
              {FORGE_PREVIEW.ctaChat}
            </Link>
            <p className="aa-mono" style={{ marginTop: '1rem', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--aa-muted)' }}>
              Or ask a DEMO question here — evidence appears when a draft is staged
            </p>
          </>
        )}
      </aside>
    </div>
  );
}
