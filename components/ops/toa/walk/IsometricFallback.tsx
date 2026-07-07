'use client';

import type { Phase, PoiId } from './geometry';

/**
 * IsometricFallback — the honest still. Shown when WebGL is unavailable or the
 * visitor prefers reduced motion: a static isometric of the current phase with
 * the same seven eye-POIs, still clickable. No first-person, no auto-rotate.
 */
const CHAMPAGNE = '#bfa37a';
const INK = '#161516';

// approximate 2D POI positions within the 640×460 viewBox
const POI_XY: Record<PoiId, [number, number]> = {
  teAranga: [120, 330],
  zoneRules: [500, 250],
  h1Energy: [410, 150],
  consentMemo: [250, 300],
  precedent: [360, 250],
  materials: [175, 230],
  rfi: [330, 380],
};

function PhaseArt({ phase }: { phase: Phase }) {
  // shared iso house silhouette points (base 320,250 centre)
  const wall = phase === 'complete' ? '#b98c57' : phase === 'concept' ? '#3a3f3a' : '#efe7d3';
  const roof = phase === 'complete' ? '#2c2b2a' : phase === 'concept' ? '#4a4f4a' : 'none';
  const stroke = phase === 'consent' ? '#2a2722' : 'rgba(0,0,0,0.25)';
  const timber = '#c39a63';

  return (
    <g>
      {/* ground diamond */}
      <polygon points="320,120 600,270 320,420 40,270" fill="#e9e7de" />
      {/* left face */}
      <polygon points="200,250 320,320 320,410 200,340" fill={wall} stroke={stroke} strokeWidth="1.5" opacity={phase === 'consent' ? 0.25 : 1} />
      {/* right face */}
      <polygon points="320,320 440,250 440,340 320,410" fill={wall} stroke={stroke} strokeWidth="1.5" opacity={phase === 'consent' ? 0.2 : 1} filter="brightness(0.9)" />
      {/* right face shade */}
      <polygon points="320,320 440,250 440,340 320,410" fill="rgba(0,0,0,0.12)" opacity={phase === 'consent' ? 0 : 1} />
      {/* gable roof */}
      {roof !== 'none' ? (
        <>
          <polygon points="200,250 320,180 320,320" fill={roof} stroke={stroke} strokeWidth="1.2" />
          <polygon points="320,180 440,250 320,320" fill={roof} stroke={stroke} strokeWidth="1.2" opacity="0.85" />
        </>
      ) : null}

      {/* phase overlays */}
      {phase === 'consent' ? (
        <>
          {/* plan on the ground */}
          <polygon points="320,250 430,305 320,362 210,305" fill="#f7f1e2" stroke="#2a2722" strokeWidth="1" opacity="0.9" />
          <line x1="265" y1="278" x2="375" y2="278" stroke="#2a2722" strokeWidth="0.8" opacity="0.5" />
          <line x1="320" y1="250" x2="320" y2="362" stroke="#2a2722" strokeWidth="0.8" opacity="0.5" />
          {/* dashed envelope */}
          <polygon points="200,250 320,180 440,250 320,320" fill="none" stroke="#2a2722" strokeWidth="1.2" strokeDasharray="5 4" />
        </>
      ) : null}
      {phase === 'construction' ? (
        <g stroke={timber} strokeWidth="2.4">
          {/* studs on left face */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line key={`l${t}`} x1={200 + t * 120} y1={250 + t * 70} x2={200 + t * 120} y2={340 + t * 70} />
          ))}
          {/* studs on right face */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line key={`r${t}`} x1={320 + t * 120} y1={320 - t * 70} x2={320 + t * 120} y2={410 - t * 70} />
          ))}
          {/* rafters */}
          <line x1="200" y1="250" x2="320" y2="180" />
          <line x1="440" y1="250" x2="320" y2="180" />
          <line x1="230" y1="267" x2="320" y2="205" />
          <line x1="410" y1="267" x2="320" y2="205" />
        </g>
      ) : null}
      {phase === 'complete' ? (
        <>
          {/* warm windows */}
          <rect x="238" y="280" width="26" height="34" fill="#f4c987" opacity="0.9" transform="skewY(30)" />
          <rect x="360" y="150" width="26" height="34" fill="#f4c987" opacity="0.85" transform="skewY(-30)" />
          {/* deck */}
          <polygon points="320,410 400,368 470,405 390,450" fill="#a8814f" opacity="0.9" />
        </>
      ) : null}
    </g>
  );
}

export function IsometricFallback({
  phase,
  onOpenPoi,
}: {
  phase: Phase;
  onOpenPoi: (id: PoiId) => void;
}) {
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 640 460" className="h-full w-full" role="img" aria-label={`16A — ${phase} phase, isometric view`}>
        <rect x="0" y="0" width="640" height="460" fill="#efeee7" />
        <PhaseArt phase={phase} />
      </svg>
      {/* clickable eye POIs */}
      {(Object.keys(POI_XY) as PoiId[]).map((id) => {
        const [x, y] = POI_XY[id];
        return (
          <button
            key={id}
            type="button"
            onClick={() => onOpenPoi(id)}
            aria-label={`ARC insight ${id}`}
            className="absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full shadow-md transition hover:scale-110"
            style={{
              left: `${(x / 640) * 100}%`,
              top: `${(y / 460) * 100}%`,
              background: INK,
              border: `1.5px solid ${CHAMPAGNE}`,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" stroke="#f2ead9" strokeWidth="1.6" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="2.6" fill={CHAMPAGNE} />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
