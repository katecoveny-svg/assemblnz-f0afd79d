'use client';

import { ENSEMBLE_BRAND_BOARD } from '@/lib/ensemble/demo-package';

export function EnsembleBrandBoard() {
  return (
    <div className="ens-board" id="ensemble-board">
      {ENSEMBLE_BRAND_BOARD.map((item) => (
        <figure key={item.id}>
          {item.kind === 'image' && item.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.src} alt={`${item.agent} — ${item.note}`} />
          ) : null}
          {item.kind === 'video' && item.src ? (
            <video src={item.src} controls playsInline muted loop />
          ) : null}
          {item.kind === 'audio' && item.src ? (
            <div className="ens-board-audio">
              <audio src={item.src} controls />
            </div>
          ) : null}
          {item.kind === 'copy' && item.text ? (
            <div className="ens-board-copy">
              <p>{item.text}</p>
            </div>
          ) : null}
          <figcaption>
            <strong>{item.agent}</strong>
            <span className="ens-mono">{item.note}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
