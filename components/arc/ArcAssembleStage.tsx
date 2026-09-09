'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ARC_PREVIEW } from '@/lib/arc/preview-copy';

/**
 * Pinned scroll-scrub: flat-lay building parts assemble into a NZ terrace GA plan.
 * Paper field + plum ink. Honours prefers-reduced-motion (shows assembled).
 */
export function ArcAssembleStage() {
  const pinRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pin = pinRef.current;
    const sheet = sheetRef.current;
    if (!pin || !sheet) return;

    const parts = sheet.querySelectorAll<SVGElement>('[data-part]');
    const assembled = sheet.querySelectorAll<SVGElement>('[data-assembled]');
    const flat = sheet.querySelectorAll<SVGElement>('[data-flat]');

    if (reduce) {
      parts.forEach((el) => {
        el.style.transform = '';
        el.style.opacity = '1';
      });
      flat.forEach((el) => {
        el.style.opacity = '0';
      });
      assembled.forEach((el) => {
        el.style.opacity = '1';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: '+=220%',
          pin: true,
          scrub: 0.65,
          anticipatePin: 1,
        },
      });

      // Flat-lay labels fade as assembly begins
      tl.fromTo(
        flat,
        { autoAlpha: 1 },
        { autoAlpha: 0, duration: 0.25, ease: 'none' },
        0,
      );

      // Each part slides from scatter into its plan seat
      parts.forEach((el, i) => {
        const scatterX = Number(el.dataset.sx ?? 0);
        const scatterY = Number(el.dataset.sy ?? 0);
        const scatterR = Number(el.dataset.sr ?? 0);
        tl.fromTo(
          el,
          {
            x: scatterX,
            y: scatterY,
            rotation: scatterR,
            transformOrigin: '50% 50%',
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.55,
            ease: 'power2.inOut',
          },
          0.08 + i * 0.06,
        );
      });

      tl.fromTo(
        assembled,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.35, ease: 'power1.out' },
        0.72,
      );

      tl.fromTo(
        sheet.querySelectorAll('[data-assemble-stamp]'),
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' },
        0.88,
      );
    }, pin);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      className="arc-assemble-pin"
      ref={pinRef}
      aria-labelledby="arc-assemble-title"
      id="arc-assemble"
    >
      <div className="arc-assemble-stage">
        <div className="arc-section-head arc-assemble-head">
          <p className="arc-eyebrow arc-mono">{ARC_PREVIEW.assembleEyebrow}</p>
          <h2 id="arc-assemble-title">{ARC_PREVIEW.assembleTitle}</h2>
          <p>{ARC_PREVIEW.assembleSupport}</p>
        </div>

        <div className="arc-plan-sheet" ref={sheetRef} data-sheet="assemble">
          <div className="arc-title-block arc-mono" aria-hidden>
            <div className="arc-title-block-row">
              <span>PROJECT</span>
              <strong>Harbour terrace · DEMO</strong>
            </div>
            <div className="arc-title-block-row">
              <span>DRAWING</span>
              <strong>GA plan · A1</strong>
            </div>
            <div className="arc-title-block-row">
              <span>SCALE</span>
              <strong>1:100</strong>
            </div>
            <div className="arc-title-block-row">
              <span>REV</span>
              <strong>P0 · preview</strong>
            </div>
          </div>

          <svg
            className="arc-plan-svg"
            viewBox="0 0 640 420"
            role="img"
            aria-label="DEMO Auckland terrace plan assembling from flat-lay parts"
          >
            <defs>
              <pattern id="arc-eng-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#240B21" strokeWidth="0.35" opacity="0.08" />
              </pattern>
            </defs>

            <rect width="640" height="420" fill="#FFFDFB" />
            <rect width="640" height="420" fill="url(#arc-eng-grid)" />

            {/* Flat-lay captions */}
            <g data-flat fill="#654A4E" fontFamily="IBM Plex Mono, ui-monospace, monospace" fontSize="9" letterSpacing="1.2">
              <text x="36" y="28">FLAT LAY · PARTS</text>
              <text x="480" y="28">SCROLL TO ASSEMBLE</text>
            </g>

            {/* Envelope / walls */}
            <g
              data-part
              data-sx="-48"
              data-sy="-28"
              data-sr="-4"
              stroke="#240B21"
              fill="none"
              strokeLinejoin="miter"
            >
              <rect x="90" y="70" width="420" height="250" strokeWidth="3.2" />
              <line x1="270" y1="70" x2="270" y2="210" strokeWidth="2" />
              <line x1="90" y1="210" x2="270" y2="210" strokeWidth="2" />
              <line x1="360" y1="210" x2="510" y2="210" strokeWidth="2" />
              <line x1="360" y1="210" x2="360" y2="320" strokeWidth="2" />
            </g>

            {/* Stair block */}
            <g data-part data-sx="72" data-sy="36" data-sr="8" stroke="#240B21" fill="none">
              <rect x="430" y="230" width="80" height="90" strokeWidth="2" />
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="430"
                  y1={248 + i * 14}
                  x2="510"
                  y2={248 + i * 14}
                  strokeWidth="1"
                  opacity="0.75"
                />
              ))}
            </g>

            {/* Bath / WC */}
            <g data-part data-sx="54" data-sy="-42" data-sr="6" stroke="#240B21" fill="none">
              <rect x="360" y="210" width="70" height="55" strokeWidth="2" />
              <circle cx="395" cy="238" r="14" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.7" />
            </g>

            {/* Deck */}
            <g data-part data-sx="-36" data-sy="58" data-sr="-3" stroke="#240B21" fill="none">
              <rect
                x="90"
                y="320"
                width="220"
                height="48"
                strokeWidth="1.6"
                strokeDasharray="6 4"
                opacity="0.9"
              />
            </g>

            {/* Door swings + openings */}
            <g data-part data-sx="20" data-sy="-50" data-sr="12" stroke="#654A4E" fill="none">
              <path d="M190 210 A22 22 0 0 1 212 232" strokeWidth="1.2" />
              <path d="M270 130 A20 20 0 0 1 290 150" strokeWidth="1.2" />
              <line x1="150" y1="70" x2="210" y2="70" strokeWidth="4" stroke="#FFFDFB" />
              <line x1="320" y1="70" x2="390" y2="70" strokeWidth="4" stroke="#FFFDFB" />
            </g>

            {/* Assembled annotations */}
            <g
              data-assembled
              fill="#654A4E"
              fontFamily="IBM Plex Mono, ui-monospace, monospace"
              fontSize="10"
              letterSpacing="0.8"
              opacity="0"
            >
              <text x="140" y="145">BED 1</text>
              <text x="140" y="265">LIVING / KITCHEN</text>
              <text x="310" y="145">BED 2</text>
              <text x="372" y="242">WC</text>
              <text x="448" y="280">STAIR</text>
              <text x="155" y="348" fill="#916A70">
                DECK
              </text>
            </g>

            {/* Dimension + north */}
            <g data-assembled stroke="#240B21" fill="#240B21" opacity="0">
              <line x1="90" y1="52" x2="510" y2="52" strokeWidth="0.8" />
              <line x1="90" y1="48" x2="90" y2="56" strokeWidth="0.8" />
              <line x1="510" y1="48" x2="510" y2="56" strokeWidth="0.8" />
              <text
                x="300"
                y="46"
                textAnchor="middle"
                fontFamily="IBM Plex Mono, ui-monospace, monospace"
                fontSize="9"
                fill="#654A4E"
              >
                12 400
              </text>
              <line x1="580" y1="90" x2="580" y2="58" strokeWidth="1" />
              <path d="M580 58 l-4 8 h8 z" />
              <text
                x="575"
                y="108"
                fontFamily="IBM Plex Mono, ui-monospace, monospace"
                fontSize="9"
                fill="#654A4E"
              >
                N
              </text>
            </g>

            <g data-assemble-stamp opacity="0">
              <rect
                x="520"
                y="340"
                width="88"
                height="42"
                fill="none"
                stroke="#916A70"
                strokeWidth="1.2"
              />
              <text
                x="564"
                y="358"
                textAnchor="middle"
                fontFamily="IBM Plex Mono, ui-monospace, monospace"
                fontSize="9"
                fill="#916A70"
                letterSpacing="1.4"
              >
                DEMO
              </text>
              <text
                x="564"
                y="372"
                textAnchor="middle"
                fontFamily="IBM Plex Mono, ui-monospace, monospace"
                fontSize="8"
                fill="#654A4E"
              >
                not lodged
              </text>
            </g>
          </svg>

          <p className="arc-sheet-caption arc-mono">
            fictional Auckland terrace · sample business · details fictional
          </p>
        </div>
      </div>
    </section>
  );
}
