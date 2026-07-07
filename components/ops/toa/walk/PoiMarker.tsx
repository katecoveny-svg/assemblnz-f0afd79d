'use client';

import { Html } from '@react-three/drei';
import type { PoiId } from './geometry';

/**
 * PoiMarker — the ARC eye, floating at a spatial moment on the building. Same
 * language as the ICG gallery: an eye icon you click to reveal the insight
 * behind it. Champagne ring, gentle pulse, always visible (the insight layer
 * sits *over* the architecture, so we don't occlude it against the model).
 */
export function PoiMarker({
  id,
  position,
  label,
  index,
  active,
  onOpen,
}: {
  id: PoiId;
  position: readonly [number, number, number];
  label: string;
  index: number;
  active: boolean;
  onOpen: (id: PoiId) => void;
}) {
  return (
    <Html position={position as [number, number, number]} center distanceFactor={11} zIndexRange={[20, 0]}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpen(id);
        }}
        aria-label={`ARC insight: ${label}`}
        className="group relative grid place-items-center"
        style={{
          width: 44,
          height: 44,
          // filmic reveal — each eye fades in on the film's detail-reveal rhythm
          animation: `poiEnter 0.9s cubic-bezier(0.22,1,0.36,1) ${0.5 + index * 0.4}s both`,
        }}
      >
        {/* pulse ring */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            border: '1.5px solid #bfa37a',
            animation: `poiPulse 2.6s ease-out ${index * 0.35}s infinite`,
          }}
        />
        {/* core disc */}
        <span
          className="relative grid h-8 w-8 place-items-center rounded-full shadow-lg transition-transform group-hover:scale-110"
          style={{
            background: active ? '#bfa37a' : 'rgba(22,21,22,0.92)',
            border: '1.5px solid #bfa37a',
            transform: active ? 'scale(1.14)' : undefined,
          }}
        >
          {/* eye icon */}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"
              stroke={active ? '#161516' : '#f2ead9'}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="2.6" fill={active ? '#161516' : '#bfa37a'} />
          </svg>
        </span>
        {/* label chip on hover */}
        <span
          className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] opacity-0 transition-opacity group-hover:opacity-100"
          style={{ background: '#161516', color: '#f2ead9', fontFamily: 'var(--font-brand-mono, monospace)' }}
        >
          {label}
        </span>
      </button>
    </Html>
  );
}
