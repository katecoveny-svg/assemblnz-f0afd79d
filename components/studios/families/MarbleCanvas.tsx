'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type p5Type from 'p5';
import type { RendererProps } from '@/lib/generative-art/families';
import { useDragAdjust } from '@/lib/generative-art/use-drag-adjust';
import { MARBLE_PALETTES, type MarblePalette } from '@/lib/generative-art/families/marble';
import { backgroundById } from '@/lib/generative-art/backgrounds';
import { stampWatermarkOnCanvas } from '@/lib/generative-art/watermark';
import { canvasScaledToBlob } from '@/lib/generative-art/render-utils';

/**
 * Suminagashi / ebru marbling in a single pure-JS composition:
 *   1. Build N concentric ink rings (drops). Each ring is a set of anchor
 *      points around a circle centred at (cx, cy) with radius r.
 *   2. For every subsequent drop, DISPLACE every existing anchor in the
 *      canvas outward from that drop's centre (mass conservation — you're
 *      pushing the water sideways to make room).
 *   3. Apply straight comb sweeps: each anchor gets shifted along the
 *      sweep direction by a smooth function of its perpendicular distance
 *      from the sweep line. The result is the classic marbled combing.
 *   4. Render each ring as a closed curve of the resulting anchor points.
 * Deterministic per seed — same input = same swirl.
 */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Ring {
  colour: string;
  ringIndex: number;
  totalRings: number;
  pts: Float32Array; // xy pairs
}

export function MarbleCanvas({ presetId, values, seed, background, onAdjust, onExportersReady }: RendererProps) {
  const drag = useDragAdjust(onAdjust, (nx, ny) => ({ combStrength: Number((0.2 + nx * 2.3).toFixed(2)), drops: Math.round(3 + (1 - ny) * 37) }));
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5Type | null>(null);
  const [ready, setReady] = useState(false);

  const basePalette = MARBLE_PALETTES[presetId] ?? MARBLE_PALETTES.suminagashi;
  const bg = backgroundById(background);
  const palette: MarblePalette = useMemo(() => {
    if (!bg) return basePalette;
    return { ground: bg.ground, inks: basePalette.inks };
  }, [basePalette, bg]);

  const stateRef = useRef({ values, palette, seed, presetId });
  stateRef.current = { values, palette, seed, presetId };
  const versionRef = useRef(0);
  useEffect(() => { versionRef.current += 1; }, [values, seed, presetId, background]);

  useEffect(() => {
    let disposed = false;
    let instance: p5Type | null = null;

    async function init() {
      const mod = await import('p5');
      const P5 = (mod as { default: typeof p5Type }).default;
      if (disposed || !containerRef.current) return;

      instance = new P5((p: p5Type) => {
        let w = 0, h = 0;
        let lastVersion = -1;

        function render() {
          const { values: v, palette: pal, seed: s } = stateRef.current;
          const rand = mulberry32(s);
          const dropCount = Math.max(3, Math.round(v.drops ?? 22));
          const combCount = Math.max(0, Math.round(v.combs ?? 5));
          const ringDensity = Math.max(3, Math.round(v.ringDensity ?? 15));
          const combStrength = v.combStrength ?? 1.4;
          const alpha = v.alpha ?? 0.75;
          const stroke = v.stroke ?? 0.9;
          const pointsPerRing = 220;

          const rings: Ring[] = [];

          function displaceForDrop(cx: number, cy: number, r: number) {
            // Move every existing anchor outward from (cx, cy) so the drop
            // "makes room" as ink displaces water.
            const r2 = r * r;
            for (const ring of rings) {
              const pts = ring.pts;
              for (let i = 0; i < pts.length; i += 2) {
                const dx = pts[i] - cx;
                const dy = pts[i + 1] - cy;
                const d2 = dx * dx + dy * dy;
                const factor = Math.sqrt(1 + r2 / d2);
                pts[i] = cx + dx * factor;
                pts[i + 1] = cy + dy * factor;
              }
            }
          }

          function addDrop(cx: number, cy: number, r: number, colour: string) {
            displaceForDrop(cx, cy, r);
            for (let ri = 0; ri < ringDensity; ri++) {
              const rr = (r * (ri + 1)) / ringDensity;
              const pts = new Float32Array(pointsPerRing * 2);
              for (let k = 0; k < pointsPerRing; k++) {
                const a = (k / pointsPerRing) * Math.PI * 2;
                pts[k * 2] = cx + Math.cos(a) * rr;
                pts[k * 2 + 1] = cy + Math.sin(a) * rr;
              }
              rings.push({ colour, ringIndex: ri, totalRings: ringDensity, pts });
            }
          }

          function applyComb(x0: number, y0: number, dx: number, dy: number, teeth: number, teethSpacing: number, strength: number) {
            // Straight sweep — each anchor gets displaced by a smooth
            // function of perpendicular distance to the closest tooth line.
            // Cotangent-like fall-off keeps the swirl sharp near teeth.
            const nx = -dy;
            const ny = dx;
            for (const ring of rings) {
              const pts = ring.pts;
              for (let i = 0; i < pts.length; i += 2) {
                const px = pts[i] - x0;
                const py = pts[i + 1] - y0;
                const along = px * dx + py * dy;
                const across = px * nx + py * ny;
                // Distance to the nearest tooth in the perpendicular axis.
                const toothIdx = Math.round(across / teethSpacing);
                if (Math.abs(toothIdx) > teeth) continue;
                const nearest = toothIdx * teethSpacing;
                const dist = across - nearest;
                const fall = Math.exp(-(dist * dist) / (teethSpacing * teethSpacing * 0.15));
                const shift = fall * strength * teethSpacing;
                pts[i] += dx * shift;
                pts[i + 1] += dy * shift;
                // Slight compensating pull so combs don't drift the whole field.
                pts[i] -= (dist / teethSpacing) * dx * fall * 0.1;
                pts[i + 1] -= (dist / teethSpacing) * dy * fall * 0.1;
              }
            }
          }

          // Populate drops — first one centred, then random-ish.
          const maxR = Math.min(w, h) * 0.42;
          addDrop(w / 2, h / 2, maxR, pal.inks[0]);
          for (let i = 1; i < dropCount; i++) {
            const cx = rand() * w;
            const cy = rand() * h;
            const r = (0.06 + rand() * 0.20) * Math.min(w, h);
            const colour = pal.inks[i % pal.inks.length];
            addDrop(cx, cy, r, colour);
          }

          // Combs — alternate horizontal / vertical sweeps.
          for (let c = 0; c < combCount; c++) {
            const angle = c % 2 === 0 ? 0 : Math.PI / 2;
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);
            const across = c % 2 === 0 ? h * (0.2 + rand() * 0.6) : w * (0.2 + rand() * 0.6);
            const x0 = c % 2 === 0 ? 0 : across;
            const y0 = c % 2 === 0 ? across : 0;
            const teeth = 8;
            const teethSpacing = Math.min(w, h) * 0.06;
            applyComb(x0, y0, dx, dy, teeth, teethSpacing, combStrength);
          }

          // Sort rings so the innermost drape draws last (bright veins on top).
          rings.sort((a, b) => a.ringIndex - b.ringIndex);

          // Paint.
          p.background(pal.ground);
          for (const ring of rings) {
            const [r, g, b] = hexToRgb(ring.colour);
            // Innermost ring solid; outer rings translucent so drop cores read.
            const ringT = 1 - ring.ringIndex / ring.totalRings;
            const ringAlpha = alpha * (0.6 + 0.4 * ringT);
            p.stroke(r, g, b, Math.round(ringAlpha * 255));
            p.strokeWeight(stroke);
            p.noFill();
            p.beginShape();
            const pts = ring.pts;
            for (let i = 0; i < pts.length; i += 2) p.vertex(pts[i], pts[i + 1]);
            p.endShape(p.CLOSE);
          }
        }

        p.setup = () => {
          const rect = containerRef.current!.getBoundingClientRect();
          w = Math.max(320, rect.width);
          h = Math.max(320, rect.height);
          p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
          p.createCanvas(w, h);
          p.noLoop();
          render();
          setReady(true);
        };
        p.windowResized = () => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;
          w = Math.max(320, rect.width);
          h = Math.max(320, rect.height);
          p.resizeCanvas(w, h);
          render();
        };
        p.draw = () => {
          if (versionRef.current !== lastVersion) {
            lastVersion = versionRef.current;
            render();
          }
        };
      }, containerRef.current);
      p5Ref.current = instance;
    }
    init();
    return () => {
      disposed = true;
      instance?.remove();
      p5Ref.current = null;
    };
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => p5Ref.current?.redraw());
    return () => cancelAnimationFrame(raf);
  }, [values, seed, background, presetId]);

  const png = useCallback(async (): Promise<Blob | null> => {
    const canvas = containerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return null;
    const stamped = stampWatermarkOnCanvas(canvas, palette.ground);
    return await new Promise((resolve) => stamped.toBlob((b) => resolve(b), 'image/png'));
  }, [palette.ground]);

  const renderAtSize = useCallback(
    async (w: number, h: number): Promise<Blob | null> => {
      const canvas = containerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
      if (!canvas) return null;
      return canvasScaledToBlob(canvas, w, h, palette.ground);
    },
    [palette.ground],
  );

  useEffect(() => {
    onExportersReady?.({ png, renderAtSize });
  }, [onExportersReady, png, renderAtSize]);

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        {...drag}
        className="relative mx-auto ga-canvas w-full touch-none cursor-crosshair overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]"
        style={{ background: palette.ground }}
      />
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[10.5px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
          floating ink…
        </div>
      )}
    </div>
  );
}
