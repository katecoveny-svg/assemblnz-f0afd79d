/**
 * AssemblPatternStudio — one engine, five modes.
 *
 * Faithful TypeScript port of Kate's canonical AssemblPatternStudio.js:
 *   halftone     — animated dot-grid
 *   dither       — animated ordered (Bayer) dither texture
 *   ascii        — the same field rendered as monospace characters
 *   particles    — free-roaming constellation particle system
 *   particleText — a particle cloud that assembles into words, holds, disperses, repeats
 *
 * Six field effects (wave, pulse, ripple, spiral, noise, off) and the dot /
 * particle shape sets are hers, unchanged. Two site adaptations: the word
 * sampler uses the brand display face (Cormorant) rather than Poppins, and a
 * reduced-motion static frame snaps particleText straight to the assembled
 * word (the React wrapper forces isAnimated:false there — content stays,
 * motion doesn't). Colours are passed in concrete; the wrapper resolves the
 * --a-* tokens so the one accent stays the single source of truth.
 */

export type PatternMode = 'halftone' | 'dither' | 'ascii' | 'particles' | 'particleText';
export type PatternEffect = 'wave' | 'pulse' | 'ripple' | 'spiral' | 'noise' | 'off';
export type DotShape = 'circle' | 'square' | 'diamond' | 'triangle';
export type ParticleShape = 'circle' | 'square' | 'diamond' | 'spark';
export type MouseMode = 'repel' | 'attract' | 'connect';

export interface PatternSettings {
  mode: PatternMode;
  density: number;
  size: number;
  intensity: number;
  speed: number;
  dotShape: DotShape;
  animationEffect: PatternEffect;
  morphing: boolean;
  mouseInteractive: boolean;
  count: number;
  particleShape: ParticleShape;
  connectLines: boolean;
  connectDistance: number;
  mouseMode: MouseMode;
  gravity: number;
  glow: boolean;
  turbulence: number;
  words: string[];
  holdSeconds: number;
  backgroundColor: string;
  foregroundColor: string;
  accentColor: string;
  isAnimated: boolean;
}

export const ASSEMBL_PRESETS: Record<string, { backgroundColor: string; foregroundColor: string }> = {
  'Cream / Teal': { backgroundColor: '#f7f3ea', foregroundColor: '#2d5f6b' },
  'Dark / Gold': { backgroundColor: '#141413', foregroundColor: '#e8b04b' },
  'Cream / Orange': { backgroundColor: '#f7f3ea', foregroundColor: '#c8623a' },
  'Dark / Teal': { backgroundColor: '#141413', foregroundColor: '#2d5f6b' },
  'Pure Black/White': { backgroundColor: '#000000', foregroundColor: '#ffffff' },
  'Pure White/Black': { backgroundColor: '#ffffff', foregroundColor: '#000000' },
};

const DEFAULTS: PatternSettings = {
  mode: 'halftone',
  density: 35,
  size: 35,
  intensity: 65,
  speed: 1.2,
  dotShape: 'circle',
  animationEffect: 'wave',
  morphing: false,
  mouseInteractive: true,
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
  backgroundColor: '#ffffff',
  foregroundColor: '#3f7373',
  accentColor: '#b8964f',
  isAnimated: true,
};

const ASCII_RAMP = ' .:-=+*#%@';
const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16));
// Brand display face for the word sampler (Kate's engine used Poppins).
const TEXT_FONT = "'Cormorant Garamond', Georgia, serif";

interface Dot {
  x: number;
  y: number;
  col: number;
  row: number;
  seed: number;
  idx: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  accent?: boolean;
}

type TextState = 'cloud' | 'assembling' | 'holding' | 'dispersing';

export class AssemblPatternStudio {
  static get presets() {
    return ASSEMBL_PRESETS;
  }

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private settings: PatternSettings;
  private time = 0;
  private mouse = { x: -9999, y: -9999, active: false };
  private width = 0;
  private height = 0;
  private spacing = 10;
  private maxRadius = 4;
  private dots: Dot[] = [];
  private particles: Particle[] = [];
  private wordTargets: Array<Array<[number, number]>> = [];
  private wordIndex = 0;
  private textState: TextState = 'cloud';
  private textStateTime = 0;
  private raf: number | null = null;
  private lastFrame: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private readonly onResize = () => {
    this.resizeCanvas();
    this.rebuildForMode();
    if (!this.settings.isAnimated) this.renderFrame(this.time);
  };
  private readonly onMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
    this.mouse.active = true;
  };
  private readonly onMouseLeave = () => {
    this.mouse.active = false;
  };
  private readonly tick = (now: number) => {
    const rawDt = Math.min(64, now - (this.lastFrame ?? now));
    this.lastFrame = now;
    const dt = rawDt / 16.67;
    this.time += rawDt * 0.001 * this.settings.speed;

    if (this.settings.mode === 'particles') this.updateFreeParticles(dt);
    else if (this.settings.mode === 'particleText') this.updateTextParticles(dt, rawDt / 1000);

    this.renderFrame(this.time);
    this.raf = requestAnimationFrame(this.tick);
  };

  constructor(target: string | HTMLCanvasElement, options: Partial<PatternSettings> = {}) {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!(el instanceof HTMLCanvasElement)) {
      throw new Error(`AssemblPatternStudio: canvas "${String(target)}" not found`);
    }
    this.canvas = el;
    const ctx = el.getContext('2d');
    if (!ctx) throw new Error('AssemblPatternStudio: 2D context unavailable');
    this.ctx = ctx;
    this.settings = { ...DEFAULTS, ...options };

    this.attachListeners();
    this.resizeCanvas();
    this.rebuildForMode();
    if (!this.settings.isAnimated) this.prepareStatic();
    this.renderFrame(0);
    if (this.settings.isAnimated) this.startLoop();
  }

  // ── public API ──────────────────────────────────────────────────────
  updateSettings(partial: Partial<PatternSettings>) {
    const prevMode = this.settings.mode;
    const prevDensity = this.settings.density;
    const prevCount = this.settings.count;
    const prevWords = this.settings.words.join('');
    const prevMouse = this.settings.mouseInteractive;
    const wasAnimated = this.settings.isAnimated;

    this.settings = { ...this.settings, ...partial };

    const modeChanged = this.settings.mode !== prevMode;
    const gridChanged = this.settings.density !== prevDensity;
    const countChanged = this.settings.count !== prevCount;
    const wordsChanged = this.settings.words.join('') !== prevWords;

    if (modeChanged || gridChanged || countChanged || wordsChanged) this.rebuildForMode();

    if (prevMouse !== this.settings.mouseInteractive && !this.settings.mouseInteractive) {
      this.mouse.active = false;
    }

    if (this.settings.isAnimated && !wasAnimated) {
      this.startLoop();
    } else if (!this.settings.isAnimated && wasAnimated) {
      this.stopLoop();
    }

    if (!this.settings.isAnimated) {
      this.prepareStatic();
      this.renderFrame(this.time);
    }
  }

  destroy() {
    this.stopLoop();
    window.removeEventListener('resize', this.onResize);
    this.resizeObserver?.disconnect();
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
  }

  // ── setup / resize / mouse ──────────────────────────────────────────
  private attachListeners() {
    window.addEventListener('resize', this.onResize);
    if (typeof ResizeObserver !== 'undefined' && this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(this.canvas.parentElement);
    }
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mouseleave', this.onMouseLeave);
  }

  private resizeCanvas() {
    const parent = this.canvas.parentElement;
    const w = parent ? parent.clientWidth : this.canvas.clientWidth || 600;
    const h = parent ? parent.clientHeight : this.canvas.clientHeight || 400;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = w;
    this.height = h;
    this.canvas.width = Math.max(1, Math.floor(w * dpr));
    this.canvas.height = Math.max(1, Math.floor(h * dpr));
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private rebuildForMode() {
    const { mode } = this.settings;
    if (mode === 'halftone' || mode === 'dither' || mode === 'ascii') this.buildGrid();
    else if (mode === 'particles') this.initFreeParticles();
    else if (mode === 'particleText') this.initTextParticles();
  }

  /** Reduced-motion / static: snap particleText straight to the assembled word. */
  private prepareStatic() {
    if (this.settings.mode !== 'particleText' || !this.particles.length) return;
    const targets = this.wordTargets[this.wordIndex] ?? [];
    if (!targets.length) return;
    this.textState = 'holding';
    this.textStateTime = 0;
    const cx = this.width / 2;
    const cy = this.height / 2;
    for (let i = 0; i < this.particles.length; i += 1) {
      const t = targets[i % targets.length];
      this.particles[i].x = cx + t[0];
      this.particles[i].y = cy + t[1];
      this.particles[i].vx = 0;
      this.particles[i].vy = 0;
    }
  }

  // ── shared grid (halftone / dither / ascii) ─────────────────────────
  private buildGrid() {
    const { density, size } = this.settings;
    const spacing = Math.max(6, 60 - (density / 100) * 48);
    this.spacing = spacing;
    this.maxRadius = spacing * (0.18 + (size / 100) * 0.42);

    this.dots = [];
    const cols = Math.ceil(this.width / spacing) + 1;
    const rows = Math.ceil(this.height / spacing) + 1;
    let idx = 0;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        this.dots.push({
          x: col * spacing,
          y: row * spacing,
          col,
          row,
          seed: Math.abs(Math.sin(idx * 12.9898)) % 1,
          idx: idx++,
        });
      }
    }
  }

  private fieldValue(dot: Dot, t: number): number {
    const { animationEffect, intensity } = this.settings;
    const amp = intensity / 100;
    const freq = 0.045;
    switch (animationEffect) {
      case 'wave':
        return (
          0.5 +
          0.5 * Math.sin(dot.x * freq + t * 1.6) * Math.sin(dot.y * freq + t * 1.1) * amp +
          (1 - amp) * 0.5
        );
      case 'pulse':
        return 0.5 + 0.5 * Math.sin(t * 2 + dot.idx * 0.0001) * amp;
      case 'ripple': {
        const cx = this.mouse.active && this.settings.mouseInteractive ? this.mouse.x : this.width / 2;
        const cy = this.mouse.active && this.settings.mouseInteractive ? this.mouse.y : this.height / 2;
        const d = Math.sqrt((dot.x - cx) ** 2 + (dot.y - cy) ** 2);
        return 0.5 + 0.5 * Math.sin(d * 0.05 - t * 2.4) * amp;
      }
      case 'spiral': {
        const cx = this.mouse.active && this.settings.mouseInteractive ? this.mouse.x : this.width / 2;
        const cy = this.mouse.active && this.settings.mouseInteractive ? this.mouse.y : this.height / 2;
        const dx = dot.x - cx;
        const dy = dot.y - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        return 0.5 + 0.5 * Math.sin(angle * 3 + d * 0.04 - t * 2.2) * amp;
      }
      case 'noise':
        return (
          0.5 +
          0.5 *
            (Math.sin(dot.seed * 6.28 + t * 1.3) * 0.6 +
              Math.sin(dot.x * 0.01 + dot.y * 0.013 + t * 0.7) * 0.4) *
            amp
        );
      case 'off':
      default:
        return amp;
    }
  }

  private mouseBoost(dot: Dot): number {
    if (!this.settings.mouseInteractive || !this.mouse.active) return 0;
    const dx = dot.x - this.mouse.x;
    const dy = dot.y - this.mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = 160;
    if (dist > radius) return 0;
    return (1 - dist / radius) * 0.9;
  }

  private drawDotShape(x: number, y: number, r: number, shape: DotShape) {
    if (r <= 0.15) return;
    const ctx = this.ctx;
    ctx.beginPath();
    switch (shape) {
      case 'square':
        ctx.rect(x - r, y - r, r * 2, r * 2);
        break;
      case 'diamond':
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r, y);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - r, y);
        ctx.closePath();
        break;
      case 'triangle': {
        const h = r * 1.6;
        ctx.moveTo(x, y - h * 0.6);
        ctx.lineTo(x + h * 0.55, y + h * 0.4);
        ctx.lineTo(x - h * 0.55, y + h * 0.4);
        ctx.closePath();
        break;
      }
      case 'circle':
      default:
        ctx.arc(x, y, r, 0, Math.PI * 2);
        break;
    }
    ctx.fill();
  }

  private renderHalftone(t: number) {
    const ctx = this.ctx;
    const { backgroundColor, foregroundColor, dotShape, morphing } = this.settings;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = foregroundColor;

    const SHAPE_CYCLE: DotShape[] = ['circle', 'square', 'diamond', 'triangle'];
    let shapeA = dotShape;
    let shapeB = dotShape;
    let mix = 0;
    if (morphing) {
      const cyclePos = (t * 0.15) % SHAPE_CYCLE.length;
      const i = Math.floor(cyclePos);
      shapeA = SHAPE_CYCLE[i];
      shapeB = SHAPE_CYCLE[(i + 1) % SHAPE_CYCLE.length];
      mix = cyclePos - i;
    }

    for (const dot of this.dots) {
      const field = this.fieldValue(dot, t);
      const boost = this.mouseBoost(dot);
      const r = Math.max(0, Math.min(this.maxRadius, this.maxRadius * field + boost * this.maxRadius * 0.6));
      if (morphing) {
        ctx.globalAlpha = mix < 0.5 ? 1 - mix * 2 : 0;
        if (ctx.globalAlpha > 0) this.drawDotShape(dot.x, dot.y, r, shapeA);
        ctx.globalAlpha = mix < 0.5 ? mix * 2 : 1;
        this.drawDotShape(dot.x, dot.y, r, shapeB);
        ctx.globalAlpha = 1;
      } else {
        this.drawDotShape(dot.x, dot.y, r, shapeA);
      }
    }
  }

  private renderDither(t: number) {
    const ctx = this.ctx;
    const { backgroundColor, foregroundColor } = this.settings;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = foregroundColor;
    const cell = this.spacing;
    for (const dot of this.dots) {
      const field = this.fieldValue(dot, t);
      const threshold = BAYER_4[dot.row % 4][dot.col % 4];
      if (field > threshold) {
        ctx.fillRect(dot.x - cell / 2, dot.y - cell / 2, cell * 0.92, cell * 0.92);
      }
    }
  }

  private renderAscii(t: number) {
    const ctx = this.ctx;
    const { backgroundColor, foregroundColor } = this.settings;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = foregroundColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.max(8, this.spacing * 0.95)}px 'Space Mono', 'Courier New', monospace`;
    for (const dot of this.dots) {
      const field = this.fieldValue(dot, t);
      const boost = this.mouseBoost(dot);
      const v = Math.max(0, Math.min(1, field + boost * 0.5));
      const charIdx = Math.floor(v * (ASCII_RAMP.length - 1));
      const ch = ASCII_RAMP[charIdx];
      if (ch !== ' ') ctx.fillText(ch, dot.x, dot.y);
    }
  }

  // ── free particles (constellation) ──────────────────────────────────
  private initFreeParticles() {
    const { count } = this.settings;
    const baseR = 2.5;
    this.particles = [];
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = this.settings.speed * (0.3 + Math.random() * 0.7);
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: Math.max(1, baseR + (Math.random() - 0.5) * 1.5),
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  private updateFreeParticles(dt: number) {
    const { gravity, mouseInteractive, mouseMode } = this.settings;
    const mouseRadius = 140;
    for (const p of this.particles) {
      p.vy += gravity * 0.02 * dt;
      if (mouseInteractive && this.mouse.active && (mouseMode === 'repel' || mouseMode === 'attract')) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
        if (dist < mouseRadius) {
          const force = (1 - dist / mouseRadius) * 0.6;
          const dir = mouseMode === 'repel' ? 1 : -1;
          p.vx += (dx / dist) * force * dir * dt;
          p.vy += (dy / dist) * force * dir * dt;
        }
      }
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.height + 10;
      if (p.y > this.height + 10) p.y = -10;
    }
  }

  private renderFreeParticles() {
    const ctx = this.ctx;
    const { backgroundColor, foregroundColor, particleShape, connectLines, connectDistance, glow } =
      this.settings;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, this.width, this.height);

    if (connectLines) {
      ctx.lineWidth = 1;
      for (let i = 0; i < this.particles.length; i += 1) {
        for (let j = i + 1; j < this.particles.length; j += 1) {
          const a = this.particles[i];
          const b = this.particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < connectDistance) {
            ctx.strokeStyle = this.withAlpha(foregroundColor, (1 - dist / connectDistance) * 0.35);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    ctx.fillStyle = foregroundColor;
    ctx.shadowBlur = glow ? 8 : 0;
    ctx.shadowColor = foregroundColor;
    for (const p of this.particles) {
      this.drawParticleShape(p.x, p.y, p.r, particleShape, Math.atan2(p.vy, p.vx));
    }
    ctx.shadowBlur = 0;
  }

  // ── particle text (cloud <-> word) ──────────────────────────────────
  private sampleWordPoints(word: string): Array<[number, number]> {
    const size = 900;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const cctx = c.getContext('2d');
    if (!cctx) return [];
    cctx.fillStyle = '#000';
    cctx.fillRect(0, 0, size, size);
    cctx.fillStyle = '#fff';
    cctx.textAlign = 'center';
    cctx.textBaseline = 'middle';
    let fontSize = 160;
    cctx.font = `600 ${fontSize}px ${TEXT_FONT}`;
    while (cctx.measureText(word).width > size * 0.82 && fontSize > 16) {
      fontSize -= 4;
      cctx.font = `600 ${fontSize}px ${TEXT_FONT}`;
    }
    cctx.fillText(word, size / 2, size / 2);
    const data = cctx.getImageData(0, 0, size, size).data;
    const pts: Array<[number, number]> = [];
    const step = 6;
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        const idx = (y * size + x) * 4;
        if (data[idx] > 128) pts.push([x - size / 2, y - size / 2]);
      }
    }
    return pts;
  }

  private initTextParticles() {
    const { count, words } = this.settings;
    const list = words && words.length ? words : ['assembl'];
    this.wordTargets = list.map((w) => this.sampleWordPoints(w));
    this.wordIndex = 0;
    this.textState = 'cloud';
    this.textStateTime = 0;

    this.particles = [];
    for (let i = 0; i < count; i += 1) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        r: 2 + Math.random() * 1.5,
        accent: Math.random() < 0.15,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  private updateTextParticles(dt: number, realDtSeconds: number) {
    const { speed, turbulence, holdSeconds } = this.settings;
    const cx = this.width / 2;
    const cy = this.height / 2;

    this.textStateTime += realDtSeconds;
    const cloudSecs = 1.5;
    const assembleSecs = 2.2;
    const disperseSecs = 1.3;

    if (this.textState === 'cloud' && this.textStateTime > cloudSecs) {
      this.textState = 'assembling';
      this.textStateTime = 0;
    } else if (this.textState === 'assembling' && this.textStateTime > assembleSecs) {
      this.textState = 'holding';
      this.textStateTime = 0;
    } else if (this.textState === 'holding' && this.textStateTime > holdSeconds) {
      this.textState = 'dispersing';
      this.textStateTime = 0;
    } else if (this.textState === 'dispersing' && this.textStateTime > disperseSecs) {
      this.textState = 'cloud';
      this.textStateTime = 0;
      this.wordIndex = (this.wordIndex + 1) % this.wordTargets.length;
    }

    const targets = this.wordTargets[this.wordIndex] ?? [];
    const jitterAmt = turbulence / 100;

    for (let i = 0; i < this.particles.length; i += 1) {
      const p = this.particles[i];
      if (this.textState === 'assembling' || this.textState === 'holding') {
        const t = targets.length ? targets[i % targets.length] : [0, 0];
        const tx = cx + t[0];
        const ty = cy + t[1];
        const dx = tx - p.x;
        const dy = ty - p.y;
        const d = Math.hypot(dx, dy) + 0.001;
        const mag = Math.min(d * 0.06, 3.2) * speed;
        p.vx = (p.vx + (dx / d) * mag) * 0.85;
        p.vy = (p.vy + (dy / d) * mag) * 0.85;
        if (this.textState === 'holding') {
          p.vx += (Math.random() - 0.5) * 0.15 * jitterAmt;
          p.vy += (Math.random() - 0.5) * 0.15 * jitterAmt;
        }
      } else {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const d = Math.hypot(dx, dy) + 0.001;
        p.vx += (-dy / d) * 0.03 * speed + (Math.random() - 0.5) * 0.2 * jitterAmt;
        p.vy += (dx / d) * 0.03 * speed + (Math.random() - 0.5) * 0.2 * jitterAmt;
        p.vx *= 0.97;
        p.vy *= 0.97;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const margin = 40;
      if (p.x < -margin) p.x = this.width + margin;
      if (p.x > this.width + margin) p.x = -margin;
      if (p.y < -margin) p.y = this.height + margin;
      if (p.y > this.height + margin) p.y = -margin;
    }
  }

  private renderTextParticles() {
    const ctx = this.ctx;
    const { backgroundColor, foregroundColor, accentColor, particleShape, glow } = this.settings;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.shadowBlur = glow ? 6 : 0;
    for (const p of this.particles) {
      ctx.fillStyle = p.accent ? accentColor : foregroundColor;
      ctx.shadowColor = ctx.fillStyle;
      this.drawParticleShape(p.x, p.y, p.r, particleShape, p.phase);
    }
    ctx.shadowBlur = 0;
  }

  private drawParticleShape(x: number, y: number, r: number, shape: ParticleShape, angle: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    switch (shape) {
      case 'square':
        ctx.rect(x - r, y - r, r * 2, r * 2);
        ctx.fill();
        return;
      case 'diamond':
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r, y);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - r, y);
        ctx.closePath();
        ctx.fill();
        return;
      case 'spark': {
        for (let i = 0; i < 4; i += 1) {
          const a = angle + (Math.PI / 2) * i;
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(a) * r * 2.2, y + Math.sin(a) * r * 2.2);
        }
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = Math.max(1, r * 0.5);
        ctx.stroke();
        return;
      }
      case 'circle':
      default:
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
  }

  private withAlpha(hexColor: string, alpha: number): string {
    const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hexColor || '');
    if (!m) return hexColor;
    let hex = m[1];
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((ch) => ch + ch)
        .join('');
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ── loop ────────────────────────────────────────────────────────────
  private startLoop() {
    if (this.raf) return;
    this.lastFrame = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  private stopLoop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  private renderFrame(t: number) {
    switch (this.settings.mode) {
      case 'dither':
        this.renderDither(t);
        break;
      case 'ascii':
        this.renderAscii(t);
        break;
      case 'particles':
        this.renderFreeParticles();
        break;
      case 'particleText':
        this.renderTextParticles();
        break;
      case 'halftone':
      default:
        this.renderHalftone(t);
    }
  }
}

export default AssemblPatternStudio;
