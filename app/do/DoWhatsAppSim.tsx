'use client';

import { useState } from 'react';

const THREAD = [
  { from: 'you' as const, text: 'Watch this Mitre RFP for deadline changes' },
  { from: 'do' as const, text: '✦ Agent drafted · Needs your yes before any notify' },
  { from: 'you' as const, text: 'Activate' },
  { from: 'do' as const, text: 'Working · Evidence on change. DEMO — nothing sent.' },
];

export function DoWhatsAppSim() {
  const [step, setStep] = useState(2);

  return (
    <div className="do-phone" aria-label="WhatsApp surface DEMO">
      <div className="do-phone-bezel">
        <div className="do-phone-notch" aria-hidden />
        <header className="do-phone-bar">
          <span className="do-phone-avatar" aria-hidden>
            ✦
          </span>
          <div>
            <strong>DO</strong>
            <span className="do-mono">WhatsApp · stub</span>
          </div>
        </header>
        <div className="do-phone-thread">
          {THREAD.slice(0, step + 1).map((m, i) => (
            <div key={i} className={`do-bubble do-bubble-${m.from}`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="do-phone-composer">
          <button
            type="button"
            className="do-cta do-cta-secondary do-cta-compact"
            onClick={() => setStep((s) => Math.min(THREAD.length - 1, s + 1))}
            disabled={step >= THREAD.length - 1}
          >
            Next
          </button>
          <button
            type="button"
            className="do-cta do-cta-secondary do-cta-compact"
            onClick={() => setStep(1)}
          >
            Replay
          </button>
        </div>
      </div>
      <p className="do-phone-caption">Surface stub · not connected</p>
    </div>
  );
}
