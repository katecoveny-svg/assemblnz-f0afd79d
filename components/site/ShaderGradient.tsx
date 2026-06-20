'use client';

import { useEffect, useRef } from 'react';

/**
 * A live, full-bleed WebGL flowing-gradient — domain-warped fbm noise mixing
 * assembl's brand colours (pounamu, gold, clay, cream) into a slow, organic
 * aurora. This is the hero's signature motion graphic.
 *
 * Robust by design:
 *  - If WebGL is unavailable or the program fails to compile, it renders
 *    nothing and the section's CSS gradient shows through (never a blank/broken
 *    hero).
 *  - Under prefers-reduced-motion it paints a single static frame (no loop).
 *  - pointer-events-none + aria-hidden; the pointer gently warps the flow.
 */
export function ShaderGradient({
  className,
  variant = 'light',
}: {
  className?: string;
  /**
   * 'light' (default) — the cream/sage/pounamu/gold hero aurora, lifted toward
   * cream on the left for copy legibility.
   * 'dark' — a deep pounamu flow (same motion) for sitting behind a dark green
   * band, kept dark enough that cream text stays readable on top.
   * 'airy' — a bright cream/sage flow with no gold and only soft green, for the
   * dash microsite (lighter, no yellow).
   */
  variant?: 'light' | 'dark' | 'airy';
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl =
      (canvas.getContext('webgl', { antialias: true, premultipliedAlpha: false }) as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const vert = `
      attribute vec2 p;
      void main() { gl_Position = vec4(p, 0.0, 1.0); }
    `;

    // Domain-warped fractal noise blending four brand colours.
    const frag = `
      precision highp float;
      uniform vec2 u_res;
      uniform float u_time;
      uniform vec2 u_ptr;
      uniform float u_variant;

      // hash + value noise
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float noise(vec2 p){
        vec2 i = floor(p); vec2 f = fract(p);
        vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(hash(i+vec2(0.0,0.0)), hash(i+vec2(1.0,0.0)), u.x),
                   mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
      }
      float fbm(vec2 p){
        float v = 0.0; float a = 0.5;
        for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.0; a *= 0.5; }
        return v;
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / u_res.xy;
        float aspect = u_res.x / u_res.y;
        vec2 st = uv; st.x *= aspect;

        float t = u_time * 0.06;
        vec2 ptr = u_ptr; ptr.x *= aspect;

        // domain warp
        vec2 q = vec2(fbm(st*1.4 + t), fbm(st*1.4 - t + 3.1));
        vec2 r = vec2(fbm(st*1.8 + q*1.6 + t*0.9 + ptr*0.4),
                      fbm(st*1.8 + q*1.6 - t*0.7));
        float f = fbm(st*1.6 + r*1.9);

        // brand palette
        vec3 cream   = vec3(0.957, 0.937, 0.886);
        vec3 sage    = vec3(0.640, 0.730, 0.640);
        vec3 pounamu = vec3(0.168, 0.419, 0.341);
        vec3 gold    = vec3(0.831, 0.659, 0.325);
        vec3 clay    = vec3(0.674, 0.345, 0.220);

        vec3 col = mix(cream, sage, smoothstep(0.0, 0.7, f));
        col = mix(col, pounamu, smoothstep(0.35, 0.95, f + r.x*0.35));
        col = mix(col, gold, smoothstep(0.55, 1.0, q.y*0.9 + f*0.4));
        col = mix(col, clay, smoothstep(0.78, 1.05, r.y + q.x*0.4) * 0.6);

        if (u_variant > 1.5) {
          // Airy (dash): bright cream → sage with only soft green. No gold, no
          // clay — keeps the dash microsite light and free of yellow.
          vec3 a = mix(cream, sage, smoothstep(0.0, 0.88, f));
          a = mix(a, vec3(0.30, 0.50, 0.40), smoothstep(0.5, 1.08, f + r.x*0.3) * 0.5);
          a = mix(a, cream, 0.22);                                   // overall lift
          a = mix(a, cream, smoothstep(0.5, 1.0, uv.y) * 0.3);       // bright top
          col = a;
        } else if (u_variant > 0.5) {
          // Deep pounamu flow for dark bands. Same warped motion, but the base
          // is deep green with only restrained gold/clay filaments, so cream
          // text stays legible over the top.
          vec3 deep = vec3(0.050, 0.170, 0.135);
          vec3 mid  = vec3(0.105, 0.300, 0.245);
          vec3 d = mix(deep, mid, smoothstep(0.0, 0.78, f));
          d = mix(d, pounamu, smoothstep(0.45, 1.05, f + r.x*0.30));
          d = mix(d, gold, smoothstep(0.74, 1.10, q.y*0.9 + f*0.4) * 0.45);
          d = mix(d, clay * 0.85, smoothstep(0.88, 1.12, r.y + q.x*0.4) * 0.30);
          // gentle centre-bias vignette so a centred headline keeps contrast
          float vig = smoothstep(1.25, 0.20, distance(uv, vec2(0.5)));
          col = d * mix(0.80, 1.05, vig);
        } else {
          // keep the left (where hero copy sits) lighter for legibility
          float leftLift = smoothstep(0.62, 0.0, uv.x);
          col = mix(col, cream, leftLift * 0.55);
          // soft top fade into the page
          col = mix(col, cream, smoothstep(0.6, 1.0, uv.y) * 0.25);
        }

        // subtle grain
        float g = (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.03;
        col += g;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(s);
        return null;
      }
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, vert);
    const fs = compile(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    // full-screen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uPtr = gl.getUniformLocation(prog, 'u_ptr');
    const uVariant = gl.getUniformLocation(prog, 'u_variant');
    gl.uniform1f(uVariant, variant === 'airy' ? 2 : variant === 'dark' ? 1 : 0);

    const ptr = { x: 0.5, y: 0.5 };
    const tptr = { x: 0.5, y: 0.5 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      tptr.x = (e.clientX - r.left) / r.width;
      tptr.y = 1 - (e.clientY - r.top) / r.height;
    };
    if (!reduce) window.addEventListener('pointermove', onMove);

    const start = performance.now();
    let raf = 0;
    const render = (now: number) => {
      ptr.x += (tptr.x - ptr.x) * 0.05;
      ptr.y += (tptr.y - ptr.y) * 0.05;
      gl.uniform2f(uPtr, ptr.x, ptr.y);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce) raf = requestAnimationFrame(render);
    };

    if (reduce) {
      gl.uniform2f(uPtr, 0.5, 0.5);
      gl.uniform1f(uTime, 8.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      raf = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      const ext = gl.getExtension('WEBGL_lose_context');
      ext?.loseContext();
    };
  }, [variant]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
