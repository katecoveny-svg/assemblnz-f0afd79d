'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RendererProps } from '@/lib/generative-art/families';
import { CHLADNI_PALETTES, type ChladniPalette } from '@/lib/generative-art/families/chladni';
import { backgroundById } from '@/lib/generative-art/backgrounds';
import { stampWatermarkOnCanvas } from '@/lib/generative-art/watermark';

/**
 * Chladni plate — a single WebGL2 fragment shader that evaluates the
 * standing-wave nodal function of a square plate:
 *     f(x,y) = sin(mπx) sin(nπy) + blend · sin(nπx) sin(mπy)
 * The absolute value maps to a grain field so nodal LINES (|f|≈0) look
 * empty like real sand-free zones, while ANTINODES accumulate darker
 * sand. Two extra modes blend so the plate never looks like a checker.
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
layout(location = 0) in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform vec3 u_plate;
uniform vec3 u_sand;
uniform vec3 u_edge;
uniform float u_m;
uniform float u_n;
uniform float u_blend;
uniform float u_contrast;
uniform float u_grain;
uniform float u_seed;

// Deterministic hash-based noise — cheap, seeded per render.
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21) + u_seed);
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 p = v_uv;
  float PI = 3.14159265;
  float a = sin(u_m * PI * p.x) * sin(u_n * PI * p.y);
  float b = sin(u_n * PI * p.x) * sin(u_m * PI * p.y);
  float f = a + u_blend * b;
  float amp = abs(f);
  // Contrast curve — pushes low values toward zero (empty nodal lines).
  amp = pow(amp, u_contrast);
  // Grain — hash noise, brighter where wave amplitude is high so sand
  // accumulates realistically.
  float grain = hash(p * 900.0);
  amp *= mix(0.7, 1.0, grain * u_grain + (1.0 - u_grain));
  // Sand accumulates darker at high amplitude; nodal lines stay plate.
  vec3 c = mix(u_plate, u_sand, clamp(amp, 0.0, 1.0));
  // Faint edge inside the frame so the plate reads as a plate.
  float d = min(min(p.x, 1.0 - p.x), min(p.y, 1.0 - p.y));
  float edgeFade = smoothstep(0.0, 0.03, d);
  c = mix(u_edge, c, edgeFade);
  outColor = vec4(c, 1.0);
}`;

export function ChladniCanvas({ presetId, values, seed, background, onExportersReady }: RendererProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const basePalette = CHLADNI_PALETTES[presetId] ?? CHLADNI_PALETTES.paper;
  const bg = backgroundById(background);
  const palette: ChladniPalette = useMemo(() => {
    if (!bg) return basePalette;
    return { ground: bg.ground, plate: bg.ground, sand: bg.ink, edge: bg.inkSoft };
  }, [basePalette, bg]);

  const draw = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;
    if (!gl || !program || !canvas) return;
    gl.useProgram(program);
    const uPlate = gl.getUniformLocation(program, 'u_plate');
    const uSand = gl.getUniformLocation(program, 'u_sand');
    const uEdge = gl.getUniformLocation(program, 'u_edge');
    const uM = gl.getUniformLocation(program, 'u_m');
    const uN = gl.getUniformLocation(program, 'u_n');
    const uBlend = gl.getUniformLocation(program, 'u_blend');
    const uContrast = gl.getUniformLocation(program, 'u_contrast');
    const uGrain = gl.getUniformLocation(program, 'u_grain');
    const uSeed = gl.getUniformLocation(program, 'u_seed');
    const [pr, pg, pb] = hexToVec3(palette.plate);
    const [sr, sg, sb] = hexToVec3(palette.sand);
    const [er, eg, ebv] = hexToVec3(palette.edge);
    gl.uniform3f(uPlate, pr, pg, pb);
    gl.uniform3f(uSand, sr, sg, sb);
    gl.uniform3f(uEdge, er, eg, ebv);
    gl.uniform1f(uM, Math.max(1, Math.round(values.m ?? 3)));
    gl.uniform1f(uN, Math.max(1, Math.round(values.n ?? 5)));
    gl.uniform1f(uBlend, values.blend ?? 0.3);
    gl.uniform1f(uContrast, values.contrast ?? 1.6);
    gl.uniform1f(uGrain, values.grain ?? 0.3);
    gl.uniform1f(uSeed, (seed % 1000) / 1000);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, [palette.plate, palette.sand, palette.edge, values.m, values.n, values.blend, values.contrast, values.grain, seed]);

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
    canvas.width = Math.max(320, Math.round(rect.width));
    canvas.height = Math.max(320, Math.round(rect.height));

    const gl = canvas.getContext('webgl2', { antialias: true, preserveDrawingBuffer: true });
    if (!gl) {
      setError('WebGL2 is not available in this browser.');
      return;
    }
    glRef.current = gl;
    try {
      programRef.current = link(gl, VS, FS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'shader compile failed');
      return;
    }
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    setReady(true);
    return () => {
      glRef.current = null;
      try { host.removeChild(canvas); } catch { /* ignore */ }
    };
  }, []);

  // Redraw on any state change.
  useEffect(() => {
    if (!ready) return;
    draw();
  }, [ready, draw]);

  const png = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const stamped = stampWatermarkOnCanvas(canvas, palette.ground);
    return await new Promise((resolve) => stamped.toBlob((b) => resolve(b), 'image/png'));
  }, [palette.ground]);

  const renderAtSize = useCallback(
    async (w: number, h: number): Promise<Blob | null> => {
      const gl = glRef.current;
      const canvas = canvasRef.current;
      if (!gl || !canvas) return null;
      const prevW = canvas.width, prevH = canvas.height;
      canvas.width = w;
      canvas.height = h;
      draw();
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
      // Restore live size.
      canvas.width = prevW;
      canvas.height = prevH;
      draw();
      if (!blob) return null;
      // Watermark composite at target size.
      const img = new Image();
      const url = URL.createObjectURL(blob);
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('decode')); img.src = url; });
      URL.revokeObjectURL(url);
      const out = document.createElement('canvas');
      out.width = w; out.height = h;
      const ctx = out.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0, w, h);
      const stamped = stampWatermarkOnCanvas(out, palette.ground);
      return await new Promise((resolve) => stamped.toBlob((b) => resolve(b), 'image/png'));
    },
    [draw, palette.ground],
  );

  useEffect(() => {
    onExportersReady?.({ png, renderAtSize });
  }, [onExportersReady, png, renderAtSize]);

  return (
    <div className="relative w-full">
      <div
        ref={hostRef}
        className="relative mx-auto aspect-[0.92/1] w-full max-w-[720px] overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]"
        style={{ background: palette.ground }}
      />
      {!ready && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[10.5px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
          tuning the plate…
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
