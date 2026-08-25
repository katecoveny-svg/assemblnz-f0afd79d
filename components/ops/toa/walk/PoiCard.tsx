'use client';

import { useEffect, useState } from 'react';
import { LiveArcChat } from '@/components/ops/toa/LiveArcChat';
import type { Poi, PoiSlide } from './poi-content';

/**
 * PoiCard — the ICG-style reveal. Click an eye, this card slides up over the
 * walk: an ARC insight, its slides, and a citation + trust grade in the footer.
 * The consent-memo card is special — it opens the real, streaming ARC chat.
 *
 * Champagne canon: paper white, ink, champagne gold. Cormorant lowercase title,
 * Space Mono micro-labels, Lato body.
 */
const CHAMPAGNE = '#bfa37a';
const INK = '#161516';
const MUTED = '#6f6f64';

function TrustBadge({ trust }: { trust: 'A' | 'B' | 'C' }) {
  const map = {
    A: { bg: CHAMPAGNE, fg: INK, note: 'sourced · cite-able' },
    B: { bg: 'transparent', fg: '#8a744f', note: 'draft for review' },
    C: { bg: 'transparent', fg: MUTED, note: 'indicative' },
  } as const;
  const s = map[trust];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold uppercase tracking-[0.14em]"
      style={{
        background: s.bg,
        color: s.fg,
        border: `1px solid ${trust === 'A' ? CHAMPAGNE : 'rgba(138,116,79,0.5)'}`,
      }}
    >
      trust {trust} · {s.note}
    </span>
  );
}

function SlideBody({ slide }: { slide: PoiSlide }) {
  return (
    <div className="flex flex-col gap-3">
      <h4
        className="text-[12px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: '#8a744f', fontFamily: 'var(--font-brand-mono, monospace)' }}
      >
        {slide.heading}
      </h4>
      {slide.body ? (
        <p className="text-[13.5px] leading-relaxed" style={{ color: '#363a35' }}>
          {slide.body}
        </p>
      ) : null}
      {slide.rows ? (
        <dl className="flex flex-col divide-y" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          {slide.rows.map((r) => (
            <div key={r.k} className="flex items-baseline justify-between gap-3 py-1.5">
              <dt className="shrink-0 text-[12.5px]" style={{ color: MUTED }}>
                {r.k}
              </dt>
              <dd className="flex flex-1 items-baseline justify-end gap-2 text-right">
                <span className="text-[13px] font-medium" style={{ color: INK }}>
                  {r.v}
                </span>
                {r.cite ? (
                  <span
                    className="hidden shrink-0 text-[12px] uppercase tracking-wide sm:inline"
                    style={{ color: CHAMPAGNE, fontFamily: 'var(--font-brand-mono, monospace)' }}
                  >
                    {r.cite}
                  </span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {slide.bullets ? (
        <ul className="flex flex-col gap-1.5">
          {slide.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-[13px] leading-relaxed" style={{ color: '#363a35' }}>
              <span aria-hidden className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: CHAMPAGNE }} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {slide.note ? (
        <p
          className="rounded-lg px-3 py-2 text-[12px] leading-relaxed"
          style={{ background: 'rgba(191,163,122,0.1)', color: '#5c5240' }}
        >
          {slide.note}
        </p>
      ) : null}
    </div>
  );
}

export function PoiCard({ poi, onClose }: { poi: Poi; onClose: () => void }) {
  const [i, setI] = useState(0);
  const slides = poi.slides;
  const many = slides.length > 1;

  useEffect(() => {
    setI(0);
  }, [poi.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (poi.custom) return;
      if (e.key === 'ArrowRight' && i < slides.length - 1) setI((v) => v + 1);
      if (e.key === 'ArrowLeft' && i > 0) setI((v) => v - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [i, slides.length, poi.custom, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`ARC insight — ${poi.label}`}
      className="absolute inset-0 z-30 flex items-end justify-center p-3 sm:items-center sm:p-6"
    >
      {/* scrim */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ background: 'rgba(22,21,22,0.42)', backdropFilter: 'blur(2px)' }}
      />

      <div
        className="relative flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ border: `1px solid ${CHAMPAGNE}66` }}
      >
        {/* header */}
        <div className="flex items-start gap-3 border-b px-5 pb-4 pt-5" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <span
            className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full"
            style={{ background: INK, border: `1.5px solid ${CHAMPAGNE}` }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" stroke="#f2ead9" strokeWidth="1.6" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="2.6" fill={CHAMPAGNE} />
            </svg>
          </span>
          <div className="flex-1">
            <p
              className="text-[12px] uppercase tracking-[0.2em]"
              style={{ color: MUTED, fontFamily: 'var(--font-brand-mono, monospace)' }}
            >
              {poi.eyebrow}
            </p>
            <h3
              className="mt-0.5 text-2xl lowercase leading-tight"
              style={{ color: INK, fontFamily: 'var(--font-brand-display, Cormorant Garamond), Georgia, serif' }}
            >
              {poi.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full transition hover:bg-black/5"
            style={{ color: INK }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <TrustBadge trust={poi.trust} />
            {poi.draft ? (
              <span
                className="rounded-full px-2.5 py-1 text-[12px] font-semibold uppercase tracking-[0.14em]"
                style={{ background: 'rgba(22,21,22,0.06)', color: '#363a35' }}
              >
                draft-only · nothing sends
              </span>
            ) : null}
            <span className="text-[12px]" style={{ color: MUTED }}>
              {poi.where}
            </span>
          </div>

          <p className="text-[13.5px] leading-relaxed" style={{ color: INK }}>
            {poi.intro}
          </p>

          {poi.custom === 'chat' ? (
            <div className="rounded-xl border" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
              <LiveArcChat compact />
            </div>
          ) : (
            <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(0,0,0,0.07)', background: '#fbfaf6' }}>
              <SlideBody slide={slides[i]} />
            </div>
          )}
        </div>

        {/* footer — carousel + citation */}
        <div className="flex flex-col gap-2 border-t px-5 py-3" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          {many ? (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setI((v) => Math.max(0, v - 1))}
                disabled={i === 0}
                className="grid h-8 w-8 place-items-center rounded-full border transition disabled:opacity-30"
                style={{ borderColor: 'rgba(0,0,0,0.15)', color: INK }}
                aria-label="Previous"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <div className="flex items-center gap-1.5">
                {slides.map((s, idx) => (
                  <button
                    key={s.heading}
                    type="button"
                    onClick={() => setI(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: idx === i ? 20 : 6, background: idx === i ? CHAMPAGNE : 'rgba(0,0,0,0.18)' }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setI((v) => Math.min(slides.length - 1, v + 1))}
                disabled={i === slides.length - 1}
                className="grid h-8 w-8 place-items-center rounded-full border transition disabled:opacity-30"
                style={{ borderColor: 'rgba(0,0,0,0.15)', color: INK }}
                aria-label="Next"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          ) : null}
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: MUTED, fontFamily: 'var(--font-brand-mono, monospace)' }}
          >
            source · {poi.citation}
          </p>
        </div>
      </div>
    </div>
  );
}
