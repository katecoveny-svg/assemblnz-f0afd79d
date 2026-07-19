'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type p5Type from 'p5';
import type { RendererProps } from '@/lib/generative-art/families';
import { CONSTELLATION_PALETTES } from '@/lib/generative-art/families/constellation';
import { stampWatermarkOnCanvas } from '@/lib/generative-art/watermark';
import { canvasScaledToBlob } from '@/lib/generative-art/render-utils';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

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

export function ConstellationCanvas({ presetId, values, seed, onExportersReady }: RendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5Type | null>(null);
  const [ready, setReady] = useState(false);
  const palette = CONSTELLATION_PALETTES[presetId] ?? CONSTELLATION_PALETTES.paper;
  const stateRef = useRef({ values, palette, seed });
  stateRef.current = { values, palette, seed };

  useEffect(() => {
    let disposed = false;
    let instance: p5Type | null = null;
    async function init() {
      const mod = await import('p5');
      const P5 = (mod as { default: typeof p5Type }).default;
      if (disposed || !containerRef.current) return;

      instance = new P5((p: p5Type) => {
        let nodes: Node[] = [];
        let w = 0;
        let h = 0;

        function respawn() {
          const { values: v, seed: s } = stateRef.current;
          const rand = mulberry32(s ^ 0xd1c3);
          const target = Math.max(4, Math.round(v.nodes ?? 110));
          nodes = Array.from({ length: target }, () => ({
            x: rand() * w,
            y: rand() * h,
            vx: (rand() - 0.5) * 0.6,
            vy: (rand() - 0.5) * 0.6,
          }));
        }

        p.setup = () => {
          const r = containerRef.current!.getBoundingClientRect();
          w = Math.max(320, r.width);
          h = Math.max(320, r.height);
          p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
          p.createCanvas(w, h);
          respawn();
          setReady(true);
        };
        p.windowResized = () => {
          const r = containerRef.current?.getBoundingClientRect();
          if (!r) return;
          w = Math.max(320, r.width);
          h = Math.max(320, r.height);
          p.resizeCanvas(w, h);
          respawn();
        };
        p.draw = () => {
          const { values: v, palette: pal } = stateRef.current;
          const targetCount = Math.max(4, Math.round(v.nodes ?? 110));
          if (nodes.length !== targetCount) respawn();

          p.background(pal.ground);
          const radius = v.radius ?? 110;
          const radius2 = radius * radius;
          const speed = v.speed ?? 0.55;
          const nodeSize = v.nodeSize ?? 3.5;
          const edgeAlpha = v.edgeAlpha ?? 0.28;
          const edgeWidth = v.edgeWidth ?? 0.9;

          // Advance + wrap.
          for (const n of nodes) {
            n.x += n.vx * speed;
            n.y += n.vy * speed;
            if (n.x < -10) n.x = w + 10;
            else if (n.x > w + 10) n.x = -10;
            if (n.y < -10) n.y = h + 10;
            else if (n.y > h + 10) n.y = -10;
          }

          // Edges — draw first so nodes sit on top.
          const [er, eg, eb] = hexToRgb(pal.edge);
          const [esr, esg, esb] = hexToRgb(pal.edgeStrong);
          p.strokeWeight(edgeWidth);
          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const dx = nodes[i].x - nodes[j].x;
              const dy = nodes[i].y - nodes[j].y;
              const d2 = dx * dx + dy * dy;
              if (d2 > radius2) continue;
              // Closer nodes get the strong edge colour, farther get the soft.
              const t = d2 / radius2;
              const fade = 1 - t;
              const rr = Math.round(er + (esr - er) * fade);
              const gg = Math.round(eg + (esg - eg) * fade);
              const bb = Math.round(eb + (esb - eb) * fade);
              p.stroke(rr, gg, bb, Math.round(edgeAlpha * 255 * fade));
              p.line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            }
          }

          // Nodes.
          const [nr, ng, nb] = hexToRgb(pal.node);
          p.noStroke();
          p.fill(nr, ng, nb, 235);
          for (const n of nodes) p.circle(n.x, n.y, nodeSize);
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
        className="relative mx-auto aspect-[0.92/1] w-full max-w-[720px] overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]"
        style={{ background: palette.ground }}
      />
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[10.5px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
          assembling…
        </div>
      )}
    </div>
  );
}
