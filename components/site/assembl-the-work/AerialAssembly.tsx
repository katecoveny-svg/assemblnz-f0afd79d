'use client';

import type { CSSProperties } from 'react';

/**
 * Aerial assembly — scattered signals flock through FIND → DO → SHOW → one output.
 * Sparse CSS motion. Reduced-motion gets the fully assembled end state.
 */

export function AerialAssembly() {
  const signals = [
    { cx: 38, cy: 42, r: 2.2, dx: '118px', dy: '38px', delay: '0s' },
    { cx: 52, cy: 28, r: 1.8, dx: '108px', dy: '52px', delay: '0.4s' },
    { cx: 28, cy: 68, r: 2.4, dx: '126px', dy: '12px', delay: '0.9s' },
    { cx: 70, cy: 58, r: 1.6, dx: '92px', dy: '22px', delay: '1.3s' },
    { cx: 44, cy: 88, r: 2.0, dx: '112px', dy: '-8px', delay: '1.7s' },
    { cx: 18, cy: 36, r: 1.5, dx: '132px', dy: '44px', delay: '2.1s' },
    { cx: 62, cy: 96, r: 1.9, dx: '98px', dy: '-18px', delay: '2.6s' },
    { cx: 86, cy: 34, r: 1.7, dx: '78px', dy: '48px', delay: '0.7s' },
    { cx: 24, cy: 104, r: 2.1, dx: '128px', dy: '-24px', delay: '1.1s' },
    { cx: 78, cy: 78, r: 1.4, dx: '84px', dy: '4px', delay: '1.9s' },
    { cx: 96, cy: 62, r: 1.8, dx: '68px', dy: '18px', delay: '2.4s' },
    { cx: 12, cy: 82, r: 1.6, dx: '138px', dy: '-2px', delay: '0.2s' },
  ];

  return (
    <figure className="atw-aerial" aria-label="Signals assemble through FIND, DO and SHOW into one output">
      <svg viewBox="0 0 400 320" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="atw-path" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#916A70" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#916A70" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F5F1F2" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Assembly path */}
        <path
          d="M70 160 C 130 120, 170 120, 200 160 C 230 200, 270 200, 330 160"
          fill="none"
          stroke="url(#atw-path)"
          strokeWidth="1.25"
          strokeDasharray="3 5"
        />

        {/* Stages */}
        <g className="atw-stage-ring" data-motion style={{ animationDelay: '0s' }}>
          <circle cx="110" cy="150" r="28" fill="none" stroke="#916A70" strokeOpacity="0.55" strokeWidth="1" />
          <text x="110" y="154" textAnchor="middle" fill="#F5F1F2" fontSize="11" fontFamily="IBM Plex Mono, monospace" letterSpacing="0.12em">
            FIND
          </text>
        </g>
        <g className="atw-stage-ring" data-motion style={{ animationDelay: '1.2s' }}>
          <circle cx="200" cy="160" r="34" fill="rgba(145,106,112,0.12)" stroke="#F5F1F2" strokeOpacity="0.7" strokeWidth="1.25" />
          <text x="200" y="164" textAnchor="middle" fill="#FFFDFB" fontSize="13" fontFamily="IBM Plex Mono, monospace" letterSpacing="0.14em" fontWeight="700">
            DO
          </text>
        </g>
        <g className="atw-stage-ring" data-motion style={{ animationDelay: '2.4s' }}>
          <circle cx="290" cy="150" r="28" fill="none" stroke="#916A70" strokeOpacity="0.55" strokeWidth="1" />
          <text x="290" y="154" textAnchor="middle" fill="#F5F1F2" fontSize="11" fontFamily="IBM Plex Mono, monospace" letterSpacing="0.12em">
            SHOW
          </text>
        </g>

        {/* Output lock */}
        <rect x="318" y="210" width="54" height="28" fill="none" stroke="#F5F1F2" strokeOpacity="0.45" />
        <text x="345" y="228" textAnchor="middle" fill="#916A70" fontSize="9" fontFamily="IBM Plex Mono, monospace" letterSpacing="0.08em">
          OUTPUT
        </text>

        {/* Scattered → flocking signals */}
        {signals.map((s, i) => (
          <circle
            key={i}
            className="atw-signal-dot"
            data-motion
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="#F5F1F2"
            fillOpacity="0.85"
            style={
              {
                ['--dx' as string]: s.dx,
                ['--dy' as string]: s.dy,
                animationDelay: s.delay,
                animationDuration: `${6.8 + (i % 4) * 0.45}s`,
              } as CSSProperties
            }
          />
        ))}
      </svg>
      <figcaption className="atw-aerial-caption">aerial assembly · signals → work</figcaption>
    </figure>
  );
}
