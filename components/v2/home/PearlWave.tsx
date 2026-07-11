'use client';

import * as React from 'react';

/**
 * The homepage hero art, pearl direction: a slow particle wave — thousands of
 * small dots forming a dune that breathes — pearl grey in the troughs,
 * champagne gold on the crests, on the site's warm paper. Pure canvas 2D, no
 * WebGL, so it paints instantly everywhere.
 *
 * prefers-reduced-motion → a single still frame of the same wave.
 * Offscreen or hidden tab → the loop pauses.
 */

// Trough → crest colour ramp (pearl → champagne). Matches the OS surfaces:
// #e6e2d6 pearl, #c2a15f / #b3945a champagne — the locked accent family.
const PEARL = [201, 195, 181] as const;
const GOLD = [194, 161, 95] as const;
const GOLD_DEEP = [179, 148, 90] as const;

const ROWS = 26;
const TWO_PI = Math.PI * 2;

function mix(a: readonly number[], b: readonly number[], t: number) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ] as const;
}

/** The wave surface: layered sines, x in px, depth 0 (back) → 1 (front). */
function surface(x: number, depth: number, t: number) {
  return (
    Math.sin(x * 0.0021 + t * 0.42 + depth * 3.1) +
    0.55 * Math.sin(x * 0.0043 - t * 0.27 + depth * 5.4) +
    0.3 * Math.sin(x * 0.009 + t * 0.61 + depth * 1.7)
  );
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
) {
  ctx.clearRect(0, 0, w, h);

  // A whisper of champagne light behind the crest line.
  const glow = ctx.createRadialGradient(w * 0.62, h * 0.52, 0, w * 0.62, h * 0.52, Math.max(w, h) * 0.5);
  glow.addColorStop(0, 'rgba(214, 191, 148, 0.16)');
  glow.addColorStop(1, 'rgba(214, 191, 148, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const cols = Math.max(48, Math.floor(w / 9));
  for (let j = 0; j < ROWS; j += 1) {
    const depth = j / (ROWS - 1);
    // Perspective: back rows sit higher, move less, and stay faint.
    const baseY = h * (0.3 + 0.52 * depth * depth);
    const amp = h * (0.035 + 0.085 * depth);
    const radius = 0.7 + 1.9 * depth;
    const rowAlpha = 0.16 + 0.5 * depth;

    for (let i = 0; i <= cols; i += 1) {
      const x = (i / cols) * w;
      const n = surface(x, depth, t); // ≈ -1.85 … 1.85
      const y = baseY - n * amp;
      const crest = Math.min(1, Math.max(0, (n + 1.2) / 2.4));
      const [r, g, b] =
        crest > 0.72
          ? mix(GOLD, GOLD_DEEP, (crest - 0.72) / 0.28)
          : mix(PEARL, GOLD, crest / 0.72);
      // Crests glint a little brighter; troughs recede.
      const alpha = rowAlpha * (0.55 + 0.45 * crest);

      ctx.beginPath();
      ctx.arc(x, y, radius * (0.8 + 0.35 * crest), 0, TWO_PI);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
      ctx.fill();
    }
  }
}

export function PearlWave() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let onscreen = true;
    const t0 = performance.now();

    const size = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = (now: number) => {
      drawFrame(ctx, w, h, (now - t0) / 1000);
      raf = requestAnimationFrame(frame);
    };

    // Reduced motion gets one considered still; everyone else gets the tide.
    const still = () => drawFrame(ctx, w, h, 2.6);
    const start = () => {
      cancelAnimationFrame(raf);
      if (reduced.matches) {
        still();
      } else if (visible && onscreen) {
        raf = requestAnimationFrame(frame);
      }
    };

    size();
    start();

    const ro = new ResizeObserver(() => {
      size();
      if (reduced.matches || !visible || !onscreen) still();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      onscreen = entry?.isIntersecting ?? true;
      start();
    });
    io.observe(canvas);

    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
      start();
    };
    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', start);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      reduced.removeEventListener('change', start);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  );
}
