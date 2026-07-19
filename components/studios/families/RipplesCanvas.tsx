'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RendererProps } from '@/lib/generative-art/families';
import { RIPPLES_PALETTES, type RipplesPalette } from '@/lib/generative-art/families/ripples';
import { backgroundById } from '@/lib/generative-art/backgrounds';
import { stampWatermarkOnCanvas } from '@/lib/generative-art/watermark';

/**
 * 2D wave equation on a pond via WebGL2 ping-pong. The state texture's R
 * channel holds the current height u(x, y, t), G channel holds the
 * previous step u(x, y, t-1). Step shader computes:
 *   new = (2u - prev + c²∇²u) · damping
 * Drops perturb the texture between steps; the display shader shades the
 * height field with a two-stop palette + edge tint on the interference
 * fringes.
 */

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error('shader compile: ' + info);
  }
  return s;
}
function link(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
  return p;
}

const VS = `#version 300 es
layout(location=0) in vec2 a_position;
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
uniform float u_damping;
uniform vec4 u_drop; // xy = uv, z = radius, w = strength (0 = none)

void main() {
  vec4 c = texture(u_tex, v_uv);
  float u  = c.r;
  float pu = c.g;
  float up    = texture(u_tex, v_uv + vec2(0.0,  u_texel.y)).r;
  float dn    = texture(u_tex, v_uv + vec2(0.0, -u_texel.y)).r;
  float lf    = texture(u_tex, v_uv + vec2(-u_texel.x, 0.0)).r;
  float rt    = texture(u_tex, v_uv + vec2( u_texel.x, 0.0)).r;
  // Discrete wave equation (c² dt² / dx² = 0.5 for stability).
  float lap = up + dn + lf + rt - 4.0 * u;
  float next = (2.0 * u - pu + 0.5 * lap) * u_damping;

  // Apply drop, if any, this step.
  if (u_drop.w > 0.0) {
    float d = distance(v_uv, u_drop.xy);
    if (d < u_drop.z) {
      float pulse = cos((d / u_drop.z) * 3.14159265) * 0.5 + 0.5;
      next += pulse * u_drop.w * 0.4;
    }
  }
  outColor = vec4(clamp(next, -1.0, 1.0), u, 0.0, 1.0);
}`;

const DRAW_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_tex;
uniform vec3 u_ground;
uniform vec3 u_crest;
uniform vec3 u_trough;
uniform vec3 u_edge;
uniform float u_contrast;

void main() {
  float u = texture(u_tex, v_uv).r;
  // Contrast for the height amplitude — pushes small ripples brighter.
  float amp = clamp(pow(abs(u), 1.0 / u_contrast), 0.0, 1.0);
  vec3 c = u > 0.0 ? mix(u_ground, u_crest, amp) : mix(u_ground, u_trough, amp);
  // Edge tint — where the local variance is high (interference fringes).
  vec3 edgeTint = mix(c, u_edge, min(amp * 0.4, 0.4));
  c = mix(c, edgeTint, smoothstep(0.35, 1.0, amp));
  outColor = vec4(c, 1.0);
}`;

export function RipplesCanvas({ presetId, values, seed, background, onExportersReady }: RendererProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const basePalette = RIPPLES_PALETTES[presetId] ?? RIPPLES_PALETTES.pond;
  const bg = backgroundById(background);
  const palette: RipplesPalette = useMemo(() => {
    if (!bg) return basePalette;
    return { ground: bg.ground, crest: bg.ink, trough: bg.inkSoft, edge: bg.ink };
  }, [basePalette, bg]);

  const paramsRef = useRef({ values, palette, seed });
  paramsRef.current = { values, palette, seed };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    host.appendChild(canvas);
    canvasRef.current = canvas;
    const rect = host.getBoundingClientRect();
    const displayW = Math.max(320, Math.round(rect.width));
    const displayH = Math.max(320, Math.round(rect.height));
    const simMax = 512;
    const scale = Math.min(1, simMax / Math.max(displayW, displayH));
    const simW = Math.max(128, Math.round(displayW * scale));
    const simH = Math.max(128, Math.round(displayH * scale));
    canvas.width = displayW;
    canvas.height = displayH;

    const glMaybe = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });
    if (!glMaybe) { setError('WebGL2 is not available in this browser.'); return; }
    const gl: WebGL2RenderingContext = glMaybe;
    let stepProgram: WebGLProgram, drawProgram: WebGLProgram;
    try {
      stepProgram = link(gl, VS, STEP_FS);
      drawProgram = link(gl, VS, DRAW_FS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'shader failure');
      return;
    }

    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const makeTex = () => {
      const t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      // Signed 16-bit float — necessary to store negative wave heights
      // without severe quantisation.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, simW, simH, 0, gl.RGBA, gl.HALF_FLOAT, null);
      return t;
    };
    // Enable the float-color-buffer extension so we can render into RGBA16F.
    if (!gl.getExtension('EXT_color_buffer_float')) {
      setError('float framebuffers unsupported');
      return;
    }
    const texA = makeTex();
    const texB = makeTex();
    const makeFb = (tex: WebGLTexture) => {
      const fb = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return fb;
    };
    const fbA = makeFb(texA);
    const fbB = makeFb(texB);
    let activeIsA = true;
    let running = true;
    let raf = 0;

    // Warmup — one blank pass to make sure the textures are cleared.
    gl.viewport(0, 0, simW, simH);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbA);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbB);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const stepLoc = {
      u_tex: gl.getUniformLocation(stepProgram, 'u_tex'),
      u_texel: gl.getUniformLocation(stepProgram, 'u_texel'),
      u_damping: gl.getUniformLocation(stepProgram, 'u_damping'),
      u_drop: gl.getUniformLocation(stepProgram, 'u_drop'),
    };
    const drawLoc = {
      u_tex: gl.getUniformLocation(drawProgram, 'u_tex'),
      u_ground: gl.getUniformLocation(drawProgram, 'u_ground'),
      u_crest: gl.getUniformLocation(drawProgram, 'u_crest'),
      u_trough: gl.getUniformLocation(drawProgram, 'u_trough'),
      u_edge: gl.getUniformLocation(drawProgram, 'u_edge'),
      u_contrast: gl.getUniformLocation(drawProgram, 'u_contrast'),
    };

    let dropTimer = 0;
    let rndState = (paramsRef.current.seed || 1) >>> 0;
    const rnd = () => { rndState = (rndState * 16807) % 2147483647; return rndState / 2147483647; };

    function tick() {
      if (!running) return;
      const { values: v, palette: pal } = paramsRef.current;
      const steps = Math.max(1, Math.round(v.stepsPerFrame ?? 2));
      const damping = v.damping ?? 0.995;
      const dropRate = v.dropRate ?? 1.5;
      const dropStrength = v.dropStrength ?? 0.55;

      gl.useProgram(stepProgram);
      gl.uniform2f(stepLoc.u_texel, 1 / simW, 1 / simH);
      gl.uniform1f(stepLoc.u_damping, damping);
      gl.uniform1i(stepLoc.u_tex, 0);

      dropTimer += (1 / 60) * dropRate;
      let dropX = 0, dropY = 0, dropR = 0, dropS = 0;
      if (dropTimer > 1) {
        dropTimer -= 1;
        dropX = rnd();
        dropY = rnd();
        dropR = 0.02 + rnd() * 0.06;
        dropS = dropStrength;
      }

      gl.viewport(0, 0, simW, simH);
      for (let i = 0; i < steps; i++) {
        const readTex = activeIsA ? texA : texB;
        const writeFb = activeIsA ? fbB : fbA;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, readTex);
        gl.bindFramebuffer(gl.FRAMEBUFFER, writeFb);
        // Only apply the drop on the first iteration of a frame.
        gl.uniform4f(stepLoc.u_drop, dropX, dropY, dropR, i === 0 ? dropS : 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        activeIsA = !activeIsA;
      }

      // Draw.
      gl.useProgram(drawProgram);
      const [gr, gg, gb] = hexToVec3(pal.ground);
      const [cr, cg, cb] = hexToVec3(pal.crest);
      const [tr, tg, tb] = hexToVec3(pal.trough);
      const [er, eg, ebv] = hexToVec3(pal.edge);
      gl.uniform3f(drawLoc.u_ground, gr, gg, gb);
      gl.uniform3f(drawLoc.u_crest, cr, cg, cb);
      gl.uniform3f(drawLoc.u_trough, tr, tg, tb);
      gl.uniform3f(drawLoc.u_edge, er, eg, ebv);
      gl.uniform1f(drawLoc.u_contrast, v.contrast ?? 1.2);
      gl.uniform1i(drawLoc.u_tex, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, activeIsA ? texA : texB);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, displayW, displayH);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      raf = requestAnimationFrame(tick);
    }

    setReady(true);
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      try {
        gl.deleteProgram(stepProgram);
        gl.deleteProgram(drawProgram);
        gl.deleteTexture(texA);
        gl.deleteTexture(texB);
        gl.deleteFramebuffer(fbA);
        gl.deleteFramebuffer(fbB);
        gl.deleteVertexArray(vao);
      } catch { /* ignore */ }
      try { host.removeChild(canvas); } catch { /* ignore */ }
    };
  }, []);

  const png = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const stamped = stampWatermarkOnCanvas(canvas, palette.ground);
    return await new Promise((resolve) => stamped.toBlob((b) => resolve(b), 'image/png'));
  }, [palette.ground]);

  const renderAtSize = useCallback(
    async (w: number, h: number): Promise<Blob | null> => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      // Scale-copy of the current frame; the sim state stays put.
      const out = document.createElement('canvas');
      out.width = w; out.height = h;
      const ctx = out.getContext('2d');
      if (!ctx) return null;
      ctx.fillStyle = palette.ground;
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const srcAspect = canvas.width / canvas.height;
      const dstAspect = w / h;
      let dw: number; let dh: number;
      if (srcAspect > dstAspect) { dw = w; dh = w / srcAspect; }
      else                       { dh = h; dw = h * srcAspect; }
      ctx.drawImage(canvas, (w - dw) / 2, (h - dh) / 2, dw, dh);
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
        className="relative ga-canvas w-full overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]"
        style={{ background: palette.ground }}
      />
      {!ready && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[10.5px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
          settling the water…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center font-mono text-[11px] text-[color:var(--text-primary)]">
          {error}
        </div>
      )}
    </div>
  );
}
