'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RendererProps } from '@/lib/generative-art/families';
import { useDragAdjust } from '@/lib/generative-art/use-drag-adjust';
import { REACTION_PALETTES } from '@/lib/generative-art/families/reaction';
import { backgroundById } from '@/lib/generative-art/backgrounds';
import { stampWatermarkOnCanvas } from '@/lib/generative-art/watermark';
import { textToMask } from '@/lib/generative-art/text-shape';

/**
 * Gray-Scott reaction-diffusion implemented on the GPU:
 *   - Two ping-pong RGBA textures store chemicals A and B in R and G.
 *   - The step shader reads a 3x3 stencil, applies the Laplacian, then
 *     writes updated (A, B) into the swap texture.
 *   - The display shader maps B intensity through the palette gradient.
 *   - `stepsPerFrame` iterations happen per RAF tick to advance time
 *     faster than one-pixel-per-frame.
 *
 * All of this runs on the GPU in a single fragment shader — the CPU only
 * uploads the seed once. No external libraries.
 */

interface State {
  gl: WebGL2RenderingContext;
  displayCanvas: HTMLCanvasElement;
  simCanvas: HTMLCanvasElement;
  simSize: { w: number; h: number };
  stepProgram: WebGLProgram;
  drawProgram: WebGLProgram;
  fbA: WebGLFramebuffer;
  fbB: WebGLFramebuffer;
  texA: WebGLTexture;
  texB: WebGLTexture;
  vao: WebGLVertexArrayObject;
  activeIsA: boolean;
  raf: number;
  running: boolean;
}

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error('shader compile failed: ' + info);
  }
  return s;
}
function linkProgram(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const v = compileShader(gl, gl.VERTEX_SHADER, vs);
  const f = compileShader(gl, gl.FRAGMENT_SHADER, fs);
  const p = gl.createProgram()!;
  gl.attachShader(p, v);
  gl.attachShader(p, f);
  gl.linkProgram(p);
  gl.deleteShader(v);
  gl.deleteShader(f);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(p);
    gl.deleteProgram(p);
    throw new Error('program link failed: ' + info);
  }
  return p;
}

const VS = `#version 300 es
layout(location = 0) in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const STEP_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_tex;
uniform vec2 u_texel;
uniform float u_dA;
uniform float u_dB;
uniform float u_feed;
uniform float u_kill;
uniform float u_dt;

void main() {
  vec2 uv = v_uv;
  vec4 c  = texture(u_tex, uv);
  float a = c.r;
  float b = c.g;

  vec4 up    = texture(u_tex, uv + vec2(0.0,  u_texel.y));
  vec4 down  = texture(u_tex, uv + vec2(0.0, -u_texel.y));
  vec4 left  = texture(u_tex, uv + vec2(-u_texel.x, 0.0));
  vec4 right = texture(u_tex, uv + vec2( u_texel.x, 0.0));
  vec4 ul    = texture(u_tex, uv + vec2(-u_texel.x,  u_texel.y));
  vec4 ur    = texture(u_tex, uv + vec2( u_texel.x,  u_texel.y));
  vec4 dl    = texture(u_tex, uv + vec2(-u_texel.x, -u_texel.y));
  vec4 dr    = texture(u_tex, uv + vec2( u_texel.x, -u_texel.y));

  // Weighted Laplacian (Gray & Scott's stencil).
  float lapA = 0.2 * (up.r + down.r + left.r + right.r)
             + 0.05 * (ul.r + ur.r + dl.r + dr.r) - a;
  float lapB = 0.2 * (up.g + down.g + left.g + right.g)
             + 0.05 * (ul.g + ur.g + dl.g + dr.g) - b;

  float abb = a * b * b;
  float na = a + (u_dA * lapA - abb + u_feed * (1.0 - a)) * u_dt;
  float nb = b + (u_dB * lapB + abb - (u_kill + u_feed) * b) * u_dt;

  outColor = vec4(clamp(na, 0.0, 1.0), clamp(nb, 0.0, 1.0), 0.0, 1.0);
}`;

const DRAW_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_tex;
uniform vec3 u_low;
uniform vec3 u_high;
uniform vec3 u_edge;
uniform vec3 u_ground;
uniform float u_contrast;

void main() {
  float b = texture(u_tex, v_uv).g;
  // Contrast curve — nudge toward 0/1 for more graphic edges.
  b = clamp(pow(b, 1.0 / u_contrast), 0.0, 1.0);
  // Three-stop gradient: ground → low → high, with a hint of edge at the
  // top so pattern boundaries read.
  vec3 c;
  if (b < 0.35) {
    c = mix(u_ground, u_low, b / 0.35);
  } else if (b < 0.75) {
    c = mix(u_low, u_high, (b - 0.35) / 0.40);
  } else {
    c = mix(u_high, u_edge, (b - 0.75) / 0.25);
  }
  outColor = vec4(c, 1.0);
}`;

export function ReactionCanvas({ presetId, values, seed, background, text, onAdjust, onExportersReady }: RendererProps) {
  const drag = useDragAdjust(onAdjust, (nx, ny) => ({ feed: Number((0.01 + nx * 0.09).toFixed(3)), kill: Number((0.04 + (1 - ny) * 0.035).toFixed(3)) }));
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<State | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const basePalette = REACTION_PALETTES[presetId] ?? REACTION_PALETTES.coral;
  const bg = backgroundById(background);
  const palette = useMemo(() => {
    if (!bg) return basePalette;
    // When the user picked a global background, use its ground; keep the
    // family palette for the pattern colours (else the piece loses identity).
    return { ...basePalette, ground: bg.ground };
  }, [basePalette, bg]);

  const paramsRef = useRef({ values, palette, text, seed });
  paramsRef.current = { values, palette, text, seed };

  const seedPattern = useCallback(async (state: State) => {
    const { gl, simSize } = state;
    const { w, h } = simSize;
    const density = paramsRef.current.values.seedDensity ?? 0.35;
    const seedInt = paramsRef.current.seed;
    // Deterministic PRNG so the same seed lands the same starting pattern.
    let rngState = (seedInt >>> 0) || 1;
    const rand = () => {
      rngState = (rngState * 16807) % 2147483647;
      return rngState / 2147483647;
    };

    // Chemical A everywhere (mostly), chemical B in a text mask (if given)
    // or in a few random blobs (otherwise).
    const pixels = new Uint8Array(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      pixels[i * 4] = 255;
      pixels[i * 4 + 1] = 0;
      pixels[i * 4 + 2] = 0;
      pixels[i * 4 + 3] = 255;
    }

    const currentText = paramsRef.current.text?.trim() ?? '';
    if (currentText) {
      const mask = await textToMask(currentText, w, h);
      for (let i = 0; i < mask.length; i++) {
        if (mask[i]) {
          pixels[i * 4 + 1] = 255; // full B where letter pixels sit
        }
      }
    } else {
      // A handful of random blobs — enough for the reaction to catch.
      const blobCount = Math.max(3, Math.round(density * 40));
      for (let b = 0; b < blobCount; b++) {
        const cx = Math.floor(rand() * w);
        const cy = Math.floor(rand() * h);
        const r = 4 + Math.floor(rand() * 10);
        for (let y = -r; y <= r; y++) {
          for (let x = -r; x <= r; x++) {
            if (x * x + y * y > r * r) continue;
            const px = ((cx + x) % w + w) % w;
            const py = ((cy + y) % h + h) % h;
            const idx = (py * w + px) * 4;
            pixels[idx + 1] = 255;
          }
        }
      }
    }

    // texSubImage2D updates the existing texture data without redefining
    // the storage — which is what texImage2D would do and which would
    // invalidate the framebuffer color attachments.
    gl.bindTexture(gl.TEXTURE_2D, state.texA);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.bindTexture(gl.TEXTURE_2D, state.texB);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    state.activeIsA = true;
  }, []);

  useEffect(() => {
    let disposed = false;
    const host = hostRef.current;
    if (!host) return;

    const displayCanvas = document.createElement('canvas');
    displayCanvas.style.width = '100%';
    displayCanvas.style.height = '100%';
    displayCanvas.style.display = 'block';
    host.appendChild(displayCanvas);

    const rect = host.getBoundingClientRect();
    // Cap the sim resolution — the shader is O(w*h*steps); running full
    // retina on a 720² canvas at 20 steps/frame melts a laptop.
    const displayW = Math.max(320, Math.round(rect.width));
    const displayH = Math.max(320, Math.round(rect.height));
    const simMax = 512;
    const scale = Math.min(1, simMax / Math.max(displayW, displayH));
    const simW = Math.max(128, Math.round(displayW * scale));
    const simH = Math.max(128, Math.round(displayH * scale));
    displayCanvas.width = displayW;
    displayCanvas.height = displayH;

    const glMaybe = displayCanvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });
    if (!glMaybe) {
      setError('WebGL2 is not available in this browser.');
      return;
    }
    const gl: WebGL2RenderingContext = glMaybe;

    let stepProgram: WebGLProgram;
    let drawProgram: WebGLProgram;
    try {
      stepProgram = linkProgram(gl, VS, STEP_FS);
      drawProgram = linkProgram(gl, VS, DRAW_FS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'shader failure');
      return;
    }

    // Full-screen quad — attribute location is fixed via layout(location=0)
    // in the vertex shader, so no bindAttribLocation dance is needed.
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // Verify the framebuffers are complete — if not, drawArrays silently
    // does nothing and we spend an hour wondering why the canvas is empty.
    for (const [name, fb] of [['fbA-check', null], ['fbB-check', null]] as const) {
      // (placeholder — real check runs below after we allocate them)
      void name; void fb;
    }

    const makeTex = (): WebGLTexture => {
      const t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, simW, simH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      return t;
    };
    const texA = makeTex();
    const texB = makeTex();

    const makeFb = (tex: WebGLTexture): WebGLFramebuffer => {
      const fb = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      if (status !== gl.FRAMEBUFFER_COMPLETE) {
        // eslint-disable-next-line no-console
        console.error('Reaction framebuffer not complete: 0x' + status.toString(16));
      }
      return fb;
    };
    const fbA = makeFb(texA);
    const fbB = makeFb(texB);

    const state: State = {
      gl,
      displayCanvas,
      simCanvas: displayCanvas,
      simSize: { w: simW, h: simH },
      stepProgram,
      drawProgram,
      fbA,
      fbB,
      texA,
      texB,
      vao,
      activeIsA: true,
      raf: 0,
      running: true,
    };
    stateRef.current = state;

    void seedPattern(state).then(() => {
      if (disposed) return;
      setReady(true);
    });

    const stepLoc = {
      u_tex: gl.getUniformLocation(stepProgram, 'u_tex'),
      u_texel: gl.getUniformLocation(stepProgram, 'u_texel'),
      u_dA: gl.getUniformLocation(stepProgram, 'u_dA'),
      u_dB: gl.getUniformLocation(stepProgram, 'u_dB'),
      u_feed: gl.getUniformLocation(stepProgram, 'u_feed'),
      u_kill: gl.getUniformLocation(stepProgram, 'u_kill'),
      u_dt: gl.getUniformLocation(stepProgram, 'u_dt'),
    };
    const drawLoc = {
      u_tex: gl.getUniformLocation(drawProgram, 'u_tex'),
      u_low: gl.getUniformLocation(drawProgram, 'u_low'),
      u_high: gl.getUniformLocation(drawProgram, 'u_high'),
      u_edge: gl.getUniformLocation(drawProgram, 'u_edge'),
      u_ground: gl.getUniformLocation(drawProgram, 'u_ground'),
      u_contrast: gl.getUniformLocation(drawProgram, 'u_contrast'),
    };

    function tick() {
      if (!state.running) return;
      const { values: v, palette: pal } = paramsRef.current;
      const steps = Math.max(1, Math.round(v.stepsPerFrame ?? 12));
      const feed = v.feed ?? 0.062;
      const kill = v.kill ?? 0.062;

      gl.useProgram(stepProgram);
      gl.uniform2f(stepLoc.u_texel, 1 / simW, 1 / simH);
      gl.uniform1f(stepLoc.u_dA, 1.0);
      gl.uniform1f(stepLoc.u_dB, 0.5);
      gl.uniform1f(stepLoc.u_feed, feed);
      gl.uniform1f(stepLoc.u_kill, kill);
      gl.uniform1f(stepLoc.u_dt, 1.0);
      gl.uniform1i(stepLoc.u_tex, 0);
      gl.bindVertexArray(vao);
      gl.viewport(0, 0, simW, simH);

      for (let i = 0; i < steps; i++) {
        const readTex = state.activeIsA ? texA : texB;
        const writeFb = state.activeIsA ? fbB : fbA;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, readTex);
        gl.bindFramebuffer(gl.FRAMEBUFFER, writeFb);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        state.activeIsA = !state.activeIsA;
      }

      // Draw to canvas.
      const [lr, lg, lb] = hexToVec3(pal.low);
      const [hr, hg, hb] = hexToVec3(pal.high);
      const [er, eg, ebv] = hexToVec3(pal.edge);
      const [gr, gg_, gb] = hexToVec3(pal.ground);
      gl.useProgram(drawProgram);
      gl.uniform3f(drawLoc.u_low, lr, lg, lb);
      gl.uniform3f(drawLoc.u_high, hr, hg, hb);
      gl.uniform3f(drawLoc.u_edge, er, eg, ebv);
      gl.uniform3f(drawLoc.u_ground, gr, gg_, gb);
      gl.uniform1f(drawLoc.u_contrast, v.contrast ?? 1.1);
      gl.uniform1i(drawLoc.u_tex, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, state.activeIsA ? texA : texB);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, displayW, displayH);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      state.raf = requestAnimationFrame(tick);
    }

    state.raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      state.running = false;
      cancelAnimationFrame(state.raf);
      try {
        gl.deleteProgram(stepProgram);
        gl.deleteProgram(drawProgram);
        gl.deleteTexture(texA);
        gl.deleteTexture(texB);
        gl.deleteFramebuffer(fbA);
        gl.deleteFramebuffer(fbB);
        gl.deleteVertexArray(vao);
      } catch {
        /* ignore */
      }
      try {
        host.removeChild(displayCanvas);
      } catch {
        /* ignore */
      }
      stateRef.current = null;
    };
  }, [seedPattern]);

  // Reseed when the preset, seed, or text changes.
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    void seedPattern(state);
  }, [presetId, seed, text, seedPattern]);

  const png = useCallback(async (): Promise<Blob | null> => {
    const state = stateRef.current;
    if (!state) return null;
    const stamped = stampWatermarkOnCanvas(state.displayCanvas, palette.ground);
    return await new Promise((resolve) => stamped.toBlob((b) => resolve(b), 'image/png'));
  }, [palette.ground]);

  const renderAtSize = useCallback(
    async (w: number, h: number): Promise<Blob | null> => {
      const state = stateRef.current;
      if (!state) return null;
      // Simple approach: draw the current display canvas into a target
      // canvas at the requested pixel size. Because RD's visible output is
      // the composited palette (not the sim texture directly), a scale
      // preserves the piece. This mirrors how Flow / Constellation export.
      const out = document.createElement('canvas');
      out.width = w;
      out.height = h;
      const ctx = out.getContext('2d');
      if (!ctx) return null;
      ctx.fillStyle = palette.ground;
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const src = state.displayCanvas;
      const srcAspect = src.width / src.height;
      const dstAspect = w / h;
      let dw: number;
      let dh: number;
      if (srcAspect > dstAspect) { dw = w; dh = w / srcAspect; }
      else                       { dh = h; dw = h * srcAspect; }
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      ctx.drawImage(src, dx, dy, dw, dh);
      const stamped = stampWatermarkOnCanvas(out, palette.ground);
      return await new Promise((resolve) => stamped.toBlob((b) => resolve(b), 'image/png'));
    },
    [palette.ground],
  );

  useEffect(() => {
    onExportersReady?.({ png, renderAtSize });
  }, [onExportersReady, png, renderAtSize]);

  return (
    <div className="relative w-full">
      <div
        ref={hostRef}
        {...drag}
        className="relative mx-auto ga-canvas w-full touch-none cursor-crosshair overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]"
        style={{ background: palette.ground }}
      />
      {!ready && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[12px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
          seeding chemistry…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center font-mono text-[12px] text-[color:var(--text-primary)]">
          {error}
        </div>
      )}
    </div>
  );
}
