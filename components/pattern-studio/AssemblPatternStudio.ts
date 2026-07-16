/**
 * assembl Pattern Studio — one canvas engine, five modes.
 *
 * Built to the contract in AssemblPatternStudioComponent.tsx (Kate's handoff):
 * halftone · dither · ascii · particles · particleText, each driven by a shared
 * animation field (wave / pulse / ripple / spiral / noise / off) and an optional
 * pointer. Framework-agnostic — the React wrapper owns reduced-motion, tab
 * visibility and lazy-mount; this class owns the drawing only.
 *
 * Colours are passed in as concrete values (canvas can't resolve CSS vars); the
 * wrapper resolves assembl's --a-* tokens before handing them over, so the one
 * restrained accent stays the single source of truth.
 */

export type PatternMode = 'halftone' | 'dither' | 'ascii' | 'particles' | 'particleText';
export type PatternEffect = 'wave' | 'pulse' | 'ripple' | 'spiral' | 'noise' | 'off';
export type DotShape = 'circle' | 'square' | 'diamond' | 'triangle';
export type ParticleShape = 'circle' | 'square' | 'diamond' | 'spark';

export interface PatternSettings {
  mode: PatternMode;
  density: number;
  size: number;
  intensity: number;
  dotShape: DotShape;
  animationEffect: PatternEffect;
  morphing: boolean;
  count: number;
  particleShape: ParticleShape;
  connectLines: boolean;
  connectDistance: number;
  mouseMode: 'repel' | 'attract' | 'connect';
  gravity: number;
  glow: boolean;
  turbulence: number;
  words: string[];
  holdSeconds: number;
  speed: number;
  mouseInteractive: boolean;
  backgroundColor: string;
  foregroundColor: string;
  accentColor: string;
  isAnimated: boolean;
}

const DEFAULTS: PatternSettings = {
  mode: 'halftone',
  density: 35,
  size: 35,
  intensity: 65,
  dotShape: 'circle',
  animationEffect: 'wave',
  morphing: false,
  count: 150,
  particleShape: 'circle',
  connectLines: true,
  connectDistance: 120,
  mouseMode: 'repel',
  gravity: 0,
  glow: true,
  turbulence: 30,
  words: ['assembl'],
  holdSeconds: 2.2,
  speed: 1.2,
  mouseInteractive: true,
  backgroundColor: '#ffffff',
  foregroundColor: '#3f7373',
  accentColor: '#b8964f',
  isAnimated: true,
};

const ASCII_RAMP = ' .:-=+*#%@';
const TWO_PI = Math.PI * 2;
// 4×4 Bayer matrix (normalised) for ordered dithering.
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16));

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  accent: boolean;
  seed: number;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Cheap deterministic value noise (hash-based), good enough for texture. */
function hashNoise(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hashNoise(xi, yi);
  const b = hashNoise(xi + 1, yi);
  const c = hashNoise(xi, yi + 1);
  const d = hashNoise(xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, v), v);
}

export class AssemblPatternStudio {
  private canvas: HTMLCanvasElement | null;
  private ctx: CanvasRenderingContext2D | null;
  private s: PatternSettings;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private raf = 0;
  private t = 0;
  private lastFrame = 0;
  private particles: Particle[] = [];
  private targets: Array<{ x: number; y: number }> = [];
  private wordIndex = 0;
  private wordTimer = 0;
  private pointer = { x: -9999, y: -9999, active: false };
  private resizeObserver: ResizeObserver | null = null;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerLeave: () => void;

  constructor(target: string | HTMLCanvasElement, settings: Partial<PatternSettings> = {}) {
    this.canvas =
      typeof target === 'string'
        ? (document.getElementById(target) as HTMLCanvasElement | null)
        : target;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.s = { ...DEFAULTS, ...settings };

    this.boundPointerMove = (e: PointerEvent) => {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = e.clientX - rect.left;
      this.pointer.y = e.clientY - rect.top;
      this.pointer.active = true;
    };
    this.boundPointerLeave = () => {
      this.pointer.active = false;
      this.pointer.x = -9999;
      this.pointer.y = -9999;
    };

    if (!this.canvas || !this.ctx) return;

    this.resize();
    this.buildScene();
    this.attach();
    this.start();
  }

  private attach() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement ?? this.canvas;
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
        this.buildScene();
        if (!this.s.isAnimated) this.renderFrame(this.t);
      });
      this.resizeObserver.observe(parent);
    }
    if (this.s.mouseInteractive) {
      this.canvas.addEventListener('pointermove', this.boundPointerMove);
      this.canvas.addEventListener('pointerleave', this.boundPointerLeave);
    }
  }

  private resize() {
    if (!this.canvas || !this.ctx) return;
    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : this.canvas.getBoundingClientRect();
    this.dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    this.width = Math.max(1, Math.round(rect.width));
    this.height = Math.max(1, Math.round(rect.height));
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /** (Re)build particles or text targets for the current mode. */
  private buildScene() {
    if (this.s.mode === 'particleText') {
      this.buildTextTargets(this.s.words[this.wordIndex % Math.max(1, this.s.words.length)] ?? '');
      this.buildParticles(true);
    } else if (this.s.mode === 'particles') {
      this.buildParticles(false);
    } else {
      this.particles = [];
      this.targets = [];
    }
  }

  private buildParticles(toTargets: boolean) {
    const n = Math.max(1, Math.round(this.s.count));
    // When motion is off (reduced-motion / static), snap straight to the
    // letter points so the still frame shows the assembled word, not scatter.
    const snap = toTargets && !this.s.isAnimated;
    const next: Particle[] = [];
    for (let i = 0; i < n; i += 1) {
      const existing = this.particles[i];
      const target = this.targets.length ? this.targets[i % this.targets.length] : null;
      const tx = toTargets && target ? target.x : 0;
      const ty = toTargets && target ? target.y : 0;
      next.push({
        x: snap && target ? tx : existing ? existing.x : Math.random() * this.width,
        y: snap && target ? ty : existing ? existing.y : Math.random() * this.height,
        vx: existing ? existing.vx : (Math.random() - 0.5) * 0.6,
        vy: existing ? existing.vy : (Math.random() - 0.5) * 0.6,
        tx,
        ty,
        accent: i % 9 === 0,
        seed: existing ? existing.seed : Math.random() * 1000,
      });
    }
    this.particles = next;
  }

  private buildTextTargets(word: string) {
    if (!word || this.width < 2 || this.height < 2) {
      this.targets = [];
      return;
    }
    const off = document.createElement('canvas');
    off.width = this.width;
    off.height = this.height;
    const octx = off.getContext('2d');
    if (!octx) {
      this.targets = [];
      return;
    }
    // Fit the word to ~78% of the width.
    let fontSize = Math.round(this.height * 0.42);
    const family = "'Cormorant Garamond', Georgia, serif";
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.font = `700 ${fontSize}px ${family}`;
    const maxW = this.width * 0.78;
    let measured = octx.measureText(word).width;
    if (measured > maxW) {
      fontSize = Math.max(12, Math.floor((fontSize * maxW) / measured));
      octx.font = `700 ${fontSize}px ${family}`;
      measured = octx.measureText(word).width;
    }
    octx.fillStyle = '#000';
    octx.fillText(word, this.width / 2, this.height / 2);

    const image = octx.getImageData(0, 0, this.width, this.height).data;
    // Sample gap chosen so the number of hit points lands near `count`.
    const inkGuess = Math.max(1, measured * fontSize * 0.55);
    const gap = Math.max(3, Math.round(Math.sqrt(inkGuess / Math.max(1, this.s.count))));
    const pts: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < this.height; y += gap) {
      for (let x = 0; x < this.width; x += gap) {
        const alpha = image[(y * this.width + x) * 4 + 3];
        if (alpha > 128) pts.push({ x, y });
      }
    }
    this.targets = pts;
  }

  /** Shared 0..1 animation field for the grid modes. */
  private field(x: number, y: number, t: number): number {
    const nx = x / this.width;
    const ny = y / this.height;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const dx = x - (this.pointer.active ? this.pointer.x : cx);
    const dy = y - (this.pointer.active ? this.pointer.y : cy);
    const dist = Math.sqrt(dx * dx + dy * dy);
    switch (this.s.animationEffect) {
      case 'pulse':
        return clamp01(0.5 + 0.5 * Math.sin(dist * 0.03 - t * 2));
      case 'ripple':
        return clamp01(0.5 + 0.5 * Math.sin(dist * 0.06 - t * 3));
      case 'spiral': {
        const ang = Math.atan2(dy, dx);
        return clamp01(0.5 + 0.5 * Math.sin(ang * 3 + dist * 0.03 - t * 2));
      }
      case 'noise':
        return clamp01(valueNoise(nx * 6 + t * 0.5, ny * 6));
      case 'off':
        return clamp01(0.5 + 0.5 * Math.sin((nx + ny) * Math.PI));
      case 'wave':
      default:
        return clamp01(0.5 + 0.5 * Math.sin(nx * 6 + Math.cos(ny * 5 + t) + t));
    }
  }

  private start() {
    this.stopLoop();
    this.lastFrame = 0;
    if (this.s.isAnimated) {
      const loop = (now: number) => {
        if (!this.lastFrame) this.lastFrame = now;
        const dt = Math.min(0.05, (now - this.lastFrame) / 1000);
        this.lastFrame = now;
        this.t += dt * this.s.speed;
        this.step(dt);
        this.renderFrame(this.t);
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    } else {
      this.renderFrame(this.t);
    }
  }

  private stopLoop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /** Advance particle simulation (particles / particleText). */
  private step(dt: number) {
    if (this.s.mode !== 'particles' && this.s.mode !== 'particleText') return;
    const turb = this.s.turbulence / 100;
    const toText = this.s.mode === 'particleText';

    if (toText && this.s.words.length > 1) {
      this.wordTimer += dt;
      if (this.wordTimer >= this.s.holdSeconds) {
        this.wordTimer = 0;
        this.wordIndex = (this.wordIndex + 1) % this.s.words.length;
        this.buildTextTargets(this.s.words[this.wordIndex] ?? '');
        for (let i = 0; i < this.particles.length; i += 1) {
          const target = this.targets.length ? this.targets[i % this.targets.length] : null;
          if (target) {
            this.particles[i].tx = target.x;
            this.particles[i].ty = target.y;
          }
        }
      }
    }

    for (const p of this.particles) {
      if (toText) {
        // Spring toward the letter point, with a little life.
        p.vx += (p.tx - p.x) * 0.06;
        p.vy += (p.ty - p.y) * 0.06;
        p.vx *= 0.82;
        p.vy *= 0.82;
        p.vx += Math.sin(this.t * 1.3 + p.seed) * turb * 0.3;
        p.vy += Math.cos(this.t * 1.1 + p.seed) * turb * 0.3;
      } else {
        // Free drift shaped by the effect field + turbulence + gravity.
        const f = this.field(p.x, p.y, this.t);
        const ang = f * TWO_PI;
        p.vx += Math.cos(ang) * 0.12 + (valueNoise(p.x * 0.01, p.y * 0.01 + this.t) - 0.5) * turb;
        p.vy += Math.sin(ang) * 0.12 + (valueNoise(p.y * 0.01, p.x * 0.01 - this.t) - 0.5) * turb;
        p.vy += this.s.gravity * 0.02;
        p.vx *= 0.94;
        p.vy *= 0.94;
      }

      // Pointer influence.
      if (this.s.mouseInteractive && this.pointer.active && this.s.mouseMode !== 'connect') {
        const dx = p.x - this.pointer.x;
        const dy = p.y - this.pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 140 * 140 && d2 > 0.01) {
          const force = (1 - Math.sqrt(d2) / 140) * 2.4;
          const dir = this.s.mouseMode === 'attract' ? -1 : 1;
          const inv = 1 / Math.sqrt(d2);
          p.vx += dx * inv * force * dir;
          p.vy += dy * inv * force * dir;
        }
      }

      p.x += p.vx;
      p.y += p.vy;

      if (!toText) {
        if (p.x < 0) p.x += this.width;
        else if (p.x > this.width) p.x -= this.width;
        if (p.y < 0) p.y += this.height;
        else if (p.y > this.height) p.y -= this.height;
      }
    }
  }

  private renderFrame(t: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.fillStyle = this.s.backgroundColor;
    ctx.fillRect(0, 0, this.width, this.height);
    switch (this.s.mode) {
      case 'dither':
        this.drawDither(ctx, t);
        break;
      case 'ascii':
        this.drawAscii(ctx, t);
        break;
      case 'particles':
      case 'particleText':
        this.drawParticles(ctx);
        break;
      case 'halftone':
      default:
        this.drawHalftone(ctx, t);
        break;
    }
  }

  private gap(): number {
    return Math.max(4, Math.round(lerp(46, 6, clamp01(this.s.density / 100))));
  }

  private drawHalftone(ctx: CanvasRenderingContext2D, t: number) {
    const gap = this.gap();
    const maxR = lerp(1.5, gap * 0.62, clamp01(this.s.size / 100)) * (this.s.intensity / 100 + 0.4);
    for (let y = gap / 2; y < this.height; y += gap) {
      for (let x = gap / 2; x < this.width; x += gap) {
        const v = this.field(x, y, t);
        const r = v * maxR;
        if (r < 0.35) continue;
        ctx.fillStyle = v > 0.82 ? this.s.accentColor : this.s.foregroundColor;
        this.dot(ctx, x, y, r);
      }
    }
  }

  private drawDither(ctx: CanvasRenderingContext2D, t: number) {
    const gap = Math.max(3, Math.round(this.gap() * 0.5));
    const cell = gap * 0.9;
    ctx.fillStyle = this.s.foregroundColor;
    for (let y = 0, gy = 0; y < this.height; y += gap, gy += 1) {
      for (let x = 0, gx = 0; x < this.width; x += gap, gx += 1) {
        const v = this.field(x + gap / 2, y + gap / 2, t) * (this.s.intensity / 100 + 0.35);
        const threshold = BAYER[gy % 4][gx % 4];
        if (v > threshold) {
          ctx.fillStyle = v > 0.9 ? this.s.accentColor : this.s.foregroundColor;
          ctx.fillRect(x, y, cell, cell);
        }
      }
    }
  }

  private drawAscii(ctx: CanvasRenderingContext2D, t: number) {
    const gap = Math.max(8, Math.round(lerp(30, 9, clamp01(this.s.density / 100))));
    const fontSize = lerp(9, gap * 1.15, clamp01(this.s.size / 100));
    ctx.font = `${fontSize}px 'Space Mono', ui-monospace, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let y = gap / 2; y < this.height; y += gap) {
      for (let x = gap / 2; x < this.width; x += gap) {
        const v = this.field(x, y, t) * (this.s.intensity / 100 + 0.35);
        const idx = Math.min(ASCII_RAMP.length - 1, Math.floor(clamp01(v) * (ASCII_RAMP.length - 1)));
        const ch = ASCII_RAMP[idx];
        if (ch === ' ') continue;
        ctx.fillStyle = v > 0.85 ? this.s.accentColor : this.s.foregroundColor;
        ctx.fillText(ch, x, y);
      }
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    const r = lerp(0.8, 3.4, clamp01(this.s.size / 100));
    if (this.s.glow) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.s.foregroundColor;
    }
    // Connection lines (particles mode only, bounded for perf).
    if (
      this.s.connectLines &&
      this.s.mode === 'particles' &&
      this.particles.length <= 320
    ) {
      const maxD = this.s.connectDistance;
      const maxD2 = maxD * maxD;
      ctx.lineWidth = 0.6;
      for (let i = 0; i < this.particles.length; i += 1) {
        const a = this.particles[i];
        for (let j = i + 1; j < this.particles.length; j += 1) {
          const b = this.particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxD2) {
            const alpha = (1 - Math.sqrt(d2) / maxD) * 0.5;
            ctx.strokeStyle = this.rgba(this.s.foregroundColor, alpha);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }
    for (const p of this.particles) {
      ctx.fillStyle = p.accent ? this.s.accentColor : this.s.foregroundColor;
      this.particleMark(ctx, p.x, p.y, r);
    }
    ctx.shadowBlur = 0;
  }

  private dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    switch (this.s.dotShape) {
      case 'square':
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
        break;
      case 'diamond':
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-r, -r, r * 2, r * 2);
        ctx.restore();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r, y + r);
        ctx.lineTo(x - r, y + r);
        ctx.closePath();
        ctx.fill();
        break;
      case 'circle':
      default:
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TWO_PI);
        ctx.fill();
        break;
    }
  }

  private particleMark(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    switch (this.s.particleShape) {
      case 'square':
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
        break;
      case 'diamond':
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-r, -r, r * 2, r * 2);
        ctx.restore();
        break;
      case 'spark':
        ctx.fillRect(x - r * 0.35, y - r * 1.6, r * 0.7, r * 3.2);
        ctx.fillRect(x - r * 1.6, y - r * 0.35, r * 3.2, r * 0.7);
        break;
      case 'circle':
      default:
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TWO_PI);
        ctx.fill();
        break;
    }
  }

  /** Convert a #rrggbb / rgb() colour to rgba() with the given alpha. */
  private rgba(color: string, alpha: number): string {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const full =
        hex.length === 3
          ? hex
              .split('')
              .map((c) => c + c)
              .join('')
          : hex;
      const r = parseInt(full.slice(0, 2), 16);
      const g = parseInt(full.slice(2, 4), 16);
      const b = parseInt(full.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  }

  // ── Public API (used by the React wrapper) ────────────────────────────
  updateSettings(settings: Partial<PatternSettings>) {
    const prev = this.s;
    this.s = { ...this.s, ...settings };
    if (!this.canvas || !this.ctx) return;

    const modeChanged = prev.mode !== this.s.mode;
    const countChanged = prev.count !== this.s.count;
    const wordsChanged = prev.words.join('') !== this.s.words.join('');
    if (modeChanged || countChanged || wordsChanged) {
      if (wordsChanged || modeChanged) {
        this.wordIndex = 0;
        this.wordTimer = 0;
      }
      this.buildScene();
    }

    // Pointer listeners follow the mouseInteractive flag.
    if (prev.mouseInteractive !== this.s.mouseInteractive) {
      if (this.s.mouseInteractive) {
        this.canvas.addEventListener('pointermove', this.boundPointerMove);
        this.canvas.addEventListener('pointerleave', this.boundPointerLeave);
      } else {
        this.canvas.removeEventListener('pointermove', this.boundPointerMove);
        this.canvas.removeEventListener('pointerleave', this.boundPointerLeave);
        this.boundPointerLeave();
      }
    }

    if (prev.isAnimated !== this.s.isAnimated) {
      // Stopping: re-snap particleText to the word so the still frame reads.
      if (!this.s.isAnimated) this.buildScene();
      this.start();
    } else if (!this.s.isAnimated) {
      this.renderFrame(this.t);
    }
  }

  destroy() {
    this.stopLoop();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.canvas) {
      this.canvas.removeEventListener('pointermove', this.boundPointerMove);
      this.canvas.removeEventListener('pointerleave', this.boundPointerLeave);
    }
    this.particles = [];
    this.targets = [];
  }
}

export default AssemblPatternStudio;
