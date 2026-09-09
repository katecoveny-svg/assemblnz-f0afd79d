'use client';

import { useEffect, useState } from 'react';
import { LIVE_WAIT } from './copy';

type Scenario = (typeof LIVE_WAIT.scenarios)[number];

/**
 * Simulated wait chrome only — NOT live chat.
 * Kept for possible wait-scenario demos. Homepage live agent chat is
 * `HomeGuidePhone` mounted from `CinematicJourneyHome` (POST /api/home/agent).
 * role=img: decorative device frame; no input composer by design.
 */
export function JourneyPhone({ scenario, choice }: { scenario: Scenario; choice: number }) {
  const [clock, setClock] = useState('9:41');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(`${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`);
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="cj-phone" role="img" aria-label="Simulated customer phone during an active wait">
      <div className="cj-phone-bezel">
        <div className="cj-phone-island" aria-hidden="true" />
        <div className="cj-phone-status">
          <span>{clock}</span>
          <span className="cj-phone-status-right">
            <i aria-hidden="true" />
            <i aria-hidden="true" />
            <b aria-hidden="true" />
          </span>
        </div>

        <div className="cj-phone-app">
          <p className="cj-phone-kicker">simulated wait</p>
          <h3>{scenario.status}</h3>
          <p className="cj-phone-wait">{scenario.wait}</p>
          <div className="cj-phone-signal">
            <i aria-hidden="true" />
            <span>work is happening</span>
          </div>
          <p className="cj-phone-prompt">{scenario.prompt}</p>
          <ul className="cj-phone-choices">
            {scenario.choices.map((item, index) => (
              <li key={item} className={index === choice ? 'is-on' : undefined}>
                <span>{item}</span>
                <em aria-hidden="true">{index === choice ? '✓' : '→'}</em>
              </li>
            ))}
          </ul>
          <div className="cj-phone-outcome">
            <small>prepared</small>
            <strong>{scenario.outcome}</strong>
            <p>{scenario.detail}</p>
          </div>
        </div>

        <div className="cj-phone-home" aria-hidden="true" />
      </div>
    </div>
  );
}
